// What a commit carries out of this box, and what stays home. The reader takes
// the text of git diff --cached and answers the added lines, and three checks
// read those alone. This module reaches nothing outside itself, so the Bash
// door and the git hook both call it over the same delta.
// [[spec/design_output/private#the-delta-a-commit-carries]]

import { PROSE } from "./vale.js";

export const NOBODY = ["user", "root", "one", "somebody"];
export const NOTES = ".se/notes";
export const RUN = 6;

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
const SEPARATED = /[@/\\]/;
const OPAQUE = /^[a-z0-9._+]{12,}$/;
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
          `A home path names the person owning the box, and ${NOBODY.join(", ")} are`,
          "the users that name nobody. Write the path under one of those, or say $HOME.",
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
      if (!carries(one.text, name.said)) continue;
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
      const theirs = wordsOf(note.text);
      const run = longestRun(words, theirs);
      if (run.length >= RUN) {
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

function namesOf(box) {
  const out = [];
  const user = String(box?.user ?? "").trim();
  const home = String(box?.home ?? "").trim();
  const name = String(box?.name ?? "").trim();
  const email = String(box?.email ?? "").trim();

  if (nameable(user)) out.push({ what: "the user of this box", said: user });
  if (home) {
    const last = home.split(/[/\\]+/).filter(Boolean).pop() ?? "";
    if (nameable(last)) out.push({ what: "the home folder here", said: home });
  }
  if (nameable(name)) out.push({ what: "the git name here", said: name });
  if (email) out.push({ what: "the git address here", said: email });
  return out;
}

function nameable(said) {
  const one = String(said ?? "").trim();
  return one.length >= 3 && !NOBODY.includes(one.toLowerCase());
}

function carries(text, said) {
  const line = String(text);
  for (let at = line.indexOf(said); at >= 0; at = line.indexOf(said, at + 1)) {
    const before = line[at - 1] ?? " ";
    const after = line[at + said.length] ?? " ";
    if (!/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after)) return true;
  }
  return false;
}

function dated(text) {
  const out = [];
  for (const shape of DATES) out.push(...matched(text, shape));
  return out.filter((said, at) => out.indexOf(said) === at);
}

function homed(text) {
  const out = [];
  for (const one of String(text).matchAll(HOMES)) {
    if (NOBODY.includes(one[1].toLowerCase())) continue;
    out.push(one[0]);
  }
  return out;
}

function matched(text, shape) {
  return [...String(text).matchAll(shape)].map((one) => one[0]);
}

// [[spec/design_output/private#the-run-and-the-token]]
export function wordsOf(text) {
  const out = [];
  for (const raw of String(text ?? "").split(/\s+/)) {
    const one = raw.toLowerCase().replace(/^[^a-z0-9@/\\]+|[^a-z0-9@/\\]+$/g, "");
    if (!one) continue;
    if (SEPARATED.test(one)) {
      out.push({ flat: one, raw });
      continue;
    }
    for (const part of one.split(/[^a-z0-9]+/).filter(Boolean)) {
      out.push({ flat: part, raw });
    }
  }
  return out;
}

function wordsWithLines(added) {
  const out = [];
  for (const one of added) {
    for (const word of wordsOf(one.text)) {
      out.push({ ...word, file: one.file, line: one.line });
    }
  }
  return out;
}

// [[spec/design_output/private#the-run-and-the-token]]
export function longestRun(mine, theirs) {
  const a = mine.map((one) => one.flat);
  const b = theirs.map((one) => one.flat);
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
export function sharedTokens(mine, theirs) {
  const opaque = new Set(
    theirs.filter((one) => one.flat.length >= 8 && identifies(one.flat)).map((one) => one.flat),
  );
  const out = [];
  const seen = new Set();
  for (const one of mine) {
    if (!opaque.has(one.flat) || seen.has(one.flat)) continue;
    seen.add(one.flat);
    out.push(one);
  }
  return out;
}

function identifies(said) {
  return SEPARATED.test(said) || OPAQUE.test(said);
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
