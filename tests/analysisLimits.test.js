import * as api from '../src/index.js';
import * as colors from '../js/utils/colorUtils.js';
import { SECURITY_LIMITS, validateAnalysisSize } from '../js/utils/securityLimits.js';
import { importColors } from '../js/utils/importExportUtils.js';
import { generateInitialColors } from '../js/utils/uiUtils.js';

const limit = SECURITY_LIMITS.MAX_PAIRWISE_COLORS;
const palette = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    jest.restoreAllMocks();
});

test.each([
    colors.calculateMetrics, colors.findClosestPair,
    api.calculateMetrics, api.findClosestPair
])('%p rejects oversized dense and sparse palettes before conversion', analyze => {
    for (const input of [Array(limit + 1).fill(palette[0]), Array(limit + 1)]) {
        const conversion = jest.spyOn(input, 'map').mockImplementation(() => { throw Error('conversion reached'); });
        expect(() => analyze(input)).toThrow(RangeError);
        expect(() => analyze(input)).toThrow(/at most 1024 colors/);
        expect(conversion).not.toHaveBeenCalled();
    }
});

test('the exact cap reaches conversion without doing an adversarial analysis', () => {
    expect(() => validateAnalysisSize(limit)).not.toThrow();
    expect(() => validateAnalysisSize(limit + 1)).toThrow(RangeError);
    for (const analyze of [api.calculateMetrics, api.findClosestPair]) {
        const input = Array(limit);
        const conversion = jest.spyOn(input, 'map').mockImplementation(() => { throw Error('admitted'); });
        expect(() => analyze(input)).toThrow('admitted');
        expect(conversion).toHaveBeenCalledTimes(1);
    }
});

test('ordinary metrics, closest-pair ordering, references and inputs remain intact', () => {
    const before = JSON.stringify(palette);
    const distances = [[0, 1], [0, 2], [1, 2]].map(([a, b]) => colors.deltaE(colors.rgb2lab(palette[a]), colors.rgb2lab(palette[b])));
    expect(api.calculateMetrics(palette)).toEqual({
        min: Math.min(...distances), max: Math.max(...distances),
        sum: distances.reduce((a, b) => a + b, 0), avg: distances.reduce((a, b) => a + b, 0) / 3
    });
    const tied = [palette[0], palette[0], palette[0]];
    const closest = api.findClosestPair(tied);
    expect(closest.distance).toBe(0);
    expect(closest.colors[0]).toBe(tied[0]);
    expect(closest.colors[1]).toBe(tied[1]);
    expect(JSON.stringify(palette)).toBe(before);
});

test.each([[[]], [[palette[0]]]])('empty and singleton analysis semantics remain intact (%p)', input => {
    expect(api.calculateMetrics(input)).toEqual({ min: Infinity, max: -Infinity, avg: NaN, sum: 0 });
    expect(api.findClosestPair(input)).toEqual({ colors: [input[0], undefined], distance: Infinity });
});

function browser({ randomCount = 2, imported = null, mode = 'replace', input = '' } = {}) {
    const elements = Object.fromEntries(['totalColors', 'selectColors', 'importText', 'importError', 'generateButton', 'complexityEstimate', 'results', 'colorSummary', 'calculateButton', 'initial-colors'].map(id => [id, {
        value: '', textContent: `previous ${id}`, innerHTML: `previous ${id}`, style: {}, disabled: true
    }]));
    elements.totalColors.value = String(randomCount);
    elements.selectColors.value = '2';
    elements.importText.value = input;
    globalThis.document = {
        getElementById: id => elements[id],
        querySelector: () => ({ value: mode }),
        querySelectorAll: () => []
    };
    globalThis.window = {
        importedColors: imported, initialColors: palette,
        randomColor: jest.fn(() => palette[0]),
        sortColors: jest.fn(colors.sortColors), calculateMetrics: jest.fn(colors.calculateMetrics),
        findClosestPair: jest.fn(colors.findClosestPair), analyzeColorDistribution: jest.fn(colors.analyzeColorDistribution),
        rgbToHex: colors.rgbToHex, createSpectrumPlot: jest.fn()
    };
    return elements;
}

