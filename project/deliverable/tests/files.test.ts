// The file lane's laws, each tested against the incident that ruled it.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import {
  fileDelete,
  fileGlob,
  fileList,
  fileRead,
  fileReplace,
  fileWrite,
  globToRegExp,
  IMAGE_BUDGET,
  READ_BUDGET,
} from "../engine/files.ts";
import { filePatch } from "../engine/files-patch.ts";
import { contentHash } from "../engine/hash.ts";
import { doorStats } from "../engine/notes.ts";
import { runToCompletion } from "../engine/run.ts";
import { search } from "../engine/search.ts";

function fresh(): string {
  return mkdtempSync(join(tmpdir(), "se-v3-"));
}

// A FIGURE IS AUTHORED IN TEXT (ux.md), because a machine must be able to read
// it, and markdown is the truth (software.md). A PNG was copied into the repo
// on 2026-07-29 and had to be taken straight out again. Both rules existed;
// neither was applied. ux.md's own closing rule says a prose rule that keeps
// breaking wants a LINT or a TEST rather than another sentence — so here it is.
// The owner's reason, in their words: if it is not human readable it is not a
// first-class artifact.
test("no binary file lives under project/ — an unreadable figure is not an artifact", () => {
  // THE SCRATCHPAD IS EXEMPT (owner ruling 2026-08-12): it is the agent's
  // workbench and may hold whatever the work needs — a standards PDF, a heap
  // profile, a rendered probe. It is gitignored, and package.ts already keeps
  // it out of the shipped archive, so nothing here reaches the PRODUCT.
  //
  // The rule was always about what the product OWNS. Reaching into the
  // workbench made it refuse inputs, which is not what it is for.
  const skip = new Set(["node_modules", ".git", ".obsidian", "scratchpad"]);
  const offenders: string[] = [];
  const walk = (dir: URL, rel: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      if (e.isDirectory()) walk(new URL(`${e.name}/`, dir), `${rel}${e.name}/`);
      else if (readFileSync(new URL(e.name, dir)).includes(0)) offenders.push(rel + e.name);
    }
  };
  walk(new URL("../../", import.meta.url), "project/");
  assert.deepEqual(offenders, [], "author figures as inline SVG, Mermaid or ASCII; a binary is input, never evidence");
});

// THE DOOR ONLY HELPS WHAT WALKS THROUGH IT (owner question, 2026-08-09:
// "what do you need to search for so that you know that you found every call?").
//
// The answer is this string, and the reason it needs a test is that four
// separate caches were built before anyone counted. Together they cost 39,857
// stats and left the three biggest readers untouched — because those readers
// called readFileSync themselves and no cache stood in their way. A door that
// can be walked around is a suggestion.
//
// A RATCHET, NOT A BAN. Ninety-nine of these are legitimate: JSON config, a
// canvas, a git object, a file read once at boot. Banning them would be a lie
// nobody could keep. What must never happen is the number going UP without
// somebody deciding it should — so it may fall freely and cannot rise.
//
// bin/ IS EXEMPT. A one-shot script reads its input and exits; there is no
// second ask for a door to save.
test("no new file read bypasses the door — the count may fall, never rise", () => {
  // 100 since 2026-08-10: the vault's watcher reads .quack-watch.json direct —
  // JSON config, not a note, so no door saves a shared parse.
  // 101 since 2026-08-12: claims.ts reads the machine-id file — one tiny
  // id outside the note system, minted once.
  // 102 since 2026-08-13: help.ts reads the demand log (.se/help-demand.jsonl)
  // direct — a JSONL log outside the note system, same shape as the two above.
  // 103 since 2026-08-14: mode.ts reads .se/mode.json — the run mode, one tiny
  // JSON object of session state, read at start. Same shape as the three
  // above, and no door would ever hold it.
  // 104 since 2026-08-14: version.ts reads the package manifest ONCE at import,
  // for the product's own version. It was hardcoded as "3.0.0-bootstrap" in
  // four places and stopped following the product at the 4.0.0 release, so
  // every logged call across v4 carried a version the product had left behind.
  // There is no node here to route through a door — only the manifest, which
  // the packaging script already reads for the same fact.
  // 105 since 2026-08-15: testreporters.ts reads .se/test-timings.jsonl to
  // count what a run recorded. A JSONL append log outside the note system,
  // read once per run to answer one question — did the bookkeeping land. The
  // read is the POINT: it is what makes a silent instrument failure visible,
  // and routing it through a note door would share a parse with nobody.
  // 106: mirror.ts serves the vendored graph renderer at
  // /vendor/cytoscape.min.js. A one-shot read of a static asset outside the
  // note system, the same shape as every increment above it — and the read
  // exists because the alternative was fetching it from unpkg on every open.
  const CEILING = 106;
  let found = 0;
  const offenders: string[] = [];
  const walk = (dir: URL, rel: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name !== "bin") walk(new URL(`${e.name}/`, dir), `${rel}${e.name}/`);
        continue;
      }
      // notes.ts IS the door. Its own read is the one that is supposed to be there.
      if (!e.name.endsWith(".ts") || e.name === "notes.ts") continue;
      const n = (readFileSync(new URL(e.name, dir), "utf8").match(/readFileSync\(/g) ?? []).length;
      if (n > 0) offenders.push(`${rel}${e.name} (${n})`);
      found += n;
    }
  };
  walk(new URL("../engine/", import.meta.url), "engine/");
  assert.ok(
    found <= CEILING,
    `${found} direct file reads, up from ${CEILING}. Read notes through readNode/noteOf/nodeLines instead — ` +
      `they share one read and one parse with every other reader. If the new read is genuinely one-shot, ` +
      `lower nothing and raise CEILING with a reason.\n${offenders.join("\n")}`,
  );
  assert.ok(found >= CEILING - 20, `${found} reads against a ceiling of ${CEILING} — lower the ceiling, the ratchet has slack`);
});

