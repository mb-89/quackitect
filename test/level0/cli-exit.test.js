// The command line exits once its output drains, so the work tab's pipe reads
// the whole answer of a verb past the pipe's buffer.
// [[spec/tickets/open-tasks-run-in-shadow]]

import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { exitsDrained } from "../../src/scripts/cli.js";

const BIG = 4 * 65536;

test("a verb exits only once a slow reader holds every byte it wrote", async () => {
  const out = new PassThrough({ highWaterMark: 1024 });
  out.write("x".repeat(BIG));
  let read = 0;
  let readAtExit = -1;
  const exited = new Promise((resolve) => {
    exitsDrained(3, out, (code) => {
      readAtExit = read;
      resolve(code);
    });
  });
  out.on("data", (chunk) => {
    read += chunk.length;
  });
  assert.equal(await exited, 3);
  assert.equal(readAtExit, BIG);
});
