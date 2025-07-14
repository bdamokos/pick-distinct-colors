import { rgb2lab, deltaE, sortColors, mulberry32 } from '../utils/colorUtils.js';

export function greedySelection(colors, selectCount, seed) {
    console.log('Starting Greedy calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const selected = [];
    const available = Array.from({length: colors.length}, (_, i) => i);
    
    // Use seeded PRNG if seed is provided
    const prng = typeof seed === 'number' ? mulberry32(seed) : Math.random;
    
    // Helper function to calculate minimum distance from a point to selected points
    function calculateMinDistance(index) {
        if (selected.length === 0) return Infinity;
        return Math.min(...selected.map(selectedIndex => 
            deltaE(labColors[index], labColors[selectedIndex])
        ));
    }
    
    // Select first point randomly
    const firstIndex = Math.floor(prng() * available.length);
    selected.push(available[firstIndex]);
    available.splice(firstIndex, 1);
    
    // Select remaining points
    while (selected.length < selectCount) {
        let bestIndex = 0;
        let bestMinDistance = -Infinity;
        
        // Find point with maximum minimum distance to selected points
        for (let i = 0; i < available.length; i++) {
            const minDistance = calculateMinDistance(available[i]);
            if (minDistance > bestMinDistance) {
                bestMinDistance = minDistance;
                bestIndex = i;
            }
        }
        
        selected.push(available[bestIndex]);
        available.splice(bestIndex, 1);
    }
    
    return {
        colors: sortColors(selected.map(i => colors[i])),
        time: performance.now() - start
    };
} 