// Dispatch requests stay on the claimed head and survive a failed request.
// [[spec/design_output/copilot#dispatch-and-recovery]]

import assert from "node:assert/strict";
import { posix } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeSession } from "../../src/doors/fake/session.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { dispatch } from "../../.claude/skills/level0/lib/copilot-dispatch.js";

function fixture() {
  const pull = {
    number: 7,
    url: "https://github.com/example/tree/pull/7",
    isDraft: true,
    headRefName: "work/example",
    baseRefName: "main",
  };
  const it = {
    root: "/tree",
    join: posix.join,
    session: fakeSession("/tree"),
    disk: fakeDisk({ "/tree/HANDOVER.md": "---\nstatus: todo\n---\nA brief." }),
    branch: "main",
    head: "0".repeat(40),
    remoteHead: "0".repeat(40),
    comments: [],
    claims: 0,
    fail: false,
    work(root, args) {
      assert.equal(root, it.root);
      assert.deepEqual(args, ["take"]);
      assert.equal(it.branch, "main");
      assert.match(it.disk.read("/tree/HANDOVER.md"), /status: todo/);
      it.claims++;
      it.branch = "work/example";
      it.head = it.claims.toString(16).padStart(40, "0");
      it.disk.write("/tree/HANDOVER.md", "---\nstatus: held\n---\nA brief.");
      return 0;
    },
  };
  it.proc = fakeProc({
    "git status --porcelain": {},
    "git rev-parse --abbrev-ref HEAD": () => ({ stdout: it.branch }),
    "git rev-parse HEAD": () => ({ stdout: it.head }),
    "git fetch origin main": {},
    "git show origin/main:.github/hooks/level0.json": { stdout: "quackitect-level0" },
    "git show origin/main:.github/workflows/copilot-setup-steps.yml": {
      stdout: "quackitect-level0",
    },
    "git push origin work/example": () => {
      it.remoteHead = it.head;
      return {};
    },
    "gh pr list --head work/example --base main --state open --json number,url,isDraft,headRefName,baseRefName":
      () => ({ stdout: JSON.stringify([pull]) }),
    "gh api --paginate --slurp repos/{owner}/{repo}/issues/7/comments?per_page=100":
      () => ({ stdout: JSON.stringify([it.comments]) }),
    gh(argv) {
      assert.deepEqual(argv.slice(0, 5), ["gh", "pr", "comment", "7", "--body"]);
      assert.equal(argv.length, 6);
      it.comments.push({ body: argv[5] });
      return it.fail ? { exitCode: 1 } : {};
    },
  });
  return it;
}

test("dispatch claims once and requests work on the existing draft head", async () => {
  const it = fixture();
  assert.match(await dispatch(it), /Verify that a Copilot job starts/);
  assert.equal(it.claims, 1);
  assert.match(it.comments[0].body, /@copilot/);
  assert.equal(
    it.proc.ran.some(({ argv }) => argv.includes("merge")),
    false,
  );
  assert.match(await dispatch(it), /Already requested/);
  assert.equal(it.comments.length, 1);
});

test("an ambiguous comment failure recovers without claiming or posting twice", async () => {
  const it = fixture();
  it.fail = true;
  await assert.rejects(dispatch(it), /Keep the claim/);
  assert.equal(it.session.records.get("copilot-dispatch").branch, "work/example");
  const attempt = it.head;
  it.head = "b".repeat(40);
  it.fail = false;
  await dispatch(it);
  assert.equal(it.claims, 1);
  assert.equal(it.comments.length, 1);
  assert.ok(it.comments[0].body.includes(`:${attempt} -->`));
  assert.equal(it.session.records.get("copilot-dispatch").attempt, attempt);
  assert.equal(it.remoteHead, it.head);
});

test("a new claim on the same branch sends a distinct dispatch request", async () => {
  const it = fixture();
  await dispatch(it);
  const firstAttempt = it.head;
  it.disk.write("/tree/HANDOVER.md", "---\nstatus: todo\n---\nContinue the work.");
  it.branch = "main";
  await dispatch(it);
  assert.equal(it.claims, 2);
  assert.notEqual(it.head, firstAttempt);
  assert.equal(it.comments.length, 2);
  assert.ok(it.comments[0].body.includes(`:${firstAttempt} -->`));
  assert.ok(it.comments[1].body.includes(`:${it.head} -->`));
  await dispatch(it);
  assert.equal(it.comments.length, 2);
});
