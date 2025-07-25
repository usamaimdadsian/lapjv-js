import { execSync } from "child_process";


// Build WASM for ESM
execSync(`emcc src/wasm/lapjv.cpp -o src/wasm/lapjv.js \
  -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORT_NAME="createLapjvModule" \
  -s EXPORTED_FUNCTIONS="['_lapjv_internal','_malloc','_free']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','getValue','setValue','HEAPF64','HEAP32']"`, { stdio: "inherit" });

// Build WASM for CJS
execSync(`emcc src/wasm/lapjv.cpp -o src/wasm/lapjv.cjs.js \
  -s MODULARIZE=1 -s EXPORT_NAME="createLapjvModule" \
  -s EXPORTED_FUNCTIONS="['_lapjv_internal','_malloc','_free']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','getValue','setValue','HEAPF64','HEAP32']"`, { stdio: "inherit" });

