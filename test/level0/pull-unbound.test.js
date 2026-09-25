// A named group passes the unbound gate, and a plain pull stays behind it.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { probeOf, startOf } from "../../src/scripts/serve.js";
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

function onTrunk() {
  const said = doorsSaying(
    { ...groupRemote(SOON), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: SOON, ...HAND },
  );
  said.outside.proc.teach(probeOf("node", 6510), { exitCode: 1 });
  said.outside.proc.teach(startOf(ROOT), { exitCode: 0 });
  return said;
}

test("a cloud box on trunk at unbound takes the group it names", () => {
  const named = onTrunk();
  const asked = heard(() =>
    pulling(ROOT, ["pull", "one-group"], {
      ...named.it,
      cloud: true,
      binding: "unbound",
    }),
  );
  assert.equal(asked.code, 0, asked.said);
  assert.ok(
    ranGit(named.outside).includes("git switch work/one-group"),
    "the owner names it, so the gate lets it through",
  );
});

// A desk takes a cloud branch in by a merge alone. [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk on trunk at unbound naming a group passes the gate, and meets the merge", () => {
  const named = onTrunk();
  const asked = heard(() =>
    pulling(ROOT, ["pull", "one-group"], {
      ...named.it,
      cloud: false,
      binding: "unbound",
    }),
  );
  assert.equal(asked.code, 2, asked.said);
  assert.doesNotMatch(asked.said, /binds to unbound/, "the gate lets it through");
  assert.match(asked.said, /branch merge one-group/);
  assert.ok(!ranGit(named.outside).some((one) => one.startsWith("git switch")));
});

test("a plain pull on trunk at unbound takes no group", () => {
  const plain = onTrunk();
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
