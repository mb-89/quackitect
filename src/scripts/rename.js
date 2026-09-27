// The rename verb. One name moves, and every reach the tree writes moves with
// it: an import, a path, a note link and a word in prose.
// [[spec/design_output/index#a-rename-reaches-a-name]]

import {
  journalOf,
  nameOf,
  FOLDER as UNDONE,
} from "../../.claude/skills/level0/lib/undo.js";
import { CLOSED, fieldOf, TICKETS } from "../engine/group.js";
import { everyHold } from "./guidance-hand.js";

export const BY = "rename";

// The folders a walk leaves alone, as the findings reader leaves them. [[spec/design_output/index#a-rename-reaches-a-name]]
const SKIP = new Set([".git", "node_modules", ".se", ".claude-plugin", "bin"]);
// How far into a file the reader looks for the byte a text file holds nowhere. [[spec/design_output/index#a-rename-reaches-a-name]]
const SNIFF = 4096;

function edged(name) {
  return edgedAny([name]);
}

function edgedAny(names) {
  const said = names.map((one) =>
    String(one).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&"),
  );
  return new RegExp(`(?<![\\w-])(?:${said.join("|")})(?![\\w-])`, "g");
}

// Every form of a name rewrites in one pass, the longest first, so no rewrite meets the text an earlier form wrote. [[spec/tickets/rename-rewrites-each-link-once]]
export function renamedForms(text, forms) {
  const to = new Map(forms.map(([name, other]) => [String(name), String(other)]));
  const names = [...to.keys()].sort((a, b) => b.length - a.length);
  return String(text ?? "").replace(edgedAny(names), (found) => to.get(found));
}

// A closed ticket keeps its text, because the ticket door refuses its fields to every hand. [[spec/tickets/rename-rewrites-each-link-once]]
function keepsItsText(it, file, text) {
  const path = slashed(file.slice(it.root.length + 1));
  return path.startsWith(`${TICKETS}/`) && fieldOf(text, "state") === CLOSED;
}

// A line naming the old name, with the number a reader opens. [[spec/design_output/index#a-rename-reaches-a-name]]
export function reachesIn(text, from) {
  const out = [];
  const rows = String(text ?? "").split("\n");
  for (let at = 0; at < rows.length; at++) {
    if (edged(from).test(rows[at])) out.push({ line: at + 1, said: rows[at] });
  }
  return out;
}

// The text with each reach rewritten, and a longer word left standing. [[spec/design_output/index#a-rename-reaches-a-name]]
export function renamedText(text, from, to) {
  return String(text ?? "").replace(edged(from), String(to));
}

// Every file under a folder, whatever its ending. A caller names the part it wants. [[spec/design_output/index#a-rename-reaches-a-name]]
export function filesUnder(it, where) {
  const out = [];
  const into = (at) => {
    let held;
    try {
      held = it.disk.list(at);
    } catch {
      return;
    }
    for (const one of held) {
      if (SKIP.has(one.name)) continue;
      const next = it.join(at, one.name);
      if (one.kind === "dir") into(next);
      else out.push(next);
    }
  };
  into(where);
  return out.sort();
}

// A text file holds no zero byte, so the reader looks for one and leaves the ending alone. [[spec/design_output/index#a-rename-reaches-a-name]]
export function readsAsText(said) {
  return !String(said ?? "")
    .slice(0, SNIFF)
    .includes("\u0000");
}

// The files a rewrite reads, beside the ones its reader leaves out. A rule that skips says what it skips. [[spec/design_output/index#a-rename-reaches-a-name]]
export function writtenFiles(it, where) {
  const read = [];
  const skipped = [];
  for (const one of filesUnder(it, where)) {
    if (readsAsText(it.disk.read(one))) read.push(one);
    else skipped.push(one);
  }
  read.skipped = skipped;
  return read;
}

// A note reaches a reader two ways, as a path and as a link without its ending. [[spec/design_output/index#a-rename-reaches-a-name]]
export function formsOf(from, to) {
  const out = [[String(from), String(to)]];
  const bare = String(from).replace(/\.md$/, "");
  if (bare !== String(from)) out.push([bare, String(to).replace(/\.md$/, "")]);
  return out;
}

