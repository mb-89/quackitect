// The owner's prompt comes first, and the gate reads the answer at the turn's
// end. This holds the rules of both doors.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]
// [[spec/design_output/level0#the-gate-reads-the-answer]]

import { SESSION } from "./log.js";
import { scoreOf as score } from "./voice.js";

// [[spec/design_output/level0#which-prompt-opens-a-turn]]
const OPENS = new Set([
  "composer",
  "bridge",
  "sdk",
  "scheduled-trigger",
  "slack-ping",
  "channel",
  "auto-continuation",
]);

// [[spec/design_output/level0#where-it-must-not-bite]]
const REACHES = new Set(["AskUserQuestion"]);

// [[spec/design_output/level0#what-the-refusal-says]]
export const SAYS = [
  "The owner asked something and nothing has answered it. Write the answer in",
  "the chat, as text: what you understood and what you do next. Then work.",
  "The chat pays this door the moment it shows that answer.",
  "The log takes the answer from the chat, so the log tool answers nothing.",
].join("\n");

// [[spec/design_output/level0#a-warning-on-every-call]]
export function warns(why) {
  return [
    `${why}, and nothing has answered it yet. Write the answer in the chat, as`,
    "text before the next tool call: what you understood and what you do next.",
    "Level zero refuses that call until an answer stands in the chat.",
  ].join(" ");
}

// [[spec/design_output/level0#what-the-door-reads]]
export function lastSaid(messages) {
  const rows = Array.isArray(messages) ? messages : [];
  for (let i = rows.length - 1; i >= 0; i--) {
    const text = String(rows[i]?.text ?? "").trim();
    if (rows[i]?.role === "assistant" && text) return text;
  }
  return "";
}

// [[spec/design_output/log#the-answer-under-its-prompt]]
export function answerAfter(messages, seen) {
  const rows = sinceTheOwner(messages);
  const texts = rows.map((one) => String(one?.text ?? "").trim());
  const start = seen ? texts.lastIndexOf(seen) + 1 : 0;
  return rows
    .slice(start)
    .filter((one) => one?.role === "assistant")
    .map((one) => String(one?.text ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
}

function sinceTheOwner(messages) {
  const rows = Array.isArray(messages) ? messages : [];
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i]?.role !== "user") continue;
    if ((rows[i]?.toolResults ?? []).length) continue;
    return rows.slice(i + 1);
  }
  return rows;
}

export function opensATurn(origin) {
  return OPENS.has(String(origin?.kind ?? ""));
}

export function reachesTheOwner(tool) {
  return REACHES.has(String(tool ?? ""));
}

// [[spec/design_output/level0#what-the-door-reads]]
export function spokeSince(messages) {
  return Boolean(answerAfter(messages, ""));
}

// [[spec/design_output/level0#a-note-answers-its-prompt]]
const NOTE_WORD = /\bnotes?\b|\bnoted\b/i;

export function namesNote(text) {
  let fenced = false;
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced && NOTE_WORD.test(line)) return true;
  }
  return false;
}

// [[spec/design_output/level0#a-note-answers-its-prompt]]
export function notesIn(box) {
  return noteRows(box).length;
}

export function newestNote(box) {
  return noteRows(box).at(-1) ?? "";
}

// [[spec/design_output/level0#a-note-answers-its-prompt]]
function noteRows(box) {
  let text = "";
  try {
    text = String(box.disk.read(joinIn(box)));
  } catch {
    return [];
  }
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line);
      if (String(row?.kind ?? "") === "note")
        out.push(String(row.text ?? row.said ?? ""));
    } catch {}
  }
  return out;
}

// A log door built on a root answers the whole path already, and one built on none answers the path under it. [[spec/design_output/level0#a-note-answers-its-prompt]]
function joinIn(box) {
  const path =
    String(box.log?.path ?? "")
      .split("\\")
      .join("/") || SESSION;
  const root = String(box.work ?? "")
    .split("\\")
    .join("/");
  if (!root || path.startsWith(root) || /^([A-Za-z]:)?\//.test(path)) return path;
  return `${root}/${path}`;
}

// [[spec/design_output/level0#the-question-comes-first]]

export const TABLE = "QuestionTable";
const HEADS = ["question", "answer"];

// [[spec/design_output/level0#the-door-counts-the-questions]]
export function questionsIn(text) {
  let fenced = false;
  let count = 0;
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    count += (line.match(/\?+(?=\s|$)/g) ?? []).length;
  }
  return count;
}

