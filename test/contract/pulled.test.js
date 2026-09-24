// The pull-commit rule, against a real repository this test builds and throws
// away. The level0 cases hand the door a fake process, so this case proves the
// real git answers the read the door makes.
// [[spec/design_output/bash#a-pull-commit-stands]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { disk } from "../../src/doors/disk.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";

// A history of three commits: a plain one, a pull commit over a ticket, and a plain one on top. [[spec/design_output/bash#a-pull-commit-stands]]
function historyHere(files) {
  const at = files.tempDir("level0-pulled-");
  const door = git(proc(), at);
  door.run(["init", "-b", "main"], true);
  door.run(["config", "user.email", "duck@example.com"], true);
  door.run(["config", "user.name", "Duck Tester"], true);
  const lands = (path, text, subject) => {
    files.write(join(at, path), text);
    door.add(path);
    door.run(["-c", "commit.gpgsign=false", "commit", "-m", subject], true);
  };
  files.makeDir(join(at, "spec", "tickets"));
  lands("notes.md", "# Notes\n", "the first commit");
  lands("spec/tickets/a-child.md", "# Ask\n", "a-child: passes design/draft");
  lands("notes.md", "# Notes\n\nMore.\n", "fix the lint");
  const sha = (rev) => String(proc().run(["git", "rev-parse", rev], { cwd: at }).stdout).trim();
  return { at, pull: sha("HEAD~1"), plain: sha("HEAD") };
}

function box(files, at) {
  return {
    env: {},
    disk: files,
    proc: proc(),
    work: at,
    method: at,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");

test("the real git read refuses a revert of a pull commit, and passes a plain one over it", async () => {
  const files = disk();
  const { at, pull, plain } = historyHere(files);
  try {
    const it = box(files, at);
    assert.match(
      denied(await onBash({ command: `git revert ${pull}` }, it)),
      /ticket pull a-child --back design\/draft/,
    );
    assert.equal(denied(await onBash({ command: `git revert ${plain}` }, it)), "");
    assert.match(denied(await onBash({ command: "git reset --hard HEAD~2" }, it)), /PullCommitStands/);
    assert.equal(denied(await onBash({ command: "git reset --hard HEAD~1" }, it)), "");
  } finally {
    files.remove(at);
  }
});
