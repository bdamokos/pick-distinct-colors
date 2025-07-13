/**
 * @module color-distance
 */

/**
 * Converts RGB color to Lab color space
 * @param {number[]} rgb - RGB color array [r, g, b] in range [0, 255]
 * @returns {number[]} Lab color array [L, a, b]
 */
export { rgb2lab } from '../js/utils/colorUtils.js';

/**
 * Calculates the deltaE (color difference) between two colors in Lab space
 * @param {number[]} lab1 - First Lab color array [L, a, b]
 * @param {number[]} lab2 - Second Lab color array [L, a, b]
 * @returns {number} The deltaE value, higher numbers indicate more distinct colors
 */
export { deltaE } from '../js/utils/colorUtils.js';

/**
 * Analyzes the distribution of colors in Lab color space
 * @param {number[][]} colors - Array of RGB colors to analyze
 * @returns {string} Analysis results including color space coverage and contrast ratios
 */
export { analyzeColorDistribution } from '../js/utils/colorUtils.js';

/**
 * Calculates various metrics for a set of colors
 * @param {number[][]} colors - Array of RGB colors
 * @returns {{min: number, avg: number}} Object containing minimum and average deltaE values
 */
export { calculateMetrics } from '../js/utils/colorUtils.js';

/**
 * Finds the closest pair of colors in a set
 * @param {number[][]} colors - Array of RGB colors
 * @returns {{colors: number[][], distance: number}} Object containing the closest pair and their distance
 */
export { findClosestPair } from '../js/utils/colorUtils.js';

/**
 * Global Maximum Sum algorithm - Selects colors that maximize the sum of distances between all pairs
 * Best for optimal results but slower for large sets
 * Time complexity: O(n choose k)
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { maxSumDistancesGlobal } from '../js/algorithms/maxSumDistances.js';

/**
 * Sequential Maximum Sum algorithm - Faster version that builds the solution incrementally
 * Good balance between speed and quality
 * Time complexity: O(n * k)
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { maxSumDistancesSequential } from '../js/algorithms/maxSumDistances.js';

/**
 * Greedy Selection algorithm - Fast algorithm that selects colors one by one
 * Very fast but may not find optimal solutions
 * Time complexity: O(n * k)
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { greedySelection } from '../js/algorithms/greedy.js';

/**
 * K-Means++ Selection algorithm - Clusters colors and selects representatives
 * Good for finding well-distributed colors in the color space
 * Time complexity: O(n * k * i) where i is the number of iterations
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { kmeansppSelection } from '../js/algorithms/kmeans.js';

/**
 * Simulated Annealing algorithm - Probabilistic optimization method
 * Good for escaping local optima
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @param {Object} options - Algorithm options
 * @param {number} options.initialTemp - Initial temperature (default: 1000)
 * @param {number} options.coolingRate - Cooling rate (default: 0.995)
 * @param {number} options.minTemp - Minimum temperature (default: 0.1)
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { simulatedAnnealing } from '../js/algorithms/simulatedAnnealing.js';

/**
 * Genetic Algorithm - Population-based optimization method
 * Good for exploring multiple solutions simultaneously
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @param {Object} options - Algorithm options
 * @param {number} options.populationSize - Size of population (default: 100)
 * @param {number} options.generations - Number of generations (default: 100)
 * @param {number} options.mutationRate - Mutation rate (default: 0.1)
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { geneticAlgorithm } from '../js/algorithms/genetic.js';

/**
 * Particle Swarm Optimization - Swarm intelligence based method
 * Good for continuous optimization problems
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @param {Object} options - Algorithm options
 * @param {number} options.numParticles - Number of particles (default: 30)
 * @param {number} options.iterations - Number of iterations (default: 100)
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { particleSwarmOptimization } from '../js/algorithms/particleSwarm.js';

/**
 * Ant Colony Optimization - Swarm intelligence based method
 * Good for discrete optimization problems
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @param {Object} options - Algorithm options
 * @param {number} options.numAnts - Number of ants (default: 20)
 * @param {number} options.iterations - Number of iterations (default: 50)
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { antColonyOptimization } from '../js/algorithms/antColony.js';

/**
 * Tabu Search - Local search method with memory
 * Good for avoiding revisiting previous solutions
 * @param {number[][]} colors - Array of RGB colors to select from
 * @param {number} selectCount - Number of colors to select
 * @param {Object} options - Algorithm options
 * @param {number} options.maxIterations - Maximum iterations (default: 1000)
 * @param {number} options.tabuTenure - Tabu tenure (default: 5)
 * @returns {{colors: number[][], time: number}} Selected colors and execution time
 */
export { tabuSearch } from '../js/algorithms/tabu.js';

export { pickDistinctColors } from '../js/utils/pickDistinctColors.js';
