// A BOUND WORKTREE MUST NOT SWALLOW THE OWNER'S DECLARED ROOTS.
//
// Found live 2026-08-01, and it cost the owner two messages. Inside an
// expedition's worktree, se_file_read resolved "@ai/..." perfectly while
// se_file_glob and se_file_search refused the SAME name with SE-C-127,
// "none declared" — and handed over a remedy telling the caller to declare a
// root that was already declared. Following that remedy would have
// overwritten a correct file with a guess.
//
// The cause was not the roots registry. laneRoot() had always routed an
// "@" address to the project root, where .se/roots.json lives. The two tools
// simply never SHOWED it the address: they called rootOf() with no argument,
// so the worktree answered, and a worktree has no .se/roots.json.
//
// So there are two things to hold: the routing rule, and the wiring that
// feeds it. The wiring is the half that broke.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mainMachinePath, Session } from "../engine/session.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

describe("declared roots", { concurrency: true }, () => {
  // THE ROUTING RULE. An "@" address is session state exactly like .se/, so it
  // is answered by the PROJECT root however deep in a worktree the walk is.
  test("an @ address routes to the project root, whatever else is bound", () => {
    const s = new Session(REPO_ROOT, mainMachinePath(REPO_ROOT));
    assert.equal(s.laneRoot("@ai"), s.root, "a bare root name");
    assert.equal(s.laneRoot("@ai/sya_kb/digest"), s.root, "a path inside one");
    assert.equal(s.laneRoot("@ai/**/*.md"), s.root, "A GLOB — the case that broke");
  });

  // ...and the other side of it, so a fix here never quietly redirects
  // ordinary work out of the worktree it belongs in.
  test("everything else still answers from the work root", () => {
    const s = new Session(REPO_ROOT, mainMachinePath(REPO_ROOT));
    assert.equal(s.laneRoot(), s.workRoot(), "no address at all");
    assert.equal(s.laneRoot("project/guidance/ux.md"), s.workRoot(), "an ordinary path");
    assert.equal(s.laneRoot("project/**/*.md"), s.workRoot(), "an ordinary glob");
  });

  // THE WIRING. The routing rule is worthless if the tool never shows it the
  // address, which is exactly what happened. Every file tool that accepts a
  // root selector must pass THAT SELECTOR to rootOf, never nothing.
  test("the glob and search handlers pass their selector to the root chooser", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../engine/tools.ts", import.meta.url), "utf8");
    const globLine = src.split("\n").find((l) => l.includes("fileGlob(rootOf("));
    const searchLine = src.split("\n").find((l) => l.includes("search(rootOf("));
    assert.ok(globLine !== undefined && !globLine.includes("rootOf()"), "se_file_glob must route on its glob");
    assert.ok(searchLine !== undefined && !searchLine.includes("rootOf()"), "se_file_search must route on its path scope");
  });

  // The refusal that misled the owner. It should never claim nothing is
  // declared when something is.
  test("a root that IS declared is never reported as undeclared", async () => {
    const { declaredRoots } = await import("../engine/paths.ts");
    const root = mkdtempSync(join(tmpdir(), "se-roots-"));
    mkdirSync(join(root, ".se"), { recursive: true });
    writeFileSync(join(root, ".se", "roots.json"), JSON.stringify({ books: "C:\\\\books" }), "utf8");
    assert.deepEqual(Object.keys(declaredRoots(root)), ["books"]);
    // And a root with no declaration at all answers empty rather than throwing,
    // so the caller can say "none declared" honestly.
    const bare = mkdtempSync(join(tmpdir(), "se-roots-bare-"));
    assert.deepEqual(declaredRoots(bare), {});
  });
});
