// The git door's batch over a fake process that refuses an answer past its
// buffer, the way the real spawn does. A read of every ticket on every work
// branch grows with the branches, so the door asks in pieces.
// [[spec/design_output/work#the-listing-reads-git-once]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { BATCH_ASKS, fakeGit } from "../../src/doors/fake/git.js";
import { framed } from "../../src/scripts/work-read.js";

const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";

// A cat-file that answers each ask with its own name, and throws past the cap, as a spawn past its buffer does. [[spec/design_output/work#the-listing-reads-git-once]]
function capped(cap) {
  return fakeGit({
    "git cat-file --batch": (_argv, init) => {
      const asks = String(init.stdin ?? "")
        .split("\n")
        .filter(Boolean);
      if (asks.length > cap) {
        throw Object.assign(new Error("spawnSync git ENOBUFS"), { code: "ENOBUFS" });
      }
      return {
        stdout: asks
          .map((ask) => `${SHA} blob ${Buffer.byteLength(ask)}\n${ask}\n`)
          .join(""),
      };
    },
  });
}

test("a batch past the buffer answers in pieces, every ask in its order", () => {
  const git = capped(BATCH_ASKS);
  const asks = Array.from(
    { length: BATCH_ASKS * 2 + 1 },
    (_, at) => `tip${at}:spec/tickets/t${at}.md`,
  );
  const read = framed(git.batch(asks), asks);
  assert.equal(read.size, asks.length);
  for (const ask of asks) assert.equal(read.get(ask), ask);
  assert.equal(
    git.ran.filter((one) => one.argv.join(" ") === "git cat-file --batch").length,
    3,
    "three pieces carry the asks",
  );
});

test("a batch of nothing runs no git", () => {
  const git = capped(BATCH_ASKS);
  assert.equal(git.batch([]), "");
  assert.deepEqual(git.ran, []);
});
