// see dsp-quality-toolchain.md#the-engine-observes-the-red
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseTap } from "../discipline.ts";
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
  const summary = /^# pass \d+$/m.test(out) && /^# fail \d+$/m.test(out);
  const tap = parseTap(out);
  const { pass, fail } = tap;
  const crashes = tap.failures.filter((f) => f.kind === "crash");
  const asserts = tap.failures.filter((f) => f.kind === "assertion");
  process.stdout.write(`##progress 1 1 done\n`);
  if (!summary) {
    // NO SUMMARY MEANS NO RUN. The runner died before reporting, and reading
    // that as red would pass this state on an instrument failure.
    problems.push(`the runner produced no TAP summary — it did not complete:\n${out.trim().slice(0, 2000)}`);
  } else if (pass + fail === 0) {
    problems.push("the new check files ran zero cases — a file that registers no test cannot be observed red");
  } else if (fail === 0) {
    problems.push(
      `all ${String(pass)} new cases PASS before the build — a check green from birth proves nothing. Either the design is already realized, or the check does not test what it says.`,
    );
  } else if (asserts.length === 0) {
    // EVERY FAILURE CRASHED. Nothing reached an expectation, so nothing about
    // the design was measured. The likeliest cause is the check file itself.
    problems.push(
      `${String(fail)} of ${String(pass + fail)} new cases fail, and every one CRASHED rather than failing an assertion. A crash never reaches its expectation, so it says the check file is broken — not that the design is unrealized. Look at these first:\n${crashes
        .map((f) => `    ${f.name}\n${f.detail.replace(/^/gm, "      ")}`)
        .join("\n")}`,
    );
  } else {
    process.stdout.write(
      `red observed: ${String(asserts.length)} of ${String(pass + fail)} new cases fail on an assertion, as they should\n`,
    );
    // A CRASH ALONGSIDE AN ASSERTION IS NEWS WITHOUT BEING A REFUSAL. The red
    // stands on the assertions; the crashing cases are named so they are not
    // mistaken for part of it.
    if (crashes.length > 0) {
      process.stdout.write(
        `note: ${String(crashes.length)} further case(s) CRASHED rather than asserting, and prove nothing about the design — ${crashes
          .map((f) => f.name)
          .join(", ")}\n`,
      );
    }
    process.stdout.write(`specs: ${specs.join(", ")}\n`);
  }
}

if (problems.length > 0) {
  process.stdout.write(`red RED — ${String(problems.length)} problem${problems.length === 1 ? "" : "s"}\n\n`);
  for (const p of problems) process.stdout.write(`- ${p}\n`);
  process.exitCode = 1;
}
