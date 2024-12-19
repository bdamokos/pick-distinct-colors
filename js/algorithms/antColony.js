import { rgb2lab, deltaE, sortColors } from '../utils/colorUtils.js';

export function antColonyOptimization(colors, selectCount, settings = {}) {
    console.log('Starting Ant Colony Optimization...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const numAnts = settings.numAnts ?? 20;
    const maxIterations = settings.acoIterations ?? 100;
    const evaporationRate = settings.evaporationRate ?? 0.1;
    const alpha = settings.pheromoneImportance ?? 1; // pheromone importance
    const beta = settings.heuristicImportance ?? 2;  // heuristic importance
    
    // Initialize pheromone trails
    const pheromones = Array(colors.length).fill(1);
    
    // Calculate heuristic information (distances between colors)
    const distances = Array(colors.length).fill().map(() => Array(colors.length));
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const distance = deltaE(labColors[i], labColors[j]);
            distances[i][j] = distance;
            distances[j][i] = distance;
        }
    }
    
    let bestSolution = null;
    let bestFitness = -Infinity;
    
    // Main ACO loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Solutions found by ants in this iteration
        const solutions = [];
        
        // Each ant constructs a solution
        for (let ant = 0; ant < numAnts; ant++) {
            const available = Array.from({length: colors.length}, (_, i) => i);
            const solution = [];
            
            // Randomly select first color
            const firstIndex = Math.floor(Math.random() * available.length);
            solution.push(available[firstIndex]);
            available.splice(firstIndex, 1);
            
            // Select remaining colors
            while (solution.length < selectCount) {
                // Calculate probabilities for each available color
                const probabilities = available.map(i => {
                    const pheromone = Math.pow(pheromones[i], alpha);
                    const minDist = Math.min(...solution.map(j => distances[i][j]));
                    const heuristic = Math.pow(minDist, beta);
                    return pheromone * heuristic;
                });
                
                // Select next color using roulette wheel selection
                const total = probabilities.reduce((a, b) => a + b, 0);
                let random = Math.random() * total;
                let selectedIndex = 0;
                
                while (random > 0 && selectedIndex < probabilities.length) {
                    random -= probabilities[selectedIndex];
                    if (random > 0) selectedIndex++;
                }
                
                solution.push(available[selectedIndex]);
                available.splice(selectedIndex, 1);
            }
            
            solutions.push(solution);
        }
        
        // Evaluate solutions and update best
        for (const solution of solutions) {
            const fitness = Math.min(...solution.map((i, idx) => 
                solution.slice(idx + 1).map(j => 
                    deltaE(labColors[i], labColors[j])
                )
            ).flat());
            
            if (fitness > bestFitness) {
                bestFitness = fitness;
                bestSolution = solution;
            }
        }
        
        // Update pheromones
        for (let i = 0; i < pheromones.length; i++) {
            pheromones[i] *= (1 - evaporationRate);
        }
        
        // Add new pheromones from solutions
        for (const solution of solutions) {
            const deposit = 1 / solution.length;
            for (const i of solution) {
                pheromones[i] += deposit;
            }
        }
    }
    
    return {
        colors: sortColors(bestSolution.map(i => colors[i])),
        time: performance.now() - start
    };
} 