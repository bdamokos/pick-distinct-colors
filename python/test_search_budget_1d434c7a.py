"""Bounded regressions for finding 1d434c7a-c6d5-4c45-a947-6846bff3b85e."""

import copy
import unittest
from unittest.mock import patch

import pick_distinct_colors as pdc


POOL = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
ALGORITHMS = ('tabu_search', 'exact_minimum')


def pool(size):
    return [(i % 256, i // 256, 0) for i in range(size)]


class SearchBudgetTests(unittest.TestCase):
    def routes(self, algorithm, colors, count, options):
        return {
            'direct': lambda: getattr(pdc, algorithm)(colors, count, options),
            'registry': lambda: pdc.ALGORITHMS[algorithm](colors, count, options),
            'selection': lambda: pdc.select_distinct_colors(colors, count, algorithm, options),
            'generated': lambda: pdc.generate_n_colors(count, algorithm, options),
            'named': lambda: pdc.pick_distinct_colors({
                'count': count, 'algorithm': algorithm, 'colors': colors, 'options': options,
            }),
            'legacy': lambda: pdc.pick_distinct_colors(count, algorithm, None, colors, options),
        }

    def test_multiplied_work_rejected_before_conversion_on_every_route(self):
        for algorithm, size in (('tabu_search', 512), ('exact_minimum', 258)):
            colors = pool(size)
            with patch.object(pdc, 'generate_random_colors', return_value=colors), \
                    patch.object(pdc, 'rgb_to_lab') as conversion, \
                    patch.object(pdc, 'delta_e') as scoring:
                for route, call in self.routes(algorithm, colors, 256, {'maxIterations': 1}).items():
                    with self.subTest(algorithm=algorithm, route=route):
                        with self.assertRaisesRegex(ValueError, 'estimated work'):
                            call()
                conversion.assert_not_called()
                scoring.assert_not_called()

    def test_generated_named_and_legacy_calls_cannot_bypass_preflight(self):
        with patch.object(pdc, 'rgb_to_lab') as conversion:
            for algorithm in ALGORITHMS:
                with self.subTest(algorithm=algorithm):
                    with self.assertRaisesRegex(ValueError, 'estimated work|combinations'):
                        pdc.pick_distinct_colors({'count': 256, 'algorithm': algorithm})
                    with self.assertRaisesRegex(ValueError, 'estimated work|combinations'):
                        pdc.pick_distinct_colors(256, algorithm, 512)
                    with self.assertRaisesRegex(ValueError, 'estimated work|combinations'):
                        pdc.generate_n_colors(256, algorithm)
            conversion.assert_not_called()

    def test_tabu_iteration_aliases_count_work_and_preserve_precedence(self):
        colors = pool(64)
        with patch.object(pdc, 'rgb_to_lab') as conversion:
            for key in ('maxIterations', 'tabuIterations'):
                with self.assertRaisesRegex(ValueError, 'estimated work'):
                    pdc.tabu_search(colors, 8, {key: 2000})
            conversion.assert_not_called()
        result = pdc.tabu_search(POOL, 2, {'maxIterations': 2, 'tabuIterations': 2000})
        self.assertEqual(result['colors'], [(255, 255, 0), (0, 0, 255)])

    def test_exact_work_boundary_includes_construction(self):
        # Six combinations, each constructing two indices and scoring one pair.
        with patch.object(pdc, 'MAX_SEARCH_WORK_UNITS', 17), \
                patch.object(pdc, 'rgb_to_lab') as conversion:
            with self.assertRaisesRegex(ValueError, 'estimated work'):
                pdc.exact_minimum(POOL, 2)
            conversion.assert_not_called()
        with patch.object(pdc, 'MAX_SEARCH_WORK_UNITS', 18):
            self.assertEqual(pdc.exact_minimum(POOL, 2)['colors'],
                             [(0, 255, 0), (0, 0, 255)])

    def test_tabu_work_boundary_includes_membership_and_construction(self):
        # Initial work: 2 + 1; per iteration: membership 16, neighbors 12, moves 8.
        with patch.object(pdc, 'MAX_SEARCH_WORK_UNITS', 74), \
                patch.object(pdc, 'rgb_to_lab') as conversion:
            with self.assertRaisesRegex(ValueError, 'estimated work'):
                pdc.tabu_search(POOL, 2, {'maxIterations': 2})
            conversion.assert_not_called()
        with patch.object(pdc, 'MAX_SEARCH_WORK_UNITS', 75):
            self.assertEqual(pdc.tabu_search(POOL, 2, {'maxIterations': 2})['colors'],
                             [(255, 255, 0), (0, 0, 255)])

    def test_deadline_interrupts_initial_and_neighbor_pair_scoring(self):
        cases = [('exact_minimum', 1), ('tabu_search', 1), ('tabu_search', 4)]
        for algorithm, stop_after in cases:
            now = [0.0]
            calls = [0]
            original_distance = pdc.delta_e

            def advance_clock(a, b):
                calls[0] += 1
                if calls[0] == stop_after:
                    now[0] = pdc.MAX_SEARCH_EXECUTION_SECONDS
                return original_distance(a, b)

            with self.subTest(algorithm=algorithm, stop_after=stop_after), \
                    patch.object(pdc.time, 'monotonic', side_effect=lambda: now[0]), \
                    patch.object(pdc, 'delta_e', side_effect=advance_clock) as scoring:
                with self.assertRaisesRegex(ValueError, 'execution budget'):
                    getattr(pdc, algorithm)(POOL, 3, {'maxIterations': 1})
                self.assertEqual(scoring.call_count, stop_after)

    def test_candidate_checkpoints_cover_single_color_without_pairs(self):
        for algorithm in ALGORITHMS:
            now = [0.0]
            calls = [0]
            # Tabu scores the initial selection before enumerating neighbors.
            stop_after = 2 if algorithm == 'tabu_search' else 1

            def advance_clock(*args):
                calls[0] += 1
                if calls[0] == stop_after:
                    now[0] = pdc.MAX_SEARCH_EXECUTION_SECONDS
                return float('inf')

            with self.subTest(algorithm=algorithm), \
                    patch.object(pdc.time, 'monotonic', side_effect=lambda: now[0]), \
                    patch.object(pdc, '_minimum_selection_distance', side_effect=advance_clock) as scoring:
                with self.assertRaisesRegex(ValueError, 'execution budget'):
                    getattr(pdc, algorithm)(POOL, 1, {'maxIterations': 1})
                self.assertEqual(scoring.call_count, stop_after)

    def test_final_checkpoint_rejects_expired_results(self):
        for algorithm in ALGORITHMS:
            now = [0.0]
            original_sort = pdc.sort_colors

            def advance_clock(colors):
                now[0] = pdc.MAX_SEARCH_EXECUTION_SECONDS
                return original_sort(colors)

            with self.subTest(algorithm=algorithm), \
                    patch.object(pdc.time, 'monotonic', side_effect=lambda: now[0]), \
                    patch.object(pdc, 'sort_colors', side_effect=advance_clock):
                with self.assertRaisesRegex(ValueError, 'execution budget'):
                    getattr(pdc, algorithm)(POOL, 2, {'maxIterations': 1})

    def test_small_results_and_inputs_remain_compatible_on_every_route(self):
        expected = {
            'tabu_search': [(255, 255, 0), (0, 0, 255)],
            'exact_minimum': [(0, 255, 0), (0, 0, 255)],
        }
        for algorithm in ALGORITHMS:
            colors = copy.deepcopy(POOL)
            options = {'maxIterations': 2, 'seed': 42}
            with patch.object(pdc, 'generate_random_colors', return_value=colors):
                for route, call in self.routes(algorithm, colors, 2, options).items():
                    with self.subTest(algorithm=algorithm, route=route):
                        result = call()
                        self.assertEqual(result['colors'], expected[algorithm])
                        self.assertEqual(set(result), {'colors', 'time'})
                        self.assertGreaterEqual(result['time'], 0)
                        self.assertEqual(colors, POOL)
                        self.assertEqual(options, {'maxIterations': 2, 'seed': 42})

    def test_single_full_and_duplicate_selections_remain_valid(self):
        for algorithm in ALGORITHMS:
            for colors, count in ((POOL, 1), (POOL, 4), ([POOL[0]] * 4, 2)):
                with self.subTest(algorithm=algorithm, count=count, colors=colors):
                    result = getattr(pdc, algorithm)(colors, count, {'maxIterations': 2})
                    self.assertEqual(len(result['colors']), count)
                    if count == 1:
                        self.assertEqual(result['colors'], [colors[0]])
                    if count == len(colors):
                        self.assertEqual(result['colors'], pdc.sort_colors(colors))
        # No replacements means only one membership scan, regardless of iterations.
        self.assertEqual(len(pdc.tabu_search(pool(256), 256)['colors']), 256)

    def test_existing_validation_errors_remain_explicit(self):
        with self.assertRaisesRegex(ValueError, 'combinations'):
            pdc.exact_minimum(pool(30), 15)
        for value in (0, -1, True, 1.5, '2', 2001):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'maxIterations'):
                pdc.tabu_search(POOL, 2, {'maxIterations': value})


if __name__ == '__main__':
    unittest.main()
