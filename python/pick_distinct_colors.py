"""
pick-distinct-colors: A Python implementation of algorithms for selecting maximally distinct colors.

This module provides various optimization algorithms for selecting a subset of colors
that maximizes the minimum distance between them in the CIELAB color space.
"""

import math
import random
import time
from itertools import combinations
from typing import List, Tuple, Dict, Any, Optional


def rgb_to_lab(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    """Convert RGB color to CIELAB color space."""
    r, g, b = rgb[0] / 255, rgb[1] / 255, rgb[2] / 255
    
    # Gamma correction
    r = ((r + 0.055) / 1.055) ** 2.4 if r > 0.04045 else r / 12.92
    g = ((g + 0.055) / 1.055) ** 2.4 if g > 0.04045 else g / 12.92
    b = ((b + 0.055) / 1.055) ** 2.4 if b > 0.04045 else b / 12.92
    
    # Convert to XYZ
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100
    
    # Normalize by illuminant D65
    x /= 95.047
    y /= 100
    z /= 108.883
    
    # Convert to LAB
    x = x ** (1/3) if x > 0.008856 else (7.787 * x) + 16/116
    y = y ** (1/3) if y > 0.008856 else (7.787 * y) + 16/116
    z = z ** (1/3) if z > 0.008856 else (7.787 * z) + 16/116
    
    L = (116 * y) - 16
    a = 500 * (x - y)
    b = 200 * (y - z)
    
    return L, a, b


def delta_e(lab_a: Tuple[float, float, float], lab_b: Tuple[float, float, float]) -> float:
    """Calculate CIE76 Delta E distance between two LAB colors."""
    delta_L = lab_a[0] - lab_b[0]
    delta_a = lab_a[1] - lab_b[1]
    delta_b = lab_a[2] - lab_b[2]
    return math.sqrt(delta_L ** 2 + delta_a ** 2 + delta_b ** 2)


def sort_colors(colors: List[Tuple[int, int, int]]) -> List[Tuple[int, int, int]]:
    """Sort colors by LAB values (L, then a, then b)."""
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    indices = list(range(len(colors)))
    
    # Sort by L (descending), then a (descending), then b (descending)
    indices.sort(key=lambda i: (-lab_colors[i][0], -lab_colors[i][1], -lab_colors[i][2]))
    
    return [colors[i] for i in indices]


def calculate_metrics(colors: List[Tuple[int, int, int]]) -> Dict[str, float]:
    """Calculate distance metrics for a set of colors."""
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    distances = []
    
    for i in range(len(colors) - 1):
        for j in range(i + 1, len(colors)):
            dist = delta_e(lab_colors[i], lab_colors[j])
            distances.append(dist)
    
    if not distances:
        return {'min': 0, 'max': 0, 'avg': 0, 'sum': 0}
    
    return {
        'min': min(distances),
        'max': max(distances),
        'avg': sum(distances) / len(distances),
        'sum': sum(distances)
    }


def random_color() -> Tuple[int, int, int]:
    """Generate a random RGB color."""
    return (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))


def generate_random_colors(count: int) -> List[Tuple[int, int, int]]:
    """Generate a list of random RGB colors."""
    return [random_color() for _ in range(count)]


def generate_color_palette(total_colors: int = 30, 
                          custom_colors: Optional[List[Tuple[int, int, int]]] = None,
                          mode: str = 'replace') -> List[Tuple[int, int, int]]:
    """
    Generate a color palette, optionally incorporating custom colors.
    
    Args:
        total_colors: Number of random colors to generate
        custom_colors: Optional list of custom RGB colors to include
        mode: How to handle custom colors:
            - 'replace': Use only custom colors, ignore total_colors
            - 'append': Generate random colors AND add custom colors
            - 'mixed': Replace some random colors with custom colors
    
    Returns:
        List of RGB color tuples
    """
    if custom_colors is None:
        custom_colors = []
    
    if mode == 'replace' and custom_colors:
        # Use only the custom colors
        return custom_colors[:]
    
    elif mode == 'append':
        # Generate random colors and add custom colors
        random_colors = generate_random_colors(total_colors)
        return random_colors + custom_colors
    
    elif mode == 'mixed' and custom_colors:
        # Generate random colors, then replace some with custom colors
        random_colors = generate_random_colors(total_colors)
        
        # Replace up to len(custom_colors) random colors with custom ones
        num_to_replace = min(len(custom_colors), len(random_colors))
        
        # Replace from the beginning
        for i in range(num_to_replace):
            random_colors[i] = custom_colors[i]
        
        # If we have more custom colors than random colors, add the rest
        if len(custom_colors) > len(random_colors):
            random_colors.extend(custom_colors[len(random_colors):])
        
        return random_colors
    
    else:
        # Default: just generate random colors
        return generate_random_colors(total_colors)


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        raise ValueError(f"Invalid hex color: {hex_color}")
    
    try:
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    except ValueError:
        raise ValueError(f"Invalid hex color: {hex_color}")


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """Convert RGB tuple to hex color string."""
    return '#' + ''.join(f'{c:02x}' for c in rgb)


