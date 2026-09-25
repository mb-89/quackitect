// A stand-in for the vscode module, so a test loads an editor door off the
// editor. The door requires vscode, and this answers that name with the fake.
// [[spec/design_output/doors#a-fake-behaves]]

import { createRequire } from "node:module";

const NAME = "vscode";

// A require from the test's own place, where vscode answers the fake the case hands in. [[spec/design_output/doors#a-fake-behaves]]
export function editorRequire(fake, from) {
  const require = createRequire(from);
  const Module = require("node:module");
  const resolve = Module._resolveFilename;
  if (!resolve.fake) {
    const answered = function (request, ...rest) {
      return request === NAME ? NAME : resolve.call(this, request, ...rest);
    };
    answered.fake = true;
    Module._resolveFilename = answered;
  }
  require.cache[NAME] = { id: NAME, filename: NAME, loaded: true, exports: fake };
  return require;
}
