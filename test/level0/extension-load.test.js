// The extension, loaded the way the editor loads it: its own require, the
// `vscode` stand-in the fake door answers, and `activate` with no door handed
// in. The stand-in answers every property with a callable a `new` can take
// too, so any editor call the load makes returns something.
// [[spec/tickets/the-owner-view-decides-done]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { editorRequire } from "../../src/doors/fake/vscode.js";

const HERE = join(import.meta.dirname, "..", "..", "src", "extension", "extension.js");

function anything() {
  function call() {
    return anything();
  }
  return new Proxy(call, {
    get: (_, key) =>
      key === "then" ? undefined : key === Symbol.toPrimitive ? () => "" : anything(),
    construct: () => anything(),
  });
}

test("the extension loads and activates as the editor loads it", async () => {
  const extension = editorRequire(anything(), import.meta.url)(HERE);
  const context = {
    subscriptions: [],
    extensionPath: join(HERE, ".."),
    globalState: anything(),
    workspaceState: anything(),
  };

  await extension.activate(context);
  assert.equal(typeof extension.deactivate, "function", "the editor finds its stop");
});
