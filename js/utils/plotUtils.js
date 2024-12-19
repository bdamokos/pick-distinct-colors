import { rgb2lab, rgbToHex } from './colorUtils.js';

export function createSpectrumPlot(colors, elementId) {
    const labColors = colors.map(rgb2lab);
    const trace = {
        x: labColors.map(lab => lab[1]),  // a* component
        y: labColors.map(lab => lab[2]),  // b* component
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 10,
            color: colors.map(rgb => rgbToHex(rgb))
        }
    };

    const layout = {
        title: 'Color Distribution in Lab Color Space',
        xaxis: {title: 'a* (green-red)'},
        yaxis: {title: 'b* (blue-yellow)'}
    };

    Plotly.newPlot(elementId, [trace], layout);
} 