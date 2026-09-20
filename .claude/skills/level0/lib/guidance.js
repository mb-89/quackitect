// Reads a guidance note and answers its chapters. Level zero hands the agent
// the Actionables chapter and no other, and the canary says what it handed.
// [[spec/design_output/level0#the-standing-layer]]

export const CHAPTERS = ["Motivation", "Actionables", "Discussion"];

// The opening of a scope entry naming the hand it binds. [[spec/tickets/the-spawn-reaches-its-guidance]]
const KIND = /^([a-z][a-z0-9-]*):\s/;

const CANARY =
  /level0 holds this session: \d+ rules?, \d+ notes?, the stop hook (?:on|off)\./;

// [[spec/design_output/level0#the-canary]]
export const HEARD = {
  same: "the canary opens the answer whole",
  other: "the canary opens the answer with other counts",
  none: "the canary opens no answer",
};

// The line stands set in, on a line of its own. A reader finds it there without reading the wording around it. [[spec/design_output/level0#the-canary]]
export function highlighted(sentence) {
  return `    ${sentence}`;
}

// The wording that owes the line and the wording that pays it draw it the same way, so one reading finds it in both. [[spec/design_output/level0#the-canary]]
function around(before, sentence, after) {
  return [before.join(" "), highlighted(sentence), after.join(" ")].join("\n\n");
}

// [[spec/design_output/level0#the-canary-owes-a-debt]]
export const OWES = {
  warns: (sentence) =>
    around(
      [
        "This session owes the canary. Open your answer with this line, first",
        "and alone, word for word:",
      ],
      sentence,
      [
        "The numbers come from what level zero loaded. Level zero refuses the",
        "next tool call until that line opens an answer. The line ends no turn,",
        "so say what you do next under it and carry on.",
      ],
    ),
  denies: (sentence) =>
    around(
      [
        "This session owes the canary, and no answer opens with it. Open your",
        "next answer with this line, first and alone, word for word:",
      ],
      sentence,
      ["Level zero refuses every tool call until it stands."],
    ),
};

// [[spec/design_output/level0#the-layer-after-a-compaction]]
export const PROBE = {
  variable: "SE_PROBE_COMPACT",
  opens: "Say hello in one line.",
  asks: "Say the canary line again, on its own, and nothing else.",
};

export function parse(text) {
  const body = String(text ?? "").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const out = { front: frontOf(text), chapters: {} };

  let heading = null;
  let held = [];
  const close = () => {
    if (heading) out.chapters[heading] = held.join("\n").trim();
    held = [];
  };

  for (const line of body.split(/\r?\n/)) {
    const found = /^#\s+(.+?)\s*$/.exec(line);
    if (found) {
      close();
      heading = found[1];
      continue;
    }
    if (heading) held.push(line);
  }
  close();
  return out;
}

function frontOf(text) {
  const found = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!found) return {};
  const out = {};
  let list = null;
  for (const line of found[1].split(/\r?\n/)) {
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && list) {
      out[list].push(item[1].trim());
      continue;
    }
    const pair = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    if (pair[2].trim()) {
      list = null;
      out[pair[1]] = pair[2];
    } else {
      out[pair[1]] = [];
      list = pair[1];
    }
  }
  return out;
}

// The mark a rule describing an answer carries, beside the star a rule wanting argument carries. [[spec/design_output/pull#the-checks]]
export const ANSWER_MARK = "^";

// A note writes the mark in a code span, because a paragraph admits the character nowhere else. [[spec/design_output/pull#the-checks]]
const MARK = /\s*`?([*^])`?$/;

function markOf(raw) {
  return MARK.exec(String(raw).trimEnd())?.[1] ?? "";
}

function itemsIn(text) {
  const chapter = parse(text).chapters.Actionables;
  if (!chapter) return [];

  const out = [];
  let held = null;
  for (const line of chapter.split(/\r?\n/)) {
    const found = /^\s*(?:\d+[.)]|[-*+])\s+(.*)$/.exec(line);
    if (found) {
      if (held) out.push(held);
      held = found[1].trim();
      continue;
    }
    if (held && line.trim()) held += ` ${line.trim()}`;
    else if (held) {
      out.push(held);
      held = null;
    }
  }
  if (held) out.push(held);
  return out;
}

function stripped(one) {
  return String(one).replace(MARK, "").trim();
}

export function actionables(text) {
  return itemsIn(text).map(stripped).filter(Boolean);
}

// The rows of the Examples table, which give a hand the shape each rule names. [[spec/design_output/level0#the-examples-ride-the-rules]]
export function examples(text) {
  const chapter = parse(text).chapters.Examples;
  if (!chapter) return [];
  return chapter
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter((one) => one.startsWith("|"));
}

// A note's rules, numbered, and its Examples table under them. [[spec/design_output/level0#the-examples-ride-the-rules]]
export function rulesOf(text) {
  const rules = actionables(text).map((one, i) => `${i + 1}. ${one}`);
  const shown = examples(text);
  return shown.length ? [...rules, "", ...shown] : rules;
}

