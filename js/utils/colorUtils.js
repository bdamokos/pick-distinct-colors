export function rgb2lab(rgb) {
    let r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

export function deltaE(labA, labB) {
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

export function randomColor() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ];
}

export function sortColors(colors) {
    const labColors = colors.map(rgb2lab);
    const indices = Array.from({length: colors.length}, (_, i) => i);
    
    // Sort by L, then a, then b
    indices.sort((i, j) => {
        const [L1, a1, b1] = labColors[i];
        const [L2, a2, b2] = labColors[j];
        if (L1 !== L2) return L2 - L1;
        if (a1 !== a2) return a2 - a1;
        return b2 - b1;
    });
    
    return indices.map(i => colors[i]);
}

export function calculateMetrics(colors) {
    const labColors = colors.map(rgb2lab);
    let minDist = Infinity;
    let maxDist = -Infinity;
    let sumDist = 0;
    let count = 0;
    
    for (let i = 0; i < colors.length - 1; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const dist = deltaE(labColors[i], labColors[j]);
            minDist = Math.min(minDist, dist);
            maxDist = Math.max(maxDist, dist);
            sumDist += dist;
            count++;
        }
    }
    
    return {
        min: minDist,
        max: maxDist,
        avg: sumDist / count,
        sum: sumDist
    };
}

export function analyzeColorDistribution(colors) {
    if (!colors || colors.length === 0) return 'No colors to analyze';
    
    try {
        const labColors = colors.map(rgb2lab);
        
        // Initialize stats with first color
        const stats = {
            L: { min: labColors[0][0], max: labColors[0][0], range: [0, 100] },
            a: { min: labColors[0][1], max: labColors[0][1], range: [-128, 127] },
            b: { min: labColors[0][2], max: labColors[0][2], range: [-128, 127] }
        };
        
        // Process colors in chunks
        const chunkSize = 500;
        for (let i = 1; i < labColors.length; i += chunkSize) {
            const chunk = labColors.slice(i, i + chunkSize);
            for (const lab of chunk) {
                stats.L.min = Math.min(stats.L.min, lab[0]);
                stats.L.max = Math.max(stats.L.max, lab[0]);
                stats.a.min = Math.min(stats.a.min, lab[1]);
                stats.a.max = Math.max(stats.a.max, lab[1]);
                stats.b.min = Math.min(stats.b.min, lab[2]);
                stats.b.max = Math.max(stats.b.max, lab[2]);
            }
        }
        
        // Calculate coverage percentages
        const coverage = {
            L: ((stats.L.max - stats.L.min) / (stats.L.range[1] - stats.L.range[0]) * 100).toFixed(1),
            a: ((stats.a.max - stats.a.min) / (stats.a.range[1] - stats.a.range[0]) * 100).toFixed(1),
            b: ((stats.b.max - stats.b.min) / (stats.b.range[1] - stats.b.range[0]) * 100).toFixed(1)
        };
        
        return `
            <strong>Color Space Coverage:</strong><br>
            Lightness (L*): ${coverage.L}%<br>
            Green-Red (a*): ${coverage.a}%<br>
            Blue-Yellow (b*): ${coverage.b}%
        `;
    } catch (error) {
        console.error('Error in analyzeColorDistribution:', error);
        return 'Error analyzing color distribution';
    }
}

export function rgbToHex(rgb) {
    return '#' + rgb.map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
} 