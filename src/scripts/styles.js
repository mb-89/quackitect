// The rules Vale reads, assembled where two roots hold them. The method's
// styles come down, the project's stand over them by name, and the result is a
// folder nobody edits.
// [[spec/design_output/vehicle#the-styles-assemble-once]]

import { dirname, join } from "node:path";
import { CONFIG, stylesIn } from "../../.claude/skills/level0/lib/vale.js";

export const STYLES = "spec/config/styles";
export const INTO = ".se/vale";
const HERE = "styles";

// [[spec/design_output/vehicle#the-styles-assemble-once]]
export function assemble(files, pair) {
  if (pair?.itself) return { config: CONFIG, wrote: 0 };

  const into = join(pair.work, INTO);
  const at = join(into, CONFIG);
  const config = `${INTO}/${CONFIG}`;
  const held = [pair.method, pair.work].map((root) => ({
    from: join(root, ...STYLES.split("/")),
    names: walked(files, join(root, ...STYLES.split("/"))),
  }));
  const configs = [join(pair.method, CONFIG), join(pair.work, CONFIG)];
  // A hand editing a rule reads the edit on the next lint, and waits for no restart. [[spec/design_output/vehicle#the-styles-assemble-once]]
  if (!moved(files, held, configs, { at, into })) return { config, wrote: 0 };

  files.remove(into);
  let wrote = 0;
  for (const one of held) {
    for (const name of one.names) wrote += copied(files, one.from, into, name);
  }
  files.makeDir(into);
  files.write(
    at,
    stylesIn(readIf(files, configs[1]) || readIf(files, configs[0]), HERE),
  );
  return { config, wrote };
}

function copied(files, from, into, name) {
  const parts = name.split("/");
  const to = join(into, HERE, ...parts);
  files.makeDir(dirname(to));
  files.write(to, files.read(join(from, ...parts)));
  return 1;
}

// The derived folder is the record of what the assembly writes, so a name added, changed or dropped turns the copy over. [[spec/design_output/vehicle#the-styles-assemble-once]]
function moved(files, held, configs, where) {
  const stood = modifiedOf(files, where.at);
  if (!stood) return true;
  if (configs.some((one) => modifiedOf(files, one) > stood)) return true;
  if (!same(held, walked(files, join(where.into, HERE)))) return true;
  for (const one of held) {
    for (const name of one.names) {
      if (modifiedOf(files, join(one.from, ...name.split("/"))) > stood) return true;
    }
  }
  return false;
}

// A source going away moves no time, so the two sets of names answer the drop. [[spec/design_output/vehicle#the-styles-assemble-once]]
function same(held, written) {
  const wanted = new Set(held.flatMap((one) => one.names));
  const stands = new Set(written);
  return wanted.size === stands.size && [...wanted].every((one) => stands.has(one));
}

function walked(files, from) {
  const out = [];
  const step = (rel) => {
    for (const one of listed(files, rel ? join(from, ...rel.split("/")) : from)) {
      const next = rel ? `${rel}/${one.name}` : one.name;
      if (one.kind === "dir") step(next);
      else out.push(next);
    }
  };
  step("");
  return out;
}

function listed(files, at) {
  try {
    return files.exists(at) ? files.list(at) : [];
  } catch {
    return [];
  }
}

function modifiedOf(files, at) {
  try {
    return files.exists(at) ? files.modified(at) : 0;
  } catch {
    return 0;
  }
}

function readIf(files, at) {
  try {
    return files.exists(at) ? files.read(at) : "";
  } catch {
    return "";
  }
}
