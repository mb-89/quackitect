// The owner's prompt comes first, and the gate reads the answer at the turn's
// end. This holds both rules: which prompts open a turn a person is waiting on,
// what a refusal says, and the score, the bands and the state of the gate.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]
// [[spec/design_output/level0#the-gate-reads-the-answer]]

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
  "The owner asked something and nothing has answered it. Say back what you",
  "understood and what you do next, then work.",
].join("\n");

// [[spec/design_output/level0#one-warning-then-a-refusal]]
export function warns(why) {
  return [
    `${why}, and nothing has answered it yet. Say back what you understood and`,
    "what you do next before the next tool call. Level zero refuses that call",
    "until an answer stands.",
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
  const words = wordsIn(text);
  const rows = found?.length ?? 0;
  if (!words || !rows) return 0;
  return Math.round((rows / words) * 10000) / 10;
}

// [[spec/design_output/level0#the-three-bands]]
export function bandOf(score, bands) {
  const ceiling = Number(bands?.ceiling);
  const warnAt = Number(bands?.warnAt);
  if (Number.isFinite(ceiling) && score >= ceiling) return REWRITE;
  if (Number.isFinite(warnAt) && score >= warnAt) return CARRY;
  return CLEAN;
}

// [[spec/design_output/level0#the-gate-holds-its-state]]
export function gateOf() {
  let sent = false;
  let inARow = 0;
  let waiting = null;

  return {
    inARow: () => inARow,
    waiting: () => waiting,

    sawPrompt(mine) {
      sent = false;
      if (!mine) inARow = 0;
    },

    // [[spec/design_output/level0#the-carry-rides-a-prompt]]
    takeWaiting() {
      const held = waiting;
      waiting = null;
      return held;
    },

    // [[spec/design_output/level0#the-three-bands]]
    atTurnEnd(it) {
      const found = it?.found ?? [];
      const score = scoreOf(it?.text, found);
      const band = found.length ? bandOf(score, it) : CLEAN;
      const said = { score, band, found, sends: false, runaway: false, held: false };
      if (band === CLEAN) return said;
      if (band === CARRY) {
        waiting = { found, score };
        return said;
      }

      const most = Number(it?.mostInARow ?? 0);
      const runaway = most > 0 && inARow >= most;
      if (sent || runaway || it?.toothSpoke) {
        waiting = { found, score };
        return { ...said, runaway, held: true };
      }
      sent = true;
      inARow += 1;
      return { ...said, sends: true };
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
      "the gate clean. One field: the text of the draft.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  };
}