// THE WRITES GET THE SAME RATCHET (2026-08-10). A direct writeFileSync may
// land on a file the door is holding, and an untold write is served stale
// for the rest of a pass. writeNode writes AND tells; converting the rest
// is gradual, and this holds the line meanwhile.
//
// bin/ IS EXEMPT for the read ratchet's reason. notes.ts is exempt because
// writeNode's own write IS the door.
test("no new file write bypasses the door — the count may fall, never rise", () => {
  // 38 since 2026-08-12: claims.ts mints the machine-id file, and the pin
  // scaffolds seeded placeholder drawings — generated files the door never
  // holds, the same class as the pin's own write.
  //
  // 39 since 2026-08-14: bound.ts spills an oversized answer to
  // `.se/answers/<tool>.json`. That is SESSION state — machine-local,
  // gitignored, overwritten by the next big answer and read back only by the
  // cursor on the answer that wrote it. The door holds corpus, so this is a
  // file it can never hold.
  //
  // 40 since 2026-08-14: mode.ts writes `.se/mode.json`, the run mode the
  // person chose. Session state again — host-local, uncommitted, one small
  // object, and deliberately NOT corpus: what suits one machine's cores is not
  // a fact about the product.
  const CEILING = 40;
  let found = 0;
  const offenders: string[] = [];
  const walk = (dir: URL, rel: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name !== "bin") walk(new URL(`${e.name}/`, dir), `${rel}${e.name}/`);
        continue;
      }
      if (!e.name.endsWith(".ts") || e.name === "notes.ts") continue;
      const n = (readFileSync(new URL(e.name, dir), "utf8").match(/writeFileSync\(/g) ?? []).length;
      if (n > 0) offenders.push(`${rel}${e.name} (${n})`);
      found += n;
    }
  };
  walk(new URL("../engine/", import.meta.url), "engine/");
  assert.ok(
    found <= CEILING,
    `${found} direct file writes, up from ${CEILING}. Write through writeNode — it writes and tells the door — ` +
      `or, for a file the door can never hold, raise CEILING with a reason.\n${offenders.join("\n")}`,
  );
  assert.ok(found >= CEILING - 20, `${found} writes against a ceiling of ${CEILING} — lower the ceiling, the ratchet has slack`);
});

// AN EMPTY RESULT AND AN UNREADABLE FILE MUST NEVER LOOK ALIKE (found live
// 2026-07-29). engine/records.ts carried ONE raw NUL byte, used as a
// cache-key separator. ripgrep called the whole file binary and said so on a
// line the parser did not understand, so it was dropped and every search over
// that file returned a confident "no matches".
//
// The file was invisible to the lane for as long as it had existed, and
// nothing ever announced it. The searcher was reasoning from a hole.
test("a file too binary to search is REPORTED, never silently empty", () => {
  const root = fresh();
  writeFileSync(join(root, "plain.ts"), "const marker = 1;\n");
  // The same shape as the real defect: readable source with one NUL in it.
  writeFileSync(join(root, "withnul.ts"), "const marker = 2;\nconst k = `aNULb`;\n".replace("NUL", String.fromCharCode(0)));
  const r = search(root, "marker");
  assert.ok(
    r.matches.some((m) => m.path === "plain.ts"),
    "the readable file still matches",
  );
  // Either ripgrep read it, or it said it could not. Silence is the bug.
  const found = r.matches.some((m) => m.path === "withnul.ts");
  const announced = (r.unreadable ?? []).includes("withnul.ts");
  assert.ok(found || announced, "a file the search cannot read is named in unreadable");
  rmSync(root, { recursive: true, force: true });
});

