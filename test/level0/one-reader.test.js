// The pull and the lint read one evidence field the same way: one Vale call on
// the config the assembly writes, one reading over a file's text, and one level.
// The Vale here behaves: it names a semicolon, and a marker holds it off.
// [[spec/tickets/one-reader-judges-a-verdict]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { UNREASONED } from "../../.claude/skills/level0/lib/vale.js";
import * as findings from "../../src/bridge/findings.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { withPayload } from "../../src/scripts/pull-chapter.js";
import { assemble } from "../../src/scripts/styles.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, heard, ROOT, standing } from "./pull-doors.js";

const VALE = "/tree/.se/.runtime/bin/vale";
const TICKET = "spec/tickets/a-child.md";
const LEAF = "design/review";
const RULE = "VoiceParagraph.Characters";
const OFF = `<!-- vale ${RULE} = NO -->`;
const ON = `<!-- vale ${RULE} = YES -->`;
const LISTED = "- one; two";
const MARKER = /<!--\s*vale\s+(\S+)\s*=\s*(NO|YES)\s*-->/;

// A Vale reading stdin or the files a path reaches, naming a semicolon at warning. [[spec/design_output/doors#a-fake-behaves]]
function behavingVale(disk, ran) {
  return (argv, init = {}) => {
    ran.push({ argv: [...argv], stdin: init.stdin });
    const named = argv.find((one) => one.startsWith("--path="));
    const read =
      init.stdin !== undefined
        ? [[named ? named.slice("--path=".length) : "stdin.md", init.stdin]]
        : argv
            .slice(1)
            .filter((one) => !one.startsWith("--"))
            .flatMap((one) => filesUnder(disk, one));
    const out = {};
    for (const [file, text] of read) {
      const rows = semicolons(text);
      if (rows.length) out[file] = rows;
    }
    return { exitCode: 0, stdout: JSON.stringify(out) };
  };
}

// Every file a path reaches, named relative to the root. [[spec/design_output/doors#a-fake-behaves]]
// A list of a file throws, so the catch reads the file, and an empty folder reads as empty. [[spec/design_output/doors#a-fake-behaves]]
function filesUnder(disk, path) {
  let entries;
  try {
    entries = disk.list(join(ROOT, path));
  } catch {
    return [[path, disk.read(join(ROOT, path))]];
  }
  return entries.flatMap((one) => filesUnder(disk, `${path}/${one.name}`));
}

// [[spec/design_output/doors#a-fake-behaves]]
function semicolons(text) {
  const rows = [];
  let held = false;
  String(text)
    .split("\n")
    .forEach((line, i) => {
      const marker = MARKER.exec(line);
      if (marker && marker[1] === RULE) held = marker[2] === "NO";
      else if (!held && !line.startsWith("<!--") && line.includes(";")) {
        rows.push({
          Check: RULE,
          Line: i + 1,
          Span: [line.indexOf(";") + 1, line.indexOf(";") + 1],
          Match: ";",
          Message: "A character stands outside the set a paragraph admits.",
          Severity: "warning",
        });
      }
    });
  return rows;
}

// A ticket taken at the review leaf, with the Vale above taught. [[spec/design_output/pull#the-voice-reads-the-evidence]]
function atReview(ask = "One piece of it.") {
  const ran = [];
  const text = CHILD("open", LEAF).replace("One piece of it.", ask);
  const { it, disk } = doors(standing(text), {});
  it.proc.teach([VALE], behavingVale(disk, ran));
  it.vale = VALE;
  heard(() => pulling(ROOT, ["pull"], it));
  return { it, disk, ran, text };
}

// [[spec/design_output/pull#the-fields-ride-the-payload]]
function handBack(it, verdict) {
  return heard(() =>
    pulling(ROOT, ["pull", "a-child", "--fields", JSON.stringify({ verdict })], it),
  );
}

// The ticket as the pull holds it once the verdict lies in. [[spec/design_output/pull#the-fields-ride-the-payload]]
function laidIn(text, verdict) {
  return withPayload(text, LEAF, JSON.stringify({ verdict })).text;
}
const lineOf = (text, row) => text.split("\n").indexOf(row) + 1;
const names = (said, rule, line) =>
  said
    .split("\n")
    .some((row) => row.includes(rule) && new RegExp(`\\b${line}\\b`).test(row));

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a verdict carrying a semicolon lands with a warning naming Characters at the ticket's own line, and a semicolon outside the chapter names nothing", () => {
  const { it, ran, text } = atReview("One piece; of it.");
  const verdict = `pass\n\n${LISTED}`;
  const whole = laidIn(text, verdict);
  const line = lineOf(whole, LISTED);
  const ask = lineOf(whole, "One piece; of it.");

  const { code, said } = handBack(it, verdict);

  assert.ok(ran.length, "the pull runs Vale over the verdict");
  assert.equal(code, 0, said);
  assert.match(said, /break a rule of form, and the hand-back lands/);
  assert.ok(
    names(said, "Characters", line),
    `the warning names Characters at line ${line} of ${TICKET}: ${said}`,
  );
  assert.ok(
    !names(said, "Characters", ask),
    "the ask's semicolon stands outside the chapter",
  );
});

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("the pull hands Vale the whole ticket on stdin, on the config the assembly writes, at the ticket's path", () => {
  const { it, disk, ran, text } = atReview();
  const verdict = "pass\n\n- The approach holds.";
  const whole = laidIn(text, verdict);
  const config = assemble(disk, { method: ROOT, work: ROOT, itself: true }).config;

  const { code, said } = handBack(it, verdict);

  assert.equal(code, 0, said);
  const last = ran.at(-1);
  assert.ok(last, "the pull runs Vale");
  assert.ok(last.argv.includes(`--config=${config}`), `argv: ${last.argv.join(" ")}`);
  assert.ok(last.argv.includes(`--path=${TICKET}`), `argv: ${last.argv.join(" ")}`);
  const rows = last.stdin.split("\n");
  assert.equal(
    rows.length,
    whole.split("\n").length,
    "stdin holds every row of the ticket",
  );
  for (const row of ["## review", "- The approach holds."]) {
    assert.equal(rows[lineOf(whole, row) - 1], row, `${row} stands at its file line`);
  }
});

