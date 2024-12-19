export function getAlgorithmExplanation(algorithmName) {
    const explanations = {
        'Maximum Sum Global': 
            'This algorithm calculates the total deltaE distance from each color to all other colors in the ' +
            'initial set, then selects the N colors that have the highest total distances globally. Colors with ' +
            'high deltaE distances to many other colors in the complete set are selected, optimizing for colors ' +
            'that are generally different from the entire set.',
        
        'Maximum Sum Sequential': 
            'This algorithm uses a sequential selection process. It first calculates total distances and picks the ' +
            'color with the highest global distance. Then, for each subsequent selection, it chooses the color that ' +
            'maximizes the sum of distances to only the previously selected colors, building the palette one color ' +
            'at a time.',
        
        'Greedy': 
            'Starting with the first color, this algorithm iteratively selects the color that has the maximum minimum ' +
            'distance to all previously selected colors. It builds the solution step by step, making the locally optimal ' +
            'choice at each step. While not guaranteed to find the global optimum, it usually produces good results quickly.',
        
        'Simulated Annealing': 
            'This is a probabilistic optimization algorithm inspired by the annealing process in metallurgy. It starts with ' +
            'a random selection and iteratively makes small changes, accepting improvements and occasionally accepting worse ' +
            'solutions based on a decreasing "temperature" parameter. This allows it to escape local optima and potentially ' +
            'find better solutions than greedy approaches.',
        
        'K Means': 
            'This algorithm uses the k-means++ initialization strategy to select diverse colors. It starts by randomly ' +
            'selecting one color, then iteratively chooses subsequent colors with probability proportional to their squared ' +
            'distance from the nearest already-selected color. This tends to produce well-distributed selections quickly.',
        
        'Genetic Algorithm': 
            'Inspired by natural evolution, this algorithm maintains a population of potential solutions and evolves them ' +
            'through selection, crossover, and mutation operations. Solutions with better minimum distances between colors ' +
            'are more likely to survive and produce offspring, leading to increasingly better selections over generations.',
        
        'Particle Swarm': 
            'Based on swarm intelligence, this algorithm simulates particles moving through the solution space. Each particle ' +
            'adjusts its trajectory based on its own best known position and the swarm\'s best known position. This social ' +
            'behavior helps particles converge on optimal color selections.',
        
        'Ant Colony': 
            'This algorithm simulates how ants find optimal paths using pheromone trails. Virtual ants construct solutions ' +
            'by selecting colors, leaving pheromone trails proportional to solution quality. Over time, stronger trails ' +
            'emerge for better color combinations, guiding future selections.',
        
        'Tabu Search': 
            'This algorithm uses memory structures (tabu lists) to guide a local search procedure. It prevents cycling back ' +
            'to recently visited solutions by maintaining a list of forbidden moves, while allowing the search to escape ' +
            'local optima through strategic acceptance of non-improving moves.',
        
        'Exact Minimum': 
            'This algorithm performs an exhaustive search through all possible combinations of colors to find the globally ' +
            'optimal solution. It guarantees finding the best possible selection but becomes computationally intensive for ' +
            'large sets. It has a time complexity of O(n choose k), where n is the total number of colors and k is the ' +
            'number of colors to select.'
    };
    
    return explanations[algorithmName] || 'No explanation available for this algorithm.';
} 