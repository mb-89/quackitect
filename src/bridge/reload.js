// The server reads its own code once, and a change to a door or a lib under it
// restarts the server after the tool run that made it, so a fix reaches the
// running session.
// [[spec/design_output/level0#a-fix-reaches-the-session]]

import { join, posix } from "node:path";
import { importsOf, SELF_TEST, TESTING } from "../../.claude/skills/level0/lib/vehicle.js";

export const CODE_ROOTS = [
  "src/bridge",
  // The engine answers the questions the doors ask, so a fix there reaches the session the same way. [[spec/tickets/an-engine-takes-bridge-work]]
  "src/engine",
  "src/doors",
  ".claude/skills/level0/lib",
  ".claude/skills/level0/hooks",
];
// The module the server starts from, so its imports name every module the server runs. [[spec/design_output/level0#a-fix-reaches-the-session]]
export const ENTRY = "src/bridge/server.js";
const AFTER_TOOL = "classic.PostToolUse";

// The scripts the server watches: every one under its roots, and every module the entry imports, however deep. [[spec/design_output/level0#a-fix-reaches-the-session]]
export function watchedOf(disk, method) {
  const out = new Set(listedIn(disk, method));
  const seen = new Set();
  const waiting = [ENTRY];
  while (waiting.length) {
    const path = waiting.pop();
    if (seen.has(path)) continue;
    seen.add(path);
    let text = "";
    try {
      text = String(disk.read(join(method, ...path.split("/"))));
    } catch {
      continue;
    }
    out.add(path);
    for (const one of importsOf(text)) {
      const next = posix.normalize(posix.join(posix.dirname(path), one));
      if (next.endsWith(".js") && !next.startsWith("..")) waiting.push(next);
    }
  }
  return out;
}

function listedIn(disk, method) {
  const out = [];
  for (const folder of CODE_ROOTS) {
    const at = join(method, ...folder.split("/"));
    if (!disk.exists(at)) continue;
    for (const one of disk.list(at)) {
      if (one.kind === "file" && one.name.endsWith(".js"))
        out.push(`${folder}/${one.name}`);
    }
  }
  return out;
}

// Each script answers its time and its size, so a tool run reads no script whole. [[spec/design_output/level0#a-fix-reaches-the-session]]
export function codeOf(disk, method, paths = watchedOf(disk, method)) {
  const out = new Map();
  for (const path of paths) {
    const at = join(method, ...path.split("/"));
    try {
      out.set(path, `${disk.modified(at)}:${disk.size(at)}`);
    } catch {
      // A script standing nowhere stays off the map, so the compare reads it as moved. [[spec/design_output/level0#a-fix-reaches-the-session]]
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

// The box holds the code it started with, and a tool run is the one moment code moves. The roots are listed again, so a script added under one reads as moved. [[spec/design_output/level0#a-fix-reaches-the-session]]
export function movedCode(box, event = "") {
  if (!box.code) {
    box.watched = watchedOf(box.disk, box.method);
    box.code = codeOf(box.disk, box.method, box.watched);
    return "";
  }
  if (event !== AFTER_TOOL) return "";
  const paths = new Set([...(box.watched ?? []), ...listedIn(box.disk, box.method)]);
  const now = codeOf(box.disk, box.method, paths);
  box.seenCode = now;
  // Code that failed its self-test and has not moved since asks for no second test. [[spec/design_output/level0#new-code-proves-it-loads]]
  if (box.failedCode && !movedIn(box.failedCode, now)) return "";
  return movedIn(box.code, now);
}

// The flag and its span stand in lib/vehicle.js, which the start road reads too. [[spec/design_output/level0#new-code-proves-it-loads]]
export { SELF_TEST };

// A child loads the code on the disk and drives it, so a fault shows before the running server steps down. [[spec/design_output/level0#new-code-proves-it-loads]]
export function loadsCode(box, timeoutMs = TESTING) {
  const argv = [box.node, join(box.method, ...ENTRY.split("/")), SELF_TEST, box.method];
  try {
    const ran = box.proc.run(argv, { cwd: box.method, timeoutMs });
    if (ran.exitCode === 0) return { ok: true, why: "" };
    return { ok: false, why: faultIn(ran.stderr) || `the self-test exits ${ran.exitCode}` };
  } catch (error) {
    return { ok: false, why: String(error?.message ?? error) };
  }
}

// The server steps down where the new code passes, and runs on where it fails, with one line for each fault it has not named yet. [[spec/design_output/level0#new-code-proves-it-loads]]
export async function provesCode(box, moved) {
  const test = loadsCode(box);
  if (test.ok) {
    box.selfFault = "";
    box.failedCode = null;
    return true;
  }
  box.failedCode = box.seenCode ?? null;
  if (box.selfFault === test.why) return false;
  box.selfFault = test.why;
  await box.log.say(
    "error",
    "bridge",
    `${moved || "the code"} moved, and the new code fails its self-test, so the server runs on`,
    { file: moved, detail: test.why },
  );
  return false;
}

// The fault the child names: the file and line first, then the first line naming an error, else the first it writes. The log clips a detail, so the place stands ahead of the words. [[spec/design_output/level0#new-code-proves-it-loads]]
export function faultIn(stderr) {
  const lines = String(stderr ?? "")
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean);
  const error =
    lines.find((one) => /\b\w*Error\b/.test(one) && !PLACE.test(one)) ??
    lines.find((one) => /error/i.test(one)) ??
    lines[0] ??
    "";
  const place = lines.map((one) => PLACE.exec(one)?.[0]).find(Boolean) ?? "";
  return place ? `${place}: ${error}` : error;
}

const PLACE = /(?:src|\.claude)\/[\w./-]+\.js:\d+/;
