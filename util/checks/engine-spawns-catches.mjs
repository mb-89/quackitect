// THE SPAWN CHECK IS DRIVEN AGAINST THE DEFECT IT EXISTS FOR.
//
// A CHECK NOBODY HAS WATCHED FAIL IS A CHECK NOBODY HAS TESTED, and running
// engine-spawns.mjs on a clean tree only ever shows it passing. The criterion
// that used to stand here searched the source for a phrase about a second
// count, which a comment carrying those words satisfies.
//
// SO THIS PLANTS THE DISAGREEMENT AND REQUIRES THE RED. A spawn is written in a
// shape the pattern cannot read, in a copy of src/extension outside the tree,
// and the check has to name it and exit non-zero. Then the copy is put back the
// way it was and the check has to pass, so this cannot be satisfied by a check
// that fails on everything.
//
//   node util/checks/engine-spawns-catches.mjs <root>
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE COPY IS THE TREE THIS DRIVES, never the tree itself, because a check
// that edits what it is checking leaves the repository broken if it dies.
const work = mkdtempSync(join(tmpdir(), "catches-"));
cpSync(join(root, "src", "extension"), join(work, "src", "extension"),
  { recursive: true, filter: (p) => !p.includes("node_modules") });
cpSync(join(root, "util", "checks"), join(work, "util", "checks"), { recursive: true });

function run() {
  try {
    const out = execFileSync(process.execPath,
      [join(work, "util", "checks", "engine-spawns.mjs"), work], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: String(e.stdout ?? "") };
  }
}

const clean = run();
say("the check passes on the tree as it stands", clean.code === 0,
  "it already fails without anything planted, so a red below would say nothing:\n"
  + clean.out.split("\n").filter((l) => l.includes("FAIL")).join("\n"));

// A SPAWN THE PATTERN CANNOT READ. Its arguments are spread into the call
// rather than written as an array, so the reader walks past it, and the flag
// it carries reaches the engine unread.
const p = join(work, "src", "extension", "extension.ts");
const was = readFileSync(p, "utf8");
const mark = "spawn(exe, [...startArgs()";
say("the spawn this plants a shape at is where it was", was.includes(mark),
  "extension.ts no longer starts the engine at a spawn this can find, so this "
  + "check is driving nothing");
writeFileSync(p, was.replace(mark, 'spawn(...[exe, ["--form", "x"'), "utf8");

const planted = run();
say("the check names a spawn written in a shape it cannot read", planted.code !== 0,
  "a flag was written at a call site the pattern cannot follow and the check "
  + "answered clean, so nothing in it can see the defect it exists for");
const named = planted.out.split("\n").filter((l) => l.includes("FAIL"));
say("and it says which builder went unreached", named.length > 0,
  "it exited non-zero and named nothing, so a reader is told there is a defect "
  + "and not where");
say("and it prints both numbers it holds against each other",
  /\d+ exported, \d+ spread/.test(planted.out),
  "the counts it compares are not in the output, so a disagreement cannot be read");

writeFileSync(p, was, "utf8");
const back = run();
say("and it passes again once the shape is put back", back.code === 0,
  "it stayed red after the copy was restored, so it fails on everything and "
  + "the red above says nothing");

rmSync(work, { recursive: true, force: true });
console.log("\n" + (bad ? bad + " failed." : "0 failed."));
process.exit(bad ? 1 : 0);
