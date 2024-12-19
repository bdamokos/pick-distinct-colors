import { rgb2lab, deltaE, sortColors } from '../utils/colorUtils.js';

export function exactMaximum(colors, selectCount) {
    console.log('Starting Exact Maximum calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    let bestSelection = null;
    let bestMaxDistance = -Infinity;
    
    // Helper function to calculate maximum distance between selected colors
    function calculateMaxDistance(selection) {
        let maxDist = -Infinity;
        for (let i = 0; i < selection.length - 1; i++) {
            for (let j = i + 1; j < selection.length; j++) {
                const dist = deltaE(labColors[selection[i]], labColors[selection[j]]);
                maxDist = Math.max(maxDist, dist);
            }
        }
        return maxDist;
    }
    
    // Generate all possible combinations
    function* combinations(arr, r) {
        if (r === 1) {
            for (let i = 0; i < arr.length; i++) {
                yield [arr[i]];
            }
            return;
        }
        
        for (let i = 0; i < arr.length - r + 1; i++) {
            const head = arr[i];
            const remaining = arr.slice(i + 1);
            for (const tail of combinations(remaining, r - 1)) {
                yield [head, ...tail];
            }
        }
    }
    
    // Try all combinations
    const indices = Array.from({length: colors.length}, (_, i) => i);
    for (const selection of combinations(indices, selectCount)) {
        const maxDistance = calculateMaxDistance(selection);
        if (maxDistance > bestMaxDistance) {
            bestMaxDistance = maxDistance;
            bestSelection = selection;
        }
    }
    
    return {
        colors: sortColors(bestSelection.map(i => colors[i])),
        time: performance.now() - start
    };
} 