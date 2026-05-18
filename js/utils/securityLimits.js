export const SECURITY_LIMITS = {
    MAX_GENERATED_POOL_SIZE: 1024,
    MAX_COLOR_POOL_SIZE: 4096,
    MAX_SELECT_COUNT: 256,
    MAX_EXACT_COMBINATIONS: 1000000,
    MAX_PAIRWISE_COLORS: 1024,
    MAX_POPULATION_SIZE: 500,
    MAX_GENERATIONS: 1000,
    MAX_PARTICLES: 200,
    MAX_ANTS: 200,
    MAX_ITERATIONS: 2000
};

export function normalizePositiveInteger(value, name, max = Number.MAX_SAFE_INTEGER) {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new RangeError(`${name} must be a positive safe integer`);
    }
    if (value > max) {
        throw new RangeError(`${name} must be less than or equal to ${max}`);
    }
    return value;
}

export function validateColorPool(colors, maxColors = SECURITY_LIMITS.MAX_COLOR_POOL_SIZE) {
    if (!Array.isArray(colors) || colors.length === 0) {
        throw new TypeError('colors must be a non-empty array of RGB triples');
    }
    if (colors.length > maxColors) {
        throw new RangeError(`colors must contain no more than ${maxColors} entries`);
    }
    for (const color of colors) {
        if (!Array.isArray(color) || color.length !== 3 ||
            !color.every(component => Number.isInteger(component) && component >= 0 && component <= 255)) {
            throw new TypeError('each color must be an RGB triple with integer components between 0 and 255');
        }
    }
}

export function validateSelectionArgs(colors, selectCount, options = {}) {
    const maxColors = options.maxColors ?? SECURITY_LIMITS.MAX_COLOR_POOL_SIZE;
    const maxSelectCount = options.maxSelectCount ?? SECURITY_LIMITS.MAX_SELECT_COUNT;
    validateColorPool(colors, maxColors);
    normalizePositiveInteger(selectCount, 'selectCount', maxSelectCount);
    if (selectCount > colors.length) {
        throw new RangeError('selectCount cannot be greater than the number of colors');
    }
}

export function countCombinationsOverLimit(n, k, limit) {
    if (k < 0 || k > n) {
        return false;
    }
    const r = Math.min(k, n - k);
    let combinations = 1;
    for (let i = 1; i <= r; i++) {
        combinations = (combinations * (n - r + i)) / i;
        if (combinations > limit) {
            return true;
        }
    }
    return false;
}

export function validateExactSelectionArgs(colors, selectCount) {
    validateSelectionArgs(colors, selectCount);
    if (countCombinationsOverLimit(colors.length, selectCount, SECURITY_LIMITS.MAX_EXACT_COMBINATIONS)) {
        throw new RangeError(
            `exact algorithms are limited to ${SECURITY_LIMITS.MAX_EXACT_COMBINATIONS} combinations`
        );
    }
}

export function validatePairwiseSelectionArgs(colors, selectCount) {
    validateSelectionArgs(colors, selectCount, { maxColors: SECURITY_LIMITS.MAX_PAIRWISE_COLORS });
}
