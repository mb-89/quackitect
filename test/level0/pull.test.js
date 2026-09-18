// The pull, driven through fake doors: the take, the hand-out and the pass.
// The doors these cases drive stand in pull-doors.js beside this file.
// [[spec/design_output/pull#the-answers]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fieldOf, recordIn, withEntry, withField } from "../../src/scripts/group.js";
import { takeable, withPayload } from "../../src/scripts/pull.js";
import { probeOf, startOf } from "../../src/scripts/serve.js";
import { work } from "../../src/scripts/work.js";
import {
  at,
  BRANCH,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  HAND,
  HOLD,
  heard,
  ROOT,
  ranGit,
  SHA,
  standing,
} from "./pull-doors.js";

// [[spec/design_output/pull#the-hand-out]]
test("a pull off trunk and off a work branch refuses, and names the pull from trunk", () => {
  const { it } = doors(
    {},
    { "git rev-parse --abbrev-ref HEAD": { stdout: "claude/roaming-hopper-ab12cd\n" } },
  );

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 2);
  assert.match(said, /branch pull from main/);
  assert.ok(!said.includes("branch take"), "no hand takes a branch");
});

const FREE = CHILD().replace("group: one-group\n", "");
const onTrunk = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
  ...extra,
});
// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("on trunk a cloud box's pull takes a branch, and a desk's pull takes none", () => {
  const cloud = doors(standing(), onTrunk(), { cloud: true });
  for (const [argv, code] of [
    [probeOf("node", 6510), 1],
    [startOf(ROOT), 0],
  ])
    cloud.outside.proc.teach(argv, { exitCode: code });
  const taken = heard(() => work(ROOT, ["pull"], cloud.it));
  assert.equal(taken.code, 0);
  assert.match(taken.said, /No work branch stands at todo|took|holds it/);
  const desk = doors({ [at("spec/tickets/free-one.md")]: FREE }, onTrunk(), {
    cloud: false,
  });
  const { code, said } = heard(() => work(ROOT, ["pull"], desk.it));
  assert.equal(code, 0, said);
  assert.match(said, /^work {2}free-one at design\/draft/m, "the free ticket comes");
  assert.ok(
    !ranGit(desk.outside).some((one) => one.startsWith("git switch")),
    "the box stays on trunk",
  );
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("on trunk a desk's pull hands out no group and no group's child, and cuts a branch for an open group standing without one", () => {
  const { it, outside } = doors(standing(), onTrunk(), { cloud: false });
  const { code, said } = heard(() => work(ROOT, ["pull"], it));
  assert.equal(code, 0, said);
  assert.match(said, /work\/one-group is cut and pushed/);
  assert.ok(!said.includes("a-child at"), "the group's child stays with the group");
  const ran = ranGit(outside);
  assert.ok(
    ran.includes("git branch work/one-group main"),
    "the branch is cut from trunk",
  );
  assert.ok(
    ran.includes("git push -u origin work/one-group"),
    "and pushed for the cloud",
  );

  const stands = doors(
    standing(),
    onTrunk({
      "git ls-remote --heads origin work/*": {
        stdout: `${SHA}\trefs/heads/work/one-group\n`,
      },
    }),
    { cloud: false },
  );
  const again = heard(() => work(ROOT, ["pull"], stands.it));
  assert.ok(!again.said.includes("is cut"), "a group with a branch gets no second one");
  assert.ok(!ranGit(stands.outside).some((one) => one.startsWith("git branch work/")));
});

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("a free ticket carrying the todo tag comes before the rest on trunk", () => {
  const { it } = doors(
    {
      [at("spec/tickets/a-free.md")]: FREE,
      [at("spec/tickets/b-free.md")]: FREE.replace(
        "urgency: now",
        "urgency: now\ntodo: true",
      ),
    },
    onTrunk(),
    { cloud: false },
  );
  const { code, said } = heard(() => work(ROOT, ["pull"], it));
  assert.equal(code, 0, said);
  assert.match(said, /^work {2}b-free at/m, "the tag beats the name order");
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("on trunk the drop and the hold come before the take, so a held hand takes no branch", () => {
  const { it, outside } = doors(
    {
      ...standing(),
      [HOLD]: JSON.stringify({
        ticket: "a-free",
        path: "spec/tickets/a-free.md",
        step: "do",
        hand: HAND,
      }),
    },
    onTrunk(),
    { cloud: true },
  );
  const held = heard(() => work(ROOT, ["pull"], it));
  assert.equal(held.code, 1);
  assert.match(held.said, /a-free stands in your hand/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git switch")),
    "a held hand takes no branch",
  );

  const dropped = heard(() => work(ROOT, ["pull", "--drop"], it));
  assert.equal(dropped.code, 0);
  assert.match(dropped.said, /the hold drops/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git switch")),
    "the drop takes no branch",
  );
});

// [[spec/design_output/pull#the-work-answer]]
test("the pull hands out the child's first leaf, writes the hold, and the answer says does, the fields and the guidance", () => {
  const { it, disk } = doors(standing());

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^work {2}a-child at design\/draft, leaf 1 of 5 under design/);
  assert.match(said, /writes the approach the ask calls for/);
  assert.match(said, /One piece of it\./);
  assert.match(said, /### approach {2}text: the approach/);
  assert.match(said, /Reads spec\/guidance\/voice:\n {2}1\. Say what is\./);
  assert.match(said, /branch pull a-child --pass/);
  const hold = JSON.parse(disk.read(HOLD));
  assert.equal(hold.ticket, "a-child");
  assert.equal(hold.step, "design/draft");
  assert.equal(hold.hash, SHA);
  assert.equal(hold.hand, HAND);
  assert.equal(hold.reads[0].name, "spec/guidance/voice");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a second pull with a hold standing answers refused, and names the ticket in hand", () => {
  const { it } = doors(standing());
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/);
  assert.match(said, /a-child stands in your hand at design\/draft/);
});

// [[spec/design_output/pull#the-hand-back-refused]]
test("a hand-back with a field empty answers refused, keeps the hold, and counts the refusal", () => {
  const { it, disk, outside } = doors(standing());
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/);
  assert.match(said, /approach under design\/draft holds no text/);
  assert.match(said, /a-child stays in hand/);
  assert.equal(JSON.parse(disk.read(HOLD)).refused, 1);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git commit")),
    "nothing lands",
  );
});

