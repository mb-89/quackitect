// The extension, loaded the way the editor loads it: its own require, a
// `vscode` module the host stands in, and `activate` with no door handed in.
// [[spec/tickets/the-owner-view-decides-done]]

import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";

const HERE = join(import.meta.dirname, "..", "..", "src", "extension", "extension.js");

// Every property answers a callable that answers another, so any editor call the load makes returns something.
function anything() {
  const call = () => anything();
  return new Proxy(call, {
    get: (_, key) =>
      key === "then" ? undefined : key === Symbol.toPrimitive ? () => "" : anything(),
    construct: () => anything(),
  });
}

test("the extension loads and activates as the editor loads it", async () => {
  const load = Module._load;
  Module._load = function (request, ...rest) {
    if (request === "vscode") return anything();
    return load.call(this, request, ...rest);
  };
  try {
    const extension = createRequire(HERE)(HERE);
    const context = {
      subscriptions: [],
      extensionPath: join(HERE, ".."),
      globalState: anything(),
      workspaceState: anything(),
    };
    await extension.activate(context);
    assert.equal(typeof extension.deactivate, "function", "the editor finds its stop");
  } finally {
    Module._load = load;
  }
});
