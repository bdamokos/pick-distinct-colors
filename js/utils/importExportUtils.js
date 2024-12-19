import { rgbToHex } from './colorUtils.js';
import { updateGenerateButtonText, updateComplexityEstimate } from './uiUtils.js';

export function showExportModal(colors) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('exportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'exportModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Export Colors</h3>
                <div class="format-selector">
                    <label>Format:</label>
                    <select id="formatSelect">
                        <option value="hex">Hex (#RRGGBB)</option>
                        <option value="rgb">RGB (r,g,b)</option>
                        <option value="css">CSS rgb(r,g,b)</option>
                        <option value="array">JavaScript Array</option>
                    </select>
                </div>
                <textarea id="exportText" rows="10" style="width: 100%; margin-top: 10px;" readonly></textarea>
                <button class="copy-button" onclick="copyToClipboard()">Copy to Clipboard</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
        document.getElementById('formatSelect').onchange = () => updateExportText(colors);
    }
    
    // Show modal and update text
    modal.style.display = 'block';
    updateExportText(colors);
}

export function updateExportText(colors) {
    const format = document.getElementById('formatSelect').value;
    const textarea = document.getElementById('exportText');
    
    let text;
    switch (format) {
        case 'hex':
            text = colors.map(rgb => rgbToHex(rgb)).join('\n');
            break;
        case 'rgb':
            text = colors.map(rgb => rgb.join(',')).join('\n');
            break;
        case 'css':
            text = colors.map(rgb => `rgb(${rgb.join(',')})`).join('\n');
            break;
        case 'array':
            text = `[\n${colors.map(rgb => `  [${rgb.join(', ')}]`).join(',\n')}\n]`;
            break;
    }
    textarea.value = text;
}

export function copyToClipboard() {
    const textarea = document.getElementById('exportText');
    textarea.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = document.querySelector('.copy-button');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => button.textContent = originalText, 2000);
}

export function importColors() {
    const input = document.getElementById('importText').value.trim();
    const mode = document.querySelector('input[name="importMode"]:checked').value;
    const errorDiv = document.getElementById('importError');
    
    try {
        let importedColors = parseColorInput(input);
        
        if (importedColors.length === 0) {
            throw new Error('No valid colors found in input');
        }

        // Validate colors
        importedColors = importedColors.map(color => {
            if (!Array.isArray(color) || color.length !== 3 || 
                !color.every(v => Number.isInteger(v) && v >= 0 && v <= 255)) {
                throw new Error('Invalid color format. Each color must be RGB values between 0-255');
            }
            return color;
        });

        // Store imported colors
        window.importedColors = {
            colors: importedColors,
            mode: mode
        };

        // Add event listeners to radio buttons
        document.querySelectorAll('input[name="importMode"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (window.importedColors) {
                    window.importedColors.mode = radio.value;
                    updateGenerateButtonText();
                    updateComplexityEstimate();
                }
            });
        });

        // Update UI and complexity estimate
        updateGenerateButtonText();
        updateComplexityEstimate();
        
        errorDiv.style.display = 'none';
        document.getElementById('importText').value = ''; // Clear input
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
        window.importedColors = null;
        document.getElementById('generateButton').textContent = 'Generate Colors';
    }
}

export function parseColorInput(input) {
    // Remove any surrounding brackets and split into lines
    input = input.replace(/^\[|\]$/g, '').trim();
    
    if (input === '') return [];
    
    // Try parsing as array first
    try {
        if (input.includes('[')) {
            return JSON.parse(`[${input}]`);
        }
    } catch {}
    
    // Split into lines and parse each line
    return input.split('\n').map(line => {
        line = line.trim();
        if (!line) return null;
        
        // Try parsing as hex
        if (line.startsWith('#')) {
            const hex = line.substring(1);
            return [
                parseInt(hex.substr(0,2), 16),
                parseInt(hex.substr(2,2), 16),
                parseInt(hex.substr(4,2), 16)
            ];
        }
        
        // Try parsing as rgb() format
        if (line.startsWith('rgb(')) {
            const values = line.substring(4, line.length - 1).split(',');
            return values.map(v => parseInt(v.trim()));
        }
        
        // Try parsing as comma-separated values
        const values = line.split(',');
        if (values.length === 3) {
            return values.map(v => parseInt(v.trim()));
        }
        
        throw new Error(`Could not parse color: ${line}`);
    }).filter(color => color !== null);
} 