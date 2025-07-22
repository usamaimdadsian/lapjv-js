export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  },

  // moduleNameMapper: {
  //   // optional if you used a path alias like "lapjv-wasm"
  //   '^lapjv-wasm$': '<rootDir>/src/wasm/lapjv.js'
  // }
};
