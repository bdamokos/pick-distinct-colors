import { calculateMetrics, findClosestPair, rgbToHex, sortColors } from './colorUtils.js';
import { analyzeColorDistribution } from './colorUtils.js';
import { createSpectrumPlot } from './plotUtils.js';
import { formatExecutionTime } from './timeUtils.js';
import { showSpinner, hideSpinner } from './uiUtils.js';
import { showExportModal } from './importExportUtils.js';

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function startCalculation() {
    console.log('Starting calculation...');
    const selectColors = parseInt(document.getElementById('selectColors').value);
    
    if (!window.initialColors || window.initialColors.length === 0) {
        alert('Please generate initial colors first');
        return;
    }
    
    if (selectColors > window.initialColors.length) {
        alert('Number of colors to select cannot be greater than total colors');
        return;
    }

    // Clear only the algorithm results, not the initial colors section
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    // Remove any existing rankings
    const existingRankings = document.querySelector('.algorithm-section[data-type="summary"]');
    if (existingRankings) {
        existingRankings.remove();
    }

    // Process each algorithm sequentially
    const selectedAlgorithms = {};
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            // Convert checkbox ID back to algorithm name
            const algorithmId = checkbox.id.replace('algo-', '');
            const algorithmName = algorithmId
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            switch(algorithmName) {
                case 'Maximum Sum Global':  
                    selectedAlgorithms[algorithmName] = () => window.algorithms.maxSumDistancesGlobal(window.initialColors, selectColors);
                    break;
                case 'Maximum Sum Sequential':  
                    selectedAlgorithms[algorithmName] = () => window.algorithms.maxSumDistancesSequential(window.initialColors, selectColors);
                    break;
                case 'Greedy':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.greedySelection(window.initialColors, selectColors);
                    break;
                case 'Simulated Annealing':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.simulatedAnnealing(window.initialColors, selectColors, {
                        initialTemp: parseFloat(document.getElementById('initialTemp').value),
                        coolingRate: parseFloat(document.getElementById('coolingRate').value),
                        minTemp: parseFloat(document.getElementById('minTemp').value)
                    });
                    break;
                case 'K Means':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.kmeansppSelection(window.initialColors, selectColors);
                    break;
                case 'Genetic Algorithm':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.geneticAlgorithm(window.initialColors, selectColors, {
                        populationSize: parseInt(document.getElementById('populationSize').value),
                        generations: parseInt(document.getElementById('generations').value),
                        mutationRate: parseFloat(document.getElementById('mutationRate').value)
                    });
                    break;
                case 'Particle Swarm':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.particleSwarmOptimization(window.initialColors, selectColors, {
                        numParticles: parseInt(document.getElementById('numParticles').value),
                        iterations: parseInt(document.getElementById('psoIterations').value)
                    });
                    break;
                case 'Ant Colony':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.antColonyOptimization(window.initialColors, selectColors, {
                        numAnts: parseInt(document.getElementById('numAnts').value),
                        iterations: parseInt(document.getElementById('acoIterations').value)
                    });
                    break;
                case 'Tabu Search':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.tabuSearch(window.initialColors, selectColors, {
                        maxIterations: parseInt(document.getElementById('tabuIterations').value),
                        tabuTenure: parseInt(document.getElementById('tabuTenure').value)
                    });
                    break;
                case 'Exact Minimum':
                    selectedAlgorithms[algorithmName] = () => window.algorithms.exactMinimum(window.initialColors, selectColors);
                    break;
            }
        }
    });

    // Now process the selected algorithms
    for (const [name, algorithm] of Object.entries(selectedAlgorithms)) {
        showSpinner(`Running ${name} algorithm...`);
        // Allow spinner to render
        await new Promise(resolve => setTimeout(resolve, 0));
        
        try {
            const result = await Promise.resolve(algorithm());
            hideSpinner();
            
            const metrics = calculateMetrics(result.colors);
            const distribution = analyzeColorDistribution(result.colors);
            const plotId = `plot-${name.toLowerCase().replace(/\s+/g, '-')}`;
            
            const algorithmContainer = document.createElement('div');
            algorithmContainer.className = 'algorithm-section';
            algorithmContainer.innerHTML = `
                <h2>${name}</h2>
                <div class="algorithm-explanation" style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <details>
                        <summary style="cursor: pointer; font-weight: bold;">How this algorithm works</summary>
                        <p style="margin-top: 10px;">${window.getAlgorithmExplanation(name)}</p>
                    </details>
                </div>
                <div class="swatch-container">
                    ${result.colors.map(rgb => 
                        `<div class="swatch" style="background-color: ${rgbToHex(rgb)}"></div>`
                    ).join('')}
                </div>
                <div class="metrics">
                    <p>Execution time: ${formatExecutionTime(result.time)}</p>
                    <p>Minimum deltaE: ${metrics.min.toFixed(2)}</p>
                    <div style="display: flex; align-items: center;">
                        <span>Closest pair: </span>
                        ${(() => {
                            const closest = findClosestPair(result.colors);
                            return closest.colors.map(rgb => 
                                `<div class="swatch" style="background-color: ${rgbToHex(rgb)}; margin: 0 5px;"></div>`
                            ).join('');
                        })()}
                        <span>(deltaE: ${findClosestPair(result.colors).distance.toFixed(2)})</span>
                    </div>
                    <p>Average deltaE: ${metrics.avg.toFixed(2)}</p>
                    <p>Distribution Analysis:<br/> ${distribution}</p>
                </div>
                <div id="${plotId}" style="width:600px;height:400px;"></div>
            `;
            
            document.getElementById('results').appendChild(algorithmContainer);
            createSpectrumPlot(result.colors, plotId);
            
            // Update rankings after each algorithm completes
            updateRankings();
            
        } catch (error) {
            hideSpinner();
            console.error(`Error in ${name} algorithm:`, error);
            const errorContainer = document.createElement('div');
            errorContainer.className = 'algorithm-section';
            errorContainer.innerHTML = `
                <h2>${name}</h2>
                <div class="algorithm-explanation" style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <details>
                        <summary style="cursor: pointer; font-weight: bold;">How this algorithm works</summary>
                        <p style="margin-top: 10px;">${window.getAlgorithmExplanation(name)}</p>
                    </details>
                </div>
                <p style="color: red;">Error: ${error.message}</p>
            `;
            document.getElementById('results').appendChild(errorContainer);
        }
    }

    console.log('All calculations complete!');
}

