// The command line exits once its output drains, so the work tab's pipe reads
// the whole answer of a verb past the pipe's buffer.
// [[spec/tickets/open-tasks-run-in-shadow]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { exitsDrained } from "../../src/scripts/cli.js";

const BIG = 4 * 65536;
const SIP = 1024;

// A pipe that answers each write once a reader takes every byte up to it, as a pipe to another process does. [[spec/tickets/open-tasks-run-in-shadow]]
function pipe() {
  const waiting = [];
  let held = 0;
  let taken = 0;
  const answer = () => {
    while (waiting.length && waiting[0].upTo <= taken) waiting.shift().done?.();
  };
  return {
    write(chunk, done) {
      held += chunk.length;
      waiting.push({ upTo: held, done });
      answer();
      return false;
    },
    take(count) {
      taken = Math.min(held, taken + count);
      answer();
    },
    get held() {
      return held;
    },
    get taken() {
      return taken;
    },
  };
}

test("a verb exits only once a slow reader holds every byte it wrote", () => {
  const out = pipe();
  out.write("x".repeat(BIG));
  let code;
  let takenAtExit = -1;
  exitsDrained(3, out, (said) => {
    code = said;
    takenAtExit = out.taken;
  });
  assert.equal(code, undefined, "the verb exits before the reader takes a byte");
  while (out.taken < out.held) out.take(SIP);
  assert.equal(code, 3);
  assert.equal(takenAtExit, BIG);
});