def parse_color_string(color_str: str) -> Tuple[int, int, int]:
    """
    Parse a color string in various formats to RGB tuple.
    
    Supports:
    - Hex: #RRGGBB or RRGGBB
    - RGB function: rgb(r,g,b) or RGB(r,g,b)
    - Comma-separated: r,g,b
    - Space-separated: r g b
    """
    color_str = color_str.strip()
    
    # Hex format
    if color_str.startswith('#') or (len(color_str) == 6 and all(c in '0123456789abcdefABCDEF' for c in color_str)):
        return hex_to_rgb(color_str)
    
    # RGB function format
    if color_str.lower().startswith('rgb(') and color_str.endswith(')'):
        rgb_values = color_str[4:-1].split(',')
        if len(rgb_values) == 3:
            try:
                rgb_tuple = tuple(int(v.strip()) for v in rgb_values)
                if all(0 <= c <= 255 for c in rgb_tuple):
                    return rgb_tuple
            except ValueError:
                pass
    
    # Comma or space separated
    for separator in [',', ' ']:
        if separator in color_str:
            rgb_values = color_str.split(separator)
            if len(rgb_values) == 3:
                try:
                    rgb_tuple = tuple(int(v.strip()) for v in rgb_values)
                    if all(0 <= c <= 255 for c in rgb_tuple):
                        return rgb_tuple
                except ValueError:
                    pass
    
    raise ValueError(f"Could not parse color string: {color_str}")


def parse_color_list(color_text: str) -> List[Tuple[int, int, int]]:
    """
    Parse a text containing multiple colors in various formats.
    
    Supports:
    - One color per line in any supported format
    - JavaScript array format: [[r,g,b], [r,g,b], ...]
    - JSON array format: [[r,g,b], [r,g,b], ...]
    """
    color_text = color_text.strip()
    colors = []
    
    # Try to parse as JSON/JavaScript array first
    if color_text.startswith('[') and color_text.endswith(']'):
        try:
            import json
            # Try parsing as JSON
            parsed = json.loads(color_text)
            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, list) and len(item) == 3:
                        colors.append(tuple(int(v) for v in item))
                return colors
        except (json.JSONDecodeError, ValueError):
            pass
        
        # Try parsing as JavaScript array (without JSON)
        try:
            # Remove brackets and split by arrays
            inner = color_text[1:-1]
            # Simple parsing for [[r,g,b], [r,g,b]] format
            import re
            matches = re.findall(r'\[(\d+),\s*(\d+),\s*(\d+)\]', inner)
            for match in matches:
                colors.append(tuple(int(v) for v in match))
            if colors:
                return colors
        except:
            pass
    
    # Parse line by line
    lines = color_text.split('\n')
    for line in lines:
        line = line.strip()
        if line:  # Skip empty lines
            try:
                color = parse_color_string(line)
                colors.append(color)
            except ValueError:
                # Skip invalid lines
                continue
    
    return colors