export function updateRankings() {
    let summaryContainer = document.querySelector('.algorithm-section[data-type="summary"]');
    if (!summaryContainer) {
        summaryContainer = document.createElement('div');
        summaryContainer.className = 'algorithm-section';
        summaryContainer.setAttribute('data-type', 'summary');
        summaryContainer.innerHTML = '<h2>Rankings (Highest minimum deltaE)</h2>';
        document.getElementById('results').appendChild(summaryContainer);
    }

    // Collect results from all algorithms
    const allResults = [];
    document.querySelectorAll('.algorithm-section').forEach(section => {
        if (section.getAttribute('data-type') === 'summary') return;
        
        const titleElement = section.querySelector('h2');
        if (titleElement) {
            // Get only the text content before any child elements
            const algorithmName = titleElement.childNodes[0].textContent.trim();
            const metricsText = Array.from(section.querySelectorAll('p'));
            
            // Extract minimum deltaE
            const deltaEText = metricsText.find(p => p.textContent.includes('Minimum deltaE'))?.textContent || '';
            const minDeltaE = parseFloat(deltaEText.split(':')[1]) || 0;
            
            // Extract execution time
            const timeText = metricsText.find(p => p.textContent.includes('Execution time'))?.textContent || '';
            const executionTime = timeText.split(':')[1]?.trim() || 'N/A';
            
            // Extract RGB values from the color swatches
            const colors = Array.from(section.querySelectorAll('.swatch'))
                .slice(0, parseInt(document.getElementById('selectColors').value))
                .map(swatch => {
                    const style = window.getComputedStyle(swatch);
                    const rgb = style.backgroundColor.match(/\d+/g).map(Number);
                    return rgb;
                });
            
            if (colors.length > 0) {
                allResults.push({
                    name: escapeHtml(algorithmName),
                    minDeltaE: minDeltaE,
                    executionTime: executionTime,
                    colors: sortColors(colors)
                });
            }
        }
    });

    if (allResults.length >= 2) {
        // Sort results by minimum deltaE (descending)
        allResults.sort((a, b) => b.minDeltaE - a.minDeltaE);

        // Assign ranks, handling ties
        let currentRank = 1;
        let currentDeltaE = allResults[0].minDeltaE;
        allResults[0].rank = currentRank;

        for (let i = 1; i < allResults.length; i++) {
            if (allResults[i].minDeltaE === currentDeltaE) {
                allResults[i].rank = currentRank;
            } else {
                currentRank = i + 1;
                currentDeltaE = allResults[i].minDeltaE;
                allResults[i].rank = currentRank;
            }
        }

        // Create the summary HTML with sorted colors and execution time
        const summaryHTML = `
            <h2>Rankings (Highest minimum deltaE)</h2>
            <div style="font-family: monospace;">
                ${allResults.map(result => {
                    const deltaEString = result.minDeltaE.toFixed(2);
                    const paddedDeltaE = deltaEString.length < 5 ? ' ' + deltaEString : deltaEString;
                    
                    return `
                        <div style="display: flex; align-items: center; margin: 10px 0;">
                            <div style="width: 30px; font-weight: bold;">#${result.rank}</div>
                            <div style="width: 200px;">${result.name}</div>
                            <div style="margin-right: 20px; width: 80px;">deltaE: ${paddedDeltaE}</div>
                            <div style="margin-right: 20px; width: 120px;">Time: ${result.executionTime}</div>
                            <div style="display: flex; align-items: center;">
                                <div class="swatch-container">
                                    ${result.colors.map(rgb => 
                                        `<div class="swatch" style="background-color: rgb(${rgb.join(',')}"></div>`
                                    ).join('')}
                                </div>
                                <button onclick="window.showExportModal(${JSON.stringify(result.colors)})" 
                                        style="background: none; border: none; cursor: pointer; padding: 5px; margin-left: 10px;"
                                        title="Export these colors">
                                    📋
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        summaryContainer.innerHTML = summaryHTML;
    }
} 