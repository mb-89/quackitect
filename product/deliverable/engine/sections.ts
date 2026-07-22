// Section addressing over node bodies. A section is a markdown heading and
// everything under it until the next heading of the same or higher level.
// No line-based or string-match editing anywhere (§5) — sections and fields
// are the only body-addressing scheme.

export interface Section {
  heading: string;
  level: number;
  /** Content below the heading line, exclusive of it. */
  content: string;
}

export function listSections(body: string): Section[] {
  const lines = body.split("\n");
  const out: Section[] = [];
  let current: { heading: string; level: number; start: number } | null = null;
  const close = (endExclusive: number) => {
    if (!current) return;
    out.push({
      heading: current.heading,
      level: current.level,
      content: lines.slice(current.start, endExclusive).join("\n").replace(/^\n+|\n+$/g, ""),
    });
  };
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      close(i);
      current = { heading: m[2].trim(), level: m[1].length, start: i + 1 };
    }
  }
  close(lines.length);
  return out;
}

export function getSection(body: string, heading: string): Section | undefined {
  return listSections(body).find((s) => s.heading === heading);
}

/** Replace a section's content; the heading line itself is kept. */
export function replaceSection(body: string, heading: string, content: string): string {
  const lines = body.split("\n");
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (m && m[2].trim() === heading) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start === -1) throw new Error(`section not found: ${heading}`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  const replacement = content.replace(/^\n+|\n+$/g, "");
  return [...lines.slice(0, start + 1), "", replacement, "", ...lines.slice(end)]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}
