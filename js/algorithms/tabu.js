import { rgb2lab, deltaE, sortColors } from '../utils/colorUtils.js';

export function tabuSearch(colors, selectCount, settings = {}) {
    console.log('Starting Tabu Search...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const maxIterations = settings.tabuIterations ?? 1000;
    const tabuTenure = settings.tabuTenure ?? 5;
    
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
    
    // Initialize solution
    let current = Array.from({length: selectCount}, (_, i) => i);
    let best = [...current];
    let bestFitness = calculateFitness(best);
    
    // Tabu list implementation using a Map to store move expiration
    const tabuList = new Map();
    
    // Generate move key for tabu list
    function getMoveKey(oldColor, newColor) {
        return `${oldColor}-${newColor}`;
    }
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let bestNeighborSolution = null;
        let bestNeighborFitness = -Infinity;
        
        // Examine all possible moves
        for (let i = 0; i < selectCount; i++) {
            for (let j = 0; j < colors.length; j++) {
                if (!current.includes(j)) {
                    const moveKey = getMoveKey(current[i], j);
                    const neighbor = [...current];
                    neighbor[i] = j;
                    
                    const fitness = calculateFitness(neighbor);
                    
                    // Accept if better than current best neighbor and not tabu
                    // or if satisfies aspiration criterion (better than global best)
                    if ((fitness > bestNeighborFitness && 
                         (!tabuList.has(moveKey) || tabuList.get(moveKey) <= iteration)) ||
                        fitness > bestFitness) {
                        bestNeighborSolution = neighbor;
                        bestNeighborFitness = fitness;
                    }
                }
            }
        }
        
        if (!bestNeighborSolution) break;
        
        // Update current solution
        current = bestNeighborSolution;
        
        // Update best solution if improved
        if (bestNeighborFitness > bestFitness) {
            best = [...current];
            bestFitness = bestNeighborFitness;
        }
        
        // Update tabu list
        for (let i = 0; i < selectCount; i++) {
            const moveKey = getMoveKey(current[i], best[i]);
            tabuList.set(moveKey, iteration + tabuTenure);
        }
        
        // Clean expired tabu moves
        for (const [move, expiration] of tabuList.entries()) {
            if (expiration <= iteration) {
                tabuList.delete(move);
            }
        }
    }
    
    return {
        colors: sortColors(best.map(i => colors[i])),
        time: performance.now() - start
    };
} 