// [[spec/design_output/pull#the-pass]]
test("the voice rules read the evidence at the hand-back, and an error refuses it", () => {
  const vale = "/tree/.se/run/bin/vale";
  const long = JSON.stringify({
    "stdin.md": [
      {
        Check: "VoiceParagraph.Sentence",
        Line: 2,
        Span: [1, 3],
        Message: "A sentence holds 25 words.",
        Severity: "error",
      },
    ],
  });
  const { it, disk } = doors(
    standing(filled(CHILD(), "### approach", "A long approach.")),
    {
      [`${vale} --config=${at(".vale.ini")} --path=spec/tickets/a-child.md --output=JSON --no-exit`]:
        { stdout: long },
    },
  );
  it.vale = vale;
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(
    said,
    /design\/draft breaks Sentence at line 2 of its chapter: A sentence holds 25 words\./,
  );
  assert.equal(disk.exists(HOLD), true);
});

// [[spec/design_output/pull#a-leaf-comes-back]]
test("a hand takes a leaf it passed back, and another hand's leaf stays", () => {
  const passed = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk, outside } = doors(
    standing(passed, withField(GROUP_NOTE, "state", "closed")),
  );

  const { code, said } = heard(() =>
    work(ROOT, ["pull", "a-child", "--back", "design/draft"], it),
  );

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/draft");
  assert.equal(recordIn(now).at(-1).returns, 1);
  assert.equal(recordIn(now).at(-1).why, "the hand takes it back");
  assert.ok(ranGit(outside).includes(`git push origin ${BRANCH}`));
  assert.match(said, /a-child stands at design\/draft again/);
  assert.match(
    said,
    /^work {2}a-child at design\/draft/m,
    "the next pull hands it out at once",
  );

  const other = doors(standing(passed.replace(`hand: ${HAND}`, "hand: box other")));
  const refused = heard(() =>
    work(ROOT, ["pull", "a-child", "--back", "design/draft"], other.it),
  );
  assert.equal(refused.code, 1);
  assert.match(refused.said, /carries no hand-back by box d462e994b4cef/);
});

