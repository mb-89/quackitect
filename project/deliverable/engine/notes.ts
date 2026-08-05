// State notes — plain markdown files a drawn state points at. The v2 note
// grammar without the ledger: frontmatter carries the machine-facing fields,
// `## Guidance` and `## Evidence form` are sections, the first `# ` heading
// is the statement.
//
// Frontmatter is REAL YAML (owner ruling: Obsidian-editable). Lists may be
// YAML lists (Obsidian renders them as chips) or comma-separated strings —
// both are accepted everywhere a list is expected. Conditions are FLAT
// keys: exit_read, exit_script, entry_<type> — nested dictionaries render
// as JSON blobs in Obsidian Properties and are refused by the compiler.
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { stripBom } from "./jsonio.ts";

export type FrontmatterValue = unknown;

export interface StateNote {
  frontmatter: Record<string, unknown>;
  statement: string;
  body: string;
}

/** DROP FRONTMATTER KEYS, keeping everything else byte for byte.
 *
 *  A reopened step loses the stamps that assert its claim STANDS, and keeps
 *  the claim. The next walker reads what was said last time and judges it.
 *
 *  Single-line values only, which is what every stamp is. A key whose value
 *  runs over several lines would leave its continuation behind. */
export function stripFrontmatterKeys(raw: string, keys: string[]): string {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return raw;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end < 0) return raw;
  const drop = keys.map((k) => new RegExp(`^${k}\\s*:`));
  const head = lines.slice(1, end).filter((l) => !drop.some((re) => re.test(l)));
  return [lines[0], ...head, ...lines.slice(end)].join("\n");
}

export function parseStateNote(raw: string): StateNote {
  const text = stripBom(raw);
  const lines = text.split(/\r?\n/);
  let frontmatter: Record<string, unknown> = {};
  let bodyStart = 0;
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
    if (end > 0) {
      const block = lines.slice(1, end).join("\n");
      // A person edits these files in the real world, and two engine
      // generations may stamp the same key. The LAST value wins — a pane
      // that dies on a YAML nit is a broken pane, not a strict one.
      const parsed = parseYaml(block, { uniqueKeys: false }) as unknown;
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        frontmatter = parsed as Record<string, unknown>;
      }
      bodyStart = end + 1;
    }
  }
  const body = lines.slice(bodyStart).join("\n");
  const heading = lines.slice(bodyStart).find((l) => l.startsWith("# "));
  return { frontmatter, statement: heading?.replace(/^#\s+/, "").trim() ?? "", body };
}

export function loadStateNote(path: string): StateNote {
  return parseStateNote(readFileSync(path, "utf8"));
}

export function section(body: string, title: string): string {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${title}`);
  if (start === -1) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return rest
    .slice(0, end === -1 ? rest.length : end)
    .join("\n")
    .trim();
}
