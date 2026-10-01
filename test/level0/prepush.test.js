// The push door a terminal meets, fed the lines git pipes, a stamp and the
// delta each ref carries.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import {
  agentPushes,
  carriedBy,
  checkedThroughBy,
  holds,
  lintedBy,
  namesIn,
  rangeOf,
  heldBy as readsHold,
  heldAtTip,
  refsIn,
  staleBy,
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
  return JSON.stringify({
    sha: SHA,
    ok: true,
    clean: true,
    at: "now",
    ...over,
  });
}

test("git's lines read as refs, and a blank line reads as nothing", () => {
  assert.deepEqual(refsIn(`${toTrunk}\n${toWork}`), [
    {
      local: "refs/heads/main",
      sha: SHA,
      remote: "refs/heads/main",
      was: ZEROS,
    },
    {
      local: "refs/heads/work/x",
      sha: SHA,
      remote: "refs/heads/work/x",
      was: ZEROS,
    },
  ]);
});

// The owner's own terminal push meets no stamp. [[spec/tickets/push-gate-needs-the-engine]]
test("an owner's push to a work branch meets no door, whatever the stamp says", () => {
  const owner = (text) => holds(refsIn(toWork), text, () => [], false, () => "", "", false);
  assert.deepEqual(owner(""), { code: 0, said: "" });
  assert.deepEqual(owner(stamp({ ok: false })), { code: 0, said: "" });
});

// [[spec/tickets/level0-runs-on-the-door]]
test("an agent's push to a work branch takes the green stamp, and a red, absent or unclean one refuses", () => {
  assert.deepEqual(holds(refsIn(toWork), stamp()), { code: 0, said: "" });
  for (const [text, says] of [
    ["", /no check has run here/],
    [stamp({ ok: false }), /answered red/],
    [stamp({ clean: false }), /unclean tree/],
  ]) {
    const said = holds(refsIn(toWork), text);
    assert.equal(said.code, 1);
    assert.match(said.said, says);
    assert.match(said.said, /work\/x takes a push the check has passed/);
    assert.match(said.said, /\.\/RUNME\.sh check/);
  }
});

// [[spec/tickets/level0-runs-on-the-door]]
test("an agent's push past the checked commit lands where ticket state alone changed since, and refuses where code did", () => {
  const past = stamp({ sha: WAS });
  const reaches = (from, to) => from === WAS && to === SHA;
  const args = (through) => [() => [], false, () => "", "", true, () => false, () => null, through];

  assert.deepEqual(holds(refsIn(toWork), past, ...args(reaches)), { code: 0, said: "" });
  const said = holds(refsIn(toWork), past, ...args(() => false));
  assert.equal(said.code, 1);
  assert.match(said.said, /or code changed since/);
});

// [[spec/tickets/level0-runs-on-the-door]]
test("the stamp reaches a tip on its commit whose changes lie under the tickets folder alone", () => {
  const repo = (ancestor, names) => ({
    run: (args) =>
      args[0] === "merge-base"
        ? { ok: ancestor, out: "" }
        : { ok: true, out: names.join("\n") },
  });

  assert.equal(checkedThroughBy(repo(true, ["spec/tickets/a.md"]))(WAS, SHA), true);
  assert.equal(
    checkedThroughBy(repo(true, ["spec/tickets/a.md", "src/x.js"]))(WAS, SHA),
    false,
  );
  assert.equal(checkedThroughBy(repo(false, []))(WAS, SHA), false);
  assert.equal(checkedThroughBy(repo(true, []))("", SHA), false);
});

// [[spec/tickets/level0-runs-on-the-door]]
test("a cloud box, the engine and a Claude Code session push as agents, and a bare terminal as the owner", () => {
  assert.equal(agentPushes({ CLAUDE_CODE_REMOTE: "true" }), true);
  assert.equal(agentPushes({ SE_ENGINE: "1" }), true);
  assert.equal(agentPushes({ CLAUDECODE: "1" }), true);
  assert.equal(agentPushes({}), false);
});

// [[spec/tickets/cloud-boxes-leave-trunk-alone]]
test("a cloud box pushing main meets the refusal, whatever the battery says", () => {
  for (const text of [stamp(), ""]) {
    const said = holds(refsIn(toTrunk), text, () => [], true);
    assert.equal(said.code, 1);
    assert.match(said.said, /its own work branch/);
    assert.match(said.said, /\.\/RUNME\.sh branch merge/);
  }
});

// [[spec/tickets/cloud-boxes-leave-trunk-alone]]
test("a cloud box pushes its own work branch", () => {
  assert.deepEqual(
    holds(refsIn(toWork), stamp(), () => [], true),
    { code: 0, said: "" },
  );
});

// [[spec/tickets/one-writer-holds-a-branch]]
const HOLDER = "box 0ther1d · session s1 · claude-code-remote";
const heldBy = (hand) => () => hand;

