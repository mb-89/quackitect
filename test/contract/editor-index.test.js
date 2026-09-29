// The index door against a real server on a real port: the values it reads,
// the action it posts, and nothing where no index stands.
// [[spec/design_output/extension#the-views-section]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { editorRequire } from "../../src/doors/fake/vscode.js";
import { wire } from "../../src/doors/wire.js";

const require = editorRequire({}, import.meta.url);
const { indexDoor } = require("../../src/extension/editor-index.js");

function served() {
  const posted = [];
  const onRequest = (asked, answer) => {
    let body = "";
    asked.on("data", (part) => {
      body += part;
    });
    asked.on("end", () => {
      answer.setHeader("content-type", "application/json");
      if (asked.method === "GET" && asked.url === "/v1/values/index/names")
        return answer.end(JSON.stringify({ value: [{ name: "work/open-tasks" }] }));
      if (asked.method === "POST" && asked.url === "/v1/actions/work/pull") {
        posted.push(JSON.parse(body));
        return answer.end(JSON.stringify({ state: "done" }));
      }
      answer.statusCode = 404;
      answer.end("{}");
    });
  };
  return new Promise((done) => {
    const server = wire().listen(0, onRequest, () => done({ server, posted }));
  });
}

test("the index door reads a value and posts an action at the port the standing file names", async () => {
  const files = disk();
  const root = files.tempDir("level0-index-");
  const { server, posted } = await served();
  try {
    files.makeDir(join(root, ".se", ".runtime"));
    files.write(
      join(root, ".se", ".runtime", "index.json"),
      JSON.stringify({ port: 1, v1: server.address().port }),
    );
    const door = indexDoor(root);
    assert.deepEqual(await door.values("index/names"), [{ name: "work/open-tasks" }]);
    assert.deepEqual(await door.calls("work/pull", { n: 1 }), { state: "done" });
    assert.deepEqual(posted, [{ n: 1 }]);
    assert.equal(await door.values("index/missing"), undefined);
  } finally {
    server.close();
  }
});

test("the index door answers nothing where no index stands", async () => {
  const root = disk().tempDir("level0-index-");
  const door = indexDoor(root);
  assert.equal(await door.values("index/names"), undefined);
  assert.equal(await door.calls("work/pull", {}), undefined);
});
