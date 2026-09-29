// The prose slice in shadow: wink's answer stands, and the Go vetoes off
// `quack prose` run beside it. Each finding wink and Go keep apart becomes
// one shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/prose-checks-run-in-go]]

import { BIN } from "../../.claude/skills/level0/lib/index.js";

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "prose";
export const KEY = "migration.prose";
export const SHADOW = "shadow";

// The modes a request reads: every veto, or the past veto alone, as src/prose names them. [[spec/tickets/prose-checks-run-in-go]]
export const ALL = "all";
export const PAST = "past";

const KEPT = "kept";
const DROPPED = "dropped";

// The fields a finding carries to Go, which name it on both sides. [[spec/tickets/prose-checks-run-in-go]]
function bareOf(one) {
  return {
    rule: String(one?.rule ?? ""),
    line: Number(one?.line ?? 0),
    column: Number(one?.column ?? 0),
    said: String(one?.said ?? ""),
  };
}

function keyOf(one) {
  const bare = bareOf(one);
  return `${bare.rule}\u0000${bare.line}\u0000${bare.column}\u0000${bare.said}`;
}

// Every finding one side keeps and the other drops, a document at a time. [[spec/tickets/prose-checks-run-in-go]]
export function apartOf(docs, wink, go) {
  const out = [];
  (docs ?? []).forEach((doc, at) => {
    const old = new Map((wink?.[at] ?? []).map((one) => [keyOf(one), one]));
    const now = new Map((go?.[at] ?? []).map((one) => [keyOf(one), one]));
    for (const one of doc.found ?? []) {
      const key = keyOf(one);
      if (old.has(key) === now.has(key)) continue;
      const bare = bareOf(one);
      out.push({
        file: String(doc.file ?? ""),
        line: bare.line,
        column: bare.column,
        rule: bare.rule,
        word: bare.said,
        old: old.has(key) ? KEPT : DROPPED,
        new: now.has(key) ? KEPT : DROPPED,
      });
    }
  });
  return out;
}

// The line a mismatch writes, short enough for one row of the log. [[spec/design_output/log#one-verb-reads-the-log]]
export function saidOf(one) {
  return `${SLICE} in shadow: ${one.file}:${one.line} ${one.rule} on ${JSON.stringify(one.word)} stands ${one.old} by wink, and ${one.new} by Go`;
}

// Go's kept findings a document at a time, parsed off what `quack prose` prints, or null where it printed nothing a reader takes. [[spec/tickets/prose-checks-run-in-go]]
function answeredOf(text, count) {
  try {
    const said = JSON.parse(String(text ?? ""));
    if (!Array.isArray(said?.docs) || said.docs.length !== count) return null;
    return said.docs.map((one) => (Array.isArray(one?.kept) ? one.kept : []));
  } catch {
    return null;
  }
}

// The quack binary under a root, the way the index door finds it: the bare name, else its .exe. [[spec/design_output/index#the-door-owns-the-database]]
export function quackAt(files, join, root) {
  const bare = join(root, BIN);
  return [bare, `${bare}.exe`].find((one) => files.exists(one)) ?? bare;
}

// Where the slice reads shadow, runs `quack prose` once over the documents and writes a row for each finding kept apart. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/prose-checks-run-in-go]]
export async function shadowProse(doors, docs, wink, mode) {
  if (!doors || !(docs ?? []).some((one) => (one.found ?? []).length)) return [];
  if ((await doors.settings.ask(KEY)) !== SHADOW) return [];
  if (!doors.files.exists(doors.binary)) return [];
  const stdin = JSON.stringify({
    mode,
    docs: docs.map((one) => ({
      text: String(one.text ?? ""),
      found: (one.found ?? []).map(bareOf),
    })),
  });
  let ran;
  try {
    ran = await doors.proc.run([doors.binary, "prose"], { cwd: doors.root, stdin });
  } catch {
    return [];
  }
  const go = ran?.exitCode === 0 ? answeredOf(ran.stdout, docs.length) : null;
  if (!go) return [];
  const found = apartOf(docs, wink, go);
  for (const one of found) {
    await doors.log.say("info", SHADOW, saidOf(one), { slice: SLICE, ...one });
  }
  return found;
}