test.each([
    ['replace', JSON.stringify(Array(limit + 1).fill(palette[0])), 0],
    ['replace', Array(limit + 1).fill('#ff0000').join('\n'), 0],
    ['append', JSON.stringify(palette), limit - 2]
])('rejected %s import preserves stored palette and input', (mode, input, randomCount) => {
    const previous = { colors: palette, mode: 'replace' };
    const elements = browser({ mode, input, randomCount, imported: previous });
    importColors();
    expect(window.importedColors).toBe(previous);
    expect(elements.importText.value).toBe(input);
    expect(elements.generateButton.textContent).toBe('previous generateButton');
    expect(elements.importError.textContent).toMatch(/at most 1024 colors/);
    expect(elements.importError.style.display).toBe('block');
});

test.each(['replace', 'append'])('ordinary %s import still works', mode => {
    const elements = browser({ mode, input: '#ff0000\nrgb(0,255,0)\n0,0,255' });
    importColors();
    expect(window.importedColors).toEqual({ mode, colors: palette });
    expect(elements.importText.value).toBe('');
    expect(elements.importError.style.display).toBe('none');
});

test.each([
    [limit + 1, null],
    [0, { mode: 'replace', colors: Array(limit + 1).fill(palette[0]) }],
    [limit - 2, { mode: 'append', colors: palette }],
    [-1, null], [NaN, null]
])('generation rejects count %p before allocation and preserves display/state', (randomCount, imported) => {
    const elements = browser({ randomCount, imported });
    generateInitialColors();
    expect(window.initialColors).toBe(palette);
    for (const name of ['randomColor', 'sortColors', 'calculateMetrics', 'findClosestPair', 'analyzeColorDistribution', 'createSpectrumPlot']) {
        expect(window[name]).not.toHaveBeenCalled();
    }
    expect(elements.results.innerHTML).toBe('previous results');
    expect(elements['initial-colors'].innerHTML).toBe('previous initial-colors');
    expect(elements.calculateButton.disabled).toBe(true);
    expect(elements.colorSummary.textContent).toMatch(/use fewer imported or random colors/);
});

test('generation rechecks controls and mode changed after a successful import', () => {
    const elements = browser({ input: JSON.stringify(palette) });
    importColors();
    window.importedColors.mode = 'append';
    elements.totalColors.value = String(limit - 2);
    generateInitialColors();
    expect(window.randomColor).not.toHaveBeenCalled();
    expect(window.sortColors).not.toHaveBeenCalled();
    expect(elements.colorSummary.textContent).toMatch(/at most 1024 colors/);
});

test.each([
    [3, null, 3],
    [limit + 1, { mode: 'replace', colors: palette }, 3],
    [2, { mode: 'append', colors: palette }, 5]
])('ordinary generation preserves output and computes closest pair once', (randomCount, imported, count) => {
    const elements = browser({ randomCount, imported });
    generateInitialColors();
    expect(window.initialColors).toHaveLength(count);
    expect(window.findClosestPair).toHaveBeenCalledTimes(1);
    expect(window.createSpectrumPlot).toHaveBeenCalledTimes(1);
    expect(elements.results.innerHTML).toBe('');
    expect(elements.calculateButton.disabled).toBe(false);
    expect(elements['initial-colors'].innerHTML).toContain(`Initial Colors (${count} total)`);
});

test('an analysis failure before display commit preserves the previous palette', () => {
    const elements = browser();
    window.calculateMetrics.mockImplementation(() => { throw new RangeError('analysis failed'); });
    generateInitialColors();
    expect(window.initialColors).toBe(palette);
    expect(elements.results.innerHTML).toBe('previous results');
    expect(elements['initial-colors'].innerHTML).toBe('previous initial-colors');
    expect(elements.colorSummary.textContent).toBe('analysis failed');
});
