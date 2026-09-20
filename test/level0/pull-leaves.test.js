// The pull, driven through fake doors: a leaf, its chapter and the verbs beside it.
// The doors these cases drive stand in pull-doors.js beside this file.
// [[spec/design_output/pull#the-answers]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { fieldOf } from "../../src/scripts/group.js";
import {
  chapterOf,
  commandsRun,
  holdOf,
  leafOf,
  takeable,
  verdictIn,
} from "../../src/scripts/pull.js";
import { goModulesOf, goSays, testSays } from "../../src/scripts/test-verb.js";
import { ticket } from "../../src/scripts/ticket.js";
import { pulling, work } from "../../src/scripts/work.js";
import {
  at,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  HAND,
  HOLD,
  heard,
  ROOT,
  standing,
} from "./pull-doors.js";

test("became closes the ticket with its successor, reads no field of the leaf, and refuses a successor standing nowhere", () => {
  const { it, disk } = doors(
    standing(CHILD(), GROUP_NOTE, {
      [at("spec/tickets/a-successor.md")]: CHILD("draft", ""),
    }),
  );
  heard(() => pulling(ROOT, ["pull"], it));

  const missing = heard(() =>
    pulling(ROOT, ["pull", "a-child", "--became", "nobody"], it),
  );
  assert.equal(missing.code, 1);
  assert.match(missing.said, /nobody stands nowhere yet/);

  const { code } = heard(() =>
    pulling(ROOT, ["pull", "a-child", "--became", "a-successor"], it),
  );
  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "state"), "closed");
  assert.equal(fieldOf(now, "reason"), "became");
  assert.equal(fieldOf(now, "successors"), "a-successor");
});

// [[spec/design_output/pull#a-leaf-inherits]]
test("a leaf inherits by, on_fail and the checklist from its phases, and reads add up", () => {
  const front = {
    steps: [
      {
        name: "implement",
        by: "agent",
        checklist: ["a"],
        reads: "[[x]]",
        steps: [
          { name: "change", checklist: ["b"], reads: ["[[y]]"], on_fail: "implement" },
        ],
      },
    ],
  };
  const leaf = leafOf(front, "implement/change");
  assert.equal(leaf.by, "agent");
  assert.equal(leaf.on_fail, "implement");
  assert.deepEqual(leaf.checklist, ["a", "b"]);
  const quoted = leafOf(
    readNote(
      '---\nsteps:\n  - name: do\n    checklist: ["one, and two", "three"]\n---\n',
    ).front.said,
    "do",
  );
  assert.deepEqual(
    quoted.checklist,
    ["one, and two", "three"],
    "a comma inside quotes stays",
  );
  assert.deepEqual(leaf.reads, ["x", "y"]);
  assert.equal(leaf.at, 0);
  assert.equal(leafOf(front, "implement"), null, "a phase is no leaf");
});

// [[spec/design_output/pull#the-fields-hold-their-forms]]
test("a leaf's chapter reads its fields by heading, past the comments and the engine's lines", () => {
  const text = filled(
    CHILD(),
    "### approach",
    "<!-- a comment -->\nThe approach.\nanswered: exit 0",
  );
  const said = chapterOf(text, "design/draft");
  assert.equal(said.stands, true);
  assert.deepEqual(said.fields.get("approach"), ["The approach."]);
  assert.equal(chapterOf(text, "design/nowhere").stands, false);
  assert.deepEqual(verdictIn(["pass"]), { said: "pass", reason: "" });
  assert.deepEqual(verdictIn(["fail: thin", "- and short"]), {
    said: "fail",
    reason: "thin; and short",
  });
  assert.deepEqual(verdictIn(["maybe"]), { said: "" });
});

// [[spec/design_output/pull#the-fields-hold-their-forms]]
test("a command line the box finds nothing for comes back naming the shape a command field takes", () => {
  const it = {
    root: ROOT,
    proc: { run: () => ({ exitCode: 127, stdout: "", stderr: "" }) },
  };
  const leaf = {
    path: "do",
    evidence: [{ name: "check", form: "command", expects: 0 }],
  };
  const chapter = {
    stands: true,
    own: [],
    fields: new Map([["check", ["`./RUNME.sh check`"]]]),
  };
  const found = [];
  const ran = commandsRun(it, leaf, chapter, found);

  assert.deepEqual(found, [
    "check under do runs `./RUNME.sh check`, and the box finds no such command. A command field holds one bare line, indented four spaces.",
  ]);
  assert.deepEqual(ran, [{ name: "check", exit: 127, said: "" }]);
});

