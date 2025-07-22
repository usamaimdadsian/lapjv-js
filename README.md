# Description
A JavaScript (WASM-backed) implementation of the [LAPJV algorithm](https://github.com/gatagat/lap), ported from the Python `lap` package. It solves the **linear assignment problem** (also known as the **minimum cost bipartite matching problem**) efficiently.


## 📦 Installation
```bash
npm install lapjv-js
```


# Example Usage
```javascript
import { lapjv } from './lapjv-js.js';

const costMatrix = [
    [1.0, 2.0, 3.0],
    [2.0, 4.0, 6.0],
    [3.0, 6.0, 9.0]
];

lapjv(costMatrix).then(({ cost, x, y }) => {
    console.log("Assignment cost:", cost);
    console.log("x:", x);
    console.log("y:", y);
});

```
# Command to generate web assembly

```command
emcc lapjv.cpp -o lapjv.js \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s EXPORT_NAME="createLapjvModule" \
    -s EXPORTED_FUNCTIONS="['_lapjv_internal','_malloc', '_free']" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s EXPORTED_RUNTIME_METHODS="['cwrap', 'getValue', 'setValue','HEAPF64']"
```
