// see dsp-quality-toolchain.md#the-prose-inspection
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/** THE METHOD VOCABULARY, carried here because the product has no term list.
 *
 *  THAT ABSENCE IS ITSELF A FINDING. tsp-prose-inspection has demanded "zero
 *  bare method terms" since i1 without anything defining which words those
 *  are, which is one reason it was never runnable. The list lives here so it
 *  is editable and visible rather than implied.
 *
 *  A TERM IS BARE when it appears on a line carrying no markdown link. The
 *  owner's law allows a method term where its definition is one click away,
 *  so a link on the same line is the pass. */
const METHOD_TERMS = [
  "legal_tools",
  "state_kind",
  "evidence_form",
  "exit_script",
  "entry_read",
  "busbar",
  "rigor matrix",
  "change_size",
  "goals_served",
  "bound_breaches",
  "raid",
  "value prop",
  "design spec",
  "test-spec",
  "SCXML",
];

/** A refusal code, e.g. SE-C-112. Matched as a shape rather than a list, so a
 *  new clause is caught the day it is written. */
const CLAUSE = /\bSE-C-\d{3}\b/;

/** THE ENTRY DOCUMENTS — what a stranger meets first. Kept short on purpose:
 *  the law is about the front door, not about the whole corpus. */
const ENTRY_DOCS = ["README.md"];

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();
const findings: string[] = [];
/** What the check could not look at, printed every run and never red. */
const caveats: string[] = [];

/** ITEM 1 — entry documents carry zero bare method terms. */
function entryDocsAreePlain(): void {
  for (const rel of ENTRY_DOCS) {
    const abs = join(root, rel);
    // A ROOT WITH NO ENTRY DOCUMENT HAS NOTHING TO INSPECT. That is a fresh
    // scaffold or a test root, not a product whose front door is wrong, and
    // treating it as a finding blocked the boot of every test that stands one
    // up — five of them, the first time this ran inside the battery.
    //
    // THE OTHER BOOT SCRIPTS DO THE SAME THING and say so in their output:
    // preflight and the smoke test both skip when they are already inside a
    // run. A check has to know when it is looking at nothing.
    if (!existsSync(abs)) {
      caveats.push(`${rel} does not exist here, so item 1 inspected nothing`);
      continue;
    }
    const lines = readFileSync(abs, "utf8").split("\n");
    lines.forEach((line, i) => {
      // A LINK ON THE LINE IS THE PASS. Markdown link, or a bare URL.
      if (/\[[^\]]+\]\([^)]+\)/.test(line) || /https?:\/\//.test(line)) return;
      // A HYPHEN USED TO HIDE A TERM. The list holds `rigor matrix` with a
      // space, the test was a plain substring, and a README line reading
      // `rigor-matrix` broke the law in substance while the checker saw
      // nothing. Comparing the flattened forms as well closes that.
      const flatLine = line.toLowerCase().replace(/-/g, " ");
      const hits = METHOD_TERMS.filter(
        (t) => line.toLowerCase().includes(t.toLowerCase()) || flatLine.includes(t.toLowerCase().replace(/-/g, " ")),
      );
      if (CLAUSE.test(line)) hits.push(CLAUSE.exec(line)?.[0] ?? "a refusal code");
      for (const h of hits) findings.push(`item 1 · ${rel}:${String(i + 1)} — bare method term "${h}", with no definition one click away`);
    });
  }
}

/** DOES THIS LINE CARRY THE NEEDLE AS ITS OWN WORD?
 *
 *  A PLAIN SUBSTRING TEST READS A LEAK INTO EVERY LONGER WORD. Measured on the
 *  i17 cloud run: the box's home directory is `/root`, so the path
 *  `tests/roots.test.ts` came back as a leaked home directory. The needle ends
 *  in a word character and the text carries on with another one — that is a
 *  longer word, never the needle.
 *
 *  THE BOUNDARY IS ONLY ENFORCED WHERE THE NEEDLE'S OWN EDGE IS A WORD
 *  CHARACTER, so a needle that starts with a slash still matches mid-path. */
function carriesWord(line: string, needle: string): boolean {
  const hay = line.toLowerCase();
  const nee = needle.toLowerCase();
  const wordChar = /[a-z0-9_]/;
  const headBound = wordChar.test(nee[0]);
  const tailBound = wordChar.test(nee[nee.length - 1]);
  let at = hay.indexOf(nee);
  while (at !== -1) {
    const before = at > 0 ? hay[at - 1] : "";
    const after = hay[at + nee.length] ?? "";
    const headOk = !headBound || before === "" || !wordChar.test(before);
    const tailOk = !tailBound || after === "" || !wordChar.test(after);
    if (headOk && tailOk) return true;
    at = hay.indexOf(nee, at + 1);
  }
  return false;
}

/** ABOVE THIS MANY FILES, A BARE WORD IS THE CORPUS'S OWN VOCABULARY. Three
 *  is deliberate: a leak lands in the record that leaked it and the odd one
 *  that quotes it, while a word the project actually speaks is everywhere. */
const VOCABULARY_FLOOR = 3;