// CORRECT WHAT IS MECHANICAL, ANNOUNCE WHAT YOU CORRECTED, REFUSE ONLY THE
// AMBIGUOUS (owner ruling 2026-08-02). The walking test above catches a raw
// NUL after it has landed. These catch it at the write, which is the last
// moment it is still cheap.
//
// It has been written twice by two authors, both times as a hash separator:
// records.ts in 2026-07-29, discipline.ts in a patch that arrived today. A
// third time is a matter of when, so the guard sits on every door that
// writes bytes rather than on the one that happened to be used.
//
// The named per-file list that used to stand here is gone. A new engine file
// joined it only by an edit nobody remembers to make, and the walking test
// already covers every file under project/.
test("a raw NUL written into code becomes the escape, and the write SAYS so", () => {
  const root = fresh();
  const r = fileWrite(root, "engine/x.ts", `const sep = "${String.fromCharCode(0)}";\n`, null);
  assert.match(String(r.corrected), /unsearchable/, "a silent correction teaches nothing");
  const disk = readFileSync(join(root, "engine", "x.ts"), "utf8");
  assert.equal(disk.includes(String.fromCharCode(0)), false, "no raw byte survives the write");
  assert.ok(disk.includes("\\0"), "and the escape means exactly what the byte meant");
  rmSync(root, { recursive: true, force: true });
});

test("a raw NUL in prose REFUSES — there the intent is not knowable", () => {
  const root = fresh();
  assert.throws(
    () => fileWrite(root, "notes.md", `a${String.fromCharCode(0)}b`, null),
    (e: unknown) => e instanceof Rejection,
  );
  assert.deepEqual(readdirSync(root), [], "a refused write leaves the tree untouched");
  rmSync(root, { recursive: true, force: true });
});

test("the patch door closes the same way, and names it on the result", () => {
  const root = fresh();
  fileWrite(root, "engine/y.ts", 'const sep = "HERE";\n', null);
  const r = filePatch(root, [{ path: "engine/y.ts", old_string: "HERE", new_string: String.fromCharCode(0) }]);
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("engine/y.ts")),
    "the correction rides the result",
  );
  assert.equal(readFileSync(join(root, "engine", "y.ts"), "utf8").includes(String.fromCharCode(0)), false);
  rmSync(root, { recursive: true, force: true });
});

// SEARCH AND REPLACE ACROSS FILES (owner, 2026-08-02). The per-file regex op
// is the scalpel; this is the sweep. What makes a sweep safe to offer is the
// REPORT rather than a cleverer pattern: a wide edit whose result is only a
// number is the one nobody can check.
test("a wide replace sweeps every file the glob reaches, and names every place", () => {
  const root = fresh();
  fileWrite(root, "a/one.ts", 'const p = "old/path";\nconst q = 1;\n', null);
  fileWrite(root, "a/b/two.ts", 'import x from "old/path";\n', null);
  fileWrite(root, "a/prose.md", "old/path is prose here\n", null);
  const r = fileReplace(root, "**/*.ts", "old/path", "new/path");
  assert.equal(r.places_total, 2, "both code hits");
  assert.equal(r.changed.length, 2);
  const one = r.places.find((p) => p.path.endsWith("one.ts"));
  assert.ok(one !== undefined, "every place is reported, not just a count");
  assert.equal(one.line, 1, "a place names the line a reader can open");
  assert.match(one.before, /old\/path/, "what stood there");
  assert.match(one.after, /new\/path/, "and what stands there now");
  assert.ok(readFileSync(join(root, "a", "prose.md"), "utf8").includes("old/path"), "outside the glob is untouched");
  rmSync(root, { recursive: true, force: true });
});

test("a pattern that matches nothing REFUSES — a sweep that hit nothing is not a success", () => {
  const root = fresh();
  fileWrite(root, "a/one.ts", "const q = 1;\n", null);
  assert.throws(
    () => fileReplace(root, "**/*.ts", "nowhere", "x"),
    (e: unknown) => e instanceof Rejection,
  );
  rmSync(root, { recursive: true, force: true });
});

test("expect_count guards a sweep whose size you already know, and writes nothing when it is wrong", () => {
  const root = fresh();
  fileWrite(root, "a/one.ts", 'const p = "old";\nconst r = "old";\n', null);
  assert.throws(
    () => fileReplace(root, "**/*.ts", "old", "new", { expect_count: 1 }),
    (e: unknown) => e instanceof Rejection,
  );
  assert.ok(readFileSync(join(root, "a", "one.ts"), "utf8").includes('"old"'), "a refused sweep leaves the tree untouched");
  rmSync(root, { recursive: true, force: true });
});

