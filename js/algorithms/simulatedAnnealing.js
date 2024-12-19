import { rgb2lab, deltaE, sortColors } from '../utils/colorUtils.js';

export function simulatedAnnealing(colors, selectCount, settings = {}) {
    console.log('Starting Simulated Annealing calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const maxIterations = 10000;
    const initialTemp = settings.initialTemp ?? 1000;
    const coolingRate = settings.coolingRate ?? 0.995;
    const minTemp = settings.minTemp ?? 0.1;
    
    // Helper function to calculate minimum distance between selected colors
    function calculateFitness(selection) {
        let minDist = Infinity;
        for (let i = 0; i < selection.length - 1; i++) {
            for (let j = i + 1; j < selection.length; j++) {
                const dist = deltaE(labColors[selection[i]], labColors[selection[j]]);
                minDist = Math.min(minDist, dist);
            }
        }
        return minDist;
    }
    
    // Generate initial solution
    let currentSolution = Array.from({length: colors.length}, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, selectCount);
    let currentFitness = calculateFitness(currentSolution);
    
    let bestSolution = [...currentSolution];
    let bestFitness = currentFitness;
    
    let temperature = initialTemp;
    
    // Main loop
    for (let i = 0; i < maxIterations && temperature > minTemp; i++) {
        // Generate neighbor by swapping one selected color with an unselected one
        const neighborSolution = [...currentSolution];
        const swapIndex = Math.floor(Math.random() * selectCount);
        const availableIndices = Array.from({length: colors.length}, (_, i) => i)
            .filter(i => !currentSolution.includes(i));
        const newIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        neighborSolution[swapIndex] = newIndex;
        
        const neighborFitness = calculateFitness(neighborSolution);
        
        // Decide if we should accept the neighbor
        const delta = neighborFitness - currentFitness;
        if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
            currentSolution = neighborSolution;
            currentFitness = neighborFitness;
            
            if (currentFitness > bestFitness) {
                bestSolution = [...currentSolution];
                bestFitness = currentFitness;
            }
        }
        
        temperature *= coolingRate;
    }
    
    return {
        colors: sortColors(bestSolution.map(i => colors[i])),
        time: performance.now() - start
    };
} 