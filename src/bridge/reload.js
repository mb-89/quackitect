// The server reads its own code once, and a change to a door or a lib under it
// restarts the server after the tool run that made it, so a fix reaches the
// running session.
// [[spec/design_output/level0#a-fix-reaches-the-session]]

import { join } from "node:path";

export const CODE_ROOTS = [
  "src/bridge",
  "src/doors",
  ".claude/skills/level0/lib",
  ".claude/skills/level0/hooks",
];
const AFTER_TOOL = "classic.PostToolUse";

export function codeOf(disk, method) {
  const out = new Map();
  for (const folder of CODE_ROOTS) {
    const at = join(method, ...folder.split("/"));
    if (!disk.exists(at)) continue;
    for (const one of disk.list(at)) {
      if (one.kind !== "file" || !one.name.endsWith(".js")) continue;
      out.set(`${folder}/${one.name}`, String(disk.read(join(at, one.name))));
    }
  }
  return out;
}

export function movedIn(was, now) {
  for (const [path, text] of now) {
    if (was.get(path) !== text) return path;
  }
  for (const path of was.keys()) {
    if (!now.has(path)) return path;
  }
  return "";
}

// The box holds the code it started with, and a tool run is the one moment code moves. [[spec/design_output/level0#a-fix-reaches-the-session]]
export function movedCode(box, event = "") {
  if (!box.code) {
    box.code = codeOf(box.disk, box.method);
    return "";
  }
  if (event !== AFTER_TOOL) return "";
  return movedIn(box.code, codeOf(box.disk, box.method));
}
