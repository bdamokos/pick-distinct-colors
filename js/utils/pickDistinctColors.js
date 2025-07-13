import { randomColor } from './colorUtils.js';
import { maxSumDistancesGlobal, maxSumDistancesSequential } from '../algorithms/maxSumDistances.js';
import { greedySelection } from '../algorithms/greedy.js';
import { kmeansppSelection } from '../algorithms/kmeans.js';
import { simulatedAnnealing } from '../algorithms/simulatedAnnealing.js';
import { geneticAlgorithm } from '../algorithms/genetic.js';
import { particleSwarmOptimization } from '../algorithms/particleSwarm.js';
import { antColonyOptimization } from '../algorithms/antColony.js';
import { tabuSearch } from '../algorithms/tabu.js';
import { exactMaximum } from '../algorithms/exactMaximum.js';
import { exactMinimum } from '../algorithms/exactMinimum.js';
import { randomSelection } from '../algorithms/random.js';

const ALGORITHMS = {
  greedy: greedySelection,
  maxSumDistancesGlobal,
  maxSumDistancesSequential,
  kmeansppSelection,
  simulatedAnnealing,
  geneticAlgorithm,
  particleSwarmOptimization,
  antColonyOptimization,
  tabuSearch,
  exactMaximum,
  exactMinimum,
  randomSelection,
};

/**
 * Pick a set of maximally distinct colors using the specified algorithm.
 *
 * Recommended usage (named arguments):
 *   pickDistinctColors({ count, algorithm, poolSize, colors, options })
 *
 * @param {object|number} args - Either an options object or the count (legacy positional signature).
 * @param {number} args.count - Number of colors to select.
 * @param {string} [args.algorithm='greedy'] - Algorithm name (see docs for options).
 * @param {number} [args.poolSize] - Number of random colors to generate if no pool is provided.
 * @param {number[][]} [args.colors] - Optional array of RGB colors to select from.
 * @param {object} [args.options] - Optional algorithm-specific options.
 * @returns {Promise<{colors: number[][], time: number}>} Selected colors and execution time.
 */
export async function pickDistinctColors(args, algorithm, poolSize, colors, options) {
  // Support both: pickDistinctColors({ ... }) and pickDistinctColors(count, ...)
  let count, _algorithm, _poolSize, _colors, _options;
  if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
    count = args.count;
    _algorithm = args.algorithm ?? 'greedy';
    _poolSize = args.poolSize;
    _colors = args.colors;
    _options = args.options;
  } else {
    // Legacy positional signature
    count = args;
    _algorithm = algorithm ?? 'greedy';
    _poolSize = poolSize;
    _colors = colors;
    _options = options;
  }
  if (!ALGORITHMS[_algorithm]) {
    throw new Error(`Unknown algorithm: ${_algorithm}`);
  }
  let pool = _colors;
  if (!Array.isArray(pool) || pool.length === 0) {
    const size = _poolSize || Math.min(count * 10, 20);
    pool = Array.from({ length: size }, randomColor);
  }
  if (_algorithm === 'maxSumDistancesGlobal') {
    return await maxSumDistancesGlobal(pool, count);
  }
  if (_algorithm === 'maxSumDistancesSequential') {
    return maxSumDistancesSequential(pool, count);
  }
  if (_algorithm === 'greedy') {
    return greedySelection(pool, count);
  }
  if (_algorithm === 'kmeansppSelection') {
    return kmeansppSelection(pool, count);
  }
  if (_algorithm === 'simulatedAnnealing') {
    return simulatedAnnealing(pool, count, _options);
  }
  if (_algorithm === 'geneticAlgorithm') {
    return geneticAlgorithm(pool, count, _options);
  }
  if (_algorithm === 'particleSwarmOptimization') {
    return particleSwarmOptimization(pool, count, _options);
  }
  if (_algorithm === 'antColonyOptimization') {
    return antColonyOptimization(pool, count, _options);
  }
  if (_algorithm === 'tabuSearch') {
    return tabuSearch(pool, count, _options);
  }
  if (_algorithm === 'exactMaximum') {
    return exactMaximum(pool, count);
  }
  if (_algorithm === 'exactMinimum') {
    return exactMinimum(pool, count);
  }
  if (_algorithm === 'randomSelection') {
    return randomSelection(pool, count);
  }
  throw new Error(`Algorithm not implemented: ${_algorithm}`);
} 