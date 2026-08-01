// The boot preflight's own guards.
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the only
// unit that reaches a second core, so themes get their own file. See
// guidance/software.md.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const PREFLIGHT = fileURLToPath(new URL("../engine/bin/preflight.ts", import.meta.url));

/** A root holding nothing but a shell whose single webview script is `script`. */
function rootWithShell(script: string): string {
  const root = mkdtempSync(join(tmpdir(), "se-preflight-"));
  const dir = join(root, "product", "deliverable", "vscode");
  mkdirSync(dir, { recursive: true });
  // The script lives inside a template literal, exactly as the real shell
  // builds its webviews — so the OUTER file parses whatever is in here.
  writeFileSync(join(dir, "extension.js"), "const html = `<script>" + script + "</script>`;\n", "utf8");
  return root;
}

/**
 * Run the preflight against a throwaway root and hand back everything it said.
 *
 * A SPAWN THAT NEVER RAN MUST NOT LOOK LIKE A CLEAN RUN. This failed once in a
 * full concurrent suite and passed alone, and empty output is exactly what
 * that looks like: the "is it flagged" assertion fails while the "is it clean"
 * one passes for the wrong reason. Under a loaded machine a spawn can come
 * back EAGAIN, so one retry is the remedy and anything else is reported with
 * the spawn's own error rather than as a puzzle.
 */
/**
 * Run the preflight against a throwaway root and hand back everything it said.
 *
 * SE_SELFTEST_SKIP IS CLEARED, and that is the whole reason this helper is
 * more than one line. The variable is a RECURSION guard: a boot walk inside
 * the suite would otherwise run the suite again. selftest.ts therefore sets it
 * for every test process, and preflight.ts exits at once when it sees it.
 *
 * So this test spawned a preflight that skipped every check and printed one
 * line. The sound case passed because that line mentions no webview, and the
 * broken case failed because nothing had been parsed — which is why it passed
 * alone and failed in the suite. The guard against a silently dead pane was
 * itself silently skipped, in the very run that gates boot.
 *
 * Nothing here boots a walk, so the guard does not apply; and the assertion
 * below makes it impossible to skip again without saying so.
 */
function preflightOutput(root: string): string {
  const env = { ...process.env };
  delete env.SE_SELFTEST_SKIP;
  const r = spawnSync(process.execPath, [PREFLIGHT, "--root", root], { encoding: "utf8", env });
  assert.equal(r.error, undefined, `the preflight could not be started: ${String(r.error)}`);
  const said = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  assert.doesNotMatch(said, /skipped/, "the preflight actually ran — a skipped one proves nothing");
  return said;
}

// Concurrent: every case builds its own root and touches no global.
describe("preflight", { concurrency: true }, () => {
  // `node --check` on extension.js sees a webview's script as TEXT, so a
  // syntax error in one shipped green: VS Code loaded the extension, the pane
  // rendered, the script threw on parse, and the pane was silently dead. A
  // guard that only ever passes would prove nothing, so the broken case is
  // pinned beside the sound one.
  test("a syntax error INSIDE a webview script is caught, though the file itself parses", () => {
    const sound = preflightOutput(rootWithShell("const a = 1;"));
    assert.ok(!sound.includes("webview script"), "a sound script is not flagged");

    const broken = preflightOutput(rootWithShell("const a = ;"));
    assert.match(broken, /webview script #1/, "a broken script IS flagged, with its number");
    assert.match(broken, /does not parse/);
  });

  // Host-side interpolation is not part of the script's grammar. Blanking it
  // is what lets the body be judged at all; without it every real webview
  // would report a false failure.
  test("host interpolation is blanked rather than parsed", () => {
    const out = preflightOutput(rootWithShell("const a = ${JSON.stringify(x)}; const b = a;"));
    assert.ok(!out.includes("webview script"), "an interpolated script is not a syntax error");
  });
});
