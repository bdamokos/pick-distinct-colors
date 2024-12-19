import { rgb2lab, deltaE } from './colorUtils.js';

export async function calibratePerformance() {
    // Generate a small set of test colors
    const testColors = Array.from({length: 10}, () => [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ]);
    
    const labColors = testColors.map(rgb2lab);
    const selectCount = 3;
    const startTime = performance.now();
    let combinationsChecked = 0;
    
    // Run test combinations for a short duration
    const testDuration = 100; // 100ms test
    while (performance.now() - startTime < testDuration) {
        // Simulate exact minimum calculation with a small set
        let maxMinDist = -Infinity;
        for (let i = 0; i < testColors.length - 2; i++) {
            for (let j = i + 1; j < testColors.length - 1; j++) {
                for (let k = j + 1; k < testColors.length; k++) {
                    let minDist = Infinity;
                    const combo = [i, j, k];
                    for (let x = 0; x < combo.length; x++) {
                        for (let y = x + 1; y < combo.length; y++) {
                            const dist = deltaE(labColors[combo[x]], labColors[combo[y]]);
                            minDist = Math.min(minDist, dist);
                        }
                    }
                    maxMinDist = Math.max(maxMinDist, minDist);
                    combinationsChecked++;
                }
            }
        }
    }
    
    // Calculate combinations per second
    const timeElapsed = (performance.now() - startTime) / 1000; // Convert to seconds
    const combinationsPerSecond = combinationsChecked / timeElapsed;
    
    return combinationsPerSecond;
} 