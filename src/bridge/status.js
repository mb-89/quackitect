// The status update the full ask demands. Its shape stands in a small file,
// one chapter a heading, and a reply fits when every chapter stands with text
// under it. What the reply lacks comes back as the reason it is refused.
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

// The block the full ask rides: the chapters, one a line, with what each says.
export function statusAsks(chapters) {
  return [
    "Write the status update under these headings, each with text under it:",
    "",
    ...chapters.map((one) => `# ${one.name}: ${one.says}`),
  ].join("\n");
}

// Empty where the reply fits, else the chapters it lacks.
export function statusLacks(text, chapters) {
  const lacking = chapters.filter((one) => !carries(text, one.name)).map((one) => one.name);
  if (!lacking.length) return "";
  return `The status update lacks ${lacking.join(", ")}. Write every chapter as a heading with text under it.`;
}

function carries(text, name) {
  const heading = new RegExp(`^#+\\s*${name}\\b[^\\n]*\\n+([^#\\n][^\\n]*)`, "im");
  return heading.test(String(text ?? ""));
}