// The move sweep SKIPPED a file holding a NUL. Its references stayed
// dangling, and the report named neither the file nor the reason.
test("the move sweep repairs a NUL file instead of skipping it in silence", async () => {
  const { fileMove } = await import("../engine/move.ts");
  const root = fresh();
  fileWrite(root, "project/guidance/old.md", "# old\n", null);
  fileWrite(root, "engine/keep.ts", "const a = 1;\n", null);
  writeFileSync(join(root, "engine", "ref.ts"), `const p = "project/guidance/old.md";\nconst sep = "${String.fromCharCode(0)}";\n`);
  const r = fileMove(root, "project/guidance/old.md", "project/guidance/new.md");
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("ref.ts")),
    "the repair is named",
  );
  const after = readFileSync(join(root, "engine", "ref.ts"), "utf8");
  assert.ok(after.includes("project/guidance/new.md"), "and the reference is rewritten, which the skip prevented");
  rmSync(root, { recursive: true, force: true });
});

// THE SERVER IS THE MIRROR (owner, 2026-07-29: "it takes forever to render,
// maybe that was because you were running something in the background"). It
// was. se_run used spawnSync, which holds Node's event loop for the WHOLE
// command, so every long run served nothing at all — no page, no feed, no
// click. A 30-second test run froze the reader's whole interface.
//
test("foreground run follows process completion", async () => {
  const root = fresh();
  const command = process.platform === "win32" ? "Write-Output complete" : "printf complete";
  const result = await runToCompletion(root, command);
  assert.equal(result.exit, 0);
  assert.equal(result.stdout.trim(), "complete");
  rmSync(root, { recursive: true, force: true });
});

test("read returns hash and numbered lines", () => {
  const root = fresh();
  writeFileSync(join(root, "a.md"), "one\ntwo\nthree\n");
  const r = fileRead(root, "a.md");
  assert.equal(r.total_lines, 4);
  assert.match(r.content, / {4}1\tone/);
  assert.equal(r.hash.length, 12);
});

