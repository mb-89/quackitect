// The extension starting the server, with a fake editor. What the client is
// handed is data, so this reads it on both platforms, and the start itself
// runs against a door that records the ask and touches no editor.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { startsServer } from "../../src/extension/extension.js";
import {
  BIN,
  binaryOf,
  clientOf,
  NAME,
  serverAsk,
} from "../../src/extension/lib/lsp.js";

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

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("the binary wears an ending on windows and none anywhere else", () => {
  assert.equal(binaryOf("win32"), `${NAME}.exe`);
  assert.equal(binaryOf("linux"), NAME);
  assert.equal(binaryOf("darwin"), NAME);
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
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

// [[spec/design_output/lsp#one-checker-every-front-asks]]
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

// The client module's shape: its two action tables, and a client that asks its handler at each close. With no handler it holds the client's own cap, five starts again and then none. [[spec/tickets/every-server-stands-and-answers]]
function clientModule() {
  const ErrorAction = { Continue: 1, Shutdown: 2 };
  const CloseAction = { DoNotRestart: 1, Restart: 2 };
  const CAP = 4;
  const capped = () => {
    let closes = 0;
    return {
      error: () => ({ action: ErrorAction.Shutdown }),
      closed: () => {
        closes += 1;
        return { action: closes <= CAP ? CloseAction.Restart : CloseAction.DoNotRestart };
      },
    };
  };
  class LanguageClient {
    constructor(id, name, server, options) {
      Object.assign(this, { id, name, server, options, starts: 0 });
      this.handler = options?.errorHandler ?? capped();
    }
    async closes() {
      const said = await this.handler.closed();
      if (said?.action === CloseAction.Restart) this.starts += 1;
    }
  }
  return { ErrorAction, CloseAction, LanguageClient };
}

// [[spec/tickets/every-server-stands-and-answers]]
test("the client the editor builds starts the server again on every close, past its own cap", async () => {
  const node = clientModule();
  const ask = serverAsk("/at/root", "linux");
  const client = clientOf(node, ask, async () => {});

  assert.equal(client.server.command, ask.server.command);
  assert.deepEqual(client.options.documentSelector, ask.client.documentSelector);
  for (let at = 0; at < 12; at++) await client.closes();
  assert.equal(client.starts, 12, "every close starts the server again");

  const bare = new node.LanguageClient(ask.id, ask.name, ask.server, ask.client);
  for (let at = 0; at < 12; at++) await bare.closes();
  assert.equal(bare.starts, 4, "the client's own handler gives up at its cap");
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("a door with no start at all leaves the extension standing", async () => {
  assert.equal(
    await startsServer({ root: () => "/at/root", list: async () => [] }),
    "",
  );
});
