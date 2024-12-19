import { sortColors } from '../utils/colorUtils.js';

export function randomSelection(colors, selectCount) {
    console.log('Starting Random Selection...');
    const start = performance.now();
    
    // Randomly select indices without replacement
    const indices = Array.from({length: colors.length}, (_, i) => i);
    const selected = [];
    
    for (let i = 0; i < selectCount; i++) {
        const randomIndex = Math.floor(Math.random() * indices.length);
        selected.push(indices[randomIndex]);
        indices.splice(randomIndex, 1);
    }
    
    return {
        colors: sortColors(selected.map(i => colors[i])),
        time: performance.now() - start
    };
} 