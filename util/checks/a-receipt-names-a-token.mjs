// A RECEIPT NAMING A TOKEN NAMES ONE THAT EXISTS.
//
// The last column of a checklist row is where a hand puts what a reader should
// go and look at. A work id there is a promise that the thing is in the queue,
// and it is how a cleanup gets handed on rather than dropped.
//
// MEASURED, 2026-09-07. wk-4e91c7b3f8 ticked "the cleanup the change revealed
// is in the change, or is a token of its own" with the receipt wk-2493bf564a.
// That id is nowhere: no note under doc/work, no row in the archive, and no
// commit mentions it. The cleanup it stood for was real and correctly found,
// and it went into nobody's queue, because the line recording it rested on an
// id that was never minted.
//
// A TICKED LINE IS A CLAIM THAT SOMETHING WAS DONE. This one said the cleanup
// is carried, so nobody looks again. The check that walks receipts is the only
// thing between that and a cleanup nobody ever does.
//
// THE RECEIPT COLUMN IS WHERE THIS LOOKS, and not the prose. A detail may name
// an id from another branch, a session that has not landed, or a token this box
// has never seen, and be right to. A receipt is narrower: it is what the note
// offers as the place a reader goes next.
//
// AN OPEN NOTE ONLY, because a closed note is history. Its receipts were
// written under the queue as it stood, and rewriting them rewrites the record.
//
// AND THE QUEUE THIS ASKS IS INCOMPLETE, which a reader acting on a failure has
// to know. The archive has lost rows: wk-2a0d33d3be and wk-7a32df0461 are open
// on exactly that, and ids named in src resolve in neither doc/work nor the
// archive. So a failure here means the id cannot be followed from this clone,
// which is worth knowing either way, and not that it was never minted. Telling
// the two apart needs a person and a wider search than this check makes.
//
//   node util/checks/a-receipt-names-a-token.mjs <root>
//
// reads: doc/work/*.md, doc/work/archive.jsonl
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = "doc/work";
const here = join(root, where);

const die = (why) => {
  console.log("FAIL " + why);
  process.exit(1);
};

if (!existsSync(here)) die(where + " is not there, so this guards nothing");

const notes = readdirSync(here)
  .filter((name) => name.endsWith(".md"))
  .filter((name) => !statSync(join(here, name)).isDirectory())
  .sort();
if (notes.length === 0) die(where + " holds no note, so this guards nothing");

// THE QUEUE IS THE NOTES ON DISK AND THE ROWS IN THE ARCHIVE. An id in neither
// is one no reader can follow.
const known = new Set(notes.map((name) => name.slice(0, -".md".length)));
const archive = join(here, "archive.jsonl");
if (!existsSync(archive)) die("doc/work/archive.jsonl is not there, so nothing says what was swept");
for (const line of readFileSync(archive, "utf8").split("\n")) {
  if (line.trim() === "") continue;
  try {
    const row = JSON.parse(line);
    if (typeof row?.id === "string") known.add(row.id);
  } catch { /* a row this cannot read names no id it can trust */ }
}
if (known.size === 0) die("the queue names no token at all, so this check would fail everything");

const anID = /\bwk-[0-9a-f]{10}\b/g;

// theReceipt answers the last column of a checklist row, or nothing. A row is
// pipe separated and ends with one, so the receipt is the field before the end.
function theReceipt(line) {
  const said = line.trim();
  if (!said.startsWith("|") || !said.endsWith("|")) return "";
  const fields = said.slice(1, -1).split("|");
  if (fields.length < 4) return "";
  return fields[fields.length - 1];
}

let read = 0;
let judged = 0;
let failed = 0;

for (const name of notes) {
  const text = readFileSync(join(here, name), "utf8");
  const status = /^status:[ \t]*(\S+)[ \t]*$/m.exec(text);
  if (status !== null && status[1] === "closed") continue;
  read++;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const id of theReceipt(lines[i]).match(anID) ?? []) {
      judged++;
      if (known.has(id)) continue;
      console.log(
        "FAIL " + where + "/" + name + ":" + (i + 1) + " offers " + id + " as its receipt, "
        + "and no note or archive row carries that id. A reader sent there finds nothing, "
        + "and whatever the row was ticked for is in nobody's queue",
      );
      failed++;
    }
  }
}

// A CHECK THAT READS NOTHING IS NOT A GREEN CHECK. What it must read is the
// open notes: a run over them that finds no work id in a receipt has judged a
// tree where nobody offered one, which is a fair answer.
if (read === 0) die(where + " holds no open note, so this check read nothing");

console.log(read + " open note(s) read, " + judged + " receipt(s) judged. " + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