// [[spec/design_output/level0#the-table-answers-every-question]]
export function tableFaults(text, asked) {
  const count = Number(asked ?? 0);
  if (!Number.isFinite(count) || count < 1) return [];

  const rows = String(text ?? "").split(/\r?\n/);
  let at = 0;
  while (at < rows.length && !rows[at].trim()) at += 1;
  const block = [];
  for (let i = at; i < rows.length && rows[i].trim(); i++) block.push(rows[i].trim());

  const head = block[0] ?? "";
  const one = (message) => [
    { line: at + 1, column: 1, rule: TABLE, said: head, message },
  ];

  if (!head.startsWith("|")) {
    return one(
      `The prompt asks ${many(count, "question")}, and this answer opens with no table. Open it with a table headed question and answer.`,
    );
  }

  const cells = cellsOf(head).map((cell) => cell.toLowerCase());
  if (HEADS.some((want, i) => cells[i] !== want)) {
    return one(
      `A question table heads its two columns question and answer, and this one reads ${cells.join(", ") || "nothing"}. Write the two names.`,
    );
  }

  const body = block.slice(1).filter((row) => row.startsWith("|") && !ruled(row));
  if (body.length < count) {
    return one(
      `The prompt asks ${many(count, "question")}, and the table holds ${many(body.length, "row")}. Give every question a row, and say what blocks the open ones.`,
    );
  }
  return [];
}

function cellsOf(row) {
  return String(row)
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

// [[spec/design_output/level0#the-table-answers-every-question]]
function ruled(row) {
  return /^\|[\s:|-]+\|?$/.test(row);
}

function many(count, what) {
  return `${count} ${what}${count === 1 ? "" : "s"}`;
}

// [[spec/design_output/level0#the-owner-answers-by-number]]

export const NEEDS = "NeedsTable";
export const NEEDS_HEADING = "What the agent needs";
const NEEDS_HEADS = ["no.", "question", "proposed answer"];
export const CELL_WORDS = 12;

// [[spec/design_output/level0#the-needs-table]]
export function needsFaults(spoken, stopped) {
  if (!stopped) return [];

  const rows = String(spoken ?? "").split(/\r?\n/);
  let end = rows.length - 1;
  while (end >= 0 && !rows[end].trim()) end -= 1;
  let start = end;
  while (start > 0 && rows[start - 1].trim()) start -= 1;
  const block = rows.slice(start, end + 1).map((row) => row.trim());

  let above = start - 1;
  while (above >= 0 && !rows[above].trim()) above -= 1;
  const heading = above >= 0 ? rows[above].trim() : "";

  const at = (line, said, message) => ({ line, column: 1, rule: NEEDS, said, message });
  const shape = `Close it with the heading ${NEEDS_HEADING} and a table headed No., question and proposed answer.`;

  if (end < 0 || !block.every((row) => row.startsWith("|"))) {
    return [
      at(
        Math.max(start, 0) + 1,
        block[0] ?? "",
        `This answer ends on a stop with no table above it. ${shape}`,
      ),
    ];
  }
  if (!new RegExp(`^#{1,6}\\s+${NEEDS_HEADING}\\s*$`, "i").test(heading)) {
    return [
      at(
        start + 1,
        block[0],
        `The table above the stop stands under no heading ${NEEDS_HEADING}. ${shape}`,
      ),
    ];
  }

  const heads = cellsOf(block[0]).map((cell) => cell.toLowerCase());
  if (
    NEEDS_HEADS.some((want, i) => heads[i] !== want) ||
    heads.length !== NEEDS_HEADS.length
  ) {
    return [
      at(
        start + 1,
        block[0],
        `The needs table reads ${heads.join(", ") || "nothing"}. ${shape}`,
      ),
    ];
  }

  const found = [];
  const body = block
    .map((row, i) => ({ row, line: start + i + 1 }))
    .slice(1)
    .filter((one) => !ruled(one.row));
  if (!body.length) {
    return [
      at(
        start + 1,
        block[0],
        "The needs table holds no row. Write one, and where nothing waits, say so in it.",
      ),
    ];
  }
  body.forEach((one, i) => {
    const cells = cellsOf(one.row);
    if (cells[0] !== String(i + 1)) {
      found.push(
        at(
          one.line,
          one.row,
          `Row ${i + 1} of the needs table carries the number ${cells[0] || "nothing"}. Number the rows 1, 2, 3 in order.`,
        ),
      );
    }
    for (const cell of cells.slice(1)) {
      if (cell.includes("`")) {
        found.push(
          at(
            one.line,
            cell,
            "A needs table cell holds no code. Put the detail above the table.",
          ),
        );
      } else if (wordsIn(cell) > CELL_WORDS) {
        found.push(
          at(
            one.line,
            cell,
            `A needs table cell holds ${CELL_WORDS} words, and this one holds ${wordsIn(cell)}. Put the detail above the table.`,
          ),
        );
      }
    }
  });
  return found;
}

export const LENGTH = "AnswerLength";

// [[spec/design_output/level0#the-cap-counts-the-prose]]
export function proseWordsIn(text) {
  const kept = String(text ?? "")
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("|"));
  return wordsIn(kept.join("\n"));
}

