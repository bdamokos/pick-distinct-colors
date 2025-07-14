import { rgb2lab, deltaE, sortColors, mulberry32 } from '../utils/colorUtils.js';

export function geneticAlgorithm(colors, selectCount, settings = {}) {
    console.log('Starting Genetic Algorithm calculation...');
    const start = performance.now();
    
    const labColors = colors.map(rgb2lab);
    const populationSize = settings.populationSize ?? 100;
    const generations = settings.generations ?? 100;
    const mutationRate = settings.mutationRate ?? 0.1;
    
    // Use seeded PRNG if settings.seed is provided
    const prng = typeof settings.seed === 'number' ? mulberry32(settings.seed) : Math.random;
    
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
    
    // Generate initial population
    let population = Array(populationSize).fill().map(() => 
        Array.from({length: colors.length}, (_, i) => i)
            .sort(() => prng() - 0.5)
            .slice(0, selectCount)
    );
    
    let bestSolution = population[0];
    let bestFitness = calculateFitness(bestSolution);
    
    // Main loop
    for (let generation = 0; generation < generations; generation++) {
        // Calculate fitness for each solution
        const fitnesses = population.map(calculateFitness);
        
        // Update best solution
        const maxFitnessIndex = fitnesses.indexOf(Math.max(...fitnesses));
        if (fitnesses[maxFitnessIndex] > bestFitness) {
            bestSolution = [...population[maxFitnessIndex]];
            bestFitness = fitnesses[maxFitnessIndex];
        }
        
        // Create new population through selection and crossover
        const newPopulation = [];
        
        while (newPopulation.length < populationSize) {
            // Tournament selection
            const tournament1 = Array(3).fill().map(() => Math.floor(prng() * populationSize));
            const tournament2 = Array(3).fill().map(() => Math.floor(prng() * populationSize));
            
            const parent1 = population[tournament1.reduce((a, b) => 
                fitnesses[a] > fitnesses[b] ? a : b)];
            const parent2 = population[tournament2.reduce((a, b) => 
                fitnesses[a] > fitnesses[b] ? a : b)];
            
            // Crossover
            const crossoverPoint = Math.floor(prng() * selectCount);
            const child = [...new Set([
                ...parent1.slice(0, crossoverPoint),
                ...parent2.slice(crossoverPoint)
            ])];
            
            // Fill up with random colors if needed
            while (child.length < selectCount) {
                const available = Array.from({length: colors.length}, (_, i) => i)
                    .filter(i => !child.includes(i));
                child.push(available[Math.floor(prng() * available.length)]);
            }
            
            // Mutation
            if (prng() < mutationRate) {
                const mutationIndex = Math.floor(prng() * selectCount);
                const available = Array.from({length: colors.length}, (_, i) => i)
                    .filter(i => !child.includes(i));
                child[mutationIndex] = available[Math.floor(prng() * available.length)];
            }
            
            newPopulation.push(child);
        }
        
        population = newPopulation;
    }
    
    return {
        colors: sortColors(bestSolution.map(i => colors[i])),
        time: performance.now() - start
    };
} 