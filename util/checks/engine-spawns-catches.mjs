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

const p = join(work, "src", "extension", "extension.ts");
const was = readFileSync(p, "utf8");
const mark = "spawn(exe, [...startArgs()";
say("the spawn this plants a shape at is where it was", was.includes(mark),
  "extension.ts no longer starts the engine at a spawn this can find, so this "
  + "check is driving nothing");

// TWO PLANTS, AND EACH IS EVIDENCE ABOUT A DIFFERENT HALF.
//
// REPLACING A SPAWN DOES TWO THINGS AT ONCE. It hides a call from the reading
// pattern AND it orphans the builder that call used to spread, so the red that
// comes back is the module-side count firing and says nothing about spawns. The
// check was written that way and was taken as evidence about the pattern.
//
// SO THE FIRST PLANT ADDS A CALL RATHER THAN REPLACING ONE. It orphans no
// builder, spreads nothing and writes its flag as a literal, which is how the
// defect actually arrives: nobody breaks a working call site, somebody writes a
// new one. The red for it has to come from the spawn count and from nothing
// else, so this asserts the line it comes back on.
const added = 'spawnRaw(binary(context, "se"), ["--form", "x", "--work", work], { cwd: work });\n  '
  + mark;
writeFileSync(p, was.replace(mark, added), "utf8");

const grown = run();
say("the check names a spawn ADDED in a shape it cannot read", grown.code !== 0,
  "a new call site was written with its flags as literals, spreading no builder, "
  + "and the check answered clean. That is the defect this file exists for and it "
  + "is how it arrives");
say("and the red is about the spawn count rather than about a builder",
  /every spawn in the tree was read/.test(grown.out),
  "it went red for something else, so this plant is evidence about the module "
  + "side and not about the pattern:\n"
  + grown.out.split("\n").filter((l) => l.includes("FAIL")).join("\n"));
say("and the spawns-read count is in the output",
  /\d+ spawn\(s\) read/.test(grown.out),
  "the count the pattern read is not printed, so the number this criterion names "
  + "as one of the two is held against nothing a reader can see");

writeFileSync(p, was, "utf8");
say("and it passes again once the added call is taken out", run().code === 0,
  "it stayed red with the tree back as it was, so the red above says nothing");

// THE SECOND PLANT REPLACES A SPAWN, and it is kept because it exercises the
// module side: the builder it used to spread is orphaned and the converse loop
// is what has to notice.
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