def greedy_selection(colors: List[Tuple[int, int, int]], select_count: int, 
                    settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Greedy algorithm that selects colors with maximum minimum distance to already selected colors.
    """
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    selected = []
    available = list(range(len(colors)))
    
    def calculate_min_distance(index: int) -> float:
        if not selected:
            return float('inf')
        return min(delta_e(lab_colors[index], lab_colors[sel_idx]) for sel_idx in selected)
    
    # Select first color randomly
    first_idx = random.randint(0, len(available) - 1)
    selected.append(available.pop(first_idx))
    
    # Select remaining colors
    while len(selected) < select_count:
        best_idx = 0
        best_min_distance = -float('inf')
        
        for i, idx in enumerate(available):
            min_distance = calculate_min_distance(idx)
            if min_distance > best_min_distance:
                best_min_distance = min_distance
                best_idx = i
        
        selected.append(available.pop(best_idx))
    
    selected_colors = [colors[i] for i in selected]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000  # Convert to milliseconds
    }


def max_sum_distances_global(colors: List[Tuple[int, int, int]], select_count: int,
                            _settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Select colors with highest total distances to all other colors.
    """
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    
    # Calculate total distances from each color to all others
    total_distances = []
    for i in range(len(colors)):
        total_dist = sum(delta_e(lab_colors[i], lab_colors[j]) 
                        for j in range(len(colors)) if i != j)
        total_distances.append((i, total_dist))
    
    # Sort by total distance (descending) and select top colors
    total_distances.sort(key=lambda x: x[1], reverse=True)
    selected_indices = [idx for idx, _ in total_distances[:select_count]]
    selected_colors = [colors[i] for i in selected_indices]
    
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def max_sum_distances_sequential(colors: List[Tuple[int, int, int]], select_count: int,
                                _settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Sequentially select colors with maximum sum of distances to already selected colors.
    """
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    selected = []
    available = list(range(len(colors)))
    
    def calculate_total_distance(index: int) -> float:
        return sum(delta_e(lab_colors[index], lab_colors[sel_idx]) for sel_idx in selected)
    
    # Select first color randomly
    first_idx = random.randint(0, len(available) - 1)
    selected.append(available.pop(first_idx))
    
    # Select remaining colors
    while len(selected) < select_count:
        best_idx = 0
        best_distance = -float('inf')
        
        for i, idx in enumerate(available):
            total_distance = calculate_total_distance(idx)
            if total_distance > best_distance:
                best_distance = total_distance
                best_idx = i
        
        selected.append(available.pop(best_idx))
    
    selected_colors = [colors[i] for i in selected]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def simulated_annealing(colors: List[Tuple[int, int, int]], select_count: int, 
                       settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Simulated annealing optimization for color selection.
    """
    if settings is None:
        settings = {}
    
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    max_iterations = 10000
    initial_temp = settings.get('initialTemp', 1000)
    cooling_rate = settings.get('coolingRate', 0.995)
    min_temp = settings.get('minTemp', 0.1)
    
    def calculate_fitness(selection: List[int]) -> float:
        min_dist = float('inf')
        for i in range(len(selection) - 1):
            for j in range(i + 1, len(selection)):
                dist = delta_e(lab_colors[selection[i]], lab_colors[selection[j]])
                min_dist = min(min_dist, dist)
        return min_dist
    
    # Generate initial solution
    current_solution = random.sample(range(len(colors)), select_count)
    current_fitness = calculate_fitness(current_solution)
    
    best_solution = current_solution[:]
    best_fitness = current_fitness
    
    temperature = initial_temp
    
    # Main loop
    for i in range(max_iterations):
        if temperature <= min_temp:
            break
            
        # Generate neighbor by swapping one selected color with an unselected one
        neighbor_solution = current_solution[:]
        swap_index = random.randint(0, select_count - 1)
        available_indices = [i for i in range(len(colors)) if i not in current_solution]
        new_index = random.choice(available_indices)
        neighbor_solution[swap_index] = new_index
        
        neighbor_fitness = calculate_fitness(neighbor_solution)
        
        # Decide if we should accept the neighbor
        delta = neighbor_fitness - current_fitness
        if delta > 0 or random.random() < math.exp(delta / temperature):
            current_solution = neighbor_solution
            current_fitness = neighbor_fitness
            
            if current_fitness > best_fitness:
                best_solution = current_solution[:]
                best_fitness = current_fitness
        
        temperature *= cooling_rate
    
    selected_colors = [colors[i] for i in best_solution]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def kmeans_plus_plus_selection(colors: List[Tuple[int, int, int]], select_count: int,
                              _settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    K-means++ initialization for color selection.
    """
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    
    def min_distance_to_centers(point: int, centers: List[int]) -> float:
        if not centers:
            return float('inf')
        return min(delta_e(lab_colors[point], lab_colors[center]) for center in centers)
    
    # Select initial center randomly
    selected = [random.randint(0, len(colors) - 1)]
    
    # Select remaining centers using k-means++ initialization
    while len(selected) < select_count:
        distances = []
        for i in range(len(colors)):
            if i in selected:
                distances.append(0)
            else:
                dist = min_distance_to_centers(i, selected)
                distances.append(dist * dist)  # Square distances for k-means++
        
        total = sum(distances)
        if total == 0:
            # All remaining colors have zero distance, select randomly
            available = [i for i in range(len(colors)) if i not in selected]
            selected.append(random.choice(available))
        else:
            random_val = random.random() * total
            selected_index = 0
            
            while random_val > 0 and selected_index < len(distances):
                if selected_index not in selected:
                    random_val -= distances[selected_index]
                if random_val > 0:
                    selected_index += 1
            
            selected.append(selected_index)
    
    selected_colors = [colors[i] for i in selected]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def genetic_algorithm(colors: List[Tuple[int, int, int]], select_count: int,
                     settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Genetic algorithm for color selection optimization.
    """
    if settings is None:
        settings = {}
    
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    population_size = settings.get('populationSize', 100)
    generations = settings.get('generations', 100)
    mutation_rate = settings.get('mutationRate', 0.1)
    
    def calculate_fitness(selection: List[int]) -> float:
        min_dist = float('inf')
        for i in range(len(selection) - 1):
            for j in range(i + 1, len(selection)):
                dist = delta_e(lab_colors[selection[i]], lab_colors[selection[j]])
                min_dist = min(min_dist, dist)
        return min_dist
    
    # Generate initial population
    population = []
    for _ in range(population_size):
        individual = random.sample(range(len(colors)), select_count)
        population.append(individual)
    
    best_solution = population[0]
    best_fitness = calculate_fitness(best_solution)
    
    # Main loop
    for generation in range(generations):
        # Calculate fitness for each solution
        fitnesses = [calculate_fitness(individual) for individual in population]
        
        # Update best solution
        max_fitness_index = fitnesses.index(max(fitnesses))
        if fitnesses[max_fitness_index] > best_fitness:
            best_solution = population[max_fitness_index][:]
            best_fitness = fitnesses[max_fitness_index]
        
        # Create new population through selection and crossover
        new_population = []
        
        while len(new_population) < population_size:
            # Tournament selection
            tournament1 = [random.randint(0, population_size - 1) for _ in range(3)]
            tournament2 = [random.randint(0, population_size - 1) for _ in range(3)]
            
            parent1_idx = max(tournament1, key=lambda i: fitnesses[i])
            parent2_idx = max(tournament2, key=lambda i: fitnesses[i])
            
            parent1 = population[parent1_idx]
            parent2 = population[parent2_idx]
            
            # Crossover
            crossover_point = random.randint(0, select_count - 1)
            child = list(set(parent1[:crossover_point] + parent2[crossover_point:]))
            
            # Fill up with random colors if needed
            while len(child) < select_count:
                available = [i for i in range(len(colors)) if i not in child]
                child.append(random.choice(available))
            
            child = child[:select_count]  # Ensure exact size
            
            # Mutation
            if random.random() < mutation_rate:
                mutation_index = random.randint(0, select_count - 1)
                available = [i for i in range(len(colors)) if i not in child]
                if available:
                    child[mutation_index] = random.choice(available)
            
            new_population.append(child)
        
        population = new_population
    
    selected_colors = [colors[i] for i in best_solution]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def particle_swarm_optimization(colors: List[Tuple[int, int, int]], select_count: int,
                               settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Particle Swarm Optimization for color selection.
    """
    if settings is None:
        settings = {}
    
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    num_particles = settings.get('numParticles', 30)
    max_iterations = settings.get('iterations', 100)
    w = settings.get('inertiaWeight', 0.7)
    c1 = settings.get('cognitiveWeight', 1.5)
    c2 = settings.get('socialWeight', 1.5)
    
    def calculate_fitness(selection: List[int]) -> float:
        min_dist = float('inf')
        for i in range(len(selection) - 1):
            for j in range(i + 1, len(selection)):
                dist = delta_e(lab_colors[selection[i]], lab_colors[selection[j]])
                min_dist = min(min_dist, dist)
        return min_dist
    
    # Initialize particles
    particles = []
    for _ in range(num_particles):
        position = random.sample(range(len(colors)), select_count)
        particle = {
            'position': position,
            'velocity': [0] * select_count,
            'best_position': position[:],
            'best_fitness': calculate_fitness(position)
        }
        particles.append(particle)
    
    global_best_position = particles[0]['best_position'][:]
    global_best_fitness = particles[0]['best_fitness']
    
    # Find initial global best
    for particle in particles:
        if particle['best_fitness'] > global_best_fitness:
            global_best_position = particle['best_position'][:]
            global_best_fitness = particle['best_fitness']
    
    # Main loop
    for iteration in range(max_iterations):
        for particle in particles:
            # Calculate fitness
            fitness = calculate_fitness(particle['position'])
            
            # Update particle's best
            if fitness > particle['best_fitness']:
                particle['best_position'] = particle['position'][:]
                particle['best_fitness'] = fitness
                
                # Update global best
                if fitness > global_best_fitness:
                    global_best_position = particle['position'][:]
                    global_best_fitness = fitness
            
            # Update velocity and position (simplified discrete version)
            for i in range(select_count):
                r1 = random.random()
                r2 = random.random()
                
                # Simplified velocity update for discrete space
                if random.random() < 0.5:  # Random component for exploration
                    available = [j for j in range(len(colors)) if j not in particle['position']]
                    if available:
                        particle['position'][i] = random.choice(available)
    
    selected_colors = [colors[i] for i in global_best_position]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def ant_colony_optimization(colors: List[Tuple[int, int, int]], select_count: int,
                           settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Ant Colony Optimization for color selection.
    """
    if settings is None:
        settings = {}
    
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    num_ants = settings.get('numAnts', 20)
    max_iterations = settings.get('iterations', 100)
    evaporation_rate = settings.get('evaporationRate', 0.1)
    alpha = settings.get('pheromoneImportance', 1)
    beta = settings.get('heuristicImportance', 2)
    
    # Initialize pheromone trails
    pheromones = [1.0] * len(colors)
    
    # Calculate heuristic information (distances between colors)
    distances = [[0.0] * len(colors) for _ in range(len(colors))]
    for i in range(len(colors)):
        for j in range(i + 1, len(colors)):
            distance = delta_e(lab_colors[i], lab_colors[j])
            distances[i][j] = distance
            distances[j][i] = distance
    
    best_solution = None
    best_fitness = -float('inf')
    
    # Main ACO loop
    for iteration in range(max_iterations):
        solutions = []
        
        # Each ant constructs a solution
        for ant in range(num_ants):
            available = list(range(len(colors)))
            solution = []
            
            # Randomly select first color
            first_index = random.randint(0, len(available) - 1)
            solution.append(available.pop(first_index))
            
            # Select remaining colors
            while len(solution) < select_count and available:
                # Calculate probabilities for each available color
                probabilities = []
                for i in available:
                    pheromone = pheromones[i] ** alpha
                    min_dist = min(distances[i][j] for j in solution) if solution else 1
                    heuristic = min_dist ** beta
                    probabilities.append(pheromone * heuristic)
                
                # Select next color using roulette wheel selection
                total = sum(probabilities)
                if total == 0:
                    selected_index = random.choice(available)
                else:
                    random_val = random.random() * total
                    selected_index = 0
                    
                    while random_val > 0 and selected_index < len(probabilities):
                        random_val -= probabilities[selected_index]
                        if random_val > 0:
                            selected_index += 1
                    
                    selected_index = available[min(selected_index, len(available) - 1)]
                
                solution.append(selected_index)
                available.remove(selected_index)
            
            solutions.append(solution)
        
        # Evaluate solutions and update best
        for solution in solutions:
            if len(solution) == select_count:
                fitness = min(delta_e(lab_colors[solution[i]], lab_colors[solution[j]])
                            for i in range(len(solution) - 1)
                            for j in range(i + 1, len(solution)))
                
                if fitness > best_fitness:
                    best_fitness = fitness
                    best_solution = solution
        
        # Update pheromones
        for i in range(len(pheromones)):
            pheromones[i] *= (1 - evaporation_rate)
        
        # Add new pheromones from solutions
        for solution in solutions:
            if len(solution) == select_count:
                deposit = 1.0 / len(solution)
                for i in solution:
                    pheromones[i] += deposit
    
    if best_solution is None:
        best_solution = random.sample(range(len(colors)), select_count)
    
    selected_colors = [colors[i] for i in best_solution]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def tabu_search(colors: List[Tuple[int, int, int]], select_count: int,
               settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Tabu Search for color selection optimization.
    """
    if settings is None:
        settings = {}
    
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    max_iterations = settings.get('maxIterations', 1000)
    tabu_tenure = settings.get('tabuTenure', 5)
    
    def calculate_fitness(selection: List[int]) -> float:
        min_dist = float('inf')
        for i in range(len(selection) - 1):
            for j in range(i + 1, len(selection)):
                dist = delta_e(lab_colors[selection[i]], lab_colors[selection[j]])
                min_dist = min(min_dist, dist)
        return min_dist
    
    # Initialize solution
    current = list(range(select_count))
    best = current[:]
    best_fitness = calculate_fitness(best)
    
    # Tabu list implementation
    tabu_list = {}
    
    def get_move_key(old_color: int, new_color: int) -> str:
        return f"{old_color}-{new_color}"
    
    for iteration in range(max_iterations):
        best_neighbor_solution = None
        best_neighbor_fitness = -float('inf')
        
        # Examine all possible moves
        for i in range(select_count):
            for j in range(len(colors)):
                if j not in current:
                    move_key = get_move_key(current[i], j)
                    neighbor = current[:]
                    neighbor[i] = j
                    
                    fitness = calculate_fitness(neighbor)
                    
                    # Accept if better than current best neighbor and not tabu
                    # or if satisfies aspiration criterion (better than global best)
                    if ((fitness > best_neighbor_fitness and 
                         (move_key not in tabu_list or tabu_list[move_key] <= iteration)) or
                        fitness > best_fitness):
                        best_neighbor_solution = neighbor
                        best_neighbor_fitness = fitness
        
        if best_neighbor_solution is None:
            break
        
        # Update current solution
        current = best_neighbor_solution
        
        # Update best solution if improved
        if best_neighbor_fitness > best_fitness:
            best = current[:]
            best_fitness = best_neighbor_fitness
        
        # Update tabu list
        for i in range(select_count):
            move_key = get_move_key(current[i], best[i])
            tabu_list[move_key] = iteration + tabu_tenure
        
        # Clean expired tabu moves
        expired_keys = [key for key, expiration in tabu_list.items() if expiration <= iteration]
        for key in expired_keys:
            del tabu_list[key]
    
    selected_colors = [colors[i] for i in best]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


def exact_minimum(colors: List[Tuple[int, int, int]], select_count: int,
                 _settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Exact algorithm that tries all possible combinations to find the optimal solution.
    WARNING: This has exponential time complexity and should only be used for small datasets.
    """
    start_time = time.time()
    lab_colors = [rgb_to_lab(rgb) for rgb in colors]
    
    def calculate_min_distance(selection: List[int]) -> float:
        min_dist = float('inf')
        for i in range(len(selection) - 1):
            for j in range(i + 1, len(selection)):
                dist = delta_e(lab_colors[selection[i]], lab_colors[selection[j]])
                min_dist = min(min_dist, dist)
        return min_dist
    
    best_selection = None
    best_min_distance = -float('inf')
    
    # Try all combinations
    indices = list(range(len(colors)))
    for selection in combinations(indices, select_count):
        min_distance = calculate_min_distance(list(selection))
        if min_distance > best_min_distance:
            best_min_distance = min_distance
            best_selection = list(selection)
    
    selected_colors = [colors[i] for i in best_selection]
    return {
        'colors': sort_colors(selected_colors),
        'time': (time.time() - start_time) * 1000
    }


# Convenience dictionary for algorithm access
ALGORITHMS = {
    'greedy': greedy_selection,
    'max_sum_global': max_sum_distances_global,
    'max_sum_sequential': max_sum_distances_sequential,
    'simulated_annealing': simulated_annealing,
    'kmeans_plus_plus': kmeans_plus_plus_selection,
    'genetic_algorithm': genetic_algorithm,
    'particle_swarm': particle_swarm_optimization,
    'ant_colony': ant_colony_optimization,
    'tabu_search': tabu_search,
    'exact_minimum': exact_minimum
}


def generate_n_colors(n: int, algorithm: str = 'greedy', 
                      settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate n*10 random colors and select the n most distinct ones.
    
    This is a convenience function that generates a large pool of random colors
    and then selects the most distinct subset from them.
    
    Args:
        n: Number of distinct colors to select
        algorithm: Algorithm to use for selection
        settings: Optional algorithm-specific settings
    
    Returns:
        Dictionary with 'colors' and 'time' keys
    """
    # Generate n*10 random colors to select from
    pool_size = max(n * 10, 20)  # At least 20 colors in the pool
    color_pool = generate_random_colors(pool_size)
    
    # Select the n most distinct colors
    return select_distinct_colors(color_pool, n, algorithm, settings)


def select_distinct_colors(colors: List[Tuple[int, int, int]], 
                          select_count: int,
                          algorithm: str = 'greedy',
                          settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Main function to select distinct colors using the specified algorithm.
    
    Args:
        colors: List of RGB tuples [(r, g, b), ...]
        select_count: Number of colors to select
        algorithm: Algorithm name (see ALGORITHMS dict for options)
        settings: Optional algorithm-specific settings
    
    Returns:
        Dictionary with 'colors' and 'time' keys
    """
    if algorithm not in ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm}. Available: {list(ALGORITHMS.keys())}")
    
    if select_count > len(colors):
        raise ValueError("Cannot select more colors than available")
    
    return ALGORITHMS[algorithm](colors, select_count, settings)


def pick_distinct_colors(args=None, algorithm=None, pool_size=None, colors=None, options=None):
    """
    Unified API for picking maximally distinct colors (matches JS version).

    Recommended usage (named arguments):
        pick_distinct_colors({
            'count': 8,
            'algorithm': 'greedy',
            'pool_size': 80,
            'colors': [(255,0,0), (0,255,0), ...],
            'options': {...}
        })

    Legacy positional usage is also supported for backward compatibility:
        pick_distinct_colors(8, 'greedy', 80, colors, options)

    Args:
        args (dict or int): Options dict or count (legacy)
        algorithm (str): Algorithm name (legacy)
        pool_size (int): Pool size if generating random colors (legacy)
        colors (list): List of RGB tuples (legacy)
        options (dict): Algorithm-specific options (legacy)

    Returns:
        dict: {'colors': [...], 'time': ...}
    """
    # Parse arguments
    if isinstance(args, dict):
        count = args.get('count')
        _algorithm = args.get('algorithm', 'greedy')
        _pool_size = args.get('pool_size')
        _colors = args.get('colors')
        _options = args.get('options')
    else:
        count = args
        _algorithm = algorithm or 'greedy'
        _pool_size = pool_size
        _colors = colors
        _options = options
    if count is None:
        raise ValueError('count is required')
    # Prepare color pool
    pool = _colors
    if not pool:
        size = _pool_size or min(count * 10, 20)
        pool = generate_random_colors(size)
    # Call the correct algorithm
    if _algorithm == 'max_sum_global':
        return max_sum_distances_global(pool, count)
    if _algorithm == 'max_sum_sequential':
        return max_sum_distances_sequential(pool, count)
    if _algorithm == 'greedy':
        return greedy_selection(pool, count)
    if _algorithm == 'kmeans_plus_plus':
        return kmeans_plus_plus_selection(pool, count)
    if _algorithm == 'simulated_annealing':
        return simulated_annealing(pool, count, _options)
    if _algorithm == 'genetic_algorithm':
        return genetic_algorithm(pool, count, _options)
    if _algorithm == 'particle_swarm':
        return particle_swarm_optimization(pool, count, _options)
    if _algorithm == 'ant_colony':
        return ant_colony_optimization(pool, count, _options)
    if _algorithm == 'tabu_search':
        return tabu_search(pool, count, _options)
    if _algorithm == 'exact_minimum':
        return exact_minimum(pool, count)
    raise ValueError(f"Unknown algorithm: {_algorithm}")