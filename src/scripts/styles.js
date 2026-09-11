// The rules Vale reads, assembled where two roots hold them. The method's
// styles come down, the project's stand over them by name, and the result is
// a derived folder nobody edits.
// [[spec/design_output/vehicle#the-styles-assemble-once]]

import { join } from "node:path";
import { stylesIn } from "../../.claude/skills/level0/lib/layer.js";
import { CONFIG } from "../../.claude/skills/level0/lib/vale.js";

export const STYLES = "spec/config/styles";
export const INTO = ".se/vale";

// [[spec/design_output/vehicle#the-styles-assemble-once]]
export function assemble(files, pair) {
  if (pair.itself) return { config: CONFIG, wrote: 0 };

  const into = join(pair.work, INTO);
  files.remove(into);
  files.makeDir(join(into, "styles"));

  let wrote = 0;
  for (const root of [pair.method, pair.work]) {
    wrote += copied(files, join(root, STYLES), join(into, "styles"));
  }

  const read = readIf(files, join(pair.work, CONFIG)) || readIf(files, join(pair.method, CONFIG));
  const at = join(into, CONFIG);
  files.write(at, stylesIn(read, "styles"));
  return { config: join(INTO, CONFIG), wrote };
}

function copied(files, from, to) {
  let count = 0;
  const walk = (rel) => {
    let entries = [];
    try {
      entries = files.list(rel ? join(from, rel) : from);
    } catch {
      return;
    }
    for (const one of entries) {
      const next = rel ? `${rel}/${one.name}` : one.name;
      if (one.kind === "dir") {
        files.makeDir(join(to, next));
        walk(next);
        continue;
      }
      files.write(join(to, next), files.read(join(from, next)));
      count++;
    }
  };
  walk("");
  return count;
}

function readIf(files, at) {
  try {
    return files.read(at);
  } catch {
    return "";
  }
}
