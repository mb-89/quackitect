// THE ENGINE OBSERVES THE RED, NOT THE AGENT — the check behind observe-red
// (owner ruling 2026-08-16, raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions).
//
// observe-red DOES NOT GRANT se_test. Its legal tools are the file verbs and
// se_run, so the state whose whole job is watching new checks fail could not
// use the test verb, and the agent reached for the shell instead.
//
// THE OWNER'S ANSWER WAS NOT TO GRANT THE VERB: "How about the engine fires the
// tests and observes red? When you submit observe-red, the engine runs the
// test." That is the shape verification's row already claims for itself, one
// milestone earlier.
//
// WHAT IT READS. A test-spec node carries `minted_in`, `method` and `files`.
// The specs minted in the open record with `method: test` name exactly the
// checks this record is adding, and their files are the checks themselves.
//
// WHAT IT DEMANDS. At least one case in that set FAILS. A check that is green
// before its design is realized is not a check — it is a sentence that happens
// to be true, and green-from-birth is the one thing test-first exists to catch.
//
//   node engine/bin/red-observed.ts --root <project root>
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { itList } from "../iterations.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** One frontmatter scalar, or "". Flat keys only; nothing read here nests. */
function field(text: string, key: string): string {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(text);
  return m === null ? "" : m[1].trim().replace(/^["']|["']$/g, "");
}

/** A frontmatter list, either YAML block or inline comma string — both forms
 *  are legal everywhere else in the corpus, so both are read here. */
function listField(text: string, key: string): string[] {
  const inline = field(text, key);
  if (inline !== "" && !inline.startsWith("#")) {
    return inline
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s !== "");
  }
  // THE DASH MUST BE FOLLOWED BY SPACE, and that is the whole guard against
  // eating the closing `---`. YAML writes a sequence entry as "- item"; the
  // frontmatter delimiter has no space, so it stops the match instead of
  // arriving as an item called "--".
  const block = new RegExp(`^${key}:[ \\t]*\\n((?:[ \\t]*-[ \\t]+.*\\n?)+)`, "m").exec(text);
  if (block === null) return [];
  return block[1]
    .split("\n")
    .map((l) =>
      l
        .replace(/^[ \t]*-[ \t]*/, "")
        .trim()
        .replace(/^["']|["']$/g, ""),
    )
    .filter((s) => s !== "");
}

const root = argValue("--root") ?? process.cwd();
const problems: string[] = [];

// THE RED IS OBSERVED ONCE, AT ITS BIRTH — the row's own words. A condition
// script re-runs on EVERY tick attempt out of its state, and a walk re-enters
// observe-red whenever the engine reboots. By then the build has landed and
// the checks are green, which is the whole point of having built it.
//
// SO A SIGNED observe-red IS THE ANSWER, NOT A RE-RUN. The observation is a
// historical fact recorded in the record's own evidence. Asking the world
// again asks a different question: not "did these fail before the build" but
// "do they fail now", and the honest answer to that is no.
//
// FOUND BY THE CHECK BLOCKING ITS OWN ITERATION, one reload after it landed.
// THE SUBJECT IS THE RECORD STANDING AT observe-red, and its own evidence file
// says which one that is. `open` is far wider than that: every seeded record
// is open, so 26 of them answered on the first run and 25 had never been walked
// at all.
//
// THE FILE EXISTS ONLY ONCE THE STATE IS BEING WORKED. Unsigned means the
// observation is still owed; signed means it happened and was recorded.
const standing = (id: string): "owed" | "recorded" | "not there" => {
  const ev = join(root, "project", "spec", "iterations", id, "evidence", "observe-red.md");
  if (!existsSync(ev)) return "not there";
  return /^signed_off:[ \t]*\S/m.test(readFileSync(ev, "utf8")) ? "recorded" : "owed";
};

const open = itList(root).filter((i) => i.open);
const owing = open.filter((i) => standing(i.id) === "owed");
if (owing.length === 0) {
  // A RE-ENTRY IS NOT A RE-ASK. A walk passes back through observe-red whenever
  // the engine reboots, and by then the build has landed and the checks are
  // green — which is what building them was for. The row says the observation
  // is recorded per check, once, at its birth, so a signed record answers it.
  const done = open.filter((i) => standing(i.id) === "recorded").map((i) => i.id);
  process.stdout.write(
    done.length === 0 ? "red: no record standing at observe-red\n" : `red: already observed and recorded — ${done.join(", ")}\n`,
  );
  process.exit(0);
}
const ids = new Set(owing.map((i) => i.id));

const specDir = join(root, "project", "spec", "trace", "test-spec");
const files = new Set<string>();
const specs: string[] = [];
if (existsSync(specDir)) {
  for (const n of readdirSync(specDir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(join(specDir, n), "utf8");
    if (!ids.has(field(text, "minted_in"))) continue;
    // ONLY THE RUNNABLE ONES. Demonstration, inspection and analysis specs are
    // the form's checklist — no run can show their red, which is precisely why
    // the row asks a person about those and the engine about these.
    if (field(text, "method") !== "test") continue;
    const id = field(text, "id") || n.replace(/\.md$/, "");
    specs.push(id);
    const named = listField(text, "files");
    if (named.length === 0) {
      problems.push(`${id}: method test and no files — the check it describes has no address`);
      continue;
    }
    for (const rel of named) {
      const abs = join(root, "project", "deliverable", rel);
      if (!existsSync(abs)) {
        problems.push(`${id}: names ${rel}, which does not exist — the check was never written`);
        continue;
      }
      files.add(abs);
    }
  }
}

// A RECORD MAY LEGITIMATELY ADD NO RUNNABLE CHECK. A documentation change or a
// pure deletion authors demonstration specs and nothing else, and demanding a
// red from it would be demanding a test nobody needs.
if (specs.length === 0 && problems.length === 0) {
  process.stdout.write(`red: ${[...ids].join(", ")} authored no runnable test spec — nothing for the engine to observe\n`);
  process.exit(0);
}

if (files.size > 0) {
  process.stdout.write(`##progress 0 1 running ${String(files.size)} new check file(s)\n`);
  const r = spawnSync("node", ["--test", "--test-reporter=tap", ...files], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const count = (key: string): number => Number(new RegExp(`^# ${key} (\\d+)$`, "m").exec(out)?.[1] ?? "-1");
  const pass = count("pass");
  const fail = count("fail");
  process.stdout.write(`##progress 1 1 done\n`);
  if (pass < 0 || fail < 0) {
    // NO SUMMARY MEANS NO RUN. The runner died before reporting, and reading
    // that as red would pass this state on an instrument failure.
    problems.push(`the runner produced no TAP summary — it did not complete:\n${out.trim().slice(0, 2000)}`);
  } else if (pass + fail === 0) {
    problems.push("the new check files ran zero cases — a file that registers no test cannot be observed red");
  } else if (fail === 0) {
    problems.push(
      `all ${String(pass)} new cases PASS before the build — a check green from birth proves nothing. Either the design is already realized, or the check does not test what it says.`,
    );
  } else {
    process.stdout.write(`red observed: ${String(fail)} of ${String(pass + fail)} new cases fail, as they should\n`);
    process.stdout.write(`specs: ${specs.join(", ")}\n`);
  }
}

if (problems.length > 0) {
  process.stdout.write(`red RED — ${String(problems.length)} problem${problems.length === 1 ? "" : "s"}\n\n`);
  for (const p of problems) process.stdout.write(`- ${p}\n`);
  process.exitCode = 1;
}
