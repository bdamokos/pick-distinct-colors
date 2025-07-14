import { pickDistinctColors } from './utils/pickDistinctColors.js';
import { calculateMetrics, deltaE, rgb2lab } from './utils/colorUtils.js';

function stddev(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
}

function allPairwiseDeltaE(colors) {
  const labs = colors.map(rgb2lab);
  const dists = [];
  for (let i = 0; i < labs.length - 1; i++) {
    for (let j = i + 1; j < labs.length; j++) {
      dists.push(deltaE(labs[i], labs[j]));
    }
  }
  return dists;
}

async function benchmark() {
  const count = 8;
  const algorithm = 'greedy';
  const seed = 42;
  const minPool = count * 2;
  const maxPool = count * 50;
  const step = count * 2;
  console.log('poolSize\ttime(ms)\tminDeltaE\tavgDeltaE\tstddevDeltaE');
  for (let poolSize = minPool; poolSize <= maxPool; poolSize += step) {
    const t0 = Date.now();
    const { colors } = await pickDistinctColors({ count, algorithm, poolSize, seed });
    const t1 = Date.now();
    const dists = allPairwiseDeltaE(colors);
    const minDeltaE = Math.min(...dists);
    const avgDeltaE = dists.reduce((a, b) => a + b, 0) / dists.length;
    const stddevDeltaE = stddev(dists);
    const time = t1 - t0;
    console.log(`${poolSize}\t${time}\t${minDeltaE.toFixed(2)}\t${avgDeltaE.toFixed(2)}\t${stddevDeltaE.toFixed(2)}`);
  }
}

benchmark(); 