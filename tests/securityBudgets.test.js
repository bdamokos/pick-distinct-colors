import vm from 'node:vm';
import * as api from '../src/index.js';
import { exactMinimum } from '../js/algorithms/exactMinimum.js';
import { exactMaximum } from '../js/algorithms/exactMaximum.js';
import { randomSelection } from '../js/algorithms/random.js';
import { SECURITY_LIMITS } from '../js/utils/securityLimits.js';
import * as colorUtils from '../js/utils/colorUtils.js';

const pool = size => Array.from({ length: size }, (_, i) => [i % 256, (i * 73) % 256, (i * 151) % 256]);
const methods = [
    ['greedy', api.greedySelection, true],
    ['kmeansppSelection', api.kmeansppSelection, true],
    ['maxSumDistancesSequential', api.maxSumDistancesSequential, true],
    ['randomSelection', randomSelection, true],
    ['antColonyOptimization', api.antColonyOptimization],
    ['geneticAlgorithm', api.geneticAlgorithm],
    ['particleSwarmOptimization', api.particleSwarmOptimization],
    ['simulatedAnnealing', api.simulatedAnnealing],
    ['tabuSearch', api.tabuSearch],
    ['exactMinimum', exactMinimum],
    ['exactMaximum', exactMaximum]
].map(([name, select, positionalSeed = false]) => [name, select, positionalSeed]);
const originalPerformance = globalThis.performance;

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
    globalThis.performance = originalPerformance;
    jest.restoreAllMocks();
});

test.each([exactMinimum, exactMaximum])('rejects expensive scoring even with few combinations (%p)', select => {
    expect(() => select(pool(258), 256)).toThrow(/estimated work/);
});

test('rejects the reported ant-colony CPU trigger and the iterations alias', async () => {
    const colors = pool(256);
    expect(() => api.antColonyOptimization(colors, 256, { numAnts: 1, acoIterations: 305 })).toThrow(/estimated work/);
    expect(() => api.antColonyOptimization(colors, 256, { numAnts: 1, iterations: 305 })).toThrow(/estimated work/);
    await expect(api.pickDistinctColors({ count: 256, colors, algorithm: 'antColonyOptimization', options: { numAnts: 1, iterations: 305 } })).rejects.toThrow(RangeError);
});

test.each(methods)('%s interrupts work when its clock reaches the deadline', (name, select, positionalSeed) => {
    let now = 0;
    globalThis.performance = { now: () => { now += 500; return now; } };
    expect(() => select(pool(12), 4, positionalSeed ? 42 : { seed: 42 })).toThrow(/execution budget/);
    expect(now).toBeLessThanOrEqual(SECURITY_LIMITS.MAX_EXECUTION_TIME_MS + 1500);
});

test('tabu search checks the deadline between neighbors within one iteration', () => {
    let elapsed = 0;
    let distanceCalls = 0;
    globalThis.performance = { now: () => elapsed };
    jest.spyOn(colorUtils, 'deltaE').mockImplementation(() => {
        if (++distanceCalls > 600) elapsed = SECURITY_LIMITS.MAX_EXECUTION_TIME_MS;
        return 1;
    });
    expect(() => api.tabuSearch(pool(64), 32, { tabuIterations: 1 })).toThrow(/execution budget/);
    // Initial fitness and one neighbor are bounded; scoring all neighbors is not.
    expect(distanceCalls).toBeLessThanOrEqual(2 * (32 * 31 / 2));
});

test.each(methods)('%s keeps direct, named and legacy seeded palettes compatible', async (name, select, positionalSeed) => {
    const colors = pool(6);
    const before = JSON.stringify(colors);
    const direct = select(colors, 3, positionalSeed ? 42 : { seed: 42 });
    const named = await api.pickDistinctColors({ count: 3, colors, algorithm: name, seed: 42 });
    const legacy = await api.pickDistinctColors(3, name, undefined, colors, undefined, 42);
    expect(named.colors).toEqual(direct.colors);
    expect(legacy.colors).toEqual(direct.colors);
    expect(direct.colors).toHaveLength(3);
    for (const color of direct.colors) expect(colors).toContainEqual(color);
    expect(Number.isFinite(direct.time)).toBe(true);
    expect(JSON.stringify(colors)).toBe(before);
});

test('the documented default greedy API still selects eight colors', async () => {
    const result = await api.pickDistinctColors({ count: 8, seed: 12345 });
    expect(result.colors).toHaveLength(8);
});

const scalarOptions = [
    ['antColonyOptimization', api.antColonyOptimization, 'evaporationRate'],
    ['antColonyOptimization', api.antColonyOptimization, 'pheromoneImportance'],
    ['antColonyOptimization', api.antColonyOptimization, 'heuristicImportance'],
    ['particleSwarmOptimization', api.particleSwarmOptimization, 'inertiaWeight'],
    ['particleSwarmOptimization', api.particleSwarmOptimization, 'cognitiveWeight'],
    ['particleSwarmOptimization', api.particleSwarmOptimization, 'socialWeight'],
    ['simulatedAnnealing', api.simulatedAnnealing, 'initialTemp'],
    ['simulatedAnnealing', api.simulatedAnnealing, 'coolingRate'],
    ['simulatedAnnealing', api.simulatedAnnealing, 'minTemp'],
    ['geneticAlgorithm', api.geneticAlgorithm, 'mutationRate']
];

test.each(scalarOptions)('%s rejects coercion and non-finite values for its scalar option', async (name, select, option) => {
    const colors = pool(6);
    for (const value of [' '.repeat(10000) + '1', NaN, Infinity, true, []]) {
        const options = { [option]: value };
        expect(() => select(colors, 3, options)).toThrow(/finite number/);
        await expect(api.pickDistinctColors({ count: 3, algorithm: name, colors, options })).rejects.toThrow(/finite number/);
        await expect(api.pickDistinctColors(3, name, undefined, colors, options)).rejects.toThrow(/finite number/);
    }
});

test('oversized pools and invalid selection counts still fail before computation', () => {
    expect(() => exactMinimum(pool(2), 3)).toThrow(RangeError);
    expect(() => api.antColonyOptimization(pool(1025), 2)).toThrow(RangeError);
    expect(() => api.greedySelection(pool(4097), 2)).toThrow(RangeError);
});

describe('browser-worker budget', () => {
    let blob;
    let worker;
    const originalWorker = globalThis.Worker;

    beforeEach(() => {
        jest.spyOn(URL, 'createObjectURL').mockImplementation(value => { blob = value; return 'blob:test'; });
        jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        globalThis.Worker = class {
            constructor() { worker = this; this.terminate = jest.fn(); }
            async postMessage(data) {
                const self = { postMessage: message => this.onmessage({ data: message }) };
                vm.runInNewContext(await blob.text(), { self, performance: globalThis.performance });
                self.onmessage({ data });
            }
        };
    });

    afterEach(() => { globalThis.Worker = originalWorker; });

    test('worker errors preserve RangeError and release worker resources', async () => {
        let now = 0;
        globalThis.performance = { now: () => { now += 500; return now; } };
        await expect(api.maxSumDistancesGlobal(pool(12), 4)).rejects.toThrow(RangeError);
        expect(worker.terminate).toHaveBeenCalledTimes(1);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
    });

    test('the worker returns a normal palette and releases resources', async () => {
        const result = await api.maxSumDistancesGlobal(pool(12), 4);
        expect(result.colors).toHaveLength(4);
        expect(worker.terminate).toHaveBeenCalledTimes(1);
        expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });
});
