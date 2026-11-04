const assert = require('node:assert/strict');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => {
  const ts = require('typescript');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
};
const { photoSwipeStep } = require('../src/lib/photoSwipe.ts');
const gestures = [
  ['left advances', -100, 10, 1],
  ['right goes back', 100, -10, -1],
  ['tap stays put', 0, 0, 0],
  ['small movement stays put', -20, 3, 0],
  ['vertical scroll stays put', 10, -100, 0],
  ['diagonal scroll stays put', -80, 75, 0],
  ['horizontal threshold advances', -45, 0, 1],
  ['below threshold stays put', 44, 0, 0],
  ['mostly horizontal advances', -100, 40, 1],
];
for (const [name, x, y, expected] of gestures) assert.equal(photoSwipeStep(x, y), expected, name);
console.log(`PASS: ${gestures.length} photo swipe direction and scrolling checks.`);