// [[spec/design_output/level0#the-cap-counts-the-prose]]
export function lengthFaults(text, most) {
  const cap = Number(most);
  if (!Number.isFinite(cap) || cap < 1) return [];
  const count = proseWordsIn(text);
  if (count <= cap) return [];
  return [
    {
      line: 1,
      column: 1,
      rule: LENGTH,
      said:
        String(text ?? "")
          .trim()
          .split(/\r?\n/)[0] ?? "",
      message: `An answer holds ${cap} words outside its code and tables, and this one holds ${count}. Cut it to ${cap}.`,
    },
  ];
}

// [[spec/design_output/level0#a-shape-finding-rewrites]]
const SHAPES = new Set([TABLE, NEEDS, LENGTH]);

export function shapeIn(found) {
  return (found ?? []).some((one) => SHAPES.has(one?.rule));
}

// [[spec/design_output/level0#the-gate-reads-the-answer]]

export const CHECK = "check_answer";
export const DRAFT = 60;
export const CLEAN = "clean";
export const CARRY = "carry";
export const REWRITE = "rewrite";

// [[spec/design_output/level0#the-score-is-a-rate]]
export function wordsIn(text) {
  let fenced = false;
  let count = 0;
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    for (const one of line.split(/\s+/)) {
      if (/[A-Za-z0-9]/.test(one)) count += 1;
    }
  }
  return count;
}

export function scoreOf(text, found) {
  return score(wordsIn(text), found?.length ?? 0);
}

// [[spec/design_output/level0#the-three-bands]]
export function bandOf(score, bands, found) {
  if (shapeIn(found)) return REWRITE;
  const ceiling = Number(bands?.ceiling);
  const warnAt = Number(bands?.warnAt);
  if (Number.isFinite(ceiling) && score >= ceiling) return REWRITE;
  if (Number.isFinite(warnAt) && score >= warnAt) return CARRY;
  return CLEAN;
}

// [[spec/design_output/level0#the-gate-holds-its-state]]
export function gateOf() {
  let waiting = null;

  return {
    waiting: () => waiting,

    // [[spec/design_output/level0#the-three-bands]]
    atTurnEnd(it) {
      const found = it?.found ?? [];
      const score = scoreOf(it?.text, found);
      const band = found.length ? bandOf(score, it, found) : CLEAN;
      if (band !== CLEAN) waiting = { found, score, band };
      return { score, band, found };
    },

    // [[spec/design_output/level0#the-findings-ride-the-next-call]]
    takeWaiting() {
      const held = waiting;
      waiting = null;
      return held;
    },
  };
}

// [[spec/design_output/level0#the-tool-reads-a-draft]]
export function checkSpec() {
  return {
    name: CHECK,
    description: [
      "Reads a draft answer through the voice rules and answers its findings,",
      "in the wording the gate uses at the turn's end. Check every draft over",
      `${DRAFT} words before you send it, because a draft checked here meets`,
      "the gate clean. Two fields: the text of the draft, and stop, true where",
      "the answer ends on a stop call, so the check demands the needs table.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" }, stop: { type: "boolean" } },
      required: ["text"],
    },
  };
}
