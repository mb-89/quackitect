// The Go topics a reader asks: `quack <topic>` under the method root, and the
// slice's mode a caller reads off its doors. A reader takes the topic where its
// slice reads new, and stays on its old path where the topic answers nothing.
// [[spec/tickets/readers-take-the-go-topics]]

import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { fieldOf } from "../engine/group.js";

// The slice a reader asks, and the mode that answers off the Go topic. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
const NEW = "new";

// The quack binary under a root, the way the index door finds it: the bare name, else its .exe. [[spec/design_output/index#the-door-owns-the-database]]
export function quackAt(files, join, root) {
  const bare = join(root, BIN);
  return [bare, `${bare}.exe`].find((one) => files.exists(one)) ?? bare;
}

// Whether the slice reads new on the caller's doors, which hold the modes under slices. [[spec/tickets/readers-name-one-mode-source]]
export function readsNew(it, slice) {
  return it?.slices?.[slice] === NEW;
}

// Vale's findings as Go names them, and the key two lists of them meet on. [[spec/tickets/prose-checks-run-in-go]]
function bareOf(one) {
  return {
    rule: String(one?.rule ?? ""),
    line: Number(one?.line ?? 0),
    column: Number(one?.column ?? 0),
    said: String(one?.said ?? ""),
  };
}

const keyOf = (one) => Object.values(bareOf(one)).join("\u0000");

// The findings Go's vetoes keep over one text, each as the caller holds it, or null where quack answers nothing a reader takes. [[spec/tickets/prose-checks-run-in-go]]
export function keptOf(it, text, found, mode) {
  const said = topicOf(
    it,
    ["prose"],
    JSON.stringify({ mode, docs: [{ text, found: (found ?? []).map(bareOf) }] }),
  );
  if (said?.docs?.length !== 1 || !Array.isArray(said.docs[0]?.kept)) return null;
  const keep = new Set(said.docs[0].kept.map(keyOf));
  return (found ?? []).filter((one) => keep.has(keyOf(one)));
}

// The parsed JSON `quack` prints for the topic, or null where the binary stands missing, exits non-zero or prints what no reader takes. [[spec/tickets/readers-take-the-go-topics]]
export function topicOf(it, argv, stdin) {
  const root = it.method ?? it.root;
  const binary = quackAt(it.disk, it.join, root);
  if (!it.disk.exists(binary)) return null;
  try {
    const ran = it.proc.run([binary, ...argv], {
      cwd: root,
      ...(stdin === undefined ? {} : { stdin }),
    });
    return ran?.exitCode === 0 ? JSON.parse(String(ran.stdout ?? "")) : null;
  } catch {
    return null;
  }
}

// The rows the config verb prints, off the map `quack config` answers, in key order. [[spec/tickets/cfg-topic-holds-one-resolver]]
export function configRowsOf(answered) {
  if (!answered || typeof answered !== "object" || Array.isArray(answered)) return null;
  try {
    return Object.keys(answered)
      .sort()
      .map((key) => ({
        key,
        value: JSON.parse(answered[key].value),
        layer: String(answered[key].layer ?? ""),
      }));
  } catch {
    return null;
  }
}

// The rows the log verb filters, off the rows `quack log` answers: a broken line stays out, as the old reader drops it, and a row's extra fields ride beside its own. [[spec/tickets/the-log-topic-lands]]
export function logRowsOf(answered) {
  if (!Array.isArray(answered)) return null;
  return answered
    .filter((one) => one && typeof one === "object" && !one.broken)
    .map(({ extra, broken, ...own }) => ({ ...(extra ?? {}), ...own }));
}

// One leaf's notes, off `quack guidance` where the slice reads new and the topic names the leaf, else what the old reader answers. [[spec/tickets/the-guidance-topic-lands]]
export function notesOf(it, leaf, old) {
  if (readsNew(it, "guidance")) {
    const said = topicOf(it, ["guidance"])?.[leaf];
    if (Array.isArray(said)) return said.map(String);
  }
  return old();
}

// The name of the process a ticket names, as the guidance module keys its leaves. [[spec/tickets/the-guidance-topic-lands]]
export function processNameOf(text) {
  return String(fieldOf(text, "process") ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .split("/")
    .pop();
}
