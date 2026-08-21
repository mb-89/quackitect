// see dsp-write-guard.md#the-write-guard
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { CLAUSES, Rejection } from "./errors.ts";
import { clusterId } from "./morphbox.ts";
import { brokenHere, rulesOf } from "./rules.ts";
import { fileForId, outsideVocabulary } from "./vocabulary.ts";

const SRC = "engine/guard.ts";

/** THE KEYS THAT CARRY REFERENCES TO OTHER NODES. Every one of them names an
 *  id the corpus is expected to hold.
 *
 *  source_refs IS DELIBERATELY INCLUDED even though it also carries free text
 *  — a URL, a quoted ruling, a page reference. Anything that does not look
 *  like an id is skipped rather than reported, so the loose half costs
 *  nothing and the id half is checked. */
const REFERENCE_KEYS = [
  "refines",
  "satisfies",
  "implements",
  "realizes",
  "verifies",
  "depends_on",
  "source_refs",
  "weighs_with",
  "weighs_against",
  // A CLUSTER IS A REFERENCE LIKE ANY OTHER, and it was the one nobody checked.
  // A function could name a group nobody had declared and nothing said so — the
  // offer a placement picks from is a list of real clusters, and the stored
  // value never had to come from it.
  "cluster",
];

/** A REFERENCE THE CORPUS DOES NOT HOLD. It REPORTS and never refuses.
 *
 *  WHY REPORT. A dangling reference is a CORPUS-WIDE condition — whether it
 *  dangles depends on what else exists, and that changes with the next write.
 *  req-a-standing-break-reports-and-lands rules out refusing on those, and the
 *  practical reason is authoring order: a spec written before the node it
 *  names is normal and refusing it would make the order rigid.
 *
 *  req-a-standing-break-reports-and-lands */
export function danglingReferences(root: string, frontmatter: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const key of REFERENCE_KEYS) {
    const raw = frontmatter[key];
    const values = Array.isArray(raw) ? raw : raw === undefined || raw === null ? [] : [raw];
    for (const v of values) {
      // A CLUSTER IS STORED BARE — `cluster: the-arrival` — and the node it
      // names carries the prefix, so the value is resolved before it is looked
      // up. Every other key already holds a full id.
      const id =
        key === "cluster"
          ? clusterId(String(v))
          : String(v)
              .trim()
              .replace(/^\[\[|\]\]$/g, "");
      if (id === "") continue;
      // ONLY WHAT LOOKS LIKE AN ID IS CHECKED. A source_refs line carrying a
      // sentence, a URL or a quoted ruling is not a reference and reporting it
      // would drown the real findings.
      if (!/^[a-z]+-[a-z0-9-]+$/.test(id)) continue;
      const rel = fileForId(root, id);
      if (rel === undefined) continue;
      if (existsSync(join(root, rel))) continue;
      out.push(`${key}: ${id} resolves to nothing — expected ${rel}`);
    }
  }
  return out;
}

/** THE CORPUS IS THE PART EVERY READER PARSES. A markdown file under the spec
 *  or the machines folder carries frontmatter the engine loads; anything else
 *  is prose or code and this guard has no opinion about it.
 *
 *  THE TEST IS THE PATH, not the content. Guessing from the bytes would refuse
 *  a document that happens to start with three dashes. */
export function isCorpusNode(path: string): boolean {
  const p = path.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return false;
  // THE LEADING SEGMENT COUNTS. A root-relative path opened with the opened
  // folder's name until the levels collapsed, so these folders always had a
  // slash in front. They are the first segment now.
  return /(^|\/)(spec|machines)\//.test(p);
}

/** The frontmatter block, or undefined where there is none. A node without one
 *  is legal — the guard checks what is there, never that something is. */
function frontmatterBlock(content: string): { text: string; firstLine: number } | undefined {
  if (!content.startsWith("---\n")) return undefined;
  const end = content.indexOf("\n---", 3);
  if (end < 0) return undefined;
  return { text: content.slice(4, end + 1), firstLine: 2 };
}

/** THE LINE THE PARSER MEANT, in the whole file rather than in the block.
 *  A reader given "line 9" opens the file at line 9, so the number has to be
 *  the file's. The block starts after the opening delimiter. */
function fileLine(message: string, firstLine: number): number | undefined {
  const m = /line (\d+)/.exec(message);
  if (m === null) return undefined;
  return Number(m[1]) + firstLine - 1;
}

/** THE VALUE THE READER HAS TO LOOK AT. "line 9" is a location; the line
 *  itself is the thing to fix, and quoting it back is what turns a diagnosis
 *  into a remedy. */
function lineAt(content: string, line: number | undefined): string | undefined {
  if (line === undefined) return undefined;
  const lines = content.split("\n");
  return lines[line - 1];
}

/** THE FIX, EXECUTABLE. The overwhelmingly common cause is a colon followed by
 *  a space inside an unquoted scalar, which YAML reads as a nested mapping.
 *  Quoting the value is the whole repair, and showing it beats naming it.
 *
 *  WHERE THE CAUSE IS SOMETHING ELSE the guard says so rather than guessing.
 *  A confident wrong fix is worse than an honest "here is the line". */