// A name standing as no path, such as a module's, which rewrites and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
export function renamingText(it, from, to) {
  const wrote = [];
  const held = writtenFiles(it, it.root);
  for (const file of held) {
    const text = it.disk.read(file);
    if (keepsItsText(it, file, text)) continue;
    const said = renamedText(text, from, to);
    if (said === text) continue;
    it.disk.write(file, said);
    wrote.push(slashed(file.slice(it.root.length + 1)));
  }
  return { moved: [], wrote, skipped: shortened(it, held.skipped), why: "" };
}

// A path the answer names reads with slashes on every box, the way the tree spells it. [[spec/design_output/index#a-rename-reaches-a-name]]
function slashed(one) {
  return String(one).replaceAll("\\", "/");
}

function shortened(it, files) {
  return [...(files ?? [])].map((one) => slashed(one.slice(it.root.length + 1)));
}

// The move: the folder carries, then every reach rewrites. [[spec/design_output/index#a-rename-reaches-a-name]]
export function renaming(it, from, to) {
  const source = it.join(it.root, ...String(from).split("/"));
  if (!it.disk.exists(source)) {
    return { moved: [], wrote: [], why: `${from} stands nowhere under this tree.` };
  }
  const target = it.join(it.root, ...String(to).split("/"));
  if (it.disk.exists(target)) {
    return { moved: [], wrote: [], why: `${to} stands already, so the move stops.` };
  }

  const held = filesUnder(it, source);
  const journal = movesOf(it, held.length ? held : [source], source, from, to);
  const moved = held.length
    ? held.map((file) => slashed(file.slice(source.length + 1)))
    : [String(to)];
  // The folder moves whole, so a folder the walk skips and a picture's bytes move with it. [[spec/design_output/index#a-rename-reaches-a-name]]
  it.disk.makeDir(it.join(target, ".."));
  it.disk.move(source, target);
  // Every reader of the tree asks git for its file list, so the move reaches git too. [[spec/design_output/index#a-rename-reaches-a-name]]
  it.git?.run(["add", "-A", String(from), String(to)], true);

  const wrote = [];
  const read = writtenFiles(it, it.root);
  for (const file of read) {
    const text = it.disk.read(file);
    if (keepsItsText(it, file, text)) continue;
    const said = renamedForms(text, formsOf(from, to));
    if (said === text) continue;
    it.disk.write(file, said);
    const path = slashed(file.slice(it.root.length + 1));
    wrote.push(path);
    const born = journal.get(path);
    if (born) born.made = said;
    else journal.set(path, { file: path, was: text, made: said });
  }
  journals(it, from, to, [...journal.values()]);
  return { moved, wrote, skipped: shortened(it, read.skipped), why: "" };
}

// Each text file the move carries, as its old path gone and its new path born. A picture's bytes stay out, because the journal holds text. [[spec/tickets/journal-the-rename-verb]]
function movesOf(it, files, source, from, to) {
  const out = new Map();
  for (const file of files) {
    const text = it.disk.read(file);
    if (!readsAsText(text)) continue;
    const under = file === source ? "" : `/${slashed(file.slice(source.length + 1))}`;
    const was = `${from}${under}`;
    const now = `${to}${under}`;
    out.set(was, { file: was, was: text, gone: true });
    out.set(now, { file: now, made: text, born: true });
  }
  return out;
}

// The entry names the ticket the box's one hold carries, so the pass commit of that ticket stages the move. [[spec/design_output/pull#the-refused-commit]]
function journals(it, from, to, files) {
  if (!it.clock || !files.length) return;
  const stamp = it.clock.stamp();
  // The move rides the entry, so the commit verb lands the old path where git reads no rename. [[spec/tickets/rename-detection-misses-rewrites]]
  const entry = {
    ...journalOf(stamp, `${BY}:${stamp}`, BY, files, heldTicket(it)),
    moved: { from: String(from), to: String(to) },
  };
  it.disk.makeDir(it.join(it.root, ...UNDONE.split("/")));
  it.disk.write(
    it.join(it.root, ...UNDONE.split("/"), nameOf(stamp)),
    `${JSON.stringify(entry, null, 2)}\n`,
  );
}

// Several holds name several tickets, and a move belongs to none of them alone. [[spec/tickets/journal-the-rename-verb]]
function heldTicket(it) {
  const named = new Set(
    everyHold(it)
      .map(({ held }) => String(held?.ticket ?? ""))
      .filter(Boolean),
  );
  return named.size === 1 ? [...named][0] : "";
}
