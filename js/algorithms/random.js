import { sortColors, mulberry32 } from '../utils/colorUtils.js';
import { createExecutionBudget, validateSelectionArgs } from '../utils/securityLimits.js';

export function randomSelection(colors, selectCount, seed) {
    console.log('Starting Random Selection...');
    const start = performance.now();
    validateSelectionArgs(colors, selectCount);
    const checkBudget = createExecutionBudget('randomSelection');

    // Use seeded PRNG if seed is provided
    const prng = typeof seed === 'number' ? mulberry32(seed) : Math.random;

    // Randomly select indices without replacement
    const indices = Array.from({length: colors.length}, (_, i) => i);
    const selected = [];

    for (let i = 0; i < selectCount; i++) {
        checkBudget();
        const randomIndex = Math.floor(prng() * indices.length);
        selected.push(indices[randomIndex]);
        indices.splice(randomIndex, 1);
    }

    checkBudget();
    return {
        colors: sortColors(selected.map(i => colors[i])),
        time: performance.now() - start
    };
}
