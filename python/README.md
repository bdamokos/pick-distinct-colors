# Pick Distinct Colors - Python Implementation

A Python port of the [pick-distinct-colors](https://github.com/bdamokos/pick-distinct-colors) JavaScript library for selecting maximally distinct colors using various optimization algorithms.

## Overview

This Python implementation provides the same color selection algorithms as the JavaScript version, allowing you to find subsets of colors that maximize the minimum distance between them in the CIELAB color space.

## Installation

Simply copy the `pick_distinct_colors.py` file to your project directory. The implementation has no external dependencies - it only uses Python standard library modules.

```python
# Copy pick_distinct_colors.py to your project
import pick_distinct_colors as pdc
```

## Features

- Unified `pick_distinct_colors` function for easy color selection with any algorithm
- Deterministic color selection: pass a `seed` for reproducible results (default: 42)

## Unified API (Recommended)

The Python version now supports a unified API for picking distinct colors, matching the JavaScript version. This is the recommended way to use the library for new code.

```python
import pick_distinct_colors as pdc

# Pick 8 maximally distinct colors using the default (greedy) algorithm and a fixed seed:
result = pdc.pick_distinct_colors({'count': 8, 'seed': 12345})

# Pick 10 colors using a specific algorithm, custom pool size, and a seed:
result = pdc.pick_distinct_colors({'count': 10, 'algorithm': 'max_sum_global', 'pool_size': 100, 'seed': 12345})

# Pick 5 colors from a provided color pool using the genetic algorithm (seed is ignored if colors are provided):
my_colors = [ (255,0,0), (0,255,0), (0,0,255), (255,255,0), (0,255,255), (255,0,255) ]
result2 = pdc.pick_distinct_colors({'count': 5, 'algorithm': 'genetic_algorithm', 'colors': my_colors, 'options': {'populationSize': 50}})
```

**Arguments:**
- `count` (int, required): Number of colors to select
- `algorithm` (str, optional): Algorithm name (default: 'greedy')
- `pool_size` (int, optional): Number of random colors to generate if no pool is provided
- `colors` (list, optional): List of RGB tuples to select from
- `options` (dict, optional): Algorithm-specific options
- `seed` (int, optional): Seed for deterministic random color generation (default: 42)

> **Note:** If you use the same `count`, `algorithm`, `pool_size`, and `seed`, you will always get the same result. This makes color selection fully reproducible.

Legacy positional usage is also supported:
```python
result = pdc.pick_distinct_colors(8, 'greedy', 80, my_colors, {'populationSize': 50})
```

## Quick Start

```python
import pick_distinct_colors as pdc

# Method 1: Generate distinct colors from random pool (easiest)
result = pdc.generate_n_colors(8, 'greedy')  # 8 colors from pool of 80
print(f"Generated colors: {[pdc.rgb_to_hex(c) for c in result['colors']]}")

# Method 2: Select from your own color palette
colors = [
    (255, 0, 0), (0, 255, 0), (0, 0, 255),      # RGB tuples
    (255, 255, 0), (255, 0, 255), (0, 255, 255),
    (128, 128, 128), (0, 0, 0), (255, 255, 255)
]
result = pdc.select_distinct_colors(colors, 5, 'greedy')
print(f"Selected from palette: {result['colors']}")

# Analyze color separation
metrics = pdc.calculate_metrics(result['colors'])
print(f"Min distance: {metrics['min']:.1f}, Avg: {metrics['avg']:.1f}")
```

## Available Algorithms

### Fast Algorithms
- **`greedy`** - Greedy selection maximizing minimum distance
- **`max_sum_global`** - Select colors with highest total distances to all others
- **`max_sum_sequential`** - Sequential selection with maximum sum distances
- **`kmeans_plus_plus`** - K-means++ initialization approach

### Optimization Algorithms (slower but potentially better results)
- **`simulated_annealing`** - Temperature-based optimization
- **`genetic_algorithm`** - Evolutionary approach with crossover and mutation
- **`particle_swarm`** - Swarm intelligence optimization
- **`ant_colony`** - Pheromone-based optimization
- **`tabu_search`** - Local search with memory

### Exact Algorithm (exponential time complexity)
- **`exact_minimum`** - Brute force optimal solution (only for small datasets)

## Algorithm-Specific Settings

Many algorithms accept optional settings to customize their behavior:

```python
# Simulated Annealing settings
sa_settings = {
    'initialTemp': 1000,     # Starting temperature
    'coolingRate': 0.995,    # Temperature reduction rate
    'minTemp': 0.1          # Minimum temperature
}

result = pdc.select_distinct_colors(colors, 5, 'simulated_annealing', sa_settings)

# Genetic Algorithm settings
ga_settings = {
    'populationSize': 100,   # Population size
    'generations': 100,      # Number of generations
    'mutationRate': 0.1      # Mutation probability
}

result = pdc.select_distinct_colors(colors, 5, 'genetic_algorithm', ga_settings)

# Particle Swarm settings
pso_settings = {
    'numParticles': 30,      # Number of particles
    'iterations': 100,       # Number of iterations
    'inertiaWeight': 0.7,    # Inertia weight
    'cognitiveWeight': 1.5,  # Cognitive component weight
    'socialWeight': 1.5      # Social component weight
}

result = pdc.select_distinct_colors(colors, 5, 'particle_swarm', pso_settings)
```

## Core Functions

### Color Space Conversion
```python
# Convert RGB to CIELAB
lab = pdc.rgb_to_lab((255, 0, 0))  # Returns (L, a, b) tuple

# Calculate CIE76 Delta E distance
distance = pdc.delta_e(lab1, lab2)
```

### Color Generation and Parsing
```python
# Generate random colors
random_colors = pdc.generate_random_colors(10)  # 10 random RGB colors

# Generate color palette with different modes
palette = pdc.generate_color_palette(30)  # 30 random colors

# Mix custom colors with random ones
custom_colors = [(255,0,0), (0,255,0), (0,0,255)]
palette = pdc.generate_color_palette(20, custom_colors, mode='append')  # 20 random + 3 custom

# Parse colors from various formats
color = pdc.parse_color_string('#FF0000')        # Hex
color = pdc.parse_color_string('rgb(255,0,0)')   # RGB function
color = pdc.parse_color_string('255,0,0')        # Comma-separated

# Parse multiple colors from text
colors = pdc.parse_color_list('''
#FF0000
#00FF00
#0000FF
''')

# Convert between formats
hex_color = pdc.rgb_to_hex((255, 0, 0))  # '#ff0000'
rgb_color = pdc.hex_to_rgb('#FF0000')    # (255, 0, 0)
```

### Color Analysis
```python
# Calculate comprehensive metrics
metrics = pdc.calculate_metrics(colors)
# Returns: {'min': float, 'max': float, 'avg': float, 'sum': float}

# Sort colors by LAB values
sorted_colors = pdc.sort_colors(colors)

# Generate single random color
random_rgb = pdc.random_color()  # Returns (r, g, b) tuple
```

### Convenient Functions
```python
# Generate n distinct colors from random pool (n*10 colors generated)
result = pdc.generate_n_colors(8)  # 8 colors from pool of 80
result = pdc.generate_n_colors(5, 'simulated_annealing')  # Use different algorithm

# Direct algorithm access
result = pdc.greedy_selection(colors, 5)
result = pdc.simulated_annealing(colors, 5, settings)
result = pdc.genetic_algorithm(colors, 5, settings)

# Or use the algorithms dictionary
algorithm_func = pdc.ALGORITHMS['greedy']
result = algorithm_func(colors, 5)
```

## Return Format

All selection functions return a dictionary with:
- **`colors`**: List of selected RGB tuples, sorted by LAB values
- **`time`**: Execution time in milliseconds

```python
{
    'colors': [(255, 0, 0), (0, 255, 0), (0, 0, 255), ...],
    'time': 1.23
}
```

## Performance Considerations

- **Fast algorithms** (greedy, max_sum_global, kmeans_plus_plus): < 1ms for hundreds of colors
- **Optimization algorithms**: Seconds to minutes depending on settings and dataset size
- **Exact algorithm**: Only use with < 20 colors due to exponential complexity

For large datasets (1000+ colors), start with fast algorithms. Use optimization algorithms when you need the highest quality results and can afford longer computation times.

## Examples

### Generate Distinct Colors (Most Common Use Case)
```python
import pick_distinct_colors as pdc

# Generate 8 distinct colors from a random pool
result = pdc.generate_n_colors(8, 'greedy')

# Show results with hex colors
print(f"Selected {len(result['colors'])} colors in {result['time']:.1f}ms:")
for i, color in enumerate(result['colors']):
    hex_color = pdc.rgb_to_hex(color)
    print(f"  {i+1}. RGB{color} -> {hex_color}")

# Analyze the selection
metrics = pdc.calculate_metrics(result['colors'])
print(f"Min distance: {metrics['min']:.1f}, Avg: {metrics['avg']:.1f}")
```

### Select from Custom Color Palette
```python
import pick_distinct_colors as pdc

# Web-safe color palette
web_colors = [
    (255, 0, 0), (0, 255, 0), (0, 0, 255),
    (255, 255, 0), (255, 0, 255), (0, 255, 255),
    (128, 0, 0), (0, 128, 0), (0, 0, 128),
    (128, 128, 0), (128, 0, 128), (0, 128, 128)
]

# Select 6 most distinct colors
result = pdc.select_distinct_colors(web_colors, 6, 'greedy')
print("Selected colors:", result['colors'])
```

### Comparing Multiple Algorithms
```python
colors = [pdc.random_color() for _ in range(100)]  # 100 random colors
algorithms = ['greedy', 'simulated_annealing', 'genetic_algorithm']

print(f"{'Algorithm':<20} {'Min ΔE':<8} {'Time (ms)':<10}")
print("-" * 40)

for algo in algorithms:
    result = pdc.select_distinct_colors(colors, 10, algo)
    metrics = pdc.calculate_metrics(result['colors'])
    print(f"{algo:<20} {metrics['min']:<8.1f} {result['time']:<10.1f}")
```

### Custom Optimization
```python
# Fine-tune simulated annealing for your specific use case
settings = {
    'initialTemp': 2000,    # Higher temp for more exploration
    'coolingRate': 0.99,    # Slower cooling for better results
    'minTemp': 0.01        # Lower min temp for longer search
}

result = pdc.select_distinct_colors(colors, 8, 'simulated_annealing', settings)
```

## Testing

Run the included test files to verify the implementation:

```bash
python3 test_pick_distinct_colors.py    # Basic functionality tests
python3 verify_core_functions.py        # Core function verification
python3 example_usage.py                # Usage examples
```

## Mathematical Background

The library uses the CIELAB color space for perceptually uniform color distance calculations:

1. **RGB → CIELAB conversion**: Standard ITU-R BT.709 conversion with D65 illuminant
2. **Distance metric**: CIE76 Delta E (Euclidean distance in LAB space)
3. **Optimization goal**: Maximize the minimum pairwise distance between selected colors

This approach ensures that selected colors are perceptually well-separated and suitable for applications like data visualization, UI design, and scientific plotting.

## License

MIT License - Same as the original JavaScript implementation.

## Related

- [Original JavaScript implementation](https://github.com/bdamokos/pick-distinct-colors)
- [Interactive web demo](https://bdamokos.github.io/pick-distinct-colors/)