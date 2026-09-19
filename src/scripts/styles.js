// The rules Vale reads, assembled where two roots hold them. The method's
// styles come down, the project's stand over them by name, and the result is a
// folder nobody edits.
// [[spec/design_output/vehicle#the-styles-assemble-once]]

import { join } from "node:path";
import { CONFIG } from "../../.claude/skills/level0/lib/vale.js";

export const STYLES = "spec/config/styles";
export const INTO = ".se/vale";

// [[spec/design_output/vehicle#the-styles-assemble-once]]
export function assemble(files, pair) {
  if (pair?.itself) return { config: CONFIG, wrote: 0 };
  files.makeDir(join(pair.work, INTO));
  return { config: CONFIG, wrote: 0 };
}
