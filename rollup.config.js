import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from "rollup-plugin-dts";
import { minify } from 'terser';
import fs from 'fs/promises';
import path from 'path';

function minifyWasmJs({ input, output }) {
  return {
    name: `minify-wasm-js-${path.basename(output)}`,
    async buildEnd() {
      const code = await fs.readFile(input, 'utf-8');
      const result = await minify(code);
      await fs.mkdir(path.dirname(output), { recursive: true });
      await fs.writeFile(output, result.code, 'utf-8');
      console.log(`Minified ${input} → ${output}`);
    }
  };
}

function copyWasmPlugin({ srcPath, destPath }) {
  return {
    name: `copy-wasm-${path.basename(destPath)}`,
    async buildEnd() {
      const absSrc = path.resolve(srcPath);
      const absDest = path.resolve(destPath);

      console.log('Copying wasm from:', absSrc);
      console.log('To:', absDest);

      await fs.mkdir(path.dirname(absDest), { recursive: true });
      await fs.copyFile(absSrc, absDest);
    }
  };
}


function writeEsmPackageJsonPlugin() {
  return {
    name: 'write-esm-package-json',
    async buildEnd() {
      const esmPackageJson = {
        type: 'module'
      };
      const filePath = path.resolve('dist/esm/package.json');
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(esmPackageJson, null, 2), 'utf-8');
      console.log('✅ Wrote dist/esm/package.json with "type": "module"');
    }
  };
}


const tsPlugin = typescript({ tsconfig: './tsconfig.json' });

const esmConfig = {
  input: 'src/index.ts',
  output: {
    dir: 'dist/esm',
    format: 'esm',
    sourcemap: true,
    entryFileNames: 'index.js',
    chunkFileNames: 'wasm/[name].js'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    tsPlugin,
    terser(),
    minifyWasmJs({
      input: 'src/wasm/lapjv.js',
      output: 'dist/esm/wasm/lapjv.js'
    }),
    copyWasmPlugin({ srcPath: 'src/wasm/lapjv.wasm', destPath: 'dist/esm/wasm/lapjv.wasm' }),
    writeEsmPackageJsonPlugin()
  ]
}

const cjsConfig = {
  input: 'src/index.ts',
  output: {
    dir: 'dist/cjs',
    format: 'cjs',
    sourcemap: true,
    entryFileNames: 'index.js',
    chunkFileNames: 'wasm/[name].js'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    tsPlugin,
    terser(),
    minifyWasmJs({
      input: 'src/wasm/lapjv.cjs.js',
      output: 'dist/cjs/wasm/lapjv.cjs.js'
    }),
    copyWasmPlugin({ srcPath: 'src/wasm/lapjv.cjs.wasm', destPath: 'dist/cjs/wasm/lapjv.cjs.wasm' })
  ]

}

const typesConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es'
  },
  plugins: [dts()]
};

export default [esmConfig, cjsConfig, typesConfig];
