import { rgb2lab, deltaE, sortColors, mulberry32 } from '../utils/colorUtils.js';

export function kmeansppSelection(colors, selectCount, seed) {
    console.log('Starting K-means++ calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    
    // Use seeded PRNG if seed is provided
    const prng = typeof seed === 'number' ? mulberry32(seed) : Math.random;
    
    // Helper function to find minimum distance to existing centers
    function minDistanceToCenters(point, centers) {
        if (centers.length === 0) return Infinity;
        return Math.min(...centers.map(center => 
            deltaE(labColors[point], labColors[center])
        ));
    }
    
    // Select initial center randomly
    const selected = [Math.floor(prng() * colors.length)];
    
    // Select remaining centers using k-means++ initialization
    while (selected.length < selectCount) {
        const distances = Array.from({length: colors.length}, (_, i) => {
            if (selected.includes(i)) return 0;
            const dist = minDistanceToCenters(i, selected);
            return dist * dist; // Square distances for k-means++
        });
        
        const sum = distances.reduce((a, b) => a + b, 0);
        let random = prng() * sum;
        let selectedIndex = 0;
        
        while (random > 0 && selectedIndex < distances.length) {
            if (!selected.includes(selectedIndex)) {
                random -= distances[selectedIndex];
            }
            if (random > 0) selectedIndex++;
        }
        
        selected.push(selectedIndex);
    }
    
    return {
        colors: sortColors(selected.map(i => colors[i])),
        time: performance.now() - start
    };
} 