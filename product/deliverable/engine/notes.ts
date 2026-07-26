// State notes — plain markdown files a drawn state points at. The v2 note
// grammar without the ledger: frontmatter carries the machine-facing fields,
// `## Guidance` and `## Evidence form` are sections, the first `# ` heading
// is the statement.
//
// v3 addition (the state gate): `legal` in frontmatter — the tool allowlist
// while this state is active. Comma-separated wire names, or `all`.
import { readFileSync } from "node:fs";
import { stripBom } from "./jsonio.ts";

export type FrontmatterValue = string | Record<string, string>;

export interface StateNote {
  frontmatter: Record<string, FrontmatterValue>;
  statement: string;
  body: string;
}

export function parseStateNote(raw: string): StateNote {
  const text = stripBom(raw);
  const lines = text.split(/\r?\n/);
  const frontmatter: Record<string, FrontmatterValue> = {};
  let bodyStart = 0;
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
    if (end > 0) {
      let openDict: Record<string, string> | undefined;
      for (const line of lines.slice(1, end)) {
        const nested = line.match(/^\s+([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
        if (nested && openDict !== undefined) {
          openDict[nested[1]] = nested[2].trim();
          continue;
        }
        const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
        if (!m) continue;
        if (m[2].trim() === "") {
          openDict = {};
          frontmatter[m[1]] = openDict;
        } else {
          frontmatter[m[1]] = m[2].trim();
          openDict = undefined;
        }
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
