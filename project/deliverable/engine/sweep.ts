// THE WHOLE-CORPUS CONFORMANCE SWEEP. Every bound check, run over every node,
// REPORTING rather than refusing.
//
// WHY IT REPORTS AND NEVER REFUSES. Its subject is the corpus as it stands, so
// every break it finds predates whatever write happens to be in flight. A
// refusal here would make an unrelated edit carry somebody else's debt, and
// the rational answer to that is to route around the check
// (raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus).
//
// WHAT IT IS NOT. `se_lint` is the VOICE lint — walls of text, long sentences,
// comma chains — and it already sweeps by glob. This is the conformance half,
// and the two answer different questions about the same files.
//
// req-a-standing-break-reports-and-lands · req-a-check-too-slow-for-the-write-moves-to-the-sweep
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { readNode } from "./notes.ts";
import { rulesOf } from "./rules.ts";
import { fileForId, outsideVocabulary } from "./vocabulary.ts";

/** One thing the sweep found. It names the DIFFERENCE, never the category —
 *  "the register lists raid-x; the folder does not hold it" beats "drift". */
export interface Finding {
  kind: "unparseable" | "outside-vocabulary" | "unbound-rule" | "unfinished-rule";
  path: string;
  says: string;
}

export interface SweepResult {
  scanned: number;
  findings: Finding[];
}

/** Every markdown file under a directory, depth-first. A corpus node is a
 *  file, and the folders are how the types are kept apart. */
function markdownUnder(abs: string, rel: string, out: { abs: string; rel: string }[]): void {
  let entries: string[] = [];
  try {
    entries = readdirSync(abs);
  } catch {
    return;
  }
  for (const name of entries) {
    const childAbs = join(abs, name);
    const childRel = `${rel}/${name}`;
    let isDir = false;
    try {
      isDir = statSync(childAbs).isDirectory();
    } catch {
      continue;
    }
    if (isDir) {
      markdownUnder(childAbs, childRel, out);
      continue;
    }
    if (name.endsWith(".md")) out.push({ abs: childAbs, rel: childRel });
  }
}

/** The frontmatter block, or undefined where there is none. Same shape the
 *  write guard uses, and deliberately so — a node the guard would refuse must
 *  be a node the sweep reports, or the two disagree about what is sound. */
function frontmatterBlock(content: string): string | undefined {
  if (!content.startsWith("---\n")) return undefined;
  const end = content.indexOf("\n---", 3);
  if (end < 0) return undefined;
  return content.slice(4, end + 1);
}

/** A RULE THAT CANNOT FIRE READS EXACTLY LIKE A RULE NOTHING VIOLATED, and the
 *  second is the dangerous one because it strengthens with time — nobody
 *  re-examines a check that has been passing for months.
 *
 *  req-an-unbound-rule-is-reported */
function ruleFindings(root: string, rel: string, fm: Record<string, unknown>): Finding[] {
  const out: Finding[] = [];
  const { armed, problems } = rulesOf(fm);
  for (const p of problems) {
    out.push({ kind: "unfinished-rule", path: rel, says: `${p.says} — ${p.said}` });
  }
  for (const rule of armed) {
    if (rule.binds === undefined) continue;
    const target = fileForId(root, rule.binds);
    // TWO WAYS TO BE UNBOUND, and the report says WHICH, because they have
    // different fixes: a broken reference, or a rule aimed at a subject the
    // corpus has no folder for.
    if (target === undefined) {
      out.push({
        kind: "unbound-rule",
        path: rel,
        says: `${rule.key} binds to ${rule.binds}, whose prefix matches no item template — the rule can never fire`,
      });
      continue;
    }
    if (existsSync(join(root, target))) continue;
    out.push({
      kind: "unbound-rule",
      path: rel,
      says: `${rule.key} binds to ${rule.binds}, which the corpus does not hold — expected ${target}, so the rule can never fire`,
    });
  }
  return out;
}

/** SWEEP A TREE. `rel` is root-relative, so `project/spec/trace` sweeps the
 *  whole trace corpus and `project/spec` sweeps everything under it. */
export function sweepCorpus(root: string, rel: string): SweepResult {
  const files: { abs: string; rel: string }[] = [];
  markdownUnder(join(root, rel), rel, files);
  const findings: Finding[] = [];
  for (const f of files) {
    const raw = readNode(f.abs);
    if (raw === "") continue;
    const block = frontmatterBlock(raw);
    if (block === undefined) continue;
    let parsed: unknown;
    try {
      parsed = parseYaml(block);
    } catch (e) {
      // THE GUARD STOPS THESE AT THE WRITE NOW. One found here is either older
      // than the guard or came in outside the lane — a person with an editor,
      // which raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep
      // says is an expected writer.
      findings.push({
        kind: "unparseable",
        path: f.rel,
        says: String((e as Error).message ?? e).split("\n")[0],
      });
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const fm = parsed as Record<string, unknown>;
    const wrong = outsideVocabulary(root, f.rel, fm);
    if (wrong !== undefined) {
      findings.push({
        kind: "outside-vocabulary",
        path: f.rel,
        says: `${wrong.field}: "${wrong.got}" — one of ${wrong.allowed.join(" | ")}`,
      });
    }
    findings.push(...ruleFindings(root, f.rel, fm));
  }
  return { scanned: files.length, findings };
}
