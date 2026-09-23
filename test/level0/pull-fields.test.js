// The fields a hand-back carries in its payload, and where the engine writes them.
// The doors these cases drive stand in pull-doors.js beside this file.
// [[spec/design_output/pull#the-answers]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf, withField } from "../../src/engine/group.js";
import { withPayload } from "../../src/scripts/pull.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  heard,
  ROOT,
  standing,
} from "./pull-doors.js";

// [[spec/design_output/pull#the-fields-ride-the-payload]]
test("the fields ride the payload, and the engine writes them under their headings before it checks", () => {
  const { it, disk } = doors(
    standing(CHILD(), withField(GROUP_NOTE, "step", "children")),
  );
  heard(() => pulling(ROOT, ["pull"], it));

  const wrong = heard(() =>
    pulling(ROOT, ["pull", "a-child", "--pass", "--fields", '{"nowhere": "x"}'], it),
  );
  assert.equal(wrong.code, 1);
  assert.match(wrong.said, /design\/draft holds no field nowhere/);

  const { code } = heard(() =>
    pulling(
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

  const vale = "/tree/.se/.runtime/bin/vale";
  const ranVale = [];
  const route = CHILD("open", "verdict").replace(
    "group: one-group\n",
    "  - name: verdict\n    does: reads every hunk\n    input: [diff, implement]\n    to: retro\n    evidence:\n      - name: read\n        form: files\n        says: every file you read\n      - name: verdict\n        form: verdict\n        says: pass or fail\ngroup: one-group\n",
  );
  const body = route.replace(
    "# Discussion\n",
    "# verdict\n\n## read\n\n## verdict\n\n# Discussion\n",
  );
  const { it } = doors(standing(body, withField(GROUP_NOTE, "step", "children")), {
    "git status --porcelain -uall": {
      stdout: "M spec/tickets/a-child.md\n?? .vale.ini",
    },
    [`${vale} --config=.vale.ini --output=JSON --no-exit --path=spec/tickets/a-child.md`]:
      (_argv, init) => {
        ranVale.push(init.stdin);
        return { stdout: "{}" };
      },
  });
  it.vale = vale;
  heard(() => pulling(ROOT, ["pull"], it));

  const short = heard(() =>
    pulling(
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
    pulling(
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