/** ITEM 3 — stored records name roles, never people or machines.
 *
 *  THE NEEDLES ARE READ AT RUNTIME AND NEVER WRITTEN DOWN. The check knows
 *  what to look for by asking git and the environment; nothing personal
 *  reaches this file or its output, which reports a location and a kind. */
function recordsNameRolesOnly(): void {
  // A NEEDLE THAT IS ALSO THE PRODUCT'S NAME CANNOT BE SEARCHED FOR, and the
  // first run of this check proved it: the git user here is the same word the
  // product is called, so every mention of the product read as a leaked
  // username. Ninety-seven findings, all false.
  //
  // SO A COLLIDING NEEDLE IS SKIPPED AND SAID ALOUD. A check that cannot tell
  // two things apart must report that it cannot, rather than reporting the
  // wrong one confidently.
  const productNames = new Set<string>();
  const repoName = root.split(/[/\\]/).pop() ?? "";
  for (const part of repoName.toLowerCase().split(/[^a-z0-9]+/)) if (part.length >= 3) productNames.add(part);
  const needles: { what: string; value: string }[] = [];
  const skipped: string[] = [];
  const specRoot = join(root, "spec");

  /** HOW MANY RECORDS ALREADY USE THIS WORD AS ORDINARY VOCABULARY.
   *
   *  Counted over files rather than lines: one record quoting a leaked path
   *  ten times is one file, and a word the corpus genuinely speaks is spread
   *  across many. */
  const filesCarrying = (value: string): number => {
    if (!existsSync(specRoot)) return 0;
    let n = 0;
    for (const abs of walk(specRoot)) {
      if (carriesWord(readFileSync(abs, "utf8"), value)) n++;
      if (n > VOCABULARY_FLOOR) return n;
    }
    return n;
  };

  const add = (what: string, value: string | undefined): void => {
    const v = (value ?? "").trim();
    if (v.length < 3) return;
    if (productNames.has(v.toLowerCase())) {
      skipped.push(`${what} collides with the product's own name, so a text search cannot tell them apart`);
      return;
    }
    // see dsp-quality-toolchain.md#a-bare-word-the-corpus-already-speaks-is-the
    if (!/[\s/\\@.:-]/.test(v)) {
      const n = filesCarrying(v);
      if (n > VOCABULARY_FLOOR) {
        skipped.push(
          `${what} is a bare word the records already use in ${String(n)}+ files, so a text search cannot tell a leak from the vocabulary`,
        );
        return;
      }
    }
    needles.push({ what, value: v });
  };
  try {
    add("the git user name", execFileSync("git", ["config", "user.name"], { cwd: root, encoding: "utf8" }));
    add("the git user email", execFileSync("git", ["config", "user.email"], { cwd: root, encoding: "utf8" }));
  } catch {
    // no git identity configured — nothing to leak
  }
  add("the home directory", process.env.USERPROFILE ?? process.env.HOME);
  add("the machine name", process.env.COMPUTERNAME ?? process.env.HOSTNAME);
  // A CAVEAT IS NOT A FINDING. What the check could not see is printed every
  // run so nobody reads a pass as full coverage, but it does not turn the
  // check red — a name collision cannot be fixed by anybody, and a check that
  // is permanently red gets muted, which is worse than one that is honest
  // about its blind spot.
  for (const s of skipped) caveats.push(s);
  if (needles.length === 0) return;

  const specDir = join(root, "spec");
  if (!existsSync(specDir)) return;
  for (const abs of walk(specDir)) {
    const lines = readFileSync(abs, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const n of needles) {
        if (!carriesWord(line, n.value)) continue;
        findings.push(`item 3 · ${relative(root, abs)}:${String(i + 1)} — carries ${n.what}; stored records name ROLES`);
      }
    });
  }
}

/** ITEM 8 — the desk's offer list includes a tour. */
function deskOffersATour(): void {
  const desk = join(root, "guidance", "method", "front-desk.md");
  if (!existsSync(desk)) {
    findings.push("item 8 · guidance/method/front-desk.md — the desk's own method card is missing");
    return;
  }
  if (!/\btour\b/i.test(readFileSync(desk, "utf8"))) {
    findings.push("item 8 · guidance/method/front-desk.md — the desk never mentions a tour among what it offers");
  }
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(abs));
    else if (e.name.endsWith(".md")) out.push(abs);
  }
  return out;
}

entryDocsAreePlain();
recordsNameRolesOnly();
deskOffersATour();

process.stdout.write("prose-inspect: items 1, 3 and 8 of tsp-prose-inspection\n");
process.stdout.write("               items 2, 4, 5, 6 and 7 are judgments no command answers\n");
for (const c of caveats) process.stdout.write(`               BLIND SPOT: ${c}\n`);
process.stdout.write("\n");

if (findings.length === 0) {
  process.stdout.write("prose-inspect green on the three mechanical items\n");
  process.exit(0);
}

process.stdout.write(`prose-inspect RED — ${String(findings.length)} finding(s)\n\n`);
for (const f of findings) process.stdout.write(`- ${f}\n`);
process.exitCode = 1;