// The tests stand in two languages, and the verb runs both. [[spec/design_output/pull#the-test-verb]]
test("a changed Go test names its module, and the verb says what that run answered", () => {
  assert.deepEqual(
    goModulesOf([
      "src/tui/work_test.go",
      "src/tui/tree.go",
      "src/index/index_test.go",
      "src/index/index_test.go",
      "test/level0/one.test.js",
      "spec/tickets/one.md",
    ]),
    ["src/tui", "src/index"],
  );
  assert.deepEqual(goModulesOf([]), []);

  assert.equal(goSays({ exitCode: 0 }, "src/tui"), "green, src/tui passes");
  assert.match(
    goSays({ exitCode: 1, stdout: "--- FAIL: TestOne\nFAIL\n" }, "src/tui"),
    /^assertion, a test of src\/tui fails/,
  );
  assert.match(
    goSays({ exitCode: 1, stderr: "./work.go:9:2: undefined: nothing\n" }, "src/tui"),
    /^build, because src\/tui builds not: \.\/work\.go/,
  );
});

// [[spec/design_output/pull#the-test-verb]]
test("the test verb answers green, assertion, build or missing over the tests the branch changes", () => {
  const pass = { exitCode: 0, stdout: "# tests 3\n# pass 3\n# fail 0\n" };
  assert.match(testSays(pass, ["a"]), /^green, 3 test\(s\) pass in 1 file\(s\)/);
  const red = {
    exitCode: 1,
    stdout: "not ok 1\n  code: 'ERR_ASSERTION'\n# tests 2\n# pass 1\n# fail 1\n",
  };
  assert.match(
    testSays(red, ["a"]),
    /^assertion, 1 test\(s\) fail on their own assertion/,
  );
  const broken = {
    exitCode: 1,
    stderr: "SyntaxError: Unexpected token\n",
    stdout: "# tests 0\n",
  };
  assert.match(
    testSays(broken, ["a"]),
    /^build, because a file loads no test: SyntaxError/,
  );
  const thrown = {
    exitCode: 1,
    stdout:
      "not ok 1\n  TypeError: x is not a function\n# tests 1\n# pass 0\n# fail 1\n",
  };
  assert.match(
    testSays(thrown, ["a"]),
    /^build, because 1 test\(s\) fail outside an assertion: TypeError/,
  );

  const none = doors(standing(), {
    "git merge-base origin/main HEAD": { stdout: "base111\n" },
    "git diff --name-only base111..HEAD": { stdout: "src/x.js\n" },
  });
  const missing = heard(() => work(ROOT, ["test"], none.it));
  assert.equal(missing.code, 1);
  assert.match(
    missing.said,
    /^missing, because the branch changes no test since base111/,
  );

  const some = doors(standing(), {
    "git merge-base origin/main HEAD": { stdout: "base111\n" },
    "git diff --name-only base111..HEAD": {
      stdout: "test/level0/x.test.js\nsrc/x.js\n",
    },
    "node --test --test-reporter=tap test/level0/x.test.js": pass,
  });
  const green = heard(() => work(ROOT, ["test"], some.it));
  assert.equal(green.code, 0);
  assert.match(green.said, /^green/);
});

// [[spec/design_output/pull#a-draft-opens]]
test("ticket open turns a draft with an ask into an open ticket at its first leaf, and refuses an empty ask", () => {
  const { it, disk } = doors(standing(CHILD("draft", "")));
  const { code, said } = heard(() => ticket(ROOT, ["open", "a-child"], it));
  assert.equal(code, 0);
  assert.match(said, /stands open at design\/draft/);
  assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "state"), "open");
  assert.equal(
    fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"),
    "design/draft",
  );

  const empty = doors(standing(CHILD("draft", "").replace("One piece of it.\n", "")));
  assert.equal(heard(() => ticket(ROOT, ["open", "a-child"], empty.it)).code, 1);
});

// [[spec/design_output/pull#the-checks]]
test("the judge's material is the leaf's evidence and the rules its reads name, as JSON", () => {
  const { it } = doors(standing(filled(CHILD(), "### approach", "The approach.")));
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child", "--judge"], it));

  assert.equal(code, 0);
  assert.deepEqual(JSON.parse(said), {
    ticket: "a-child",
    step: "design/draft",
    evidence: "approach:\nThe approach.",
    rules: [
      {
        label: "voice-1",
        note: "spec/guidance/voice",
        number: 1,
        rule: "Say what is.",
      },
      {
        label: "voice-2",
        note: "spec/guidance/voice",
        number: 2,
        rule: "Put the bottom line first.",
      },
    ],
  });
  const none = doors(standing());
  assert.equal(
    heard(() => pulling(ROOT, ["pull", "a-child", "--judge"], none.it)).said,
    "null",
  );
});

