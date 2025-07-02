#!/usr/bin/env python3
"""
Example usage of the pick_distinct_colors module.
"""

import pick_distinct_colors as pdc

def main():
    print("=== Pick Distinct Colors - Python Implementation ===\n")
    
    # Example 1: Generate distinct colors from random pool (most common use case)
    print("Example 1: Generate distinct colors using generate_n_colors")
    
    # Generate 8 distinct colors from a pool of 80 random colors
    result = pdc.generate_n_colors(8, 'greedy')
    metrics = pdc.calculate_metrics(result['colors'])
    
    print(f"Generated pool of {8*10} random colors and selected {len(result['colors'])} most distinct:")
    for i, color in enumerate(result['colors']):
        hex_color = pdc.rgb_to_hex(color)
        print(f"  {i+1}. RGB{color} -> {hex_color}")
    
    print(f"\nColor separation metrics:")
    print(f"  Minimum distance: {metrics['min']:.2f}")
    print(f"  Maximum distance: {metrics['max']:.2f}")
    print(f"  Average distance: {metrics['avg']:.2f}")
    print(f"  Execution time: {result['time']:.2f}ms")
    
    # Example 2: Selecting distinct colors from a custom palette
    print(f"\n\nExample 2: Selecting distinct colors from a custom palette")
    
    # Create a palette of colors
    palette = [
        (255, 0, 0),    # Red
        (255, 128, 0),  # Orange  
        (255, 255, 0),  # Yellow
        (128, 255, 0),  # Yellow-green
        (0, 255, 0),    # Green
        (0, 255, 128),  # Green-cyan
        (0, 255, 255),  # Cyan
        (0, 128, 255),  # Cyan-blue
        (0, 0, 255),    # Blue
        (128, 0, 255),  # Blue-magenta
        (255, 0, 255),  # Magenta
        (255, 0, 128),  # Magenta-red
        (128, 128, 128), # Gray
        (0, 0, 0),      # Black
        (255, 255, 255), # White
    ]
    
    print(f"Original palette: {len(palette)} colors")
    select_count = 6
    
    # Try different algorithms
    algorithms = ['greedy', 'simulated_annealing', 'genetic_algorithm']
    
    for algorithm in algorithms:
        result = pdc.select_distinct_colors(palette, select_count, algorithm)
        metrics = pdc.calculate_metrics(result['colors'])
        
        print(f"\n{algorithm.upper()}:")
        print(f"  Selected colors: {result['colors']}")
        print(f"  Min distance: {metrics['min']:.2f}")
        print(f"  Average distance: {metrics['avg']:.2f}")
        print(f"  Execution time: {result['time']:.2f}ms")
    
    # Example 3: Using algorithm-specific settings
    print(f"\n\nExample 3: Using custom algorithm settings")
    
    # Custom settings for simulated annealing
    sa_settings = {
        'initialTemp': 2000,
        'coolingRate': 0.98,
        'minTemp': 0.01
    }
    
    result_default = pdc.select_distinct_colors(palette, select_count, 'simulated_annealing')
    result_custom = pdc.select_distinct_colors(palette, select_count, 'simulated_annealing', sa_settings)
    
    metrics_default = pdc.calculate_metrics(result_default['colors'])
    metrics_custom = pdc.calculate_metrics(result_custom['colors'])
    
    print(f"Simulated Annealing (default settings):")
    print(f"  Min distance: {metrics_default['min']:.2f}, Time: {result_default['time']:.2f}ms")
    
    print(f"Simulated Annealing (custom settings):")
    print(f"  Min distance: {metrics_custom['min']:.2f}, Time: {result_custom['time']:.2f}ms")
    
    # Example 4: Comparing different algorithms
    print(f"\n\nExample 4: Algorithm comparison")
    print(f"{'Algorithm':<20} {'Min ΔE':<8} {'Avg ΔE':<8} {'Time (ms)':<10}")
    print("-" * 50)
    
    test_algorithms = ['greedy', 'max_sum_global', 'simulated_annealing', 'genetic_algorithm']
    
    for algo in test_algorithms:
        try:
            result = pdc.select_distinct_colors(palette, 5, algo)
            metrics = pdc.calculate_metrics(result['colors'])
            print(f"{algo:<20} {metrics['min']:<8.1f} {metrics['avg']:<8.1f} {result['time']:<10.1f}")
        except Exception as e:
            print(f"{algo:<20} ERROR: {str(e)[:30]}")
    
    print(f"\n=== End of Examples ===")

if __name__ == "__main__":
    main()