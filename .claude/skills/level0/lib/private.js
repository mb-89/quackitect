// The private half stays home. A raw note under .se carries anything a person
// dumps into it, and two doors hold it there: the write door refuses a tracked
// write carrying that note's own words or its own tokens, and the commit door
// refuses a delta carrying a shape, the box's own name or a note's text. Every
// check reads strings alone, so a caller hands the texts in.
// [[spec/design_output/private#the-run-and-the-token]]

import { PROSE } from "./vale.js";

export const NOTES = ".se/notes";

export const COPY_RUN = 6;

// [[spec/design_output/private#the-box-names-the-owner]]
export const NOBODY = new Set([
  "user",
  "root",
  "one",
  "somebody",
  "nobody",
  "agent",
  "claude",
  "runner",
  "ubuntu",
  "vscode",
]);

// [[spec/design_output/private#the-box-names-the-owner]]
export function namesAPerson(said) {
  const name = String(said ?? "").trim();
  if (!name) return false;
  return !NOBODY.has(name.toLowerCase());
}

// [[spec/design_output/private#the-box-names-the-owner]]
export function boxOf(env, git) {
  const said = env ?? {};
  const asked = (key) => (git ? git.run(["config", key], true).out : "");
  return {
    user: said.USER || said.USERNAME || said.LOGNAME || "",
    home: said.HOME || said.USERPROFILE || "",
    name: asked("user.name"),
    email: asked("user.email"),
  };
}

// [[spec/design_output/private#the-box-names-the-owner]]
export function carriesTheName(line, name) {
  const said = String(name ?? "");
  if (!said) return false;
  const escaped = said.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`).test(String(line ?? ""));
}

const HAS_SEPARATOR = /[@/\\]|[a-z0-9]\.[a-z0-9]/;
const OPAQUE = /^[a-z0-9._+]{12,}$/;
const SHORTEST = 8;

// [[spec/design_output/private#what-a-secret-looks-like]]
export function isIdentifier(said) {
  const token = String(said ?? "");
  return HAS_SEPARATOR.test(token) || OPAQUE.test(token);
}

// [[spec/design_output/private#the-flatten]]
export function tokensOf(text) {
  const out = [];
  for (const raw of String(text ?? "").split(/\s+/)) {
    const one = raw.toLowerCase().replace(/^[^a-z0-9@/\\]+|[^a-z0-9@/\\]+$/g, "");
    if (one === "") continue;
    if (HAS_SEPARATOR.test(one)) {
      out.push({ flat: one, raw });
      continue;
    }
    for (const part of one.split(/[^a-z0-9]+/).filter((each) => each !== "")) {
      out.push({ flat: part, raw });
    }
  }
  return out;
}

export function wordsOf(said) {
  return tokensOf(said).map((one) => one.flat);
}

// [[spec/design_output/private#the-run-and-the-token]]
export function longestRun(a, b) {
  let prev = new Array(b.length + 1).fill(0);
  let length = 0;
  let end = 0;
  for (let i = 1; i <= a.length; i++) {
    const row = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] !== b[j - 1]) continue;
      row[j] = prev[j - 1] + 1;
      if (row[j] > length) {
        length = row[j];
        end = i;
      }
    }
    prev = row;
  }
  return { length, end };
}

// [[spec/design_output/private#the-run-and-the-token]]
export function longestSharedRun(text, noteText) {
  const original = String(text ?? "")
    .split(/\s+/)
    .filter((one) => one !== "");
  const a = wordsOf(text);
  const run = longestRun(a, wordsOf(noteText));
  if (!run.length) return "";

  const from = run.end - run.length;
  const said = original.length === a.length ? original : a;
  return said.slice(from, run.end).join(" ");
}

// [[spec/design_output/private#what-a-secret-looks-like]]
export function sharedTokens(mine, theirs) {
  const inNote = new Set(
    theirs
      .filter((one) => isIdentifier(one.flat) && one.flat.length >= SHORTEST)
      .map((one) => one.flat),
  );
  const out = [];
  const seen = new Set();
  for (const one of mine) {
    if (!inNote.has(one.flat) || seen.has(one.flat)) continue;
    seen.add(one.flat);
    out.push(one);
  }
  return out;
}

export function sharedIdentifiers(text, noteText) {
  return sharedTokens(tokensOf(text), tokensOf(noteText)).map((one) => one.flat);
}

// [[spec/design_output/private#the-door-reads-the-notes]]
export function carriedFrom(text, notes) {
  const said = Array.isArray(notes) ? notes : [];

  for (const note of said) {
    const tokens = sharedIdentifiers(text, note.text);
    if (tokens.length) return { how: "token", said: tokens[0], note: note.name };
  }
  for (const note of said) {
    const run = longestSharedRun(text, note.text);
    if (wordsOf(run).length >= COPY_RUN) {
      return { how: "run", said: run, note: note.name };
    }
  }
  return null;
}

// [[spec/design_output/private#what-the-refusal-says]]
export function refusedPrivate(where, carried) {
  const count = wordsOf(carried.said).length;
  const head =
    carried.how === "token"
      ? `${where} carries ${JSON.stringify(carried.said)} straight from a note under ${NOTES}.`
      : `${where} carries ${count} words straight from a note under ${NOTES}: "${carried.said}".`;
  const why =
    carried.how === "token"
      ? "An address, a path or a secret is one word, and one word is enough to leak."
      : "A note is a dump and carries anything private. The rewrite is what makes a line safe to commit.";

  return [
    head,
    "",
    why,
    "",
    `Say what the thing is, in words written for a reader outside this box. ${NOTES}`,
    "stays home, git ignores it, and what this tree tracks is the authored half.",
  ].join("\n");
}

// [[spec/design_output/private#the-delta-a-commit-carries]]
const FREE = [/^\.se(\/|$)/, /^\.git(\/|$)/];
const NOWHERE = /(?:^|\.)(?:example\.(?:com|org|net)|example|invalid|localhost|test)$/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const CALLED = /\+\d[\d\s().-]{7,}\d|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/g;
const MONTH =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const DATES = [
  /\b\d{4}-\d{2}-\d{2}\b/g,
  new RegExp(`\\b(?:${MONTH})\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}\\b`, "g"),
  new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTH})\\s+\\d{4}\\b`, "g"),
  new RegExp(`\\b(?:${MONTH})\\s+\\d{4}\\b`, "g"),
];
const HOMES = /(?:\/home\/|\/Users\/|[A-Za-z]:\\Users\\)([A-Za-z0-9._-]+)/g;
const DIGITS = /\d/g;

