// The Go topics a reader asks: `quack <topic>` under the method root, and the
// slice's mode a caller reads off its doors. A reader takes the topic where its
// slice reads new, and a topic answering nothing there is a fault.
// [[spec/tickets/readers-take-the-go-topics]]

import { join } from "node:path";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { fieldOf } from "../engine/group.js";

// The slice a reader asks, and the mode that answers off the Go topic. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
const NEW = "new";

// The modes a prose request reads: every veto, or the past veto alone, as src/prose names them. [[spec/tickets/prose-checks-run-in-go]]
export const ALL = "all";
export const PAST = "past";

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
  return keptOver(it, [{ text, found }], mode)?.[0] ?? null;
}

// The findings Go's vetoes keep over each document, in one request, so a check pays one process. A document list holding no finding answers itself. [[spec/tickets/go-prose-checks-stand-alone]]
export function keptOver(it, docs, mode) {
  const asked = docs.map((one) => ({ text: one.text, found: one.found ?? [] }));
  if (asked.every((one) => one.found.length === 0)) return asked.map(() => []);
  const said = topicOf(
    it,
    ["prose"],
    JSON.stringify({
      mode,
      docs: asked.map((one) => ({ text: one.text, found: one.found.map(bareOf) })),
    }),
  );
  if (said?.docs?.length !== asked.length) return null;
  if (!said.docs.every((one) => Array.isArray(one?.kept))) return null;
  return asked.map((one, at) => {
    const keep = new Set(said.docs[at].kept.map(keyOf));
    return one.found.filter((row) => keep.has(keyOf(row)));
  });
}

// The parsed JSON `quack` prints for the topic, or null where the binary stands missing, exits non-zero or prints what no reader takes. [[spec/tickets/readers-take-the-go-topics]]
export function topicOf(it, argv, stdin) {
  const root = it.method ?? it.root;
  const binary = quackAt(it.disk, it.join ?? join, root);
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

// The check module's sweep under the paths the lint asks, each row as quack answers it, or null where quack answers nothing a reader takes. [[spec/tickets/the-lsp-server-leaves]]
export function sweepRowsOf(it, where) {
  const said = topicOf(it, ["sweep"]);
  return Array.isArray(said) ? rowsUnder(said, where) : null;
}

// The rows standing on a path asked or under a folder asked, and every row where the whole tree is asked. [[spec/tickets/the-lsp-server-leaves]]
export function rowsUnder(rows, where) {
  if (where.includes(".")) return rows;
  const under = where.map((one) => one.split("\\").join("/").replace(/\/+$/, ""));
  return rows.filter((row) => {
    const file = String(row?.file ?? "");
    return under.some((at) => file === at || file.startsWith(`${at}/`));
  });
}

// The rows the config verb prints, off the map `quack config` answers, in key order. [[spec/tickets/cfg-topic-holds-one-resolver]]
export function configRowsOf(answered) {
  if (!answered || typeof answered !== "object" || Array.isArray(answered)) return null;
  return Object.keys(answered)
    .sort()
    .map((key) => ({
      key,
      value: answered[key]?.value,
      layer: String(answered[key]?.layer ?? ""),
    }));
}

// A reader on a new slice takes its topic's answer, and a topic answering nothing is a fault. [[spec/tickets/topic-fallback-leaves-the-readers]]
export function answerOf(said, topic) {
  if (said === null || said === undefined) {
    throw new Error(
      `quack ${topic} answers nothing a reader takes. Run ./RUNME.sh doctor.`,
    );
  }
  return said;
}

// One leaf's notes, off `quack guidance` where the slice reads new, else what the old reader answers. [[spec/tickets/the-guidance-topic-lands]]
export function notesOf(it, leaf, old) {
  if (!readsNew(it, "guidance")) return old();
  const said = answerOf(topicOf(it, ["guidance"]), "guidance")[leaf];
  return Array.isArray(said) ? said.map(String) : [];
}

// The name of the process a ticket names, as the guidance module keys its leaves. [[spec/tickets/the-guidance-topic-lands]]
export function processNameOf(text) {
  return String(fieldOf(text, "process") ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .split("/")
    .pop();
}
