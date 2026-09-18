// The push door a terminal meets, fed the lines git pipes, a stamp and the
// delta each ref carries.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  carriedBy,
  holds,
  namesIn,
  rangeOf,
  refsIn,
} from "../../src/scripts/prepush.js";

const SHA = "a1b2c3d4e5f6a7b8";
const WAS = "b7a6f5e4d3c2b1a0";
const ZEROS = "0000000000000000";
const toTrunk = `refs/heads/main ${SHA} refs/heads/main ${ZEROS}\n`;
const toWork = `refs/heads/work/x ${SHA} refs/heads/work/x ${ZEROS}\n`;

const TAGGED = `---\nkind: [[ticket]]\nstate: open\nurgency: whenever\ntodo: true\n---\n\n# Ask\n\nLook at the lint.\n\n# Discussion\n\nNothing yet.\n`;
const FREE = `---\nkind: [[ticket]]\nstate: open\nurgency: whenever\n---\n\n# Ask\n\nLook at the lint.\n\n# Discussion\n\nNothing yet.\n`;

// [[spec/design_output/doors#a-fake-behaves]]
function fakeRepo(names, texts) {
  const runs = [];
  return {
    runs,
    run: (args) => {
      runs.push(args);
      if (args[0] === "log") return { ok: true, out: names.join("\n") };
      const path = String(args[1]).split(":").slice(1).join(":");
      const text = texts[path];
      return text === undefined ? { ok: false, out: "" } : { ok: true, out: text };
    },
  };
}

function stamp(over = {}) {
  return JSON.stringify({ sha: SHA, ok: true, clean: true, at: "now", ...over });
}

test("git's lines read as refs, and a blank line reads as nothing", () => {
  assert.deepEqual(refsIn(`${toTrunk}\n${toWork}`), [
    { local: "refs/heads/main", sha: SHA, remote: "refs/heads/main", was: ZEROS },
    { local: "refs/heads/work/x", sha: SHA, remote: "refs/heads/work/x", was: ZEROS },
  ]);
});

test("a push to a work branch meets no door, whatever the stamp says", () => {
  assert.deepEqual(holds(refsIn(toWork), ""), { code: 0, said: "" });
  assert.deepEqual(holds(refsIn(toWork), stamp({ ok: false })), { code: 0, said: "" });
});

test("a push to trunk on a green stamp lands", () => {
  assert.deepEqual(holds(refsIn(toTrunk), stamp()), { code: 0, said: "" });
});

test("a push to trunk with no check refuses, and says so", () => {
  const said = holds(refsIn(toTrunk), "");
  assert.equal(said.code, 1);
  assert.match(said.said, /no check has run here/);
});

test("a push to trunk on a stale, unclean or red stamp refuses, each by name", () => {
  assert.match(holds(refsIn(toTrunk), stamp({ sha: "ffff" })).said, /ran against ffff/);
  assert.match(holds(refsIn(toTrunk), stamp({ clean: false })).said, /unclean tree/);
  assert.match(holds(refsIn(toTrunk), stamp({ ok: false })).said, /answered red/);
});

test("the refusal names the way out", () => {
  assert.match(holds(refsIn(toTrunk), "").said, /Run `\.\/RUNME\.sh check` last/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a push whose delta carries a tagged note refuses, and names the file", () => {
  const carried = () => [
    { name: "src/scripts/work.js", text: "// code" },
    { name: "spec/tickets/slow-lint.md", text: TAGGED },
  ];
  const said = holds(refsIn(toWork), "", carried);
  assert.equal(said.code, 1);
  assert.match(said.said, /spec\/tickets\/slow-lint\.md/);
  assert.match(said.said, /ticket todo <name> --off/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a push whose delta carries an untagged note lands", () => {
  const carried = () => [{ name: "spec/tickets/slow-lint.md", text: FREE }];
  assert.deepEqual(holds(refsIn(toWork), "", carried), { code: 0, said: "" });
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a range reads the remote sha, and a fresh branch reads every commit no remote holds", () => {
  assert.deepEqual(rangeOf({ sha: SHA, was: WAS }), [`${WAS}..${SHA}`]);
  assert.deepEqual(rangeOf({ sha: SHA, was: ZEROS }), [SHA, "--not", "--remotes"]);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("the delta names the markdown alone, once each, and leaves the rest", () => {
  assert.deepEqual(namesIn("a.md\nsrc/x.js\na.md\n\nb.md"), ["a.md", "b.md"]);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("carriedBy reads every note the range names, and passes a file git lost", () => {
  const repo = fakeRepo(["spec/tickets/slow-lint.md", "gone.md", "src/x.js"], {
    "spec/tickets/slow-lint.md": TAGGED,
  });
  const out = carriedBy(repo)({ sha: SHA, was: WAS });
  assert.deepEqual(out, [{ name: "spec/tickets/slow-lint.md", text: TAGGED }]);
  assert.deepEqual(repo.runs[0], ["log", "--format=", "--name-only", `${WAS}..${SHA}`]);
});
