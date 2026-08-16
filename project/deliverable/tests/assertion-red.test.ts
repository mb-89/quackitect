// i6's assertion-red demand, written before the build so it is watched failing.
//
// TWO REDS LOOK IDENTICAL IN THE COUNTS. An assertion failure is the design not
// yet realized; a crash is the check file being broken. `# fail 4` is the same
// four either way, and the state whose whole job is watching a new check fail
// used to pass on both.
//
// req-a-red-is-an-assertion-not-a-crash
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseTap } from "../engine/discipline.ts";

// A real Node TAP fragment, kept verbatim in shape: the diagnostic block under
// `not ok` is where the kind lives, and an assertion carries ERR_ASSERTION.
const ASSERTION = `TAP version 13
not ok 1 - the guard refuses an unquoted colon
  ---
  duration_ms: 3.1
  location: 'tests/writeguard.test.ts:41:1'
  failureType: 'testCodeFailure'
  error: 'Expected values to be strictly equal'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 'rejected'
  actual: 'ok'
  operator: 'strictEqual'
  ...
1..1
# tests 1
# pass 0
# fail 1
`;

const CRASH = `TAP version 13
not ok 1 - the guard refuses an unquoted colon
  ---
  duration_ms: 0.9
  location: 'tests/writeguard.test.ts:41:1'
  failureType: 'testCodeFailure'
  error: "guardParses is not a function"
  code: 'ERR_INVALID_ARG_TYPE'
  name: 'TypeError'
  stack: |-
    at TestContext.<anonymous> (tests/writeguard.test.ts:44:3)
  ...
1..1
# tests 1
# pass 0
# fail 1
`;

test("the parser reads an assertion failure out of the TAP", () => {
  const r = parseTap(ASSERTION);
  assert.equal(r.fail, 1, "the counts still come through");
  assert.equal(r.failures.length, 1, "the failure is captured");
  assert.equal(r.failures[0].kind, "assertion", "ERR_ASSERTION is what marks it");
});

test("the parser tells a crash from an assertion", () => {
  const r = parseTap(CRASH);
  assert.equal(r.failures.length, 1, "the failure is captured");
  assert.equal(r.failures[0].kind, "crash", "no ERR_ASSERTION means the check never reached its expectation");
});

test("a mixed run keeps both kinds apart", () => {
  const mixed = `TAP version 13
not ok 1 - asserts and fails
  ---
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  ...
not ok 2 - throws before asserting
  ---
  code: 'ERR_INVALID_ARG_TYPE'
  name: 'TypeError'
  ...
1..2
# tests 2
# pass 0
# fail 2
`;
  const r = parseTap(mixed);
  assert.deepEqual(
    r.failures.map((f) => f.kind),
    ["assertion", "crash"],
    "each failure carries its own kind, in order",
  );
});

// THE ROLL-UP IS NOT A KIND OF ITS OWN. A parent saying "1 subtest failed"
// carries ERR_TEST_FAILURE and is dropped where a leaf survived it, so the
// kind must never be read off the parent.
test("a subtest roll-up does not become a crash", () => {
  const nested = `TAP version 13
    not ok 1 - the leaf that actually failed
      ---
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      ...
not ok 1 - the describe block
  ---
  failureType: 'subtestsFailed'
  error: '1 subtest failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..1
# tests 1
# pass 0
# fail 1
`;
  const r = parseTap(nested);
  assert.equal(r.failures.length, 1, "the roll-up is dropped where a leaf survived it");
  assert.equal(r.failures[0].kind, "assertion", "the leaf's kind is the one that counts");
});

test("a passing run carries no failures to classify", () => {
  const green = `TAP version 13
ok 1 - it holds
1..1
# tests 1
# pass 1
# fail 0
`;
  const r = parseTap(green);
  assert.equal(r.pass, 1);
  assert.deepEqual(r.failures, [], "nothing to classify");
});
