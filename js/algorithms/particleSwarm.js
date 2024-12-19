import { rgb2lab, deltaE, sortColors } from '../utils/colorUtils.js';

export function particleSwarmOptimization(colors, selectCount, settings = {}) {
    console.log('Starting Particle Swarm Optimization...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const numParticles = settings.numParticles ?? 30;
    const maxIterations = settings.psoIterations ?? 100;
    const w = settings.inertiaWeight ?? 0.7;  // inertia weight
    const c1 = settings.cognitiveWeight ?? 1.5; // cognitive weight
    const c2 = settings.socialWeight ?? 1.5; // social weight
    
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
    
    // Initialize particles
    const particles = Array(numParticles).fill().map(() => ({
        position: Array.from({length: colors.length}, (_, i) => i)
            .sort(() => Math.random() - 0.5)
            .slice(0, selectCount),
        velocity: Array(selectCount).fill(0),
        bestPosition: null,
        bestFitness: -Infinity
    }));
    
    let globalBestPosition = null;
    let globalBestFitness = -Infinity;
    
    // Main loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        for (const particle of particles) {
            // Calculate fitness
            const fitness = calculateFitness(particle.position);
            
            // Update particle's best
            if (fitness > particle.bestFitness) {
                particle.bestPosition = [...particle.position];
                particle.bestFitness = fitness;
                
                // Update global best
                if (fitness > globalBestFitness) {
                    globalBestPosition = [...particle.position];
                    globalBestFitness = fitness;
                }
            }
            
            // Update velocity and position
            for (let i = 0; i < selectCount; i++) {
                const r1 = Math.random();
                const r2 = Math.random();
                
                particle.velocity[i] = Math.floor(
                    w * particle.velocity[i] +
                    c1 * r1 * (particle.bestPosition[i] - particle.position[i]) +
                    c2 * r2 * (globalBestPosition[i] - particle.position[i])
                );
                
                // Apply velocity (swap with another color)
                if (particle.velocity[i] !== 0) {
                    const available = Array.from({length: colors.length}, (_, i) => i)
                        .filter(j => !particle.position.includes(j));
                    if (available.length > 0) {
                        const swapIndex = Math.floor(Math.random() * available.length);
                        particle.position[i] = available[swapIndex];
                    }
                }
            }
        }
    }
    
    return {
        colors: sortColors(globalBestPosition.map(i => colors[i])),
        time: performance.now() - start
    };
} 