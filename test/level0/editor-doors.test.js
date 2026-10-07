// The doors into the editor, run against a stand-in for vscode: the import a
// drawing takes, the inset that says why it draws nothing, and the doors the
// extension builds once and hands on.
// [[spec/tickets/the-owner-walks-the-editor]]

import assert from "node:assert/strict";
import { basename, join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeHttp } from "../../src/doors/fake/http.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { editorRequire } from "../../src/doors/fake/vscode.js";

const ROOT = join(import.meta.dirname, "..", "..");
const WORK = "/work";
const HOOKS = "/work/.se/.runtime/hooks.json";
const STANDING = "/work/.se/.runtime/index.json";
const WIRE_WAIT = 500;

const vscode = {
  Uri: {
    joinPath: (base, ...parts) => ({ fsPath: [base.fsPath, ...parts].join("/") }),
    file: (path) => ({ toString: () => path }),
  },
  window: { visibleTextEditors: [] },
  workspace: {
    workspaceFolders: [{ uri: { fsPath: WORK } }],
    fs: {
      readFile: async () => {
        throw new Error("no such file");
      },
    },
    createFileSystemWatcher: () => ({
      onDidChange() {},
      onDidCreate() {},
      onDidDelete() {},
    }),
  },
  RelativePattern: class {},
  EventEmitter: class {
    fire() {}
    dispose() {}
  },
};
const require = editorRequire(vscode, import.meta.url);
const { fileDoor } = require("../../src/extension/editor-files.js");
const { insetDoor } = require("../../src/extension/editor-inset.js");
const { doorsOf } = require("../../src/extension/editor-doors.js");
const { editorDoor } = require("../../src/extension/editor.js");
const { indexDoor } = require("../../src/extension/editor-index.js");
const { processDoor } = require("../../src/extension/editor-process.js");

const contextOf = () => ({
  subscriptions: [],
  extensionPath: join(ROOT, "src", "extension"),
});

function loads() {
  const made = {
    clock: fakeClock(),
    disk: fakeDisk(),
    http: fakeHttp(),
    proc: fakeProc(),
  };
  const loaded = [];
  const load = async (path) => {
    const name = basename(path, ".js");
    loaded.push(path);
    return { [name]: () => made[name] };
  };
  return { made, loaded, load };
}

// [[spec/design_output/doors#one-door-per-outside-thing]]
test("the doors load once each, out of the tree's own src/doors, into one hand", async () => {
  const { made, loaded, load } = loads();
  const hand = await doorsOf(contextOf(), load);
  assert.equal(hand.home, ROOT);
  for (const name of Object.keys(made)) assert.equal(hand[name], made[name], name);
  assert.deepEqual(
    [...loaded].sort(),
    Object.keys(made)
      .sort()
      .map((name) => join(ROOT, "src", "doors", `${name}.js`)),
  );
});

// [[spec/design_output/doors#one-door-per-outside-thing]]
test("activate with no door handed in builds the doors once before the editor door", async () => {
  const { loaded, load } = loads();
  // activate requires the editor door late, so the case binds its own stand-in first. [[spec/guidance/code/testing]]
  const bound = editorRequire(vscode, import.meta.url)("../../src/extension/extension.js");
  await bound.activate(contextOf(), undefined, load);
  assert.equal(loaded.length, 4);
  assert.equal(new Set(loaded).size, 4, "each door loads once");
});

// [[spec/design_output/doors#time-is-a-door]]
test("the editor door hands the doors on: its time, its timer, the index, the hook's wire and the log", async () => {
  const time = fakeClock();
  const files = fakeDisk({
    [HOOKS]: JSON.stringify({ port: 7 }),
    [STANDING]: JSON.stringify({ v1: 9 }),
  });
  const web = fakeHttp({
    "POST http://127.0.0.1:7/": () => ({ status: 404 }),
    "GET http://127.0.0.1:9/v1/values/index/names": () => ({
      status: 200,
      text: JSON.stringify({ value: ["work/open-tasks"] }),
    }),
  });
  const door = editorDoor(contextOf(), {
    home: ROOT,
    clock: time,
    disk: files,
    http: web,
    proc: fakeProc(),
  });

  assert.equal(door.now(), time.ms());
  let ran = 0;
  door.later(() => (ran += 1), 5);
  time.tick(4);
  assert.equal(ran, 0, "the timer waits its span");
  time.tick(1);
  assert.equal(ran, 1);

  assert.deepEqual(await door.index.values("index/names"), ["work/open-tasks"]);
  assert.equal(await door.adoptsProcess("bridge.hook"), true);
  assert.deepEqual(door.processes(), { "bridge.hook": "on" });

  await door.append(".se/.log/session.jsonl", "one\n");
  await door.append(".se/.log/session.jsonl", "two\n");
  assert.equal(files.read("/work/.se/.log/session.jsonl"), "one\ntwo\n");
});

