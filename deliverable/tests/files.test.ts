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
test("no binary file lives in the tree — an unreadable figure is not an artifact", () => {
  // THE SCRATCHPAD IS EXEMPT: it is the agent's
  // workbench and may hold whatever the work needs — a standards PDF, a heap
  // profile, a rendered probe. It is gitignored, and package.ts already keeps
  // it out of the shipped archive, so nothing here reaches the PRODUCT.
  //
  // The rule was always about what the product OWNS. Reaching into the
  // workbench made it refuse inputs, which is not what it is for.
  // `dist` JOINS THEM for the same reason the scratchpad is here: it is
  // build output, it is gitignored, and it came into range only when the
  // folder levels collapsed.
  // `.se` JOINS THEM, and it is the one that made this case flaky. It holds
  // machine-local state that OTHER CASES create and delete while this walk is
  // running, so the walk trips on a folder that vanished between the listing
  // and the descent. It is gitignored and the product owns nothing in it.
  const skip = new Set(["node_modules", ".git", ".obsidian", "scratchpad", "dist", ".se"]);
  const offenders: string[] = [];
  // A FOLDER THAT VANISHED IS NOT A BINARY FILE. Something else deleted it
  // mid-walk, and this case has nothing to say about that.
  const listing = (dir: URL) => {
    try {
      return readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }
  };
  const walk = (dir: URL, rel: string): void => {
    for (const e of listing(dir)) {
      if (skip.has(e.name)) continue;
      if (e.isDirectory()) walk(new URL(`${e.name}/`, dir), `${rel}${e.name}/`);
      else {
        try {
          if (readFileSync(new URL(e.name, dir)).includes(0)) offenders.push(rel + e.name);
        } catch {
          // likewise for a file that went away while this walk was reading
        }
      }
    }
  };
  walk(new URL("../../", import.meta.url), "");
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
  // 100: the vault's watcher reads .se/quack-watch.json direct —
  // JSON config, not a note, so no door saves a shared parse.
  // 101: claims.ts reads the machine-id file — one tiny
  // id outside the note system, minted once.
  // 102: help.ts reads the demand log (.se/help-demand.jsonl)
  // direct — a JSONL log outside the note system, same shape as the two above.
  // 103: mode.ts reads .se/mode.json — the run mode, one tiny
  // JSON object of session state, read at start. Same shape as the three
  // above, and no door would ever hold it.
  // 104: version.ts reads the package manifest ONCE at import,
  // for the product's own version. It was hardcoded as "3.0.0-bootstrap" in
  // four places and stopped following the product at the 4.0.0 release, so
  // every logged call across v4 carried a version the product had left behind.
  // There is no node here to route through a door — only the manifest, which
  // the packaging script already reads for the same fact.
  // 105: testreporters.ts reads .se/test-timings.jsonl to
  // count what a run recorded. A JSONL append log outside the note system,
  // read once per run to answer one question — did the bookkeeping land. The
  // read is the POINT: it is what makes a silent instrument failure visible,
  // and routing it through a note door would share a parse with nobody.
  // 106: mirror.ts serves the vendored graph renderer at
  // /vendor/cytoscape.min.js. A one-shot read of a static asset outside the
  // note system, the same shape as every increment above it — and the read
  // exists because the alternative was fetching it from unpkg on every open.
  // 107: paths.ts reads an identity file — brand.json for a
  // tree's own id, upstream.json for the id it was produced from. Two tiny
  // JSON objects, and the brand one is read in a FOREIGN tree that is not this
  // vault at all, so no note door could serve it even in principle. What the
  // read decides is whether a write target is the tree this system came from,
  // which is the one law a vehicle may never breach.
  // 111: produce.ts reads four files direct — the brand fact
  // of the tree it is producing from, the README template it renders, the
  // brand fact again when it has to mint its own identity, and a driven
  // record. None is a note. Two of them are read in trees that are not this
  // vault at all, and the README template is a template rather than a node, so
  // no door could share a parse with any of them.
  // THE TWO INCREMENTS ARE INDEPENDENT and the merge kept both.
  // i17 took 105 to 106 and i16 took 105 to 110, so the merged ceiling is 111.
  // 112: stopping-layer.ts reads .se/engine.log to say which
  // layer ended an interrupted call. A plain append-only text file outside the
  // note system, with no frontmatter to parse, read once to answer one
  // question. Routing it through a note door would share a parse with nobody,
  // and the door would have to parse a log as a node to do it.
  // THAT ONE ARRIVED ON TOP OF 111 AT THE i36 MERGE. Its own branch
  // counted it as 107 because it never saw the five increments above it.
  // 115: the benchmark run reads three things no door holds.
  // FIVE WERE WRITTEN AND TWO WERE GIVEN BACK, which is what this ratchet is
  // for: a record and a benchmark report are both NOTES, so they went through
  // noteOf, and the engine version already has its one reader in version.ts.
  //   - benchmark.ts dirHash: raw BYTES of arbitrary files, to stamp what a
  //     run's conditions actually cover. It hashes guidance, forms, items,
  //     methods and the engine, most of which are not notes at all, and it
  //     wants bytes rather than a parse.
  //   - benchmark.ts changeSizeOf: the pin, machines/seeded.json — one tiny
  //     JSON object, the same shape as increments 100 through 104.
  //   - benchmark-guard.ts controlFilesPresent: markdown in the REWOUND TREE,
  //     which is a fetched checkout and not this vault. No door could serve it
  //     even in principle, exactly as at 107 and 111.
  // 116: version.ts reads the manifest a SECOND time, and the
  // second read is the whole point. SE_VERSION beside it is an IIFE evaluated
  // once at import and frozen for the life of the process — correct for a
  // stamp, and precisely why a running lane cannot notice that the code on
  // disk has moved past it. versionOnDisk() re-reads so the two can be
  // compared and a stale lane can say so on the banner.
  //   A DOOR WOULD DEFEAT IT. Every door shares one read and one parse, which
  //   is the caching this read exists to see through. This is the rare case
  //   where sharing the read would remove the measurement.
  // 117 AT THE i38 MERGE: rigor-matrix.ts complexityRequiredIn reads the matrix
  // README looking for one marker sentence, which arms the complexity refusal
  // once every active cell carries a rating. A README is not a note and has no
  // door; the read wants a substring of raw text, not a parse, and it is
  // wrapped in a try so an absent file answers false rather than throwing.
  // 119 WITH THE VS CODE REGISTRY WRITER: vscoderegistry.ts reads
  // extensions.json twice — once to see what is already listed, once to judge
  // what it has just written. VS Code owns that file, it lives outside the
  // project, and it is not a note, so no door could hold it. The second read
  // is the rollback check and must see the disk rather than a cache.
  // 120 AT i51: run.ts testOperations reads a test run's own record out of
  // .se/test-jobs so the ONE operation table can list it beside the shell jobs.
  // A job record is not a note and has no door; the read wants one JSONL line of
  // machine-local state, not a parsed trace node, and it sits beside persisted()
  // in the same file doing the same thing for the other kind.
  // AND 121: run.ts timeRemaining reads the running work's own progress file to
  // project how much longer it needs. Same shape and same reason — machine-local
  // JSONL, no door, no parse of a trace node.
  // AND 122: bound.ts readHostCap reads .se/harness-cap.json, the cap measured
  // for THIS host by se_probe_cap. It is machine-local, it is read before the
  // door exists, and bound.ts is below the door in the stack — the door's own
  // answers are serialised through it.
  // AND 123: run.ts batteryFound reads the running battery's beat file so the
  // work account can carry its progress and its failures. That replaced a
  // status verb agents polled instead of working; the same file was already
  // read here for the projection.
  // AND 128: five one-shot reads that cannot go through the door.
  //
  // bin/hands-spawned.ts reads the roster records to answer whether this phase's
  // hands were spawned. It is a condition SCRIPT: it runs as its own process,
  // before and outside any session, so there is no door to share.
  //
  // bin/preflight.ts reads the extension source and the installed copy to
  // compare them. Boot is the only moment that comparison is worth making, it
  // reads each file exactly once, and preflight runs before the lane is up.
  //
  // ONE-SHOT AND BELOW THE DOOR IS THE WHOLE TEST, and these are both.
  //
  // 129: benchmark.ts reads the run binding to append what a sweep just cost. It
  // is a JSON file with one reader and one writer, not a node — the door shares
  // one read and one parse between readers of NODES, and there is nobody here to
  // share with. The rest of that file already reads it the same way.
  // 116, DOWN FROM 129 — and this is the first time the number has ever fallen.
  //
  // EVERY LINE ABOVE ARGUES AN INCREMENT. The ceiling went 100, 101, 102 and on
  // to 129, each rise reasoned and none ever revisited. A ratchet holds a line;
  // it never asks whether the line could move.
  //
  // SO SOMEBODY WALKED IT. Thirteen of the 129 were the shape
  // `parseStateNote(readFileSync(path))` — a cold read AND a cold parse of a
  // NOTE, which is exactly what the door exists to share. They sat in the
  // matrix, the trace, the cards, the drawer, the lint, the scale, the forms
  // and the state form.
  //
  // THE COUNT ALONE COULD NOT HAVE SAID THAT. It says 129 and nothing about
  // which of the 129 belong. Reading them is what tells the two apart.
  //
  // WHAT A COLD READER COSTS BESIDES TIME: it cannot be invalidated, so it
  // disagrees with the warm copy the moment a file changes under it, and
  // nothing reports the disagreement.
  // 120, UP FROM 116, AND THE FOUR ARE THE DOOR RULE'S OWN.
  //
  // doors.ts reads four times and doorguard.ts none. THE DOOR CANNOT HOLD
  // WHAT THEY READ: readNode, noteOf and nodeLines share one read and one parse
  // of a corpus NODE, and these read engine SOURCE and a machine list. Routing
  // them through a node reader would ask it to parse a TypeScript file as
  // frontmatter.
  //
  // THE GUARD'S OWN READ MOVED INTO THE RULE MODULE rather than being added to
  // it. doorguard.ts opened files to ask whether a module already reached, which
  // made the thing that refuses an undeclared reach one itself. That read is
  // now doors.ts's, and doorguard.ts imports no filesystem at all.
  //
  // ONE READ IS GENUINELY NEW, at move.ts. A move is a write at its
  // destination, so the content rules that govern the new path have to be asked
  // before the rename lands, and asking needs the bytes. It is one-shot, at a
  // write boundary, and there is nothing for a node reader to share.
  //
  // IT IS ALSO THE ONE READ THAT CANNOT GO THROUGH A DOOR ON PRINCIPLE. The
  // rule that decides who may read and write has to read the tree to answer,
  // and a door that could not reach its own conversation could not exist. The
  // departure list records exactly that, with the same reason.
  //
  // 122 SINCE THE RULE MODULE LEARNED WHERE AN UNREASONED LINE STANDS. The
  // departure guard hands back a patch, and a patch aimed at a line the refused
  // write never landed on matches nothing — the remedy failing in exactly the
  // case it exists for. One read answers which of two ops repairs it, and it is
  // one-shot on a refusal path.
  const CEILING = 122;
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
  // 38: claims.ts mints the machine-id file, and the pin
  // scaffolds seeded placeholder drawings — generated files the door never
  // holds, the same class as the pin's own write.
  //
  // 39: bound.ts spills an oversized answer to
  // `.se/answers/<tool>.json`. That is SESSION state — machine-local,
  // gitignored, overwritten by the next big answer and read back only by the
  // cursor on the answer that wrote it. The door holds corpus, so this is a
  // file it can never hold.
  //
  // 40: mode.ts writes `.se/mode.json`, the run mode the
  // person chose. Session state again — host-local, uncommitted, one small
  // object, and deliberately NOT corpus: what suits one machine's cores is not
  // a fact about the product.
  // 41: promptlayer.ts gained placeSkills, which writes one
  // skill file into three host directories from a single loop. It is a
  // projection of guidance, placed exactly like the protocol files beside it,
  // and no note door could hold a file whose shape the host owns.
  // 42: benchmark.ts writes `.se/benchmark.json` when a run
  // binds — which run is open, where its history was cut, and the three
  // conditions no log holds. SESSION state, exactly the shape of 39 and 40:
  // machine-local, gitignored, and deleted when the run ends. The one thing a
  // benchmark COMMITS is its report, and that is a note written through the
  // item template rather than by this call.
  // 46 WITH THE VS CODE REGISTRY WRITER: vscoderegistry.ts writes
  // extensions.json, its backup, a rescue copy when the file it found was
  // damaged, and the restore when the new file would have lost an id. VS Code
  // owns that file and it sits outside the project, so the door can never
  // hold it.
  // 47 WITH THE MEASURED HOST CAP: bound.ts recordHostCap writes
  // .se/harness-cap.json. It is machine-local and gitignored, it records what
  // one host was measured to accept, and bound.ts sits below the door — the
  // door's answers are serialised through it.
  // 48 WITH THE LAST BATTERY'S RESULTS: tools-run.ts storeLastResults writes
  // .se/test-last.json. The work account carries only a failure COUNT, so the
  // full list has to live somewhere the account can point at. Session state of
  // exactly the shape of 39, 40 and 42: machine-local, gitignored, and
  // overwritten by the next run.
  // 49: benchmark.ts writes the run binding back after appending a sweep's hop
  // timings. Same file, same reason as the read above — a JSON binding with one
  // writer, which the rest of that file already writes directly.
  // 50 WITH THE COMPACTION MARKER: compaction.ts writes `.se/compacted`, the
  // one thing a SessionStart hook can leave behind. The hook holds no lane
  // connection, so a file is the only channel it has to the engine, and the
  // next pull deletes it as it collects it. Session state of the same shape as
  // 39, 40, 42, 47 and 48: machine-local, gitignored, and gone within one call.
  // 51 AND 52 WITH SETTING A RECORD ASIDE: iterations.ts parkRecord writes the
  // status word, and markStarted writes it back when the record is resumed.
  // Both are the same act as the `started:` stamp two lines above them in that
  // file, on the same file, through the same regex replacement.
  //
  // 51, DOWN FROM 52. This ratchet was walked the same way the read one above
  // was, and it came back almost clean: of 52 direct writes, exactly ONE was
  // writing a NODE. A work token is a node, and writeNode writes AND TELLS, so
  // a reader later in the same pass now sees the token that was just minted
  // rather than the absence the door remembers from before it.
  //
  // THE ASYMMETRY IS THE FINDING. The read ratchet gave up thirteen entries
  // that belonged behind the door; this one gave up one. The write door has
  // been respected all along and the read door was walked around — which is
  // what a count cannot say and reading the entries can.
  const CEILING = 51;
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
// AMBIGUOUS. The walking test above catches a raw
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
// already covers every file under .
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

// SEARCH AND REPLACE ACROSS FILES. The per-file regex op
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

// THE PREVIEW IS THE GUARD THIS VERB WAS MISSING. It computed every place it
// would land, wrote, and handed the list back afterwards — so the reader judged
// a replace that had already happened.
//
// WHAT THAT COST, on this repository: a tree-wide rewrite whose last rule had
// lost an escape stripped the separator out of every path in every live file.
// A preview existed, in a hand-written script, and was read on four files
// before the fatal rule was added.
//
// by_file IS THE PART THAT CATCHES IT. A rule hitting one file four thousand
// times while its siblings take two reads as normal in a sample of lines and
// is unmissable in a per-file count sorted biggest first.
test("preview computes the whole sweep, writes nothing, and names the blast radius per file", () => {
  const root = fresh();
  fileWrite(root, "a/one.ts", 'const a = "old";\nconst b = "old";\nconst c = "old";\n', null);
  fileWrite(root, "a/b/two.ts", 'const d = "old";\n', null);

  const p = fileReplace(root, "**/*.ts", "old", "new", { preview: true });

  assert.equal(p.preview, true, "the result says it wrote nothing");
  assert.equal(p.changed.length, 0, "and nothing is reported as changed");
  assert.equal(p.places_total, 4, "every place is still counted");
  assert.ok(readFileSync(join(root, "a", "one.ts"), "utf8").includes('"old"'), "the tree is untouched");

  const shape = (p.by_file ?? []).map((f) => f.replacements);
  assert.deepEqual(shape, [3, 1], "biggest first — the lopsided rule is the one worth seeing");

  // And the same call without the flag really does write.
  const real = fileReplace(root, "**/*.ts", "old", "new", {});
  assert.equal(real.preview, undefined, "a real run is not marked a preview");
  assert.equal(real.changed.length, 2);
  assert.ok(!readFileSync(join(root, "a", "one.ts"), "utf8").includes('"old"'), "and now it is written");
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
  fileWrite(root, "guidance/old.md", "# old\n", null);
  fileWrite(root, "engine/keep.ts", "const a = 1;\n", null);
  writeFileSync(join(root, "engine", "ref.ts"), `const p = "guidance/old.md";\nconst sep = "${String.fromCharCode(0)}";\n`);
  const r = fileMove(root, "guidance/old.md", "guidance/new.md");
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("ref.ts")),
    "the repair is named",
  );
  const after = readFileSync(join(root, "engine", "ref.ts"), "utf8");
  assert.ok(after.includes("guidance/new.md"), "and the reference is rewritten, which the skip prevented");
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

test("character range reads preserve exact text inside one oversized line", () => {
  const root = fresh();
  const raw = JSON.stringify({ body: "x".repeat(READ_BUDGET + 1) });
  writeFileSync(join(root, "answer.json"), raw);
  const first = fileRead(root, "answer.json", { charOffset: 0, charLimit: 3_000 });
  assert.equal(first.content, raw.slice(0, 3_000));
  assert.deepEqual(first.char_range, { offset: 0, limit: 3_000, to: 3_000, of: raw.length });
  const second = fileRead(root, "answer.json", { charOffset: first.char_range?.to, charLimit: 3_000 });
  assert.equal(first.content + second.content, raw.slice(0, 6_000));
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
  fileWrite(root, "guidance/old.md", "# Doc", null);
  fileWrite(root, "notes/uses.md", "See guidance/old.md and [[guidance/old|the doc]].", null);
  fileWrite(root, "m/x.canvas", '{"nodes":[{"id":"a","type":"file","file":"guidance/old.md","x":0,"y":0,"width":1,"height":1}]}', null);
  const r = fileMove(root, "guidance/old.md", "guidance/new/doc.md");
  assert.equal(r.rewritten.length, 2);
  assert.ok(readFileSync(join(root, "notes/uses.md"), "utf8").includes("guidance/new/doc.md"));
  assert.ok(readFileSync(join(root, "notes/uses.md"), "utf8").includes("[[guidance/new/doc|the doc]]"));
  assert.ok(readFileSync(join(root, "m/x.canvas"), "utf8").includes("guidance/new/doc.md"));
  // no silent overwrite
  fileWrite(root, "guidance/other.md", "x", null);
  assert.throws(
    () => fileMove(root, "guidance/other.md", "guidance/new/doc.md"),
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

  const r = fileMove(root, "brand.json", "deliverable/brand/brand.json");

  const paths = r.rewritten.map((x) => x.path);
  assert.ok(paths.includes("engine/brand.ts"), ".ts is rewritten");
  assert.ok(paths.includes("RUNME.ps1"), ".ps1 is rewritten");
  assert.ok(paths.includes("notes/uses.md"), "prose still works");
  assert.ok(readFileSync(join(root, "engine/brand.ts"), "utf8").includes('"deliverable/brand/brand.json"'));

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

// Source takes the root-relative form ONLY. The WIKI form is a markdown
// convention, and a bare substring of one would maul unrelated code — here,
// an identifier that merely ends with the moved file's name.
//
// THE VAULT-RELATIVE FORM WAS THIS TEST'S MIDDLE CASE until the levels
// collapsed. The
// vault root is the repository root since the folder levels collapsed, so it
// is the SAME STRING as the root-relative form and names no separate risk.
test("move leaves markdown reference forms out of source, and spares longer names", async () => {
  const { fileMove } = await import("../engine/move.ts");
  const root = fresh();
  fileWrite(root, "guidance/old.md", "# Doc", null);
  fileWrite(root, "engine/x.ts", 'const a = "guidance/old.md";\nconst b = "[[guidance/old]]";\nconst c = "my-old.md";', null);

  const r = fileMove(root, "guidance/old.md", "guidance/new.md");
  const after = readFileSync(join(root, "engine/x.ts"), "utf8");

  assert.ok(after.includes('"guidance/new.md"'), "root-relative is rewritten");
  assert.ok(after.includes('"[[guidance/old]]"'), "the wiki form is left alone in source");
  assert.ok(after.includes('"my-old.md"'), "a longer name is not a reference");
  assert.deepEqual(r.unrewritten, [], "nothing root-relative survives");
});

// A SKETCH IS A CONTRACT (ux.md) and the reader could not open one. It read
// every file as utf8, so the owner had to describe a drawing the agent was
// holding the path to. Nothing ever ruled the reader text-only; it was only
// ever written that way.
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
// A ROOT YOU CANNOT BROWSE IS HALF A FEATURE. Reading by
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
