import createLapjvModule from './lapjv.js'; // Emscripten output

export async function lapjv(costMatrix, {
  extendCost = false,
  costLimit = Infinity,
  returnCost = true
} = {}) {
  const Module = await createLapjvModule();

  const lapjv_internal = Module.cwrap(
    'lapjv_internal',
    'number',
    ['number', 'number', 'number', 'number']
  );

  let originalRows = costMatrix.length;
  let originalCols = costMatrix[0].length;

  let n = 0;
  let paddedMatrix;

  if (originalRows === originalCols) {
    paddedMatrix = costMatrix;
    n = originalRows;
  } else {
    if (!extendCost && costLimit === Infinity) {
      throw new Error(
        'Cost matrix must be square. Set `extendCost=true` or provide `costLimit`.'
      );
    }

    // Padding for extendCost or costLimit logic
    if (costLimit !== Infinity) {
      n = originalRows + originalCols;
      paddedMatrix = Array(n).fill(0).map(() => Array(n).fill(costLimit / 2));
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
    } else if (extendCost) {
      n = Math.max(originalRows, originalCols);
      paddedMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
      for (let i = 0; i < originalRows; i++) {
        for (let j = 0; j < originalCols; j++) {
          paddedMatrix[i][j] = costMatrix[i][j];
        }
      }
    }
  }

  // Allocate row pointers for paddedMatrix
  const rowPtrs = [];
  const rowPtrsPtr = Module._malloc(n * 4); // 4 bytes per pointer (32-bit)

  for (let i = 0; i < n; i++) {
    const row = paddedMatrix[i];
    const rowPtr = Module._malloc(n * 8); // 8 bytes per double
    Module.HEAPF64.set(new Float64Array(row), rowPtr / 8);
    rowPtrs.push(rowPtr);
    Module.setValue(rowPtrsPtr + i * 4, rowPtr, 'i32');
  }

  const xPtr = Module._malloc(n * 4); // int32
  const yPtr = Module._malloc(n * 4); // int32

  const ret = lapjv_internal(n, rowPtrsPtr, xPtr, yPtr);

  if (ret !== 0) {
    throw new Error(`lapjv_internal failed with error code ${ret}`);
  }

  const x = new Int32Array(n);
  const y = new Int32Array(n);

  for (let i = 0; i < n; i++) {
    x[i] = Module.getValue(xPtr + i * 4, 'i32');
    y[i] = Module.getValue(yPtr + i * 4, 'i32');
  }

  // Free memory
  rowPtrs.forEach(ptr => Module._free(ptr));
  Module._free(rowPtrsPtr);
  Module._free(xPtr);
  Module._free(yPtr);

  // Postprocess result to handle padding
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

  const result = { x: finalX, y: finalY };
  if (returnCost) result.cost = totalCost;
  return result;
}
