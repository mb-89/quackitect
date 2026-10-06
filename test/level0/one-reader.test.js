// The pull reads one evidence field the way every reader does: the whole ticket
// through the rules door at the ticket's path, and one level. The rules here
// behave: they name a semicolon, and a marker holds it off.
// [[spec/tickets/one-reader-judges-a-verdict]] [[spec/tickets/vale-leaves-the-tree]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { UNREASONED } from "../../.claude/skills/level0/lib/vale.js";
import { withPayload } from "../../src/scripts/pull-chapter.js";
import { pulling } from "../../src/scripts/work.js";
import { CHILD, doors, heard, ROOT, standing } from "./pull-doors.js";
import { teachRules } from "./quack-doors.js";

const TICKET = "spec/tickets/a-child.md";
const LEAF = "design/review";
const RULE = "VoiceParagraph.Characters";
const OFF = `<!-- vale ${RULE} = NO -->`;
const ON = `<!-- vale ${RULE} = YES -->`;
const LISTED = "- one; two";
const MARKER = /<!--\s*vale\s+(\S+)\s*=\s*(NO|YES)\s*-->/;

// Rules reading stdin under the path the call names, naming a semicolon at warning. [[spec/design_output/doors#a-fake-behaves]]
function behavingRules(ran) {
  return (argv, init = {}) => {
    ran.push({ argv: [...argv], stdin: init.stdin });
    const named = argv.find((one) => one.startsWith("--path="));
    const file = named ? named.slice("--path=".length) : "stdin.md";
    const rows = semicolons(init.stdin ?? "");
    return { exitCode: 0, stdout: JSON.stringify(rows.length ? { [file]: rows } : {}) };
  };
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

// A ticket taken at the review leaf, with the rules above taught. [[spec/design_output/pull#the-voice-reads-the-evidence]]
function atReview(ask = "One piece of it.") {
  const ran = [];
  const text = CHILD("open", LEAF).replace("One piece of it.", ask);
  const { it } = doors(standing(text), {});
  teachRules(it, behavingRules(ran));
  heard(() => pulling(ROOT, ["pull"], it));
  return { it, ran, text };
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

  assert.ok(ran.length, "the pull runs the rules over the verdict");
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
test("the pull hands the rules the whole ticket on stdin, at the ticket's path", () => {
  const { it, ran, text } = atReview();
  const verdict = "pass\n\n- The approach holds.";
  const whole = laidIn(text, verdict);

  const { code, said } = handBack(it, verdict);

  assert.equal(code, 0, said);
  const last = ran.at(-1);
  assert.ok(last, "the pull runs the rules");
  assert.ok(last.argv.includes("rules-over"), `argv: ${last.argv.join(" ")}`);
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

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("an off marker in a verdict reaches the rules in the pull and holds the rule off", () => {
  const { it, ran, text } = atReview();
  const verdict = `pass\n\n<!-- because: the list names a pair -->\n${OFF}\n${LISTED}\n${ON}`;
  const whole = laidIn(text, verdict);

  const { code, said } = handBack(it, verdict);

  assert.equal(code, 0, said);
  const last = ran.at(-1);
  assert.ok(last, "the pull runs the rules");
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
test("an off marker with no reason in a verdict warns at the hand-back, naming its line", () => {
  const { it, text } = atReview();
  const verdict = `pass\n\n${OFF}\n${LISTED}\n${ON}`;
  const whole = laidIn(text, verdict);
  const marker = lineOf(whole, OFF);

  const { code, said } = handBack(it, verdict);

  assert.equal(code, 0, said);
  assert.ok(
    names(said, UNREASONED, marker),
    `the warning names ${UNREASONED} at line ${marker}: ${said}`,
  );
});
