// THE COMPONENT LIBRARY IS SERVED BY THE ENGINE. Not bundled by a build step,
// not fetched from a CDN. The mirror is a page we serve ourselves rather than
// a webview asset, so the library is one script tag and one route — and the
// project's no-build-step rule survives.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { startMirror } from "../engine/mirror.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const engineDir = join(fileURLToPath(new URL(".", import.meta.url)), "..", "engine");
const renderSrc = (): string => readFileSync(join(engineDir, "render.ts"), "utf8");

// A port of its own, so this never fights a live mirror on 7333.
const PORT = 7519;

test("the mirror asks for the component library and serves it", async () => {
  const root = freshRoot();
  const server = startMirror({ session: new Session(root), root, port: PORT, log: new CallLog(root), mode: "manual" });
  try {
    const page = await (await fetch("http://localhost:" + PORT + "/")).text();
    assert.match(page, /<script type="module" src="\/vendor\/vscode-elements\.js">/, "the page must ask for the library");

    const res = await fetch("http://localhost:" + PORT + "/vendor/vscode-elements.js");
    assert.equal(res.status, 200, "the library route must serve");
    const body = await res.text();
    // THE BUNDLE COMES FROM THE ENGINE'S OWN DEPENDENCIES. A test root has no
    // node_modules at all, and neither does a project the engine was not
    // installed into. Resolving against the served tree returned a confident
    // 404 for both.
    assert.ok(body.includes("vscode-collapsible"), "the bundle must define the components");
  } finally {
    server.close();
  }
});

test("the reader's check is read from the session, not from one state's pull", () => {
  // A doc named by a CONDITION is not always in that state's pulled list.
  // Looking it up only there left the box permanently unchecked, however
  // often it was clicked, while the server recorded every click
  // (found live 2026-07-30).
  const src = renderSrc();
  assert.match(src, /checkedDocs: m\.session\.humanCheckedPaths\(\)/, "the server has to send the session's checked list");
  assert.match(src, /D\.checkedDocs/, "and the page has to read it");
});

test("checking a document does not rebuild the pane the reader is in", () => {
  // One surface never resets another. The old handler forced a full refresh
  // on every check, which threw the reader out of whatever they had open.
  const src = renderSrc();
  const handler = src.slice(src.indexOf('closest(".docheck")'));
  const end = handler.indexOf('closest(".jump")');
  assert.ok(end > 0, "the docheck handler was not found where expected");
  assert.doesNotMatch(handler.slice(0, end), /refresh\(\)/, "checking a doc must not force a refresh");
});

test("a locked edge is guarded in the handler, not only by the component", () => {
  // A native button swallows its own click when disabled. A component decides
  // that for itself, so the walk refuses a locked edge explicitly rather than
  // trusting the library's pointer-event behaviour.
  assert.match(renderSrc(), /if \(go\.hasAttribute\("disabled"\)\) return;/, "the go handler must refuse a disabled edge");
});
