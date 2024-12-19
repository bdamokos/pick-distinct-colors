// Import all the functions we need
import { maxSumDistancesGlobal, maxSumDistancesSequential } from './algorithms/maxSumDistances.js';
import { greedySelection } from './algorithms/greedy.js';
import { simulatedAnnealing } from './algorithms/simulatedAnnealing.js';
import { kmeansppSelection } from './algorithms/kmeans.js';
import { geneticAlgorithm } from './algorithms/genetic.js';
import { particleSwarmOptimization } from './algorithms/particleSwarm.js';
import { antColonyOptimization } from './algorithms/antColony.js';
import { tabuSearch } from './algorithms/tabu.js';
import { exactMaximum } from './algorithms/exactMaximum.js';
import { exactMinimum } from './algorithms/exactMinimum.js';
import { randomSelection } from './algorithms/random.js';
import { rgb2lab, deltaE, sortColors, calculateMetrics, analyzeColorDistribution, rgbToHex, calculateDistanceMatrix, randomColor, findClosestPair } from './utils/colorUtils.js';
import { formatExecutionTime, formatTimeEstimate } from './utils/timeUtils.js';
import { createSpectrumPlot } from './utils/plotUtils.js';
import { getAlgorithmExplanation } from './utils/algorithmUtils.js';
import { calibratePerformance } from './utils/performanceUtils.js';
import { showSpinner, hideSpinner, toggleSettings, toggleImportPanel, initializePage, updateGenerateButtonText, updateComplexityEstimate, generateInitialColors } from './utils/uiUtils.js';
import { showExportModal, updateExportText, copyToClipboard, importColors, parseColorInput } from './utils/importExportUtils.js';
import { startCalculation, updateRankings } from './utils/calculationUtils.js';

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
    tabuSearch,
    exactMaximum,
    exactMinimum,
    randomSelection
};

// Expose utility functions
window.rgb2lab = rgb2lab;
window.deltaE = deltaE;
window.sortColors = sortColors;
window.calculateMetrics = calculateMetrics;
window.analyzeColorDistribution = analyzeColorDistribution;
window.rgbToHex = rgbToHex;
window.calculateDistanceMatrix = calculateDistanceMatrix;
window.formatExecutionTime = formatExecutionTime;
window.formatTimeEstimate = formatTimeEstimate;
window.randomColor = randomColor;
window.findClosestPair = findClosestPair;
window.createSpectrumPlot = createSpectrumPlot;
window.getAlgorithmExplanation = getAlgorithmExplanation;
window.calibratePerformance = calibratePerformance;

// Expose UI functions
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.toggleSettings = toggleSettings;
window.toggleImportPanel = toggleImportPanel;
window.initializePage = initializePage;
window.updateGenerateButtonText = updateGenerateButtonText;
window.updateComplexityEstimate = updateComplexityEstimate;
window.generateInitialColors = generateInitialColors;

// Expose import/export functions
window.showExportModal = showExportModal;
window.updateExportText = updateExportText;
window.copyToClipboard = copyToClipboard;
window.importColors = importColors;
window.parseColorInput = parseColorInput;

// Expose calculation functions
window.startCalculation = startCalculation;
window.updateRankings = updateRankings; 