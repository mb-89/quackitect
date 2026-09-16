// The shape of a full report: the chapters read off spec/config/status.yaml,
// the block that asks for them, and what a reply lacks.
// [[spec/design_output/extension#the-ask-is-a-line]]

import { join } from "node:path";

const SHAPE = "spec/config/status.yaml";

export function statusShape(disk, method) {
  let text = "";
  try {
    text = String(disk.read(join(method, SHAPE)));
  } catch {
    return [];
  }
  const out = [];
  for (const line of text.split("\n")) {
    const name = /^\s*-\s*name:\s*(.+)$/.exec(line);
    const says = /^\s*says:\s*(.+)$/.exec(line);
    if (name) out.push({ name: name[1].trim(), says: "" });
    else if (says && out.length) out[out.length - 1].says = says[1].trim();
  }
  return out;
}

export function statusAsks(chapters) {
  return [
    "Call mcp__level0__report with the status update under these headings, each with text under it:",
    "",
    ...chapters.map((one) => `# ${one.name}: ${one.says}`),
  ].join("\n");
}

export function statusLacks(text, chapters) {
  const lacking = chapters.filter((one) => !carries(text, one.name)).map((one) => one.name);
  if (!lacking.length) return "";
  return `The status update lacks ${lacking.join(", ")}. Write every chapter as a heading with text under it.`;
}

function carries(text, name) {
  const heading = new RegExp(`^#+\\s*${name}\\b[^\\n]*\\n+([^#\\n][^\\n]*)`, "im");
  return heading.test(String(text ?? ""));
}
