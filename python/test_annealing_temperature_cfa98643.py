"""Bounded regressions for finding cfa98643-273a-4b7a-a9be-9ee7f45b7394."""

import unittest
from unittest.mock import patch

import pick_distinct_colors as pdc


POOL = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
EXPECTED = [(0, 255, 0), (0, 0, 255)]
ALGORITHM = 'simulated_annealing'


class NumericSubclass(int):
    def __mul__(self, other):
        raise AssertionError('temperature arithmetic must not invoke overloads')


class AnnealingTemperatureTests(unittest.TestCase):
    def routes(self):
        return {
            'direct': lambda options: pdc.simulated_annealing(POOL, 2, options),
            'registry': lambda options: pdc.ALGORITHMS[ALGORITHM](POOL, 2, options),
            'selection': lambda options: pdc.select_distinct_colors(POOL, 2, ALGORITHM, options),
            'generated': lambda options: pdc.generate_n_colors(2, ALGORITHM, options),
            'named': lambda options: pdc.pick_distinct_colors({
                'count': 2, 'algorithm': ALGORITHM, 'colors': POOL, 'options': options,
            }),
            'legacy': lambda options: pdc.pick_distinct_colors(2, ALGORITHM, None, POOL, options),
        }

    def assert_rejected_before_work(self, options, field):
        with patch.object(pdc, 'generate_random_colors', return_value=POOL), \
                patch.object(pdc, 'rgb_to_lab') as conversion, \
                patch.object(pdc, 'delta_e') as scoring, \
                patch.object(pdc.random, 'Random') as random_source, \
                patch.object(pdc.random, 'sample') as sampling:
            for route, call in self.routes().items():
                with self.subTest(route=route, options=options):
                    with self.assertRaisesRegex(ValueError, field):
                        call(options)
            conversion.assert_not_called()
            scoring.assert_not_called()
            random_source.assert_not_called()
            sampling.assert_not_called()

    def test_non_numeric_and_nonfinite_values_fail_on_every_route(self):
        invalid = [True, False, None, '0.5', 'ab', [], [0.5], (0.5,), {},
                   complex(0.5), float('nan'), float('inf'), -float('inf'),
                   NumericSubclass(1)]
        for field in ('initialTemp', 'coolingRate', 'minTemp'):
            for value in invalid:
                self.assert_rejected_before_work({'seed': 42, field: value}, field)

    def test_out_of_range_temperatures_fail_without_float_overflow(self):
        for field in ('initialTemp', 'minTemp'):
            for value in (0, -1, 1_000_001, 10 ** 1000):
                self.assert_rejected_before_work({field: value}, field)

    def test_cooling_rate_requires_strict_bounds(self):
        for value in (0, -0.5, 1, 1.5, 10 ** 1000):
            self.assert_rejected_before_work({'coolingRate': value}, 'coolingRate')

    def test_minimum_cannot_exceed_initial_temperature(self):
        self.assert_rejected_before_work({'initialTemp': 1, 'minTemp': 2}, 'minTemp')

    def test_both_sequence_repetition_directions_fail_before_work(self):
        self.assert_rejected_before_work(
            {'initialTemp': 3, 'coolingRate': 'ab', 'minTemp': 0.1}, 'coolingRate')
        self.assert_rejected_before_work(
            {'initialTemp': 'ab', 'coolingRate': 3, 'minTemp': ''}, 'initialTemp')

    def test_seeded_defaults_and_documented_settings_remain_compatible(self):
        controls = [
            {'seed': 42},
            {'seed': 42, 'initialTemp': 2000, 'coolingRate': 0.99, 'minTemp': 0.01},
            {'seed': 42, 'initialTemp': 2.5, 'coolingRate': 0.5, 'minTemp': 0.25},
        ]
        with patch.object(pdc, 'generate_random_colors', return_value=POOL):
            for options in controls:
                for route, call in self.routes().items():
                    with self.subTest(route=route, options=options):
                        self.assertEqual(call(options)['colors'], EXPECTED)

    def test_upper_and_small_positive_temperature_boundaries(self):
        for temperature in (1_000_000, 1_000_000.0, 1e-300):
            result = pdc.simulated_annealing(POOL, 2, {
                'seed': 42, 'maxIterations': 1,
                'initialTemp': temperature, 'minTemp': temperature / 2,
                'coolingRate': 0.5,
            })
            self.assertEqual(len(result['colors']), 2)
            self.assertTrue(all(color in POOL for color in result['colors']))

    def test_equal_temperatures_skip_neighbor_generation(self):
        with patch.object(pdc.random, 'choice') as neighbor:
            result = pdc.simulated_annealing(POOL, 2, {'initialTemp': 1, 'minTemp': 1})
            self.assertEqual(len(result['colors']), 2)
            neighbor.assert_not_called()


if __name__ == '__main__':
    unittest.main()
