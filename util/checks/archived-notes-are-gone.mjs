// A NOTE WHOSE WORK HAS AN ARCHIVE ROW IS OFF THE DISK, OR IT IS NAMED HERE.
//
// deleted-notes-have-a-row asks the other half of this question: a note taken
// off the disk has a row saying where it went. This asks that a note WITH a row
// is actually gone. The two fail in opposite directions and neither sees the
// other's shape.
//
// A CLOSE MOVES TWO THINGS TOGETHER. It writes the archive row and it deletes
// the note. Only the row is remembered when the change is landed, because the
// note is gone by then and nothing lists it. So the branch takes the row and
// keeps the note, and the record disagrees with itself.
//
// MEASURED, September 2026, over a detached worktree of origin/v4. Of the 32
// notes there carrying bucket claims, 25 already had an archive row saying
// done. Seven were genuinely open. The queue, the burndown and every count
// taken off doc/work read 32.
//
// THE QUEUE ITSELF CANNOT FIX IT. Its pull answers that the clone is behind and
// asks a person to bring doc/work into step. The clone is not behind. It
// deleted the notes when it closed them, and the deletion never travelled.
//
// THE INSTRUMENT IS PROVED BEFORE IT RULES. Two fixtures run under this same
// run, one holding an archived note and one holding none, and this file is run
// over each as a child. A check that cannot redden would pass the branch on the
// day it went wrong.
//
//   node util/checks/archived-notes-are-gone.mjs <root> [--plain]
//
// --plain rules on the root and skips the fixtures, which is how the fixtures
// run this file without it running them again.
//
// reads: doc/work/*.md, doc/work/archive.jsonl
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ?? ".";
const plain = process.argv.includes("--plain");
const me = fileURLToPath(import.meta.url);

let failed = 0;
function fail(said) {
  failed++;
  console.log("FAIL " + said);
}

// rule reads one tree and names every note the archive has already closed.
// It answers how many notes it read, and raises failed for each one named.
function rule(at) {
  const here = join(at, "doc", "work");
  // A ROOT THAT IS NOT THERE IS A FAILURE AND NOT A SKIP. A check guarding
  // nothing says so rather than answering green.
  if (!existsSync(here)) {
    fail("doc/work is not there, so this guards nothing");
    return 0;
  }

  // THE ROWS ARE THE RECORD OF A CLOSE. A line that will not parse is a
  // failure and never a skip, because passing over one would excuse a note.
  const list = join(here, "archive.jsonl");
  const rows = new Map();
  if (existsSync(list)) {
    const lines = readFileSync(list, "utf8").split("\n").filter((l) => l.trim() !== "");
    for (const [i, line] of lines.entries()) {
      try {
        const row = JSON.parse(line);
        if (typeof row.id === "string") rows.set(row.id, row.disposition ?? row.status ?? "archived");
      } catch (e) {
        fail(`line ${i + 1} of doc/work/archive.jsonl will not parse, and the list is the record: ${e.message}`);
      }
    }
  }

  const onDisk = readdirSync(here)
    .filter((name) => name.endsWith(".md"))
    .filter((name) => !statSync(join(here, name)).isDirectory())
    .map((name) => name.slice(0, -".md".length))
    .sort();

  for (const id of onDisk) {
    if (!rows.has(id)) continue;
    fail(
      `doc/work/${id}.md is on the disk and doc/work/archive.jsonl already carries it as ` +
        `${rows.get(id)}. A reader of doc/work counts finished work as open. The close deleted ` +
        `this note and the deletion never travelled, so land the deletion: ` +
        `sh util/git/land.sh "<message>" doc/work/${id}.md doc/work/archive.jsonl`,
    );
  }
  return onDisk.length;
}

// aTree writes the smallest tree this check reads: one archive list and the
// notes named.
function aTree(rows, notes) {
  const at = mkdtempSync(join(tmpdir(), "archived-notes-"));
  const here = join(at, "doc", "work");
  mkdirSync(here, { recursive: true });
  writeFileSync(join(here, "archive.jsonl"), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  for (const id of notes) writeFileSync(join(here, id + ".md"), `---\nstatus: open\n---\n\n## detail\n\na note\n`);
  return at;
}

// overFixture runs this file over one tree and answers its exit and output.
function overFixture(at) {
  try {
    return { exit: 0, said: execFileSync(process.execPath, [me, at, "--plain"], { encoding: "utf8" }) };
  } catch (e) {
    return { exit: e.status ?? 1, said: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

if (!plain) {
  // wk-1111111111 is invented and reads as invented, the way this method's
  // other fixtures name theirs. No minted id looks like that.
  const closed = "wk-1111111111";
  const open = "wk-2222222222";
  const rows = [{ id: closed, disposition: "done" }];

  const red = overFixture(aTree(rows, [closed, open]));
  if (red.exit !== 1) {
    fail(`over a tree holding ${closed}.md with a row for it, this check exited ${red.exit} rather than 1`);
  }
  if (!red.said.includes(closed)) {
    fail(`over that same tree, this check did not name ${closed}, so it says nothing a reader can act on`);
  }
  if (red.said.includes(open)) {
    fail(`over that same tree, this check named ${open}, which has no row and is genuinely open work`);
  }

  const green = overFixture(aTree(rows, [open]));
  if (green.exit !== 0) {
    fail(`over a tree where the archived note is gone, this check exited ${green.exit} rather than 0:\n${green.said}`);
  }

  console.log(`  ok   the instrument reddens on an archived note and passes a tree without one`);
}

const read = rule(root);
console.log(`${read} note(s) on the disk. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
