// The commit door a person meets. Git runs the hook, the hook pipes the staged
// delta in, and the check the Bash door calls reads the same text. The exit code
// is the answer git reads: zero lets the commit land, one holds it.
// [[spec/design_output/private#two-doors-one-check]]

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxOf as boxIn,
  NOTES,
  privateNow,
} from "../../.claude/skills/level0/lib/private.js";
import { refusedDelta } from "../../.claude/skills/level0/lib/refuse.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { proc } from "../doors/proc.js";

export const STDIN = 0;
export const HOOKS = ".githooks";

export async function holds(it, delta) {
  const found = await privateNow({
    diff: () => String(delta ?? ""),
    box: () => boxOf(it),
    notes: () => notesOf(it),
  });
  if (!found.length) return { code: 0, said: "" };
  return { code: 1, said: refusedDelta(found) };
}

// [[spec/design_output/private#the-box-names-the-owner]]
export function boxOf(it) {
  return boxIn(it.env ?? {}, it.git);
}

export function notesOf(it) {
  const at = it.join(it.root, NOTES);
  if (!it.disk.exists(at)) return [];

  const out = [];
  for (const one of it.disk.list(at)) {
    if (one.kind !== "file") continue;
    out.push({
      name: `${NOTES}/${one.name}`,
      text: it.disk.read(it.join(at, one.name)),
    });
  }
  return out;
}

async function main() {
  const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
  const files = disk();
  const outside = proc();
  const it = { root, disk: files, git: git(outside, root), env: process.env, join };
  const said = await holds(it, files.read(STDIN));
  if (said.code !== 0) console.error(said.said);
  return said.code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(await main());
}
