// Import all the functions we need
import { maxSumDistancesGlobal, maxSumDistancesSequential } from './algorithms/maxSumDistances.js';
import { greedySelection } from './algorithms/greedy.js';
import { simulatedAnnealing } from './algorithms/simulatedAnnealing.js';
import { kmeansppSelection } from './algorithms/kmeans.js';
import { geneticAlgorithm } from './algorithms/genetic.js';
import { particleSwarmOptimization } from './algorithms/particleSwarm.js';
import { antColonyOptimization } from './algorithms/antColony.js';
import { tabuSearch } from './algorithms/tabu.js';
import { rgb2lab, deltaE, sortColors, calculateMetrics, analyzeColorDistribution, rgbToHex } from './utils/colorUtils.js';

// Expose the functions to the window object
window.algorithms = {
    maxSumDistancesGlobal,
    maxSumDistancesSequential,
    greedySelection,
    simulatedAnnealing,
    kmeansppSelection,
    geneticAlgorithm,
    particleSwarmOptimization,
    antColonyOptimization,
    tabuSearch
};

// Expose utility functions
window.rgb2lab = rgb2lab;
window.deltaE = deltaE;
window.sortColors = sortColors;
window.calculateMetrics = calculateMetrics;
window.analyzeColorDistribution = analyzeColorDistribution;
window.rgbToHex = rgbToHex; 