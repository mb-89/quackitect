// THE PAGE SCRIPT MUST PARSE. A stripped escape or a stray backtick kills
// the WHOLE inline script at parse time — every handler, the live refresh
// and the theme application die together, and no server-side assertion
// sees it. This file does: it extracts every classic <script> block the
// mirror emits and parses each one.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

function scriptsOf(html: string): string[] {
  const out: string[] = [];
  const re = /<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g;
  for (let m = re.exec(html); m !== null; m = re.exec(html)) {
    if (m[1].trim() !== "") out.push(m[1]);
  }
  return out;
}

test("every inline script the mirror emits PARSES", () => {
  const root = freshRoot();
  const pages = [
    renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" }),
    renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" }, "machine"),
    renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" }, "details"),
  ];
  let checked = 0;
  for (const html of pages) {
    for (const script of scriptsOf(html)) {
      checked++;
      assert.doesNotThrow(() => new Function(script), `a script block failed to parse:\n${script.slice(0, 400)}`);
    }
  }
  assert.ok(checked > 0, "at least one script block was found and parsed");
});
