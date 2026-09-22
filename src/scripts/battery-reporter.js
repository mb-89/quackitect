// The runner's reporter for the battery. The check names it beside the spec
// reporter, and it writes one line a case: the file, the name, the time, and
// the error's first line where the case is red. The battery reads these lines.
// [[spec/design_output/work#the-battery-answers-first]]

import { relative } from "node:path";

const PASS = "test:pass";
const FAIL = "test:fail";

// A file reads relative to where the runner starts, in forward slashes, so a stamp reads the same on every box. [[spec/design_output/work#the-battery-answers-first]]
export function rowOf(event, from) {
  if (event.type !== PASS && event.type !== FAIL) return null;
  const said = event.data ?? {};
  const error = said.details?.error;
  const words = String(error?.cause?.message ?? error?.message ?? "").split(/\r?\n/)[0];
  return {
    file: relative(from, String(said.file ?? "")).split("\\").join("/"),
    name: String(said.name ?? ""),
    nesting: Number(said.nesting) || 0,
    ms: Number(said.details?.duration_ms) || 0,
    ok: event.type === PASS,
    ...(event.type === FAIL ? { said: words } : {}),
  };
}

export default async function* battery(source) {
  const from = process.cwd();
  for await (const event of source) {
    const row = rowOf(event, from);
    if (row) yield `${JSON.stringify(row)}\n`;
  }
}
