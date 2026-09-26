// The editor's file door, against the real filesystem. The editor's own file
// system offers no append, so the door appends through node, and this case
// holds that road to what the fake in the sidebar's cases does.
// [[spec/design_output/log#every-writer-appends]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { editorRequire } from "../../src/doors/fake/vscode.js";

const require = editorRequire({}, import.meta.url);
const { fileDoor } = require("../../src/extension/editor-files.js");

test("the editor door appends a line after every line another writer holds, and makes the folder it lands in", async () => {
  const files = disk();
  const root = files.tempDir("level0-editor-");
  const door = fileDoor({ subscriptions: [] }, {}, (path) => ({
    fsPath: join(root, ...String(path).split("/")),
  }));
  const at = ".se/.log/session.jsonl";

  await door.append(at, "one\n");
  files.append(join(root, ".se", ".log", "session.jsonl"), "other\n");
  await door.append(at, "two\n");

  assert.equal(
    files.read(join(root, ".se", ".log", "session.jsonl")),
    "one\nother\ntwo\n",
  );
});
