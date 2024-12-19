// Import all the functions we need
import { maxSumDistancesGlobal, maxSumDistancesSequential } from './algorithms/maxSumDistances.js';
import { rgb2lab, deltaE, sortColors, calculateMetrics, analyzeColorDistribution, rgbToHex } from './utils/colorUtils.js';

// Expose the functions to the window object
window.algorithms = {
    maxSumDistancesGlobal,
    maxSumDistancesSequential
};

// Expose utility functions
window.rgb2lab = rgb2lab;
window.deltaE = deltaE;
window.sortColors = sortColors;
window.calculateMetrics = calculateMetrics;
window.analyzeColorDistribution = analyzeColorDistribution;
window.rgbToHex = rgbToHex; 