export const SHAPE = "ShapeStaysHome";
export const BOX = "BoxNameStaysHome";
export const NOTE = "NoteTextStaysHome";

// [[spec/design_output/private#the-delta-a-commit-carries]]
export function addedIn(diff) {
  const out = [];
  let file = "";
  let at = 0;
  let binary = false;

  for (const line of String(diff ?? "").split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      file = "";
      binary = false;
      continue;
    }
    if (line.startsWith("Binary files") || line.startsWith("GIT binary patch")) {
      binary = true;
      continue;
    }
    if (line.startsWith("+++ ")) {
      file = pathIn(line.slice(4));
      continue;
    }
    const hunk = /^@@+ .*\+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunk) {
      at = Number(hunk[1]);
      continue;
    }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    if (file && !binary) out.push({ file, line: at, text: line.slice(1) });
    at++;
  }
  return out;
}

// [[spec/design_output/private#the-three-checks]]
export function shapesIn(added) {
  const out = [];
  for (const one of added) {
    for (const said of matched(one.text, EMAIL)) {
      if (NOWHERE.test(said.slice(said.indexOf("@") + 1))) continue;
      out.push(
        found(SHAPE, one, said, [
          "An email address names a person, and git carries it to everybody.",
          "Say the role this line means, and hold the address under .se.",
        ]),
      );
    }
    for (const said of matched(one.text, CALLED)) {
      if ((said.match(DIGITS) ?? []).length < 8) continue;
      out.push(
        found(SHAPE, one, said, [
          "A phone number reaches one person, and a tracked file reaches the world.",
          "Cut it, and hold it under .se where the box keeps its own.",
        ]),
      );
    }
    if (PROSE.test(one.file)) {
      for (const said of dated(one.text)) {
        out.push(
          found(SHAPE, one, said, [
            "A date in prose says when somebody looks, and a reader acts on none of it.",
            "Drop it, and name the client version where a build matters.",
          ]),
        );
      }
    }
    for (const said of homed(one.text)) {
      out.push(
        found(SHAPE, one, said, [
          `A home path names the person owning the box, and ${[...NOBODY].join(", ")}`,
          "are the users naming nobody. Write the path under one of those, or say $HOME.",
        ]),
      );
    }
  }
  return out;
}

