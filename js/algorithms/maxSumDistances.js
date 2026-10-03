import { rgb2lab, deltaE, sortColors, mulberry32 } from '../utils/colorUtils.js';
import { SECURITY_LIMITS, createExecutionBudget, validatePairwiseSelectionArgs, validateSelectionArgs } from '../utils/securityLimits.js';

export function maxSumDistancesGlobal(colors, selectCount) {
    validatePairwiseSelectionArgs(colors, selectCount);
    return new Promise((resolve, reject) => {
        // Create worker code with utility functions in scope
        const workerCode = `
            // Import utility functions from parent
            const SECURITY_LIMITS = ${JSON.stringify(SECURITY_LIMITS)};
            const createExecutionBudget = ${createExecutionBudget.toString()};
            const rgb2lab = ${rgb2lab.toString()};
            const deltaE = ${deltaE.toString()};
            const sortColors = ${sortColors.toString()};

            // Main worker function
            function maxSumDistancesGlobal(colors, selectCount) {
                const start = performance.now();
                const checkBudget = createExecutionBudget('maxSumDistancesGlobal');
                const labColors = colors.map(rgb2lab);

                // Calculate total distances from each color to all other colors
                const totalDistances = colors.map((_, i) => {
                    checkBudget();
                    let sum = 0;
                    for (let j = 0; j < colors.length; j++) {
                        if (i !== j) {
                            sum += deltaE(labColors[i], labColors[j]);
                        }
                    }
                    return { index: i, sum };
                });

                // Sort colors by their total distance to all other colors
                totalDistances.sort((a, b) => b.sum - a.sum);

                // Take the top selectCount colors that have the highest total distances
                const selectedIndices = totalDistances.slice(0, selectCount).map(item => item.index);
                const selectedColors = selectedIndices.map(i => colors[i]);

                checkBudget();
                return {
                    colors: sortColors(selectedColors),
                    time: performance.now() - start
                };
            }

            // Worker message handler
            self.onmessage = function(e) {
                const { colors, selectCount } = e.data;
                try {
                    const result = maxSumDistancesGlobal(colors, selectCount);
                    self.postMessage({ type: 'complete', result });
                } catch (error) {
                    self.postMessage({ type: 'error', error: error.message, name: error.name });
                }
            };
        `;

        // Create blob and worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        function cleanup() {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        }

        // Set up worker message handlers
        worker.onmessage = function(e) {
            if (e.data.type === 'complete') {
                resolve(e.data.result);
            } else if (e.data.type === 'error') {
                reject(e.data.name === 'RangeError' ? new RangeError(e.data.error) : new Error(e.data.error));
            }
            cleanup();
        };

        worker.onerror = function(error) {
            reject(error);
            cleanup();
        };

        // Start the worker
        try {
            worker.postMessage({ colors, selectCount });
        } catch (error) {
            cleanup();
            reject(error);
        }
    });
}

export function maxSumDistancesSequential(colors, selectCount, seed) {
    console.log('Starting Maximum Sum (Sequential) calculation...');
    const start = performance.now();
    validateSelectionArgs(colors, selectCount);
    const checkBudget = createExecutionBudget('maxSumDistancesSequential');

    const labColors = colors.map(rgb2lab);
    const selected = [];
    const available = Array.from({length: colors.length}, (_, i) => i);

    // Use seeded PRNG if seed is provided
    const prng = typeof seed === 'number' ? mulberry32(seed) : Math.random;

    // Helper function to calculate total distance from a point to selected points
    function calculateTotalDistance(index) {
        return selected.reduce((sum, selectedIndex) =>
            sum + deltaE(labColors[index], labColors[selectedIndex]), 0);
    }

    // Select first point randomly
    const firstIndex = Math.floor(prng() * available.length);
    selected.push(available[firstIndex]);
    available.splice(firstIndex, 1);

    // Select remaining points
    while (selected.length < selectCount) {
        let bestIndex = 0;
        let bestDistance = -Infinity;

        // Find point with maximum sum of distances to selected points
        for (let i = 0; i < available.length; i++) {
            checkBudget();
            const totalDistance = calculateTotalDistance(available[i]);
            if (totalDistance > bestDistance) {
                bestDistance = totalDistance;
                bestIndex = i;
            }
        }

        selected.push(available[bestIndex]);
        available.splice(bestIndex, 1);
    }

    checkBudget();
    return {
        colors: sortColors(selected.map(i => colors[i])),
        time: performance.now() - start
    };
}