test("oversize whole-file read is REFUSED with offset/limit remedy — never silently truncated (i8d law)", () => {
  const root = fresh();
  writeFileSync(join(root, "big.md"), "x".repeat(READ_BUDGET + 1));
  assert.throws(
    () => fileRead(root, "big.md"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-103" && e.remedy.args.offset === 1,
  );
  // and the range read works
  const r = fileRead(root, "big.md", { offset: 1, limit: 1 });
  assert.ok(r.content.includes("[line truncated"));
});

test("path escape is refused", () => {
  const root = fresh();
  assert.throws(
    () => fileRead(root, "../outside.txt"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-102",
  );
});

test("CAS: write demands the disk hash; null creates; create-over-existing refused", () => {
  const root = fresh();
  const w = fileWrite(root, "n.md", "hello", null);
  assert.equal(w.created, true);
  assert.throws(
    () => fileWrite(root, "n.md", "clobber", null),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-104",
  );
  assert.throws(
    () => fileWrite(root, "n.md", "clobber", "wronghash0000"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-104",
  );
  const r = fileRead(root, "n.md");
  const w2 = fileWrite(root, "n.md", "hello2", r.hash);
  assert.equal(w2.created, false);
});

test("patch: ambiguous or absent old_string refused, batch is atomic across files", () => {
  const root = fresh();
  writeFileSync(join(root, "p.md"), "aaa bbb aaa");
  writeFileSync(join(root, "q.md"), "ccc");
  assert.throws(
    () => filePatch(root, [{ path: "p.md", old_string: "aaa", new_string: "z" }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-105",
  );
  // atomicity: second op fails, first op must NOT have written
  assert.throws(() =>
    filePatch(root, [
      { path: "q.md", old_string: "ccc", new_string: "CCC" },
      { path: "p.md", old_string: "missing", new_string: "x" },
    ]),
  );
  assert.equal(readFileSync(join(root, "q.md"), "utf8"), "ccc");
  // replace_all and multi-file batch
  const ok = filePatch(root, [
    { path: "p.md", old_string: "aaa", new_string: "z", replace_all: true },
    { path: "q.md", old_string: "ccc", new_string: "CCC" },
  ]);
  assert.equal(ok.applied.length, 2);
  assert.equal(readFileSync(join(root, "p.md"), "utf8"), "z bbb z");
});

test("sequential ops on the same file within one batch compose", () => {
  const root = fresh();
  writeFileSync(join(root, "s.md"), "one two");
  filePatch(root, [
    { path: "s.md", old_string: "one", new_string: "1" },
    { path: "s.md", old_string: "two", new_string: "2" },
  ]);
  assert.equal(readFileSync(join(root, "s.md"), "utf8"), "1 2");
});

test("delete is hash-guarded", () => {
  const root = fresh();
  writeFileSync(join(root, "d.md"), "bye");
  assert.throws(
    () => fileDelete(root, "d.md", "nope00000000"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-104",
  );
  const r = fileRead(root, "d.md");
  // AN EMPTY LIST, NEVER SILENCE (req-a-deletion-names-what-points-at-the-node).
  // A file with no `id:` is not a trace node, so nothing can point at it — and
  // the answer still carries the list, so "nothing cites this" and "nobody
  // asked" cannot look alike.
  assert.deepEqual(fileDelete(root, "d.md", r.hash), { deleted: "d.md", cited_by: [] });
});

test("glob matches ** and excludes junk dirs", () => {
  const root = fresh();
  writeFileSync(join(root, "top.test.ts"), "");
  fileWrite(root, "deep/nested/x.test.ts", "", null);
  fileWrite(root, "node_modules/hidden.test.ts", "", null);
  const g = fileGlob(root, "**/*.test.ts");
  assert.deepEqual(g.files, ["deep/nested/x.test.ts", "top.test.ts"]);
  assert.ok(globToRegExp("*.md").test("a.md"));
  assert.ok(!globToRegExp("*.md").test("d/a.md"));
});

test("search finds matches with locations (ripgrep — hard dependency, no fallback)", () => {
  const root = fresh();
  writeFileSync(join(root, "s1.md"), "alpha\nbeta needle gamma\n");
  writeFileSync(join(root, "s2.md"), "no match here\n");
  const r = search(root, "needle");
  assert.equal(r.engine, "ripgrep");
  assert.equal(r.total, 1);
  assert.equal(r.matches[0].path, "s1.md");
  assert.equal(r.matches[0].line, 2);
  // A SINGLE-FILE scope finds its matches too (rg omits the filename
  // there — the parser starved and every match vanished).
  const scoped = search(root, "needle", { path: "s1.md" });
  assert.equal(scoped.total, 1);
  assert.equal(scoped.matches[0].line, 2);
});

test("ref search runs through git grep against a committed state (v2 parity)", () => {
  const root = fresh();
  const git = (...a: string[]) => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a[0]}: ${r.stderr}`);
  };
  git("init", "-q", "-b", "main");
  writeFileSync(join(root, "h.md"), "the committed needle\n");
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "c1");
  writeFileSync(join(root, "h.md"), "needle removed from the tree\n");
  const atRef = search(root, "committed needle", { ref: "main" });
  assert.equal(atRef.engine, "git-grep");
  assert.equal(atRef.total, 1);
  assert.equal(atRef.matches[0].path, "h.md");
  const inTree = search(root, "committed needle");
  assert.equal(inTree.total, 0);
});

test("ref READS reach committed states too: git show + ls-tree through the lane", () => {
  const root = fresh();
  const git = (...a: string[]) => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a[0]}: ${r.stderr}`);
  };
  git("init", "-q", "-b", "main");
  writeFileSync(join(root, "doc.md"), "the committed text\n");
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "c1");
  // The tree loses the file — the ref still serves it.
  rmSync(join(root, "doc.md"));
  const r = fileRead(root, "doc.md", { ref: "main" });
  assert.match(r.content, /the committed text/);
  assert.equal(r.ref, "main");
  const g = fileGlob(root, "**/*.md", { ref: "main" });
  assert.deepEqual(g.files, ["doc.md"]);
  assert.equal(g.ref, "main");
  // A missing path names the spec; an unknown ref names the ref.
  assert.throws(
    () => fileRead(root, "nope.md", { ref: "main" }),
    (e) => (e as Rejection).clause === "SE-C-102",
  );
  assert.throws(
    () => fileGlob(root, "**", { ref: "nope" }),
    (e) => (e as Rejection).clause === "SE-C-102",
  );
});

test("move fixes every reference form: root-relative, vault-relative, wiki link", async () => {
  const { fileMove } = await import("../engine/move.ts");
  const root = fresh();
  fileWrite(root, "project/guidance/old.md", "# Doc", null);
  fileWrite(root, "project/notes/uses.md", "See project/guidance/old.md and [[guidance/old|the doc]].", null);
  fileWrite(
    root,
    "project/m/x.canvas",
    '{"nodes":[{"id":"a","type":"file","file":"guidance/old.md","x":0,"y":0,"width":1,"height":1}]}',
    null,
  );
  const r = fileMove(root, "project/guidance/old.md", "project/guidance/new/doc.md");
  assert.equal(r.rewritten.length, 2);
  assert.ok(readFileSync(join(root, "project/notes/uses.md"), "utf8").includes("project/guidance/new/doc.md"));
  assert.ok(readFileSync(join(root, "project/notes/uses.md"), "utf8").includes("[[guidance/new/doc|the doc]]"));
  assert.ok(readFileSync(join(root, "project/m/x.canvas"), "utf8").includes("guidance/new/doc.md"));
  // no silent overwrite
  fileWrite(root, "project/guidance/other.md", "x", null);
  assert.throws(
    () => fileMove(root, "project/guidance/other.md", "project/guidance/new/doc.md"),
    (e) => (e as Rejection).clause === "SE-C-104",
  );
});

// The mover was a markdown tool wearing a general file tool's name. Moving
// brand.json and palette.css out of the project root rewrote NOTHING, answered
// `rewritten: []`, and reported success while nine references dangled across
// four files. Trusted, it would have shipped a product with no name and no
// colours. Source is in the whitelist now, and what the whitelist cannot reach
// is reported rather than passed over.
test("move rewrites source references and reports the ones it could not", async () => {
  const { fileMove } = await import("../engine/move.ts");
  const root = fresh();
  fileWrite(root, "brand.json", '{"name":"quackitect"}', null);
  fileWrite(root, "engine/brand.ts", 'const p = join(root, "brand.json");', null);
  fileWrite(root, "RUNME.ps1", '$b = Join-Path $root "brand.json"', null);
  fileWrite(root, "notes/uses.md", "see brand.json", null);
  // Not in the whitelist — the tool cannot understand every language, so this
  // one has to come back as work the caller still owes.
  fileWrite(root, "deploy/stack.yml", "  config: brand.json", null);

  const r = fileMove(root, "brand.json", "project/deliverable/brand/brand.json");

  const paths = r.rewritten.map((x) => x.path);
  assert.ok(paths.includes("engine/brand.ts"), ".ts is rewritten");
  assert.ok(paths.includes("RUNME.ps1"), ".ps1 is rewritten");
  assert.ok(paths.includes("notes/uses.md"), "prose still works");
  assert.ok(readFileSync(join(root, "engine/brand.ts"), "utf8").includes('"project/deliverable/brand/brand.json"'));

  // THE TRAP: the new path CONTAINS the old one, so a naive residual scan
  // would report every reference it had just fixed.
  assert.deepEqual(
    r.unrewritten.map((u) => u.path),
    ["deploy/stack.yml"],
    "only the unreachable format is owed",
  );
  assert.equal(r.unrewritten_total, 1);
  assert.equal(r.unrewritten[0].line, 1);
});

// Source takes the root-relative form ONLY. The vault-relative and wiki forms
// are markdown conventions, and a bare substring of one would maul unrelated
// code — here, an identifier that merely ends with the moved file's name.
test("move leaves markdown reference forms out of source, and spares longer names", async () => {
  const { fileMove } = await import("../engine/move.ts");
  const root = fresh();
  fileWrite(root, "project/guidance/old.md", "# Doc", null);
  fileWrite(root, "engine/x.ts", 'const a = "project/guidance/old.md";\nconst b = "guidance/old.md";\nconst c = "my-old.md";', null);

  const r = fileMove(root, "project/guidance/old.md", "project/guidance/new.md");
  const after = readFileSync(join(root, "engine/x.ts"), "utf8");

  assert.ok(after.includes('"project/guidance/new.md"'), "root-relative is rewritten");
  assert.ok(after.includes('"guidance/old.md"'), "vault-relative is left alone in source");
  assert.ok(after.includes('"my-old.md"'), "a longer name is not a reference");
  // The sweep is root-relative too, so the surviving vault-relative mention is
  // NOT reported. That is the deliberate edge of the guard, pinned here so a
  // later reader meets it as a choice rather than as a surprise.
  assert.deepEqual(r.unrewritten, [], "nothing root-relative survives");
});

// A SKETCH IS A CONTRACT (ux.md) and the reader could not open one. It read
// every file as utf8, so the owner had to describe a drawing the agent was
// holding the path to. Nothing ever ruled the reader text-only; it was only
// ever written that way (owner, 2026-07-29).
const PNG_1X1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

test("an image reads back as the PICTURE, not as lines", () => {
  const root = fresh();
  writeFileSync(join(root, "sketch.png"), PNG_1X1);
  const r = fileRead(root, "sketch.png");
  assert.equal(r.media_type, "image/png");
  assert.equal(r.bytes, PNG_1X1.length);
  assert.equal(r.total_lines, undefined, "an image has no lines to count");
  const blocks = r._attachments ?? [];
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "image");
  assert.equal(blocks[0].mimeType, "image/png");
  // The bytes travel intact — a corrupted picture is worse than no picture.
  assert.ok(Buffer.from(blocks[0].data, "base64").equals(PNG_1X1));
  rmSync(root, { recursive: true, force: true });
});

test("an image carries a hash, so it can satisfy a read condition like any doc", () => {
  const root = fresh();
  writeFileSync(join(root, "a.png"), PNG_1X1);
  writeFileSync(join(root, "b.png"), PNG_1X1);
  assert.equal(fileRead(root, "a.png").hash, contentHash(PNG_1X1));
  assert.equal(fileRead(root, "a.png").hash, fileRead(root, "b.png").hash);
  rmSync(root, { recursive: true, force: true });
});

test("an oversize image is refused, never silently downscaled", () => {
  const root = fresh();
  writeFileSync(join(root, "huge.png"), Buffer.alloc(IMAGE_BUDGET + 1));
  assert.throws(
    () => fileRead(root, "huge.png"),
    (e) => (e as Rejection).clause === "SE-C-103",
  );
  rmSync(root, { recursive: true, force: true });
});

test("a binary that is not an image is refused with its size and hash", () => {
  const root = fresh();
  const blob = Buffer.from([0x00, 0x01, 0x02, 0x00, 0x03]);
  writeFileSync(join(root, "thing.bin"), blob);
  assert.throws(
    () => fileRead(root, "thing.bin"),
    (e) => {
      const r = e as Rejection;
      return r.clause === "SE-C-126" && r.got.includes(String(blob.length)) && r.got.includes(contentHash(blob));
    },
  );
  rmSync(root, { recursive: true, force: true });
});

// The widening must not move a single existing hash — every read-proof in the
// system is one of these strings.
// DECLARED, NEVER ARBITRARY (owner ruling 2026-07-29, porting v2's
// req-search-roots). The fence was never meant to stop the owner pointing the
// lane at a folder — only to stop the AGENT widening its own reach. A root the
// owner declares is as legitimate a read surface as the project itself.
test("a declared root serves reads; an undeclared one refuses with the vocabulary", () => {
  const root = fresh();
  const outside = fresh(); // a folder that is emphatically NOT the project
  writeFileSync(join(outside, "sketch.md"), "# from beyond the fence\n");
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "roots.json"), JSON.stringify({ desk: outside }));

  assert.ok(fileRead(root, "@desk/sketch.md").content.includes("from beyond the fence"));

  // An undeclared name refuses, and the refusal NAMES what is on offer.
  assert.throws(
    () => fileRead(root, "@nope/x.md"),
    (e) => (e as Rejection).clause === "SE-C-127" && (e as Rejection).expected.includes("desk"),
  );
  // No climbing out of a declared root.
  assert.throws(
    () => fileRead(root, "@desk/../beyond.md"),
    (e) => (e as Rejection).clause === "SE-C-102",
  );
  // A declared root is a READ surface. Writing to one is refused, and never
  // silently creates a literal "@desk" folder inside the project.
  assert.throws(
    () => fileWrite(root, "@desk/new.md", "x", null),
    (e) => (e as Rejection).clause === "SE-C-102",
  );
  assert.equal(existsSync(join(root, "@desk")), false);

  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

// A DECLARATION THAT CANNOT BE READ MUST NEVER READ AS "NONE DECLARED" (found
// live the day this landed). PowerShell wrote roots.json with a UTF-8 BOM,
// JSON.parse refused it, and a swallowing catch reported the owner's own root
// as undeclared. Two failures in one: the BOM, and the silence about it.
// A ROOT YOU CANNOT BROWSE IS HALF A FEATURE (owner, 2026-07-29). Reading by
// exact path is useless for a folder you are exploring, so list, glob and
// search all reach a declared root — and every one of them reports hits in the
// SAME "@name/rel" address the reader accepts back.
test("a declared root can be browsed: list, glob and search all reach it", () => {
  const root = fresh();
  const outside = fresh();
  mkdirSync(join(outside, "docs"), { recursive: true });
  writeFileSync(join(outside, "docs", "a.md"), "# alpha\nneedle here\n");
  writeFileSync(join(outside, "b.txt"), "nothing to find\n");
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "roots.json"), JSON.stringify({ ai: outside }));

  assert.ok(fileList(root, "@ai").entries.some((e) => e.name === "docs" && e.type === "dir"));
  assert.deepEqual(fileGlob(root, "@ai/**/*.md").files, ["@ai/docs/a.md"]);

  const found = search(root, "needle", { path: "@ai" });
  assert.equal(found.matches.length, 1);
  assert.equal(found.matches[0].path, "@ai/docs/a.md");

  // THE ROUND TRIP is the point: what search returns, read accepts.
  assert.ok(fileRead(root, found.matches[0].path).content.includes("needle"));

  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

test("roots.json survives a BOM, and a broken one refuses LOUDLY", () => {
  const root = fresh();
  const outside = fresh();
  writeFileSync(join(outside, "x.md"), "# reachable\n");
  mkdirSync(join(root, ".se"), { recursive: true });
  const cfg = join(root, ".se", "roots.json");

  // Notepad and PowerShell both write this byte order mark. It must not bite.
  writeFileSync(cfg, `﻿${JSON.stringify({ desk: outside })}`, "utf8");
  assert.ok(fileRead(root, "@desk/x.md").content.includes("reachable"));

  // Broken JSON is a refusal naming the file, NOT a quiet "none declared".
  writeFileSync(cfg, "{ this is not json", "utf8");
  assert.throws(
    () => fileRead(root, "@desk/x.md"),
    (e) => (e as Rejection).clause === "SE-C-127" && (e as Rejection).got.includes("roots.json"),
  );

  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

test("text reading is untouched: same lines, same hash, no attachment", () => {
  const root = fresh();
  writeFileSync(join(root, "doc.md"), "# Title\nbody\n");
  const r = fileRead(root, "doc.md");
  assert.equal(r.hash, contentHash("# Title\nbody\n"));
  assert.equal(r.total_lines, 3);
  assert.equal(r._attachments, undefined);
  assert.equal(r.media_type, undefined);
  assert.ok(r.content.includes("# Title"));
  rmSync(root, { recursive: true, force: true });
});

// A DOLLAR IN new_string IS DATA, NEVER AN INSTRUCTION (found 2026-08-07).
//
// String.replace reads dollar sequences in a STRING replacement as commands:
// $& is the match, $1 a group, and dollar-backtick is EVERYTHING BEFORE the
// match. se_file_patch passed new_string straight in, so a patch carrying a
// regex that ended in dollar-backtick spliced the whole preceding file into
// itself. Two engine files doubled in length, both patches reported success,
// and the only symptom was a parse error hundreds of lines away.
//
// replace_all never showed it: split().join() takes its argument literally.
test("a dollar sequence in new_string is written literally, not expanded", () => {
  const root = fresh();
  const D = String.fromCharCode(36);
  fileWrite(root, "engine/x.ts", "HEAD\nMARK\nTAIL\n", null);

  // dollar-backtick: the sequence that spliced a whole file into itself.
  filePatch(root, [{ path: "engine/x.ts", old_string: "MARK", new_string: `re("a"${D}\`)` }]);
  const once = readFileSync(join(root, "engine", "x.ts"), "utf8");
  assert.equal(once.includes("HEAD\nre"), true, "the replacement landed");
  assert.equal(once.split("HEAD").length - 1, 1, "and the text BEFORE the match was not spliced in");

  // $& and $1, the other two that silently rewrite what was asked for.
  fileWrite(root, "engine/y.ts", "HEAD\nMARK\nTAIL\n", null);
  filePatch(root, [{ path: "engine/y.ts", old_string: "MARK", new_string: `${D}& and ${D}1` }]);
  assert.match(readFileSync(join(root, "engine", "y.ts"), "utf8"), /^\$& and \$1$/m, "both survive as typed");
});

// THE TICK HOLE, measured 2026-08-10: Windows quantizes file times to a
// ~16 ms timer tick, so a same-length rewrite inside one tick keeps size,
// mtime and ctime identical and the stamp cannot see it. The door refuses
// to trust a stamp minted inside its own tick, so the law holds: a note
// edited on disk binds the NEXT call, however fast the edit came.
test("a same-tick same-length external rewrite still binds the next read", () => {
  const root = fresh();
  const abs = join(root, "tick.md");
  for (let i = 0; i < 20; i++) {
    writeFileSync(abs, "---\nsigned_off: 2026-08-10T00:00:00.000Z\n---\nbody\n", "utf8");
    assert.match(fileRead(root, "tick.md").content, /2026-08-10/);
    writeFileSync(abs, "---\nsigned_off: 2026-09-01T00:00:00.000Z\n---\nbody\n", "utf8");
    assert.match(fileRead(root, "tick.md").content, /2026-09-01/, `iteration ${i}: the same-tick rewrite went unseen`);
  }
});

test("live reads reuse validated content and detect external same-size rewrites", () => {
  const root = fresh();
  const path = "cached.md";
  const abs = join(root, path);
  writeFileSync(abs, "alpha");
  // COLD ON PURPOSE: a file written inside the current timestamp tick is
  // provisional and never served from its stamp, so the reuse this test
  // asserts needs an mtime the tick guard trusts.
  const aged = new Date(Date.now() - 1000);
  utimesSync(abs, aged, aged);

  const before = doorStats();
  assert.match(fileRead(root, path).content, /alpha/);
  const first = doorStats();
  assert.equal(first.misses, before.misses + 1, "the first read hits the disk");
  assert.match(fileRead(root, path).content, /alpha/);
  const second = doorStats();
  assert.equal(second.hits, first.hits + 1, "the second read is served from the door");
  assert.equal(second.misses, first.misses, "and does not touch the disk");

  writeFileSync(abs, "bravo");
  const changed = new Date(Date.now() + 1000);
  utimesSync(abs, changed, changed);
  assert.match(fileRead(root, path).content, /bravo/);
  const third = doorStats();
  assert.equal(third.misses, second.misses + 1, "a same-size external rewrite is detected by the stamp");
});
