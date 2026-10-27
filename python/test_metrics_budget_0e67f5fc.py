"""Bounded regressions for finding 0e67f5fc-8977-4c63-a507-e37b2a56624f."""

import copy
import unittest
from itertools import combinations
from unittest.mock import patch

import pick_distinct_colors as pdc


POOL = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
ZERO = {'min': 0, 'max': 0, 'avg': 0, 'sum': 0}


class MetricsBudgetTests(unittest.TestCase):
    def test_oversized_list_and_tuple_rejected_before_any_color_work(self):
        # Only 1,415 references; never perform the million implied pair scores.
        for colors in ([POOL[0]] * 1415, (POOL[0],) * 1415):
            with self.subTest(container=type(colors).__name__), \
                    patch.object(pdc, '_validate_rgb_color') as validation, \
                    patch.object(pdc, 'rgb_to_lab', side_effect=AssertionError('conversion before guard')) as conversion, \
                    patch.object(pdc, 'delta_e') as scoring:
                with self.assertRaisesRegex(ValueError, 'pair'):
                    pdc.calculate_metrics(colors)
                validation.assert_not_called()
                conversion.assert_not_called()
                scoring.assert_not_called()

    def test_real_limit_accepts_1414_colors_without_running_pair_loop(self):
        class ConversionReached(Exception):
            pass

        with patch.object(pdc, 'rgb_to_lab', side_effect=ConversionReached) as conversion, \
                patch.object(pdc, 'delta_e') as scoring:
            with self.assertRaises(ConversionReached):
                pdc.calculate_metrics([POOL[0]] * 1414)
            conversion.assert_called_once_with(POOL[0])
            scoring.assert_not_called()

    def test_tiny_pair_limit_is_inclusive(self):
        with patch.object(pdc, 'MAX_METRICS_PAIRS', 6):
            with patch.object(pdc, 'delta_e', wraps=pdc.delta_e) as scoring:
                self.assertGreater(pdc.calculate_metrics(POOL)['min'], 0)
                self.assertEqual(scoring.call_count, 6)
            with patch.object(pdc, 'rgb_to_lab') as conversion:
                with self.assertRaisesRegex(ValueError, 'pair'):
                    pdc.calculate_metrics(POOL + [POOL[0]])
                conversion.assert_not_called()

    def test_small_aggregate_oracle_and_input_immutability(self):
        for colors in (POOL, tuple(POOL), [list(rgb) for rgb in POOL],
                       [POOL[0], POOL[0]], [POOL[0], POOL[1], POOL[0]]):
            before = copy.deepcopy(colors)
            distances = [pdc.delta_e(pdc.rgb_to_lab(a), pdc.rgb_to_lab(b))
                         for a, b in combinations(colors, 2)]
            expected = {'min': min(distances), 'max': max(distances),
                        'sum': sum(distances), 'avg': sum(distances) / len(distances)}
            with self.subTest(colors=colors), \
                    patch.object(pdc, 'delta_e', wraps=pdc.delta_e) as scoring:
                actual = pdc.calculate_metrics(colors)
                self.assertEqual(set(actual), set(expected))
                for key in expected:
                    self.assertAlmostEqual(actual[key], expected[key], places=10)
                self.assertEqual(scoring.call_count, len(distances))
                self.assertEqual(colors, before)

    def test_empty_and_singleton_results_remain_integer_zeros(self):
        for colors in ([], (), [POOL[0]], (POOL[0],)):
            with self.subTest(colors=colors), \
                    patch.object(pdc, 'rgb_to_lab', wraps=pdc.rgb_to_lab) as conversion, \
                    patch.object(pdc, 'delta_e') as scoring:
                result = pdc.calculate_metrics(colors)
                self.assertEqual(result, ZERO)
                self.assertTrue(all(type(value) is int for value in result.values()))
                self.assertEqual(conversion.call_count, len(colors))
                scoring.assert_not_called()

    def test_arbitrary_iterables_rejected_without_traversal(self):
        def forbidden_iterator():
            raise AssertionError('metrics must not consume an arbitrary iterable')
            yield POOL[0]

        for colors in (None, {}, 'red', forbidden_iterator()):
            with self.subTest(container=type(colors).__name__), \
                    patch.object(pdc, 'rgb_to_lab') as conversion, \
                    patch.object(pdc, 'delta_e') as scoring:
                with self.assertRaisesRegex(ValueError, 'list or tuple'):
                    pdc.calculate_metrics(colors)
                conversion.assert_not_called()
                scoring.assert_not_called()

    def test_malformed_singletons_still_fail(self):
        for color in ((0, 0), (0, 0, 0, 0), (256, 0, 0), (-1, 0, 0),
                      (True, 0, 0), (0.5, 0, 0), ('0', 0, 0)):
            with self.subTest(color=color), self.assertRaises(ValueError):
                pdc.calculate_metrics([color])


if __name__ == '__main__':
    unittest.main()