// [[spec/tickets/one-writer-holds-a-branch]]
test("a push to a work branch another box holds refuses, and names the holder and main", () => {
  const said = holds(refsIn(toWork), stamp(), () => [], false, heldBy(HOLDER), "myb0x");
  assert.equal(said.code, 1);
  assert.match(said.said, /work\/x/);
  assert.match(said.said, /box 0ther1d/);
  assert.match(said.said, /main/);
  assert.match(said.said, /branch sync/);
});

// [[spec/tickets/one-writer-holds-a-branch]]
test("the holding box pushes its own branch", () => {
  const said = holds(
    refsIn(toWork),
    stamp(),
    () => [],
    true,
    heldBy(HOLDER),
    "0ther1d",
  );
  assert.deepEqual(said, { code: 0, said: "" });
});

// The hold the pushed tip carries: the take writes this box, a plain push keeps the holder, and a release writes nobody. [[spec/tickets/stale-hold-moves-by-take]]
const TAKER = "box myb0x · session s2 · claude-code-remote";
const pushedOver = (stale, atTip) =>
  holds(
    refsIn(toWork),
    stamp(),
    () => [],
    true,
    heldBy(HOLDER),
    "myb0x",
    true,
    () => stale,
    () => atTip,
  );

// [[spec/tickets/stale-hold-moves-by-take]]
test("a plain push onto a stale hold refuses, and names the take", () => {
  const said = pushedOver(true, HOLDER);
  assert.equal(said.code, 1);
  assert.match(said.said, /box 0ther1d/);
  assert.match(said.said, /\.\/RUNME\.sh branch take x/);
});

// [[spec/tickets/stale-hold-moves-by-take]]
test("a take or a release onto a stale hold lands", () => {
  assert.deepEqual(pushedOver(true, TAKER), { code: 0, said: "" });
  assert.deepEqual(pushedOver(true, ""), { code: 0, said: "" });
});

// [[spec/tickets/stale-hold-moves-by-take]]
test("a stale hold whose tip reads nothing refuses", () => {
  assert.equal(pushedOver(true, null).code, 1);
});

// [[spec/tickets/stale-hold-moves-by-take]]
test("a fresh hold refuses a plain push and a take alike", () => {
  for (const atTip of [HOLDER, TAKER, ""]) {
    const said = pushedOver(false, atTip);
    assert.equal(said.code, 1);
    assert.match(said.said, /box 0ther1d/);
  }
});

// [[spec/tickets/stale-hold-moves-by-take]]
test("the tip reader reads the group ticket at the pushed sha, and null where it reads nothing", () => {
  const held = `---\nkind: [[ticket]]\nstate: open\nrecord:\n  - step: sync\n    hand: ${TAKER}\n    hash_before: ${SHA}\n---\n`;
  const [work] = refsIn(toWork);
  const repo = fakeRepo([], { "spec/tickets/x.md": held });
  assert.equal(heldAtTip(repo)(work), TAKER);
  assert.deepEqual(repo.runs.at(-1), ["show", `${SHA}:spec/tickets/x.md`]);
  assert.equal(heldAtTip(fakeRepo([], { "spec/tickets/x.md": FREE }))(work), "");
  assert.equal(heldAtTip(fakeRepo([], {}))(work), null);
});

// The age of the tip on origin against the span, read the way the list reads it. [[spec/tickets/stale-hold-frees-the-branch]]
test("the stale reader reads the origin tip's time against the span", () => {
  const now = Date.parse("2026-01-01T12:00:00.000Z");
  const at = (ago) => ({
    run: (args) =>
      args.join(" ") === "log -1 --format=%ct origin/work/x"
        ? { ok: true, out: String(Math.floor(now / 1000) - ago) }
        : { ok: false, out: "" },
  });
  const ref = refsIn(toWork)[0];
  assert.equal(staleBy(at(31 * 60), "30m", now)(ref), true);
  assert.equal(staleBy(at(29 * 60), "30m", now)(ref), false);
  assert.equal(
    staleBy({ run: () => ({ ok: false, out: "" }) }, "30m", now)(ref),
    false,
  );
});

// [[spec/tickets/one-writer-holds-a-branch]]
test("a push to a work branch nobody holds lands", () => {
  const said = holds(refsIn(toWork), stamp(), () => [], false, heldBy(""), "myb0x");
  assert.deepEqual(said, { code: 0, said: "" });
});

// [[spec/tickets/push-gate-needs-the-engine]]
test("a push with no engine running and a stale stamp lands", () => {
  const said = holds(
    refsIn(toTrunk),
    stamp({ sha: "ffff" }),
    () => [],
    false,
    () => "",
    "",
    false,
  );
  assert.deepEqual(said, { code: 0, said: "" });
});

