// A group naming a config key under `enabled_by` waits while the tracked config
// on trunk reads anything but true there. The take passes it over, the list says
// what it waits for, and the trigger counts it nowhere.
// [[spec/design_output/work#a-switch-holds-a-group]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { heldIn, withField } from "../../src/engine/group.js";
import { work } from "../../src/scripts/work.js";
import { trigger } from "../../src/scripts/work-free.js";
import { list } from "../../src/scripts/work-list.js";
import { shutBy, TODO, waitsOf } from "../../src/scripts/work-stands.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  HAND,
  heard,
  on,
  ROOT,
  ranGit,
  remoteSaying,
  SHA,
} from "./work-doors.js";

const KEY = "migration.phase2switch";
const switched = (text) => text.replace(/^(kind: .*\n)/m, `$1enabled_by: ${KEY}\n`);
const shared = (value) => JSON.stringify({ migration: { phase2switch: value } });

// Two free groups: the first names the switch, and the second names none. Each holds a child a hand takes. [[spec/design_output/work#a-switch-holds-a-group]]
function twoGroups(value, files = {}) {
  const first = switched(withField(GROUP_NOTE, "step", "children"));
  const second = withField(GROUP_NOTE, "step", "children");
  const answers = {
    ...remoteSaying(
      [
        { branch: "work/a-switched", tip: "aaa" },
        { branch: "work/b-free", tip: "bbb" },
      ],
      {
        "work/a-switched:spec/tickets/a-switched.md": first,
        "work/b-free:spec/tickets/b-free.md": second,
      },
    ),
    "git show origin/work/a-switched:spec/tickets/a-switched.md": { stdout: first },
    "git show origin/work/b-free:spec/tickets/b-free.md": { stdout: second },
    "git show origin/main:spec/config/level0.json": { stdout: shared(value) },
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    "git rev-parse HEAD": { stdout: `${SHA}\n` },
    "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    "git fetch --prune origin": { stdout: "" },
  };
  return doorsSaying(answers, {
    [on("a-switched")]: first,
    [on("a-child")]: CHILD("a-switched", "open"),
    [on("b-free")]: second,
    [on("b-child")]: CHILD("b-free", "open"),
    ...HAND,
    ...files,
  });
}

const taking = (doors) =>
  heard(() => work(ROOT, ["take"], { ...doors.it, agent: true, cloud: true }));

test("a take passes over a group whose switch reads false on trunk, and claims the next", () => {
  const doors = twoGroups(false);
  const { code, said } = taking(doors);
  assert.equal(code, 0, said);
  assert.ok(!ranGit(doors.outside).includes("git push origin work/a-switched"));
  assert.ok(ranGit(doors.outside).includes("git push origin work/b-free"));
  assert.equal(heldIn(doors.disk.read(on("b-free"))).hand, "box d462e994b4cef");
});

test("a switch reading true on trunk frees its group for the take", () => {
  const doors = twoGroups(true);
  const { code, said } = taking(doors);
  assert.equal(code, 0, said);
  assert.ok(ranGit(doors.outside).includes("git push origin work/a-switched"));
});

test("a switch this box alone turns on, in its local file or its environment, frees nothing", () => {
  const local = {
    [join(ROOT, ".se/.runtime/config.json")]: shared(true),
  };
  const doors = twoGroups(false, local);
  doors.it.env = { SE_MIGRATION_PHASE2SWITCH: "true" };
  const { code, said } = taking(doors);
  assert.equal(code, 0, said);
  assert.ok(!ranGit(doors.outside).includes("git push origin work/a-switched"));
});

test("a switch the tracked config on trunk lacks reads as off", () => {
  const doors = twoGroups(undefined);
  taking(doors);
  assert.ok(!ranGit(doors.outside).includes("git push origin work/a-switched"));
});

test("the list says a switched group waits for its key to read true", () => {
  const doors = twoGroups(false);
  const { code, said } = heard(() => list({ ...doors.it }, "", []));
  assert.equal(code, 0, said);
  const row = said.split("\n").find((one) => one.startsWith("work/a-switched"));
  assert.match(row ?? "", new RegExp(`waits for ${KEY} to read true`));
  const other = said.split("\n").find((one) => one.startsWith("work/b-free"));
  assert.doesNotMatch(other ?? "", /waits for/);
});

test("the trigger counts a switched group nowhere among the free ones", () => {
  const doors = twoGroups(false);
  const { said } = heard(() => trigger({ ...doors.it }));
  assert.doesNotMatch(said, /work\/a-switched/);
  assert.match(said, /work\/b-free/);
});

test("a switch reads true alone, and a key the shared config lacks reads off", () => {
  const text = switched(GROUP_NOTE);
  assert.equal(shutBy(text, new Map([[KEY, true]])), "");
  assert.equal(shutBy(text, new Map([[KEY, false]])), KEY);
  assert.equal(shutBy(text, new Map([[KEY, "true"]])), KEY, "a string reads off");
  assert.equal(shutBy(text, new Map()), KEY);
  assert.equal(
    shutBy(GROUP_NOTE, new Map()),
    "",
    "a group naming no key waits on none",
  );
});

test("a branch waits for the groups it names first, then for its switch", () => {
  const ticket = GROUP_NOTE.replace(/^(kind: .*\n)/m, "$1depends_on: [before]\n");
  const standing = new Map([["work/before", TODO]]);
  assert.deepEqual(waitsOf({ ticket, shut: KEY }, standing), [
    "before",
    `${KEY} to read true`,
  ]);
  assert.deepEqual(waitsOf({ ticket: GROUP_NOTE, shut: "" }, standing), []);
});