// [[spec/design_output/extension#the-hook-button]]
test("a hook door silent past the wire's wait stands as no index, and none named stands as none", async () => {
  const time = fakeClock();
  const silent = { send: () => new Promise(() => {}) };
  const door = processDoor(
    contextOf(),
    { uri: { fsPath: WORK } },
    {
      clock: time,
      disk: fakeDisk({ [HOOKS]: JSON.stringify({ port: 7 }) }),
      http: silent,
    },
  );
  const asked = door.adoptsProcess("bridge.hook");
  time.tick(WIRE_WAIT);
  assert.equal(await asked, false);
  assert.deepEqual(door.processes(), {});

  const bare = processDoor(
    contextOf(),
    { uri: { fsPath: WORK } },
    {
      clock: time,
      disk: fakeDisk(),
      http: fakeHttp(),
    },
  );
  assert.equal(await bare.adoptsProcess("bridge.hook"), false);
});

// [[spec/tickets/the-lens-calls-actions]]
test("the index door posts an action through the http door, and answers its output or its refusal", async () => {
  const web = fakeHttp({
    "POST http://127.0.0.1:9/v1/actions/ticket/pull": () => ({
      status: 200,
      text: JSON.stringify({ result: "work\n  the next leaf" }),
    }),
    "POST http://127.0.0.1:9/v1/actions/ticket/route": () => ({
      status: 422,
      text: JSON.stringify({ detail: "refused\n  the leaf holds no hand" }),
    }),
  });
  const doors = {
    clock: fakeClock(),
    disk: fakeDisk({ [STANDING]: JSON.stringify({ v1: 9 }) }),
    http: web,
  };
  const door = indexDoor(WORK, doors);
  const input = { args: ["one"], person: true };
  assert.deepEqual(await door.acts("ticket/pull", input), {
    code: 0,
    out: "work\n  the next leaf",
    err: "",
  });
  assert.deepEqual(await door.acts("ticket/route", input), {
    code: 1,
    out: "",
    err: "refused\n  the leaf holds no hand",
  });
  assert.match(web.sent[0].headers.prefer, /^wait=\d+$/);
  assert.deepEqual(JSON.parse(web.sent[0].body), input);

  const none = indexDoor("/nowhere", { ...doors, disk: fakeDisk() });
  assert.equal(await none.values("index/names"), undefined);
  assert.equal((await none.acts("ticket/pull", {})).code, 1);
});

function warned(run) {
  const lines = [];
  const was = console.warn;
  console.warn = (...said) => lines.push(said.join(" "));
  try {
    return { answer: run(), lines };
  } finally {
    console.warn = was;
  }
}

// Node on Windows refuses a bare drive path, so the door hands import the URL. [[spec/tickets/the-owner-walks-the-editor]]
test("a drawing imports through the URL, and a Windows path in fsPath breaks nothing", async () => {
  const uriOf = () => ({
    fsPath: "C:\\tree\\src\\emitter.mjs",
    toString: () => "data:text/javascript,export const said = 'drawn';",
  });
  const door = fileDoor({ subscriptions: [] }, {}, uriOf);
  assert.equal((await door.imports("src/emitter.mjs")).said, "drawn");
});

// A refused inset names why, and the side panel stands in. [[spec/tickets/the-owner-walks-the-editor]]
test("an editor withholding the inset answers no page, and says why", () => {
  const path = "spec/tickets/a-ticket.md";
  vscode.workspace.asRelativePath = (uri) => uri.path;
  vscode.window.visibleTextEditors = [{ document: { uri: { path } } }];
  delete vscode.window.createWebviewTextEditorInset;
  const door = insetDoor({ subscriptions: [] }, { uri: {} });
  const { answer, lines } = warned(() => door.page(path, 4));
  assert.equal(answer, null);
  assert.match(
    lines.join("\n"),
    /no inset over spec\/tickets\/a-ticket\.md, because the editor withholds the proposed API/,
  );

  vscode.window.createWebviewTextEditorInset = () => {
    throw new Error("the inset refuses");
  };
  const thrown = warned(() => door.page(path, 4));
  assert.equal(thrown.answer, null);
  assert.match(thrown.lines.join("\n"), /because the inset refuses/);
});
