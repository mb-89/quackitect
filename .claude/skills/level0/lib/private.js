// The private half stays home. A raw note under .se carries anything a person
// dumps into it, and a tracked write carrying that note's own words or its own
// tokens comes back refused. Both checks read strings alone, so a caller hands
// the two texts in and a fake disk holds the notes.
// [[spec/design_output/private#the-run-and-the-token]]

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
export function wordsOf(said) {
  return String(said ?? "")
    .toLowerCase()
    .split(/\s+/)
    .flatMap((raw) => {
      const token = raw.replace(/^[^a-z0-9@/\\]+|[^a-z0-9@/\\]+$/g, "");
      if (token === "") return [];
      return HAS_SEPARATOR.test(token)
        ? [token]
        : token.split(/[^a-z0-9]+/).filter((one) => one !== "");
    });
}

// [[spec/design_output/private#the-run-and-the-token]]
export function longestSharedRun(text, noteText) {
  const original = String(text ?? "")
    .split(/\s+/)
    .filter((one) => one !== "");
  const a = wordsOf(text);
  const b = wordsOf(noteText);
  if (!a.length || !b.length) return "";

  let prev = new Array(b.length + 1).fill(0);
  let bestLen = 0;
  let bestEnd = 0;
  for (let i = 1; i <= a.length; i++) {
    const row = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] !== b[j - 1]) continue;
      row[j] = prev[j - 1] + 1;
      if (row[j] > bestLen) {
        bestLen = row[j];
        bestEnd = i;
      }
    }
    prev = row;
  }
  if (!bestLen) return "";

  // [[spec/design_output/private#the-run-and-the-token]]
  const from = bestEnd - bestLen;
  if (original.length === a.length) return original.slice(from, bestEnd).join(" ");
  return a.slice(from, bestEnd).join(" ");
}

// [[spec/design_output/private#what-a-secret-looks-like]]
export function sharedIdentifiers(text, noteText) {
  const inNote = new Set(
    wordsOf(noteText).filter((one) => isIdentifier(one) && one.length >= SHORTEST),
  );
  const out = [];
  for (const one of wordsOf(text)) {
    if (inNote.has(one) && !out.includes(one)) out.push(one);
  }
  return out;
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
