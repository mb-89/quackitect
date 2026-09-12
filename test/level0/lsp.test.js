// The extension starting the server, with a fake editor. What the client is
// handed is data, so this reads it on both platforms, and the start itself
// runs against a door that records the ask and touches no editor.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { startsServer } from "../../src/extension/extension.js";
import { BIN, NAME, binaryOf, serverAsk } from "../../src/extension/lib/lsp.js";

const doorOf = (held) => {
  const asked = [];
  return {
    asked,
    root: () => "/at/root",
    list: async (path) => held[path] ?? [],
    startsServer(ask) {
      asked.push(ask);
      return ask.server.command;
    },
  };
};

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
test("the binary wears an ending on windows and none anywhere else", () => {
  assert.equal(binaryOf("win32"), `${NAME}.exe`);
  assert.equal(binaryOf("linux"), NAME);
  assert.equal(binaryOf("darwin"), NAME);
});

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
test("the ask names the built binary, the lsp verb and the tree", () => {
  const ask = serverAsk("/at/root", "linux");
  assert.equal(ask.at, `${BIN}/${NAME}`);
  assert.equal(ask.server.command, `/at/root/${BIN}/${NAME}`);
  assert.deepEqual(ask.server.args, ["lsp"]);
  assert.equal(ask.server.options.cwd, "/at/root");
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("the client watches markdown and every file a two-file rule reads", () => {
  const said = serverAsk("/at/root", "linux").client.documentSelector;
  assert.equal(said[0].language, "markdown");
  const patterns = said.map((one) => one.pattern).filter(Boolean);
  for (const one of [
    "**/.vscode/settings.json",
    "**/.vscode/extensions.json",
    "**/src/scripts/install.sh",
    "**/.vale.ini",
  ]) {
    assert.ok(patterns.includes(one), one);
  }
});

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
test("a built server starts, and an unbuilt one starts nothing", async () => {
  const built = doorOf({ [BIN]: [binaryOf(process.platform), "vale"] });
  assert.equal(
    await startsServer(built),
    `/at/root/${BIN}/${binaryOf(process.platform)}`,
  );
  assert.equal(built.asked.length, 1);

  const bare = doorOf({ [BIN]: ["vale"] });
  assert.equal(await startsServer(bare), "");
  assert.equal(bare.asked.length, 0);
});

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
test("a door with no start at all leaves the extension standing", async () => {
  assert.equal(
    await startsServer({ root: () => "/at/root", list: async () => [] }),
    "",
  );
});
