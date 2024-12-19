import { rgb2lab, deltaE, sortColors } from '../utils/colorUtils.js';

export function maxSumDistancesGlobal(colors, selectCount) {
    console.log('Starting Maximum Sum (Global) calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    let bestSelection = null;
    let bestSum = -Infinity;
    
    // Calculate all pairwise distances
    const distances = Array(colors.length).fill().map(() => Array(colors.length));
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const distance = deltaE(labColors[i], labColors[j]);
            distances[i][j] = distance;
            distances[j][i] = distance;
        }
    }
    
    // Helper function to calculate sum of distances for a selection
    function calculateSum(selection) {
        let sum = 0;
        for (let i = 0; i < selection.length; i++) {
            for (let j = i + 1; j < selection.length; j++) {
                sum += distances[selection[i]][selection[j]];
            }
        }
        return sum;
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
        const sum = calculateSum(selection);
        if (sum > bestSum) {
            bestSum = sum;
            bestSelection = selection;
        }
    }
    
    return {
        colors: sortColors(bestSelection.map(i => colors[i])),
        time: performance.now() - start
    };
}

export function maxSumDistancesSequential(colors, selectCount) {
    console.log('Starting Maximum Sum (Sequential) calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const selected = [];
    const available = Array.from({length: colors.length}, (_, i) => i);
    
    // Helper function to calculate total distance from a point to selected points
    function calculateTotalDistance(index) {
        return selected.reduce((sum, selectedIndex) => 
            sum + deltaE(labColors[index], labColors[selectedIndex]), 0);
    }
    
    // Select first point randomly
    const firstIndex = Math.floor(Math.random() * available.length);
    selected.push(available[firstIndex]);
    available.splice(firstIndex, 1);
    
    // Select remaining points
    while (selected.length < selectCount) {
        let bestIndex = 0;
        let bestDistance = -Infinity;
        
        // Find point with maximum sum of distances to selected points
        for (let i = 0; i < available.length; i++) {
            const totalDistance = calculateTotalDistance(available[i]);
            if (totalDistance > bestDistance) {
                bestDistance = totalDistance;
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