// The judge reads the rules that fit evidence, and a rule describing an answer stands out. [[spec/tickets/the-judge-reads-answer-rules]]
test("the judge's ask leaves the answer rules out, and labels the rules it keeps", () => {
  const note =
    "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Open an answer with a table. ^\n3. Put the bottom line first.\n";
  const { it } = doors(
    standing(filled(CHILD(), "### approach", "The approach."), GROUP_NOTE, {
      [at("spec/guidance/voice.md")]: note,
    }),
  );
  heard(() => pulling(ROOT, ["pull"], it));

  const { said } = heard(() => pulling(ROOT, ["pull", "a-child", "--judge"], it));

  assert.deepEqual(JSON.parse(said).rules, [
    {
      label: "voice-1",
      note: "spec/guidance/voice",
      number: 1,
      rule: "Say what is.",
    },
    {
      label: "voice-3",
      note: "spec/guidance/voice",
      number: 3,
      rule: "Put the bottom line first.",
    },
  ]);
});

// [[spec/tickets/the-group-leaves-at-todo]]
test("the judge's material leaves a command field out, so a chapter of commands hands over nothing", () => {
  const { it } = doors(
    standing(filled(CHILD("open", "implement/change"), "### lint", "./RUNME.sh check")),
  );
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child", "--judge"], it));

  assert.equal(code, 0);
  assert.equal(JSON.parse(said).step, "implement/change");
  assert.equal(JSON.parse(said).evidence, "", "a command field is no prose");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the hold reads back what the pull writes, and a box with no id mints one", () => {
  const { it, disk } = doors(standing());
  it.root = ROOT;
  assert.equal(holdOf(it, HAND), null);
  disk.remove(at(".se/.runtime/box.json"));
  it.random = () => "fresh1";
  heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(JSON.parse(disk.read(at(".se/.runtime/box.json"))).id, "fresh1");
  assert.equal(holdOf(it, "box fresh1").ticket, "a-child");
});

// [[spec/design_output/pull#the-hand-out]]
test("a name with nothing in hand asks for that ticket, and a name nobody writes says so", () => {
  const here = doors(standing());
  const mine = heard(() => pulling(ROOT, ["pull", "a-child"], here.it));
  assert.match(mine.said, /a-child at design\/draft/, "the name hands that ticket out");

  const away = doors(standing());
  const none = heard(() => pulling(ROOT, ["pull", "nobody-writes-this"], away.it));
  assert.match(none.said, /nobody-writes-this stands nowhere here/);
  assert.doesNotMatch(none.said, /a-child/, "a name asks for one ticket alone");

  const bound = doors(standing(), {}, { binding: "queue" });
  const shut = heard(() => pulling(ROOT, ["pull", "a-child"], bound.it));
  assert.equal(shut.code, 2);
  assert.match(shut.said, /a-child stands behind the queue/);
});

// [[spec/design_output/pull#done-leaves-no-takeable-step]]
test("takeable waits on an open dependency, so the pull and branch done name the same step", () => {
  const waits = CHILD("open", "design/draft", "depends_on: [a-first]\n");
  const { it } = doors(standing(waits));
  const held = { name: "a-child", text: waits };
  const withFirst = (state) => [held, { name: "a-first", text: CHILD(state) }];

  assert.equal(
    takeable(it, held, withFirst("open")),
    "",
    "an open dependency holds it",
  );
  assert.equal(
    takeable(it, held, withFirst("closed")),
    "design/draft",
    "a closed dependency frees it",
  );
});

// [[spec/design_output/pull#a-closed-group-hands-nothing]]
test("a closed group hands no leaf out on its branch, and sends the box back to trunk", () => {
  const shut = GROUP_NOTE.replace("state: open", "state: closed");
  const { it, disk } = doors(standing(CHILD(), shut));

  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^done/);
  assert.match(said, /one-group stands closed/);
  assert.match(said, /branch done, then \.\/RUNME\.sh ticket pull from main/);
  assert.ok(!disk.exists(HOLD), "no leaf stands in hand");
  assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"), "design/draft");
});
