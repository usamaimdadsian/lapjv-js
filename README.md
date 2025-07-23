# lapjv-js: Linear Assignment Problem Solver for JavaScript
A JavaScript and Typescript (WASM-backed) implementation of the [LAPJV algorithm](https://github.com/gatagat/lap), ported from the Python `lap` package. It solves the **linear assignment problem** (also known as the **minimum cost bipartite matching problem**) efficiently.


## 📦 Installation
```bash
npm install lapjv-js
```


## Example Usage
```javascript
import { lapjv } from 'lapjv-js'; // ecma script module system
// or
// const {lapjv} = require('lapjv-js'); // commonjs

const costMatrix = [
    [1.0, 2.0, 3.0],
    [2.0, 4.0, 6.0],
    [3.0, 6.0, 9.0]
];

lapjv(costMatrix, {
    extendCost: true,
    costLimit: 0.85,
}).then(({ cost, x, y }) => {
    console.log("Assignment cost:", cost);
    console.log("x:", x);
    console.log("y:", y);
});
```

<details><summary>More details</summary>
The function `lapjv` returns the assignment cost `cost` and two arrays `x` and `y`. If cost matrix `C` has shape NxM, then `x` is a size-N array specifying to which column each row is assigned, and `y` is a size-M array specifying to which row each column is assigned. For example, an output of `x = [1, 0]` indicates that row 0 is assigned to column 1 and row 1 is assigned to column 0. Similarly, an output of `x = [2, 1, 0]` indicates that row 0 is assigned to column 2, row 1 is assigned to column 1, and row 2 is assigned to column 0.
</details>

## YouTube Tutorial
[![Watch the video](https://img.youtube.com/vi/kjih-Dcn6-4/hqdefault.jpg)](https://www.youtube.com/watch?v=kjih-Dcn6-4)

## License & Attribution
This JavaScript port retains the original BSD 2-Clause license. See the `LICENSE` file for details.
