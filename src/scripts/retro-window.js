// The window a retro reads, cut into chapters that hold activity. Each chapter
// mints a private ticket carrying its counts, so a reader meets the numbers
// before a word. The copy itself stands in retro-collect.js beside this file.
// [[spec/design_input/the-agent-pulls-tickets]]

import { mintedNote } from "../../.claude/skills/level0/lib/schema.js";
import { firstLeaf } from "./group.js";
import { askRows, processAt } from "./process.js";
import { fromHold, NOTES, schemasHere } from "./ticket.js";

const CHAPTER = "chapter";
const WINDOW = "window.json";
// The design fixes a chapter at six hours, and no box moves it. [[spec/design_input/the-agent-pulls-tickets]]
const HOURS = 6;
const MINUTES = 60;
const SECONDS = 60;
const MILLIS = 1000;
const SPAN = HOURS * MINUTES * SECONDS * MILLIS;
// What a log row's kind reads for each count the ask carries. [[spec/design_input/the-agent-pulls-tickets]]
const KINDS = { prompt: "prompts", tool: "tools", bash: "shell", write: "refusals" };

// [[spec/design_input/the-agent-pulls-tickets]]
export function windowOut(it, into, name, rows) {
  const log = loggedIn(it, into, rows);
  const spans = cutInto(log);
  const from = openedAt(it);

  for (const [n, span] of spans.entries()) {
    const why = minted(it, name, n + 1, span);
    // A chapter nobody mints leaves the readers step short, so the verb says which. [[spec/tickets/the-retro-cuts-its-window]]
    if (why) console.error(`${name} chapter ${n + 1} mints nowhere: ${why}`);
  }

  const said = { from, to: tipOf(it), chapters: spans.length, hours: HOURS };
  const text = `${JSON.stringify(said, null, 2)}\n`;
  it.disk.write(it.join(into, WINDOW), text);
  return [{ path: WINDOW, size: text.length, from: WINDOW }];
}

// A window opens where the last retro closes, and at the tree's first commit where none does. [[spec/tickets/the-retro-cuts-its-window]]
function openedAt(it) {
  const closed = closedRetros(it).at(-1);
  return (
    closed ||
    said(it, ["rev-list", "--max-parents=0", "HEAD"]).split("\n").filter(Boolean)[0] ||
    ""
  );
}

function closedRetros(it) {
  const at = it.join(it.root, "spec", "tickets");
  const rows = listed(it, at).filter(
    (one) => one.kind === "file" && one.name.startsWith("retro-"),
  );
  const out = [];
  for (const one of rows) {
    const text = read(it, it.join(at, one.name));
    if (!/^state: closed$/m.test(text)) continue;
    const hash = [...text.matchAll(/^\s+hash_after:\s*(\S+)\s*$/gm)].at(-1);
    if (hash) out.push(hash[1]);
  }
  return out;
}

// A chapter is six hours that hold rows, and a span holding none stands nowhere. [[spec/tickets/the-retro-cuts-its-window]]
function cutInto(log) {
  const times = log
    .map((one) => Date.parse(String(one.at ?? "")))
    .filter(Number.isFinite);
  if (!times.length) return [];
  const opens = Math.floor(Math.min(...times) / SPAN) * SPAN;
  const shuts = Math.max(...times);

  const out = [];
  for (let edge = opens; edge <= shuts; edge += SPAN) {
    const held = log.filter((one) => {
      const time = Date.parse(String(one.at ?? ""));
      return Number.isFinite(time) && time >= edge && time < edge + SPAN;
    });
    if (held.length) out.push({ opens: edge, shuts: edge + SPAN, rows: held });
  }
  return out;
}

// [[spec/tickets/the-retro-cuts-its-window]]
function minted(it, retro, n, span) {
  const name = `${retro}-${CHAPTER}-${n}`;
  const path = `${NOTES}/${name}.md`;
  const at = it.join(it.root, ...path.split("/"));
  if (it.disk.exists(at)) return "";

  const held = processAt(it.disk, it.root, it.join, CHAPTER);
  if (held.why) return held.why;

  const route = fromHold(held.route, null);
  const made = mintedNote(schemasHere(it), {
    kind: "ticket",
    path,
    fields: {
      state: "open",
      urgency: "now",
      group: retro,
      process: held.link,
      process_hash: held.hash,
      steps: route,
      step: firstLeaf(route),
      Ask: [askRows(held.ask), "", asked(span)].join("\n").trim(),
    },
  });
  if (made.why) return made.why;

  it.disk.makeDir(it.join(it.root, ...NOTES.split("/")));
  it.disk.write(at, made.text);
  return "";
}

// The counts stand before anybody reads a word. [[spec/design_input/the-agent-pulls-tickets]]
function asked(span) {
  const held = { prompts: 0, tools: 0, shell: 0, refusals: 0, errors: 0 };
  for (const one of span.rows) {
    const key = KINDS[String(one.kind ?? "")];
    if (key) held[key] += 1;
    if (String(one.level ?? "") === "error") held.errors += 1;
  }
  return [
    `The window runs from ${stamp(span.opens)} to ${stamp(span.shuts)}.`,
    "",
    ...Object.entries(held).map(([key, count]) => `- ${key}: ${count}`),
  ].join("\n");
}

function stamp(ms) {
  return new Date(ms).toISOString();
}

function loggedIn(it, into, rows) {
  const out = [];
  for (const one of rows) {
    if (!String(one.path ?? "").startsWith("log/")) continue;
    for (const line of read(it, it.join(into, ...String(one.path).split("/"))).split(
      "\n",
    )) {
      const held = parsed(line);
      if (held) out.push(held);
    }
  }
  return out;
}

function tipOf(it) {
  return said(it, ["rev-parse", "HEAD"]).trim();
}

function said(it, argv) {
  const ran = it.git.run(argv, true);
  return ran?.ok ? String(ran.out ?? "") : "";
}

function listed(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.list(at) : [];
  } catch {
    return [];
  }
}

function read(it, at) {
  try {
    return it.disk.read(at);
  } catch {
    return "";
  }
}

function parsed(line) {
  try {
    const held = JSON.parse(line);
    return held && typeof held === "object" ? held : null;
  } catch {
    return null;
  }
}
