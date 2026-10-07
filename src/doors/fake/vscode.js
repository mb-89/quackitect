// A stand-in for the vscode module, so a test loads an editor door off the
// editor. The door requires vscode, and this answers that name with the fake.
// [[spec/design_output/doors#a-fake-behaves]]

// level0: OutsideInDoors - the fake answers vscode through node's own loader, inside the process
import { createRequire } from "node:module";
import { join } from "node:path";

const NAME = "vscode";
const EXTENSION = join(import.meta.dirname, "..", "..", "extension");

// A require from the test's own place, where vscode answers the fake the case hands in. [[spec/design_output/doors#a-fake-behaves]]
export function editorRequire(fake, from) {
  const require = createRequire(from);
  // level0: OutsideInDoors - the fake answers vscode through node's own loader, inside the process
  const Module = require("node:module");
  const resolve = Module._resolveFilename;
  if (!resolve.fake) {
    const answered = function (request, ...rest) {
      return request === NAME ? NAME : resolve.call(this, request, ...rest);
    };
    answered.fake = true;
    Module._resolveFilename = answered;
  }
  // A module an earlier fake loaded holds that fake, so each case loads the extension again over its own. [[spec/guidance/code/testing]]
  for (const loaded of Object.keys(require.cache)) {
    if (loaded.startsWith(EXTENSION)) delete require.cache[loaded];
  }
  require.cache[NAME] = { id: NAME, filename: NAME, loaded: true, exports: fake };
  return require;
}