// [[spec/design_output/pull#the-pass]]
test("a pass writes the record, moves the step, commits by ticket and step, pushes, and hands out the next", () => {
  const { it, disk, outside } = doors(
    standing(CHILD(), withField(GROUP_NOTE, "state", "closed")),
  );
  heard(() => work(ROOT, ["pull"], it));
  disk.write(
    at("spec/tickets/a-child.md"),
    filled(CHILD(), "### approach", "Read the note, then write the verb."),
  );

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/review");
  assert.equal(fieldOf(now, "state"), "open");
  assert.deepEqual(recordIn(now).at(-1), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  assert.ok(ranGit(outside).includes("git add -A"));
  assert.ok(ranGit(outside).includes("git commit -m a-child: passes design/draft"));
  assert.ok(ranGit(outside).includes(`git push origin ${BRANCH}`));
  assert.equal(disk.exists(HOLD), false, "the hold drops");
  assert.match(said, /^work\n {2}a-child passes design\/draft/m);
  // [[spec/design_output/pull#the-hand-rule]]
  assert.match(
    said,
    /^spawn\n {2}a-child at design\/review waits for a hand other than box d462e994b4cef, which wrote design\/draft/m,
  );
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("a step that excludes the only hand answers spawn, with the helper's name and its prompt", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took, withField(GROUP_NOTE, "state", "closed")));

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(
    said,
    /^spawn\n {2}a-child at design\/review waits for a hand other than box d462e994b4cef/,
  );
  assert.match(said, /named helper-2, and you work one step of one ticket/);
  assert.match(said, /branch pull --as helper-2/);
  assert.match(said, /branch pull a-child --as helper-2`\. It checks/);
  assert.equal(disk.exists(HOLD), false, "the spawn answer holds nothing");
  assert.equal(
    takeable(it, { text: took }),
    "design/review",
    "a spawned hand can take it",
  );
  assert.equal(takeable(it, { text: took.replace("not: draft", "by: person") }), "");
  assert.equal(takeable(it, { text: CHILD("closed", "design/review") }), "");
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the spawn comes before the group's own leaves, and the box leaves children past no takeable child", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took, withField(GROUP_NOTE, "step", "children")));

  const { said } = heard(() => work(ROOT, ["pull"], it));

  assert.match(said, /^spawn\n {2}a-child at design\/review/);
  const group = disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(group, "step"), "children", "the group stays at children");
  assert.equal(
    recordIn(group).length,
    0,
    "the box leaves no entry while a hand can take the child",
  );

  const dropped = heard(() => work(ROOT, ["pull", "--drop"], it));
  assert.match(dropped.said, /nothing stands in your hand/);
});

// [[spec/design_output/pull#the-fields-ride-the-payload]]
test("the fields ride the payload, and the engine writes them under their headings before it checks", () => {
  const { it, disk } = doors(
    standing(CHILD(), withField(GROUP_NOTE, "state", "closed")),
  );
  heard(() => work(ROOT, ["pull"], it));

  const wrong = heard(() =>
    work(ROOT, ["pull", "a-child", "--pass", "--fields", '{"nowhere": "x"}'], it),
  );
  assert.equal(wrong.code, 1);
  assert.match(wrong.said, /design\/draft holds no field nowhere/);

  const { code } = heard(() =>
    work(
      ROOT,
      [
        "pull",
        "a-child",
        "--pass",
        "--fields",
        '{"approach": "Read it.\\nThen write."}',
      ],
      it,
    ),
  );
  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.match(
    now,
    /### approach\n\n<!-- the approach -->\n\nRead it\.\nThen write\.\n/,
  );
  assert.equal(fieldOf(now, "step"), "design/review");

  const listed = withPayload(
    CHILD("open", "implement/tests-red"),
    "implement/tests-red",
    '{"tests": "node --test", "checked": "- one\\n- two"}',
  );
  assert.match(
    listed.text,
    /### tests\n\nnode --test\n\n### checked\n\n- one\n- two\n\n## reflect/,
  );
  assert.match(withPayload("x", "a", "nope").why, /takes a JSON object/);
});

// [[spec/design_output/pull#the-fields-ride-the-payload]]
test("the payload spans a fence, a porcelain row reads whole, and a files field meets no voice rule", () => {
  const fenced = filled(
    CHILD("open", "implement/tests-red"),
    "### tests",
    "```\nold one\n```",
  );
  const put = withPayload(fenced, "implement/tests-red", '{"tests": "node --test"}');
  assert.match(
    put.text,
    /### tests\n\nnode --test\n\n## reflect/,
    "the fence goes with the old text",
  );

  const vale = "/tree/.se/run/bin/vale";
  const ranVale = [];
  const route = CHILD("open", "verdict").replace(
    "group: one-group\n",
    "  - name: verdict\n    does: reads every hunk\n    input: [diff, implement]\n    to: retro\n    evidence:\n      - name: read\n        form: files\n        says: every file you read\n      - name: verdict\n        form: verdict\n        says: pass or fail\ngroup: one-group\n",
  );
  const body = route.replace(
    "# Discussion\n",
    "# verdict\n\n## read\n\n## verdict\n\n# Discussion\n",
  );
  const { it } = doors(standing(body, withField(GROUP_NOTE, "state", "closed")), {
    "git status --porcelain": { stdout: "M spec/tickets/a-child.md\n?? .vale.ini" },
    [`${vale} --config=${at(".vale.ini")} --path=spec/tickets/a-child.md --output=JSON --no-exit`]:
      (_argv, init) => {
        ranVale.push(init.stdin);
        return { stdout: "{}" };
      },
  });
  it.vale = vale;
  heard(() => work(ROOT, ["pull"], it));

  const short = heard(() =>
    work(
      ROOT,
      ["pull", "a-child", "--fields", '{"read": "- .vale.ini", "verdict": "pass"}'],
      it,
    ),
  );
  assert.equal(short.code, 1);
  assert.match(
    short.said,
    /read under verdict leaves out spec\/tickets\/a-child\.md/,
    "the row reads whole",
  );

  const whole = heard(() =>
    work(
      ROOT,
      [
        "pull",
        "a-child",
        "--fields",
        '{"read": "- .vale.ini\\n- spec/tickets/a-child.md", "verdict": "pass"}',
      ],
      it,
    ),
  );
  assert.equal(whole.code, 0, whole.said);
  assert.ok(ranVale.length, "the voice reads the verdict");
  assert.doesNotMatch(ranVale.at(-1), /vale\.ini/, "the voice skips the files field");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a hold drops on request, and the leaf stays where it stands", () => {
  const { it, disk } = doors(standing());
  heard(() => work(ROOT, ["pull"], it));
  assert.equal(disk.exists(HOLD), true);

  const { code, said } = heard(() => work(ROOT, ["pull", "--drop"], it));

  assert.equal(code, 0);
  assert.match(said, /the hold drops, and a-child stays at design\/draft/);
  assert.equal(disk.exists(HOLD), false);
  assert.equal(
    fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"),
    "design/draft",
  );
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("a hand under --as works one step under its own name, and the pull answers done after it", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took));
  const helper = join(ROOT, ".se/run/hold/box-d462e994b4cef-helper-2.json");

  const out = heard(() => work(ROOT, ["pull", "--as", "helper-2"], it));
  assert.equal(out.code, 0);
  assert.match(out.said, /^work {2}a-child at design\/review/);
  assert.equal(JSON.parse(disk.read(helper)).hand, "box d462e994b4cef · helper-2");

  disk.write(at("spec/tickets/a-child.md"), filled(took, "### verdict", "pass"));
  const back = heard(() => work(ROOT, ["pull", "a-child", "--as", "helper-2"], it));
  assert.equal(back.code, 0);
  assert.match(
    back.said,
    /^done\n {2}box d462e994b4cef · helper-2 works one step, and it is done/m,
  );
  assert.doesNotMatch(back.said, /^work {2}/m, "a one-step hand takes no next leaf");
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(recordIn(now).at(-1).hand, "box d462e994b4cef · helper-2");
  assert.equal(fieldOf(now, "step"), "implement/tests-red");
  assert.equal(disk.exists(helper), false);
});

// [[spec/design_output/pull#the-hand-rule]]
test("another hand takes the review, and the same hand waits", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: "box other",
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it } = doors(standing(took));

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^work {2}a-child at design\/review/);
  assert.match(said, /the verdict field decides/);
});

// [[spec/design_output/pull#the-fail]]
test("a verdict field decides, the flag is refused there, and a fail sends the ticket back with a return", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: "box other",
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took));
  heard(() => work(ROOT, ["pull"], it));

  const flagged = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(flagged.code, 1);
  assert.match(flagged.said, /the field decides and the flag stays off/);

  disk.write(
    at("spec/tickets/a-child.md"),
    filled(took, "### verdict", "fail\n- the approach names no test"),
  );
  const { code, said } = heard(() => work(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/draft");
  const entry = recordIn(now).at(-1);
  assert.equal(entry.step, "design/review");
  assert.equal(entry.returns, 1);
  assert.equal(entry.why, "the approach names no test");
  assert.match(said, /fails design\/review back to design\/draft/);
});

// [[spec/design_output/pull#a-person-step-goes-in]]
