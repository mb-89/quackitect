// The take and the trigger read a group's parent chain off main, as the
// dispatch does, so a parent standing on main alone holds its child.
// [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import { trigger } from "../../src/scripts/work-free.js";
import {
  doorsSaying,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  on,
  ROOT,
  ranGit,
} from "./work-doors.js";

const underParent = GROUP_NOTE.replace(
  "state: open\n",
  "state: open\ngroup: big-parent\n",
);
const chainOnMain = () =>
  doorsSaying(
    {
      ...groupRemote(underParent, {
        objects: {
          "origin/main:spec/tickets/big-parent.md": GROUP_NOTE.replace(
            "state: open\n",
            "state: open\ndepends_on: [first-group]\n",
          ),
          "origin/main:spec/tickets/first-group.md": GROUP_NOTE,
        },
      }),
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    },
    { [on("one-group")]: underParent, ...HAND },
  );

// [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
test("take leaves a group whose parent on main alone waits on an open group", () => {
  const { it, outside } = chainOnMain();
  const { code, said } = heard(() =>
    work(ROOT, ["take", "one-group"], { ...it, cloud: true }),
  );
  assert.equal(code, 1, said);
  assert.match(said, /work\/one-group stands at no free todo/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git switch")));
});

// [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
test("the trigger names no branch free where a parent on main alone waits", () => {
  const { it } = chainOnMain();
  const { code, said } = heard(() => trigger(it));
  assert.equal(code, 0, said);
  assert.match(said, /No branch stands free/);
});