// [[spec/tickets/one-reader-judges-a-verdict]]
test("findings.js names valeArgvOf and readsText, the Vale call and the per-file reading the pull and the lint share", () => {
  assert.equal(typeof findings.valeArgvOf, "function", "valeArgvOf stands exported");
  assert.equal(typeof findings.readsText, "function", "readsText stands exported");
});

const NOTES = "notes/one.md";
const NOTE_TEXT = `# One\n\n${OFF}\nOne; two.\n${ON}\nThree; four.\n`;

function lintDoors(ran) {
  const disk = fakeDisk({ [join(ROOT, NOTES)]: NOTE_TEXT });
  return {
    disk,
    proc: fakeProc({ vale: behavingVale(disk, ran) }),
    join,
    root: ROOT,
    method: ROOT,
    work: ROOT,
    vale: "vale",
    ceilings: { function: 150, file: 600 },
  };
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("the lint runs Vale on the list valeArgvOf builds, and readsText over a file's text names what findingsOver names", async () => {
  assert.equal(typeof findings.valeArgvOf, "function", "valeArgvOf stands exported");
  assert.equal(typeof findings.readsText, "function", "readsText stands exported");
  const ran = [];
  const it = lintDoors(ran);

  const lint = await findings.findingsOver(it, ["notes"]);

  assert.equal(lint.fault, "");
  const built = findings.valeArgvOf(it);
  assert.deepEqual(
    ran[0].argv.slice(0, built.length),
    built,
    "the lint's call opens on valeArgvOf",
  );
  const rows = JSON.parse(behavingVale(it.disk, [])(["vale", NOTES]).stdout)[NOTES];
  const vale = rows.map((row) => ({
    file: NOTES,
    rule: "Characters",
    line: row.Line,
    column: row.Span[0],
    said: row.Match,
    message: row.Message,
    severity: row.Severity,
  }));
  const read = findings.readsText(it, NOTES, NOTE_TEXT, vale);
  assert.deepEqual(findings.linesNamed(read), findings.linesNamed(lint.found));
  assert.deepEqual(findings.linesNamed(lint.found), [
    `${NOTES}:${lineOf(NOTE_TEXT, OFF)}:${UNREASONED}`,
    `${NOTES}:${lineOf(NOTE_TEXT, "Three; four.")}:Characters`,
  ]);
});

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a Vale off marker in a verdict reaches Vale in the pull and holds the rule off, the way it does in the lint", () => {
  const { it, ran, text } = atReview();
  const verdict = `pass\n\n<!-- because: the list names a pair -->\n${OFF}\n${LISTED}\n${ON}`;
  const whole = laidIn(text, verdict);

  const { code, said } = handBack(it, verdict);

  assert.equal(code, 0, said);
  const last = ran.at(-1);
  assert.ok(last, "the pull runs Vale");
  const rows = last.stdin.split("\n");
  assert.equal(
    rows[lineOf(whole, OFF) - 1],
    OFF,
    "the off marker stands in stdin at its file line",
  );
  assert.equal(
    rows[lineOf(whole, ON) - 1],
    ON,
    "the on marker stands in stdin at its file line",
  );
});

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a Vale off marker with no reason in a verdict warns at the hand-back, naming the line the lint names", async () => {
  const { it, text } = atReview();
  const verdict = `pass\n\n${OFF}\n${LISTED}\n${ON}`;
  const whole = laidIn(text, verdict);
  const ran = [];
  const disk = fakeDisk({ [at(TICKET)]: whole });
  const lint = await findings.findingsOver(
    { ...lintDoors(ran), disk, proc: fakeProc({ vale: behavingVale(disk, ran) }) },
    ["spec/tickets"],
  );
  const marker = lineOf(whole, OFF);
  assert.deepEqual(findings.linesNamed(lint.found), [
    `${TICKET}:${marker}:${UNREASONED}`,
  ]);

  const { code, said } = handBack(it, verdict);

  assert.equal(code, 0, said);
  assert.ok(
    names(said, UNREASONED, marker),
    `the warning names ${UNREASONED} at line ${marker}: ${said}`,
  );
});
