// The extension starting the server, with a fake editor. What the client is
// handed is data, so this reads it on both platforms, and the start itself
// runs against a door that records the ask and touches no editor.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { startsServer } from "../../src/extension/extension.js";
import {
  BIN,
  binaryOf,
  clientOf,
  middlewareOf,
  NAME,
  serverAsk,
} from "../../src/extension/lib/lsp.js";
import { COMMAND } from "../../src/extension/lib/lens.js";

const TICKET = "spec/tickets/one.md";

// The door the middleware reaches: the reason a person types, the saves and the marks. [[spec/tickets/extension-keeps-the-editor-parts]]
const middleDoor = (typed) => {
  const said = { asked: [], order: [], marked: [] };
  return {
    said,
    asksLine: async (prompt) => {
      said.asked.push(prompt);
      return typed;
    },
    saves: async (path) => said.order.push(["saved", path]),
    marksFields: (uri, lines) => said.marked.push([uri, lines]),
  };
};

// What a press hands the server through the middleware. [[spec/tickets/extension-keeps-the-editor-parts]]
const pressedThrough = async (door, command, args) => {
  await middlewareOf(door).executeCommand(command, args, async (named, given) => {
    door.said.order.push(["sent", named, ...given]);
    return { word: "work" };
  });
  return door.said.order;
};

// [[spec/tickets/extension-keeps-the-editor-parts]]
test("the middleware asks the reason before a fail reaches the server, and an empty reason sends nothing", async () => {
  const door = middleDoor("the tests stand red");
  const sent = (await pressedThrough(door, COMMAND, ["fail", "one", TICKET])).at(-1);
  assert.deepEqual(sent, ["sent", COMMAND, "fail", "one", TICKET, "the tests stand red"]);
  assert.equal(door.said.asked.length, 1);
  const empty = middleDoor("  ");
  assert.deepEqual(await pressedThrough(empty, COMMAND, ["fail", "one", TICKET]), []);
  const other = middleDoor("");
  assert.deepEqual(await pressedThrough(other, "another.command", ["fail"]), [
    ["sent", "another.command", "fail"],
  ]);
});

// [[spec/tickets/extension-keeps-the-editor-parts]]
test("the middleware saves the ticket before a hand-back, and a take saves nothing", async () => {
  for (const act of ["pass", "back", "fail"]) {
    const order = await pressedThrough(middleDoor("why"), COMMAND, [act, "one", TICKET]);
    assert.deepEqual(order.map((one) => one[0]), ["saved", "sent"], act);
    assert.equal(order[0][1], TICKET, act);
  }
  const take = await pressedThrough(middleDoor(""), COMMAND, ["take", "one", TICKET]);
  assert.deepEqual(take.map((one) => one[0]), ["sent"]);
});

// [[spec/tickets/extension-keeps-the-editor-parts]]
test("a field hint draws as the underline, and leaves the Problems rows", () => {
  const door = middleDoor("");
  const uri = "file:///tree/spec/tickets/one.md";
  const mark = { code: "HeldField", range: { start: { line: 11 } } };
  const fault = { code: "Sentence", range: { start: { line: 3 } } };
  const handed = [];
  middlewareOf(door).handleDiagnostics(uri, [mark, fault], (at, kept) =>
    handed.push([at, kept]),
  );
  assert.deepEqual(handed, [[uri, [fault]]]);
  assert.deepEqual(door.said.marked, [[uri, [11]]]);
});

// The index binary under the root, as indexBinary in src/index/binary.go builds it, in the runtime folder folders.go owns. [[spec/design_output/index#a-door-comes-back]]
const INDEX = ".se/.runtime/bin/se-index";

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

// The editor starts quack lsp, which the index binary answers, so no second server stands. [[spec/design_output/lsp#one-checker-every-front-asks]] [[spec/tickets/the-lsp-server-leaves]]
test("the ask names the index binary, its ending on windows alone, the lsp verb and the tree", () => {
  assert.deepEqual(
    [binaryOf("win32"), binaryOf("linux"), binaryOf("darwin")],
    [`${NAME}.exe`, NAME, NAME],
  );
  const ask = serverAsk("/at/root", "linux");
  assert.deepEqual([ask.at, `${BIN}/${NAME}`], [INDEX, INDEX]);
  assert.equal(ask.server.command, `/at/root/${INDEX}`);
  assert.deepEqual(ask.server.args, ["lsp"]);
  assert.equal(ask.server.options.cwd, "/at/root");
  assert.equal(serverAsk("/at/root", "win32").at, `${INDEX}.exe`);
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("the client watches markdown and every file a two-file rule reads", () => {
  const said = serverAsk("/at/root", "linux").client.documentSelector;
  assert.equal(said[0].language, "markdown");
  const patterns = said.map((one) => one.pattern).filter(Boolean);
  for (const one of [
    "**/.vscode/settings.json",
    "**/.vscode/extensions.json",
    "**/install.sh",
  ]) {
    assert.ok(patterns.includes(one), one);
  }
  assert.ok(
    patterns.every((one) => !/vale/i.test(one)),
    "the Go rules read no prose linter's config",
  );
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("a built server starts, and an unbuilt one starts nothing", async () => {
  const built = doorOf({ [BIN]: [binaryOf(process.platform), "biome"] });
  assert.equal(
    await startsServer(built),
    `/at/root/${BIN}/${binaryOf(process.platform)}`,
  );
  assert.equal(built.asked.length, 1);

  const bare = doorOf({ [BIN]: ["biome"] });
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
        return {
          action: closes <= CAP ? CloseAction.Restart : CloseAction.DoNotRestart,
        };
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
});

// The pause waits on the clock door the caller hands in, so the client holds no timer of its own. [[spec/design_output/doors#time-is-a-door]]
test("the client starts the server again once the clock it is handed passes the pause", async () => {
  const time = fakeClock();
  const client = clientOf(clientModule(), serverAsk("/at/root", "linux"), time.wait);
  let closed = false;
  const closing = client.closes().then(() => {
    closed = true;
  });
  await Promise.resolve();
  assert.equal(closed, false, "the close waits on the clock");
  time.tick();
  await closing;
  assert.equal(client.starts, 1);
  await assert.rejects(
    clientOf(clientModule(), serverAsk("/at/root", "linux")).handler.closed(),
    "a client handed no clock holds no wait of its own",
  );
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("a door with no start at all leaves the extension standing", async () => {
  assert.equal(
    await startsServer({ root: () => "/at/root", list: async () => [] }),
    "",
  );
});