// The label naming one rule: the note's path under the guidance folder, then its number in that note. [[spec/design_output/pull#the-checks]]
export function labelOf(path, number) {
  const bare = String(path ?? "")
    .replace(/\.md$/, "")
    .replace(/^spec\/guidance\//, "");
  return `${bare.replace(/\//g, "-")}-${number}`;
}

// The rules the judge reads over evidence: the chapter's own numbering, with the marked rules out. [[spec/design_output/pull#the-checks]]
export function forEvidence(text, path) {
  const out = [];
  let number = 0;
  for (const raw of itemsIn(text)) {
    const rule = stripped(raw);
    if (!rule) continue;
    number += 1;
    if (markOf(raw) === ANSWER_MARK) continue;
    out.push({ label: labelOf(path, number), note: String(path ?? ""), number, rule });
  }
  return out;
}

// The entries of a note's scope, whether the frontmatter writes them inline or one to a line. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function scopesIn(text) {
  const said = parse(text).front.scope;
  if (!said) return [];
  if (Array.isArray(said)) return said.map(bare).filter(Boolean);
  const quoted = [...String(said).matchAll(/"([^"]*)"|'([^']*)'/g)].map(
    (one) => one[1] ?? one[2],
  );
  return (quoted.length ? quoted : [bare(said)]).filter(Boolean);
}

// A scope entry opening `<kind>:` binds the note to the hand of that kind, and a note naming no kind reaches every layer. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function kindsOf(text) {
  const found = scopesIn(text)
    .map((one) => KIND.exec(one)?.[1])
    .filter(Boolean);
  return [...new Set(found)];
}

// One layer a kind: the notes binding that kind, beside the notes binding none. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function layersOf(notes) {
  const all = [notes ?? []].flat();
  const free = all.filter((one) => !kindsOf(one.text).length);
  const out = {};
  for (const kind of new Set(all.flatMap((one) => kindsOf(one.text)))) {
    const held = all.filter((one) => kindsOf(one.text).includes(kind));
    out[kind] = standingLayer([...free, ...held]);
  }
  return out;
}

function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^["'[]+|["'\],]+$/g, "")
    .trim();
}

// [[spec/design_output/level0#guidance-a-variable-switches-on]]
export function envOf(text) {
  const said = parse(text).front.env;
  if (!said) return [];
  return (Array.isArray(said) ? said : [said])
    .map((one) => String(one).trim())
    .filter(Boolean);
}

// [[spec/design_output/level0#the-style-carries-a-note]]
export function styled(text) {
  return truthy(parse(text).front.style);
}

export function bindsHere(text, env) {
  const wants = envOf(text);
  if (!wants.length) return true;
  return wants.some((name) => truthy(env?.[name]));
}

function truthy(said) {
  const t = String(said ?? "")
    .trim()
    .toLowerCase();
  return Boolean(t) && t !== "0" && t !== "false";
}

// [[spec/design_output/level0#the-canary]]
export function canary(counts) {
  const rules = counts?.rules ?? 0;
  const notes = counts?.notes ?? 0;
  const tooth = counts?.stop === false ? "off" : "on";
  return `level0 holds this session: ${rules} rules, ${notes} notes, the stop hook ${tooth}.`;
}

// The block the session reads with the canary in it. The line opens the answer, and the stop line closes it. [[spec/design_output/level0#the-canary]]
export function canaryText(sentence) {
  return around(
    ["Open your FIRST answer with this line, first and alone, word for word:"],
    sentence,
    [
      "It says out loud that level zero holds this session, and the numbers",
      "come from what it loaded. Write this line once and never again. The line",
      "opens an answer and ends no turn: a turn ends on the stop line, last and",
      "alone, and the two stand at opposite ends of the same answer.",
    ],
  );
}

// The line stands first, so an answer quoting it later proves nothing. [[spec/design_output/level0#the-canary-opens-an-answer]]
export function canaryIn(answer, said) {
  const first = String(answer ?? "")
    .trim()
    .split("\n")[0]
    .trim();
  const found = CANARY.exec(first);
  if (!found) return { found: "none", said: "" };
  return { found: found[0] === said ? "same" : "other", said: found[0] };
}

export function countsOf(notes) {
  const carrying = notes.filter((one) => actionables(one.text).length);
  return {
    notes: carrying.length,
    rules: carrying.reduce((n, one) => n + actionables(one.text).length, 0),
  };
}

export function standingLayer(notes, read = []) {
  const said = [];
  for (const note of carried(notes, read)) {
    if (!actionables(note.text).length) continue;
    said.push(`### ${titleOf(note)}`);
    said.push("");
    said.push(...rulesOf(note.text));
    said.push("");
  }
  return said.join("\n").trim();
}

// [[spec/design_output/level0#the-helper-takes-the-guidance]]
export function forHelper(standing, prompt) {
  const task = String(prompt ?? "");
  if (!standing) return task;
  return [
    "# How this tree is worked",
    "",
    "These rules reach you before your task does, and they hold over what you",
    "write. Vale holds the mechanical ones at the write door, so a write",
    "breaking one comes back with the reason and the line.",
    "",
    standing,
    "",
    "# Your task",
    "",
    task,
  ].join("\n");
}

// A note a step reads leaves the layer, because the pull hands it with the step. [[spec/design_output/level0#the-standing-layer]]
export function carried(notes, read = []) {
  const dropped = droppedIn(read);
  return [...notes].filter((note) => !dropsHere(note, dropped));
}

function droppedIn(read) {
  return new Set([read].flat().map((one) => String(one).replace(/\.md$/, "")));
}

function dropsHere(note, dropped) {
  const bare = String(note.name ?? "").replace(/\.md$/, "");
  for (const one of dropped) {
    if (one === bare || one.endsWith(`/${bare}`)) return true;
  }
  return false;
}

function titleOf(note) {
  return String(note.name ?? "")
    .replace(/\.md$/, "")
    .replace(/[-_]/g, " ");
}
