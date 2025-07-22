# Description
A JavaScript and Typescript (WASM-backed) implementation of the [LAPJV algorithm](https://github.com/gatagat/lap), ported from the Python `lap` package. It solves the **linear assignment problem** (also known as the **minimum cost bipartite matching problem**) efficiently.


## 📦 Installation
```bash
npm install lapjv-js
```


# Example Usage
```javascript
import { lapjv } from 'lapjv-js';
// or
const {lapjv} = require('lapjv-js')

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
# License & Attribution
This JavaScript port retains the original BSD 2-Clause license. See the `LICENSE` file for details.
