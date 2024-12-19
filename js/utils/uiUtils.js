import { calibratePerformance } from './performanceUtils.js';
import { formatTimeEstimate } from './timeUtils.js';

export function showSpinner(message = 'Processing...', showCancel = false, onCancel = null) {
    hideSpinner();
    
    const spinner = document.createElement('div');
    spinner.id = 'processingSpinner';
    spinner.className = 'processing';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <div>${message}</div>
        ${showCancel ? '<button class="cancel-button">Cancel This Algorithm</button>' : ''}
    `;
    document.body.appendChild(spinner);
    
    const cancelButton = spinner.querySelector('.cancel-button');
    if (cancelButton && onCancel) {
        cancelButton.style.display = 'block';
        cancelButton.onclick = onCancel;
    }
}

export function hideSpinner() {
    const spinner = document.getElementById('processingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

export function toggleSettings(button) {
    button.classList.toggle('active');
    const container = button.closest('.input-group, .import-panel');
    if (container) {
        container.querySelector('.settings-container').classList.toggle('show');
    }
    button.textContent = button.classList.contains('active') ? 'Hide Settings' : 'Show Settings';
}

export function toggleImportPanel(button) {
    toggleSettings(button);
}

export async function initializePage() {
    const controlHtml = `
        <div class="control-panel">
            <div class="input-group">
                <label for="totalColors">Number of random colors to generate:</label>
                <input type="number" id="totalColors" value="30" min="0" max="1000">
            </div>
            <div class="input-group">
                <label for="selectColors">Number of colors to select:</label>
                <input type="number" id="selectColors" value="10" min="2">
            </div>
            
            <div class="import-panel">
                <button class="settings-toggle" onclick="toggleImportPanel(this)">Import Custom Colors</button>
                <div class="settings-container">
                    <div class="algorithm-settings">
                        <p>Paste colors in any of these formats:</p>
                        <ul style="font-family: monospace; font-size: 0.9em;">
                            <li>#RRGGBB (one per line)</li>
                            <li>rgb(r,g,b) (one per line)</li>
                            <li>r,g,b (one per line)</li>
                            <li>JavaScript array: [[r,g,b], ...]</li>
                        </ul>
                        <textarea id="importText" placeholder="Paste colors here..."></textarea>
                        <div>
                            <input type="radio" id="replace" name="importMode" value="replace" checked>
                            <label for="replace">Replace random colors</label>
                            <input type="radio" id="append" name="importMode" value="append">
                            <label for="append">Add to random colors</label>
                        </div>
                        <div class="import-error" id="importError"></div>
                        <button onclick="importColors()">Import Colors</button>
                    </div>
                </div>
            </div>

            <div class="input-group" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <h3 style="margin: 0 0 10px 0;">Algorithm Selection</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    <div>
                        <input type="checkbox" id="algo-maximum-sum-global" checked>
                        <label for="algo-maximum-sum-global">Maximum Sum Global</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-maximum-sum-sequential" checked>
                        <label for="algo-maximum-sum-sequential">Maximum Sum Sequential</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-greedy" checked>
                        <label for="algo-greedy">Greedy</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-simulated-annealing" checked>
                        <label for="algo-simulated-annealing">Simulated Annealing</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-k-means" checked>
                        <label for="algo-k-means">K-Means++</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-genetic-algorithm">
                        <label for="algo-genetic-algorithm">Genetic Algorithm</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-particle-swarm">
                        <label for="algo-particle-swarm">Particle Swarm</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-ant-colony">
                        <label for="algo-ant-colony">Ant Colony</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-tabu-search">
                        <label for="algo-tabu-search">Tabu Search</label>
                    </div>
                    <div>
                        <input type="checkbox" id="algo-exact-minimum" checked>
                        <label for="algo-exact-minimum">Exact Minimum</label>
                    </div>
                </div>
            </div>

            <div class="input-group" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <h3 style="margin: 0 0 10px 0;">Algorithm Settings</h3>
                <button class="settings-toggle" onclick="toggleSettings(this)">Show Settings</button>
                <div class="settings-container">
                    <!-- Simulated Annealing Settings -->
                    <div class="algorithm-settings" id="settings-annealing">
                        <h4>Simulated Annealing</h4>
                        <div>
                            <label for="initialTemp">Initial Temperature:</label>
                            <input type="number" id="initialTemp" value="1000" min="1">
                        </div>
                        <div>
                            <label for="coolingRate">Cooling Rate (0-1):</label>
                            <input type="number" id="coolingRate" value="0.995" min="0" max="1" step="0.001">
                        </div>
                        <div>
                            <label for="minTemp">Minimum Temperature:</label>
                            <input type="number" id="minTemp" value="0.1" min="0.0001" step="0.1">
                        </div>
                    </div>

                    <!-- Genetic Algorithm Settings -->
                    <div class="algorithm-settings" id="settings-genetic">
                        <h4>Genetic Algorithm</h4>
                        <div>
                            <label for="populationSize">Population Size:</label>
                            <input type="number" id="populationSize" value="100" min="10">
                        </div>
                        <div>
                            <label for="generations">Generations:</label>
                            <input type="number" id="generations" value="100" min="10">
                        </div>
                        <div>
                            <label for="mutationRate">Mutation Rate:</label>
                            <input type="number" id="mutationRate" value="0.1" min="0" max="1" step="0.01">
                        </div>
                    </div>

                    <!-- PSO Settings -->
                    <div class="algorithm-settings" id="settings-pso">
                        <h4>Particle Swarm Optimization</h4>
                        <div>
                            <label for="numParticles">Number of Particles:</label>
                            <input type="number" id="numParticles" value="30" min="5">
                        </div>
                        <div>
                            <label for="psoIterations">Iterations:</label>
                            <input type="number" id="psoIterations" value="100" min="10">
                        </div>
                    </div>

                    <!-- ACO Settings -->
                    <div class="algorithm-settings" id="settings-aco">
                        <h4>Ant Colony Optimization</h4>
                        <div>
                            <label for="numAnts">Number of Ants:</label>
                            <input type="number" id="numAnts" value="20" min="5">
                        </div>
                        <div>
                            <label for="acoIterations">Iterations:</label>
                            <input type="number" id="acoIterations" value="50" min="10">
                        </div>
                    </div>

                    <!-- Tabu Search Settings -->
                    <div class="algorithm-settings" id="settings-tabu">
                        <h4>Tabu Search</h4>
                        <div>
                            <label for="tabuIterations">Maximum Iterations:</label>
                            <input type="number" id="tabuIterations" value="1000" min="100">
                        </div>
                        <div>
                            <label for="tabuTenure">Tabu Tenure:</label>
                            <input type="number" id="tabuTenure" value="5" min="1">
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="generateInitialColors()" id="generateButton">Generate Colors</button>
                <button onclick="startCalculation()" id="calculateButton" disabled>Calculate Most Distinct Colors</button>
            </div>
            <div id="colorSummary" style="margin-top: 10px; font-style: italic;"></div>
            <div id="complexityEstimate" style="margin-top: 10px; font-style: italic;"></div>
        </div>
    `;
    
    // First, add the control panel HTML
    document.getElementById('control-container').innerHTML = controlHtml;
    
    // Then, calibrate performance
    showSpinner('Calibrating performance...');
    const combinationsPerSecond = await calibratePerformance();
    hideSpinner();
    
    // Store the calibrated speed as a global variable
    window.calibratedSpeed = combinationsPerSecond;
    
    // Now add event listeners after the elements exist
    document.getElementById('totalColors').addEventListener('input', updateComplexityEstimate);
    document.getElementById('selectColors').addEventListener('input', updateComplexityEstimate);
    document.getElementById('totalColors').addEventListener('input', updateGenerateButtonText);
    
    // Initial estimate
    updateComplexityEstimate();
}

export function updateGenerateButtonText() {
    const randomCount = parseInt(document.getElementById('totalColors').value);
    const generateButton = document.getElementById('generateButton');
    
    if (window.importedColors) {
        const importedCount = window.importedColors.colors.length;
        const totalCount = window.importedColors.mode === 'replace' ? 
            importedCount : 
            randomCount + importedCount;
            
        generateButton.textContent = `Generate ${totalCount} Colors (${
            window.importedColors.mode === 'replace' ? 
            'imported only' : 
            `${randomCount} random + ${importedCount} imported`
        })`;
    } else {
        generateButton.textContent = `Generate ${randomCount} Colors`;
    }
}

export function updateComplexityEstimate() {
    const selectCount = parseInt(document.getElementById('selectColors').value);
    let totalColors;
    
    // Calculate total colors based on both imported and random colors
    if (window.importedColors) {
        const randomCount = parseInt(document.getElementById('totalColors').value);
        if (window.importedColors.mode === 'replace') {
            totalColors = window.importedColors.colors.length;
        } else {
            totalColors = randomCount + window.importedColors.colors.length;
        }
    } else {
        totalColors = parseInt(document.getElementById('totalColors').value);
    }
    
    // Calculate number of combinations (n choose r)
    let combinations = 1;
    for (let i = 0; i < selectCount; i++) {
        combinations *= (totalColors - i) / (i + 1);
    }
    
    // Use calibrated speed if available, otherwise use default estimate
    const combinationsPerSecond = window.calibratedSpeed || 100000;
    const estimatedSeconds = combinations / combinationsPerSecond;
    
    const timeString = formatTimeEstimate(estimatedSeconds);
    
    const complexityDiv = document.getElementById('complexityEstimate');
    complexityDiv.innerHTML = `
        <p>Exact Minimum calculation will check ${combinations.toLocaleString()} combinations</p>
        <p>Estimated time: ${timeString}</p>
        ${estimatedSeconds > 120 ? '<p style="color: orange;">Warning: This might take a while!</p>' : ''}
        <p style="font-size: 0.8em;">Based on measured performance: ~${Math.round(combinationsPerSecond).toLocaleString()} combinations/second</p>
    `;
}

export function generateInitialColors() {
    const totalColors = parseInt(document.getElementById('totalColors').value);
    let summary = '';
    
    // Clear previous results but keep initial colors if they exist
    document.getElementById('results').innerHTML = '';
    
    if (window.importedColors) {
        const importMode = window.importedColors.mode;
        const importedCount = window.importedColors.colors.length;
        
        if (importMode === 'replace') {
            window.initialColors = window.importedColors.colors;
            summary = `Using ${importedCount} imported colors`;
        } else { // append
            const randomCount = totalColors;
            window.initialColors = Array.from({length: randomCount}, () => window.randomColor())
                .concat(window.importedColors.colors);
            summary = `Generated ${randomCount} random colors and added ${importedCount} imported colors`;
        }
    } else {
        window.initialColors = Array.from({length: totalColors}, () => window.randomColor());
        summary = `Generated ${totalColors} random colors`;
    }
    
    // Update the display
    const sortedInitialColors = window.sortColors(window.initialColors);
    const metrics = window.calculateMetrics(sortedInitialColors);
    const distribution = window.analyzeColorDistribution(sortedInitialColors);
    
    document.getElementById('colorSummary').textContent = summary;
    document.getElementById('calculateButton').disabled = false;
    
    const initialHtml = `
        <h2>Initial Colors (${window.initialColors.length} total)</h2>
        <div>
            ${sortedInitialColors.map(rgb => 
                `<div class="swatch" style="background-color: ${window.rgbToHex(rgb)}"></div>`
            ).join('')}
        </div>
        <div class="metrics">
            <p>Total Colors: ${window.initialColors.length}</p>
            <p>Minimum deltaE: ${metrics.min.toFixed(2)}</p>
            <div style="display: flex; align-items: center;">
                <span>Closest pair: </span>
                ${(() => {
                    const closest = window.findClosestPair(sortedInitialColors);
                    return closest.colors.map(rgb => 
                        `<div class="swatch" style="background-color: ${window.rgbToHex(rgb)}; margin: 0 5px;"></div>`
                    ).join('');
                })()}
                <span>(deltaE: ${window.findClosestPair(sortedInitialColors).distance.toFixed(2)})</span>
            </div>
            <p>Average deltaE: ${metrics.avg.toFixed(2)}</p>
            <p>Distribution Analysis:<br/> ${distribution}</p>
        </div>
        <div id="initial-plot" style="width:600px;height:400px;"></div>
    `;
    
    document.getElementById('initial-colors').innerHTML = initialHtml;
    window.createSpectrumPlot(sortedInitialColors, 'initial-plot');
} 