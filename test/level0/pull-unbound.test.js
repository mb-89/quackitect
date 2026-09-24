// A named group passes the unbound gate, and a plain pull stays behind it.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
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

const SOON = GROUP_NOTE.replace("urgent: true\n", "");

function deskOnTrunk() {
  return doorsSaying(
    { ...groupRemote(SOON), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: SOON, ...HAND },
  );
}

test("a desk on trunk at unbound takes the group it names", () => {
  const named = deskOnTrunk();
  const asked = heard(() =>
    pulling(ROOT, ["pull", "one-group"], {
      ...named.it,
      cloud: false,
      binding: "unbound",
    }),
  );
  assert.equal(asked.code, 0, asked.said);
  assert.ok(
    ranGit(named.outside).includes("git switch work/one-group"),
    "the owner names it, so the gate lets it through",
  );
});

test("a plain pull on trunk at unbound takes no group", () => {
  const plain = deskOnTrunk();
  const left = heard(() =>
    pulling(ROOT, ["pull"], { ...plain.it, cloud: false, binding: "unbound" }),
  );
  assert.equal(left.code, 0, left.said);
  assert.match(left.said, /binds to unbound/);
  assert.ok(
    !ranGit(plain.outside).some((one) => one.startsWith("git switch")),
    "the gate holds the plain pull",
  );
});