function suggest(offending: string | undefined): string {
  if (offending === undefined) return "quote the value, or check the block's delimiters";
  const m = /^(\s*[A-Za-z_][\w-]*):\s+(.*)$/.exec(offending);
  if (m === null) return "quote the value, or check the block's delimiters";
  const key = m[1];
  const value = m[2];
  if (!value.includes(": ")) return "quote the value, or check the block's delimiters";
  const quoted = value.replace(/"/g, '\\"');
  return `${key}: "${quoted}"`;
}

/** REFUSE A WRITE THE ENGINE'S OWN READER COULD NOT PARSE.
 *
 *  IT USES THE SAME yaml PACKAGE EVERY READER USES — four import sites today,
 *  all the same module. A guard more lenient than a reader is a false
 *  assurance, which is worse than no guard because it is trusted
 *  (raid-asm-one-parser-decides-what-parses). */
export function guardParses(root: string, path: string, content: string): string[] {
  if (!isCorpusNode(path)) return [];
  const block = frontmatterBlock(content);
  if (block === undefined) return [];
  let parsed: unknown;
  try {
    parsed = parseYaml(block.text);
  } catch (e) {
    const message = String((e as Error).message ?? e).split("\n")[0];
    const line = fileLine(message, block.firstLine);
    const offending = lineAt(content, line);
    throw new Rejection({
      clause: CLAUSES.CORPUS_UNREADABLE,
      expected: "frontmatter the engine's own reader can parse",
      got: [
        path,
        line === undefined ? message : `line ${String(line)} — ${message}`,
        offending === undefined ? "" : `the line reads: ${offending.trim()}`,
      ]
        .filter((s) => s !== "")
        .join(" · "),
      remedy: {
        tool: "se_file_write",
        args: { path, content: `…\n${suggest(offending)}\n…` },
        note: "a colon followed by a space inside an unquoted YAML value reads as a nested mapping — quote it",
      },
      source: SRC,
    });
  }
  // IT PARSED. Now the second question, and it is a different one: does every
  // key that declares a vocabulary carry a word from it?
  //
  // THIS IS THE CASE THE PARSE CHECK EXPLICITLY SENDS AWAY. `status:
  // part-closed` is perfect YAML and a word nothing accepts. It was written on
  // 2026-08-16, accepted, and trapped the walk eleven calls later naming a
  // state that was entirely fine.
  //
  // req-a-value-outside-its-vocabulary-refuses
  if (typeof parsed !== "object" || parsed === null) return [];
  const wrong = outsideVocabulary(root, path, parsed as Record<string, unknown>);
  if (wrong !== undefined) {
    throw new Rejection({
      clause: CLAUSES.CORPUS_UNREADABLE,
      expected: `${wrong.field}: one of ${wrong.allowed.join(" | ")}`,
      got: `${path} · ${wrong.field}: "${wrong.got}"`,
      remedy: {
        tool: "se_file_write",
        args: { path, content: `…\n${wrong.field}: <${wrong.allowed.join(" | ")}>\n…` },
        note: `"${wrong.got}" is not one of the words this key admits — the list comes from the item template, not from the engine`,
      },
      source: SRC,
    });
  }
  const fm = parsed as Record<string, unknown>;
  // A RULE THAT DOES NOT DECLARE ITS WAY FORWARD DOES NOT ARM, and saying so
  // at the write is the only moment it is cheap. By the time a walk meets a
  // trapping rule, the rule is written, armed and possibly shipped.
  //
  // req-a-check-names-its-way-forward
  const unfinished = rulesOf(fm).problems;
  if (unfinished.length > 0) {
    throw new Rejection({
      clause: CLAUSES.CORPUS_UNREADABLE,
      expected: "every rule declares on_break — one of report | signed | carry",
      got: `${path} · ${unfinished.map((p) => p.says).join(" · ")}`,
      remedy: {
        tool: "se_file_write",
        args: { path, content: "…\nrules:\n  - key: <field>\n    allows: [<word>, <word>]\n    on_break: <report | signed | carry>\n…" },
        note: "a rule with no declared way forward can refuse the very write that repairs it, and the walk then has no legal move",
      },
      source: SRC,
    });
  }
  // A RULE THE NODE DECLARES ON ITSELF FIRES HERE, and the refusal names the
  // node it came from so a reader argues with the rule rather than the engine.
  //
  // req-a-check-binds-without-engine-code
  const broke = brokenHere(fm);
  // `report` NEVER BLOCKS. `signed` and `carry` block until their escape is
  // taken, and taking it is somebody else's mechanism — stamped evidence, or
  // an item carried on the record. At the write, both refuse.
  if (broke !== undefined && broke.rule.onBreak !== "report") {
    const id = String(fm.id ?? path);
    throw new Rejection({
      clause: CLAUSES.CORPUS_UNREADABLE,
      expected: `${broke.rule.key}: one of ${broke.rule.allows.join(" | ")}`,
      got: `${path} · ${broke.rule.key}: "${broke.got}" — the rule is declared on ${id}`,
      remedy: {
        tool: "se_file_write",
        args: { path, content: `…\n${broke.rule.key}: <${broke.rule.allows.join(" | ")}>\n…` },
        note: `the rule lives on ${id}, not in the engine — change the value, or change the rule. Its way forward is "${broke.rule.onBreak}"`,
      },
      source: SRC,
    });
  }
  const standing = danglingReferences(root, fm);
  if (broke !== undefined) {
    standing.push(`${broke.rule.key}: "${broke.got}" — one of ${broke.rule.allows.join(" | ")}, per the rule on ${String(fm.id ?? path)}`);
  }
  return standing;
}