// [[spec/design_output/private#the-three-checks]]
export function boxNamesIn(added, box) {
  const wanted = namesOf(box);
  if (!wanted.length) return [];

  const out = [];
  for (const one of added) {
    for (const name of wanted) {
      if (!carriesTheName(one.text, name.said)) continue;
      out.push(
        found(BOX, one, name.said, [
          `This box answers ${name.said} as ${name.what}, so the line carries the`,
          "person behind the box. Say the role, and let git carry the work alone.",
        ]),
      );
    }
  }
  return out;
}

// [[spec/design_output/private#the-three-checks]]
export function noteTextIn(added, notes) {
  const held = (notes ?? []).filter((one) => String(one?.text ?? "").trim());
  if (!held.length) return [];

  const out = [];
  for (const file of [...new Set(added.map((one) => one.file))]) {
    const mine = added.filter((one) => one.file === file);
    const words = wordsWithLines(mine);
    if (!words.length) continue;

    for (const note of held) {
      const theirs = tokensOf(note.text);
      const run = longestRun(
        words.map((one) => one.flat),
        theirs.map((one) => one.flat),
      );
      if (run.length >= COPY_RUN) {
        const said = words
          .slice(run.end - run.length, run.end)
          .map((one) => one.raw)
          .join(" ");
        out.push(
          found(NOTE, words[run.end - run.length], said, [
            `${run.length} words come straight out of ${note.name}, and a note holds`,
            "what a person dumps there. Say what the thing is, for a reader who",
            "reads no note.",
          ]),
        );
      }
      for (const one of sharedTokens(words, theirs)) {
        out.push(
          found(NOTE, one, one.raw, [
            `${note.name} carries this token, and one token leaks a path, an address`,
            "or a secret. Name what the line means, and leave the token home.",
          ]),
        );
      }
    }
  }
  return out;
}

// [[spec/design_output/private#two-doors-one-check]]
export function privateIn(added, it = {}) {
  const mine = (added ?? []).filter((one) => reaches(one.file));
  if (!mine.length) return [];
  return [
    ...shapesIn(mine),
    ...boxNamesIn(mine, it.box ?? {}),
    ...noteTextIn(mine, it.notes ?? []),
  ];
}

// [[spec/design_output/private#two-doors-one-check]]
export async function privateNow(reach) {
  const added = addedIn(await reach.diff());
  if (!added.length) return [];
  return privateIn(added, { box: await reach.box(), notes: await reach.notes() });
}

export function reaches(file) {
  const said = String(file ?? "");
  return Boolean(said) && !FREE.some((one) => one.test(said));
}

// [[spec/design_output/private#the-three-checks]]
function namesOf(box) {
  const out = [];
  const user = String(box?.user ?? "").trim();
  const home = String(box?.home ?? "").trim();
  const name = String(box?.name ?? "").trim();
  const email = String(box?.email ?? "").trim();

  if (namesAPerson(user)) out.push({ what: "the user of this box", said: user });
  if (home) {
    const last = home.split(/[/\\]+/).filter(Boolean).pop() ?? "";
    if (namesAPerson(last)) out.push({ what: "the home folder here", said: home });
  }
  if (namesAPerson(name)) out.push({ what: "the git name here", said: name });
  if (namesAPerson(email)) out.push({ what: "the git address here", said: email });
  return out;
}

function dated(text) {
  const out = [];
  for (const shape of DATES) out.push(...matched(text, shape));
  return out.filter((said, at) => out.indexOf(said) === at);
}

function homed(text) {
  const out = [];
  for (const one of String(text).matchAll(HOMES)) {
    const who = one[1].replace(/\.+$/, "");
    if (!who || NOBODY.has(who.toLowerCase())) continue;
    out.push(one[0].replace(/\.+$/, ""));
  }
  return out;
}

function matched(text, shape) {
  return [...String(text).matchAll(shape)].map((one) => one[0]);
}

function wordsWithLines(added) {
  const out = [];
  for (const one of added) {
    for (const word of tokensOf(one.text)) {
      out.push({ ...word, file: one.file, line: one.line });
    }
  }
  return out;
}

function pathIn(said) {
  const one = String(said).trim().replace(/^"|"$/g, "");
  if (one === "/dev/null") return "";
  return one.replace(/^[ab]\//, "");
}

function found(rule, where, said, message) {
  return {
    file: where.file,
    line: where.line,
    column: 1,
    rule,
    said,
    message: message.join(" ").replace(/\s+/g, " "),
    severity: "error",
  };
}
