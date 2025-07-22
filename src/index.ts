
let createLapjvModule: any;

const isCjs =
  typeof require === 'function' &&
  typeof module !== 'undefined' &&
  typeof module.exports !== 'undefined';

async function getLapjvModule() {
  if (createLapjvModule) return createLapjvModule;

  if (isCjs) {
    // CJS mode
    createLapjvModule = require('./wasm/lapjv.cjs.js');
  } else {
    // ESM mode
    // @ts-ignore
    createLapjvModule = (await import('./wasm/lapjv.js')).default;
  }

  return createLapjvModule();
}


let moduleInstance: Awaited<ReturnType<typeof createLapjvModule>> | null = null;

async function getModule() {
  if (!moduleInstance) {
    moduleInstance = await getLapjvModule();
  }
  return moduleInstance;
}

export type LapjvResult = {
  x: number[];
  y: number[];
  cost?: number;
};

export async function lapjv(
  costMatrix: number[][],
  {
    extendCost = false,
    costLimit = Infinity,
    returnCost = true
  } = {}
): Promise<LapjvResult> {
  const Module = await getModule();
  const lapjv_internal = Module.cwrap(
    'lapjv_internal',
    'number',
    ['number', 'number', 'number', 'number']
  );

  if (!Array.isArray(costMatrix) || costMatrix.length === 0 || !Array.isArray(costMatrix[0])) {
    throw new Error('Invalid costMatrix: must be a 2D non-empty array');
  }

  const originalRows = costMatrix.length;
  const originalCols = costMatrix[0].length;

  let n: number;
  let paddedMatrix: number[][];

  if (originalRows === originalCols) {
    n = originalRows;
    paddedMatrix = costMatrix;
  } else {
    if (!extendCost && costLimit === Infinity) {
      throw new Error(
        'Cost matrix must be square. Set `extendCost=true` or provide `costLimit`.'
      );
    }

    if (costLimit !== Infinity) {
      n = originalRows + originalCols;
      paddedMatrix = Array.from({ length: n }, () => Array(n).fill(costLimit / 2));
      for (let i = 0; i < originalRows; i++) {
        for (let j = 0; j < originalCols; j++) {
          paddedMatrix[i][j] = costMatrix[i][j];
        }
      }
      for (let i = originalRows; i < n; i++) {
        for (let j = originalCols; j < n; j++) {
          paddedMatrix[i][j] = 0;
        }
      }
    } else {
      n = Math.max(originalRows, originalCols);
      paddedMatrix = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < originalRows; i++) {
        for (let j = 0; j < originalCols; j++) {
          paddedMatrix[i][j] = costMatrix[i][j];
        }
      }
    }
  }

  const rowPtrs = [];
  const rowPtrsPtr = Module._malloc(n * Module.HEAP32.BYTES_PER_ELEMENT);

  for (let i = 0; i < n; i++) {
    const rowPtr = Module._malloc(n * Float64Array.BYTES_PER_ELEMENT);
    Module.HEAPF64.set(new Float64Array(paddedMatrix[i]), rowPtr / Float64Array.BYTES_PER_ELEMENT);
    rowPtrs.push(rowPtr);
    Module.setValue(rowPtrsPtr + i * Module.HEAP32.BYTES_PER_ELEMENT, rowPtr, 'i32');
  }

  const xPtr = Module._malloc(n * Module.HEAP32.BYTES_PER_ELEMENT);
  const yPtr = Module._malloc(n * Module.HEAP32.BYTES_PER_ELEMENT);

  const ret = lapjv_internal(n, rowPtrsPtr, xPtr, yPtr);
  if (ret !== 0) {
    throw new Error(`lapjv_internal failed with error code ${ret}`);
  }

  const x = new Int32Array(n);
  const y = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = Module.getValue(xPtr + i * Module.HEAP32.BYTES_PER_ELEMENT, 'i32');
    y[i] = Module.getValue(yPtr + i * Module.HEAP32.BYTES_PER_ELEMENT, 'i32');
  }

  rowPtrs.forEach(ptr => Module._free(ptr));
  Module._free(rowPtrsPtr);
  Module._free(xPtr);
  Module._free(yPtr);

  const finalX = Array(originalRows).fill(-1);
  const finalY = Array(originalCols).fill(-1);
  let totalCost = 0;

  for (let i = 0; i < originalRows; i++) {
    if (x[i] < originalCols) {
      finalX[i] = x[i];
      totalCost += costMatrix[i][x[i]];
    }
  }

  for (let j = 0; j < originalCols; j++) {
    if (y[j] < originalRows) {
      finalY[j] = y[j];
    }
  }

  const result: LapjvResult = { x: finalX, y: finalY };
  if (returnCost) result.cost = totalCost;

  return result;
}