// [[spec/tickets/push-gate-needs-the-engine]]
test("a push with the engine running and a stale stamp comes back refused", () => {
  const said = holds(
    refsIn(toTrunk),
    stamp({ sha: "ffff" }),
    () => [],
    false,
    () => "",
    "",
    true,
  );
  assert.equal(said.code, 1);
  assert.match(said.said, /ran against ffff/);
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

// [[spec/design_output/work#the-battery-answers-first]]
test("a push to trunk over a stamp counting warnings refuses, and names the lint", () => {
  const said = holds(
    refsIn(toTrunk),
    stamp({ warnings: 2, files: ["spec/a.md", "spec/b.md"] }),
  );
  assert.equal(said.code, 1);
  assert.match(said.said, /2 warning\(s\) stand in 2 file\(s\)/);
  assert.match(said.said, /RUNME\.sh lint/);
  assert.equal(
    holds(refsIn(toWork), stamp({ warnings: 2 })).code,
    1,
    "an agent's work branch takes no warning either",
  );
  assert.deepEqual(holds(refsIn(toTrunk), stamp({ warnings: 0 })), {
    code: 0,
    said: "",
  });
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a push whose delta carries a tagged note refuses, and names the file", () => {
  const carried = () => [
    { name: "src/scripts/work.js", text: "// code" },
    { name: "spec/tickets/slow-lint.md", text: TAGGED },
  ];
  const said = holds(refsIn(toWork), stamp(), carried);
  assert.equal(said.code, 1);
  assert.match(said.said, /spec\/tickets\/slow-lint\.md/);
  assert.match(said.said, /ticket todo <name> --off/);
});

// [[spec/design_output/pull#the-gate]]
test("a push whose delta carries a tagged gate point lands, and a bare tag still refuses", () => {
  const point = TAGGED.replace("todo: true", "todo: true\npoint: gate");
  const landing = () => [{ name: "spec/tickets/cut-the-line.md", text: point }];
  assert.deepEqual(holds(refsIn(toWork), stamp(), landing), { code: 0, said: "" });
  const mixed = () => [
    { name: "spec/tickets/cut-the-line.md", text: point },
    { name: "spec/tickets/slow-lint.md", text: TAGGED },
  ];
  const said = holds(refsIn(toWork), stamp(), mixed);
  assert.equal(said.code, 1);
  assert.match(said.said, /slow-lint\.md/);
  assert.doesNotMatch(said.said, /cut-the-line/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a push whose delta carries an untagged note lands", () => {
  const carried = () => [{ name: "spec/tickets/slow-lint.md", text: FREE }];
  assert.deepEqual(holds(refsIn(toWork), stamp(), carried), { code: 0, said: "" });
  // A warning holds no push, so the door takes no lint. [[spec/design_output/config#the-engine-controls]]
  assert.equal(
    holds.length,
    2,
    "the door reads the refs and the stamp, then the delta, and no warnings",
  );
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

// The terminal door reads through the tense reader, so a word Vale takes for the past and the check lets stand holds no push. [[spec/design_output/level0#the-tense-reader]]
test("a false past the check lets stand holds no push, and a true past does", () => {
  const root = "/tree";
  const past = (line, span, said) => ({
    Check: "VoiceParagraph.PastTense",
    Line: line,
    Span: span,
    Match: said,
    Message: "past",
    Severity: "warning",
  });
  const vale = JSON.stringify({
    "notes.md": [past(1, [12, 15], "read"), past(2, [10, 15], "walked")],
  });
  const files = fakeDisk({
    [join(root, "notes.md")]: "The reader read the note.\nThe hand walked away.\n",
  });

  const found = lintedBy(
    fakeProc({ vale: { stdout: vale } }),
    root,
    "vale",
    files,
  )(["notes.md", "a.js"]);

  assert.deepEqual(
    found.map((one) => one.said),
    ["walked"],
  );
});

test("a push carrying no prose asks Vale nothing", () => {
  const outside = fakeProc();
  assert.deepEqual(lintedBy(outside, "/tree", "vale", fakeDisk())(["a.js"]), []);
  assert.deepEqual(outside.ran, []);
});

// [[spec/tickets/one-writer-holds-a-branch]]
test("the hold reads the group ticket at the remote tip, and a trunk push or an unread ticket reads free", () => {
  const held = `---\nkind: [[ticket]]\nstate: open\nrecord:\n  - step: sync\n    hand: ${HOLDER}\n    hash_before: ${SHA}\n---\n`;
  const repo = fakeRepo([], { "spec/tickets/x.md": held });
  const [work] = refsIn(toWork);
  assert.equal(readsHold(repo)(work), HOLDER);
  assert.deepEqual(repo.runs.at(-1), ["show", "origin/work/x:spec/tickets/x.md"]);
  assert.equal(readsHold(repo)(refsIn(toTrunk)[0]), "");
  assert.equal(readsHold(fakeRepo([], {}))(work), "");
});

// [[spec/tickets/one-writer-holds-a-branch]]
test("a box's hold refuses a hand that names no box, and a hold naming no box refuses a box", () => {
  assert.equal(
    holds(refsIn(toWork), stamp(), () => [], false, heldBy(HOLDER), "").code,
    1,
  );
  assert.equal(
    holds(refsIn(toWork), stamp(), () => [], false, heldBy("person"), "myb0x").code,
    1,
  );
});
