// The mint stamp and the backfill — the mechanical halves of
// tsp-node-scoping (req-nodes-scoped-to-iteration). A node minted in a
// bound record's worktree carries minted_in; the backfill stamps the
// standing corpus. The delta-default view rides these stamps.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { ModelFileSystem } from "../engine/model-fs.ts";

const BACKFILL = fileURLToPath(new URL("../engine/bin/backfill-minted.ts", import.meta.url));

describe("the mint stamp", { concurrency: true }, () => {
  // THE STAMP ASKS THE WALK SINCE i34, not the path. It used to read the
  // record id out of the write's root, as the `<id>` in `.worktrees/<id>` — a
  // derivation that stops working the moment there are no worktrees, and would
  // have stopped stamping silently.
  test("a trace node written while a record is bound carries minted_in", () => {
    const lab = mkdtempSync(join(tmpdir(), "mint-"));
    mkdirSync(join(lab, "project", "spec", "trace", "requirement"), { recursive: true });
    const model = new ModelFileSystem(
      () => lab,
      () => "i9-the-fixture-record",
    );
    model.write("project/spec/trace/requirement/req-x.md", "---\nid: req-x\n---\n", null);
    const written = readFileSync(join(lab, "project", "spec", "trace", "requirement", "req-x.md"), "utf8");
    assert.match(written, /^---\nminted_in: i9-the-fixture-record\n/, "the record id rides the node");
  });

  test("with no record bound, and outside the trace, nothing is stamped", () => {
    const lab = mkdtempSync(join(tmpdir(), "mint-"));
    mkdirSync(join(lab, "project", "spec", "trace", "requirement"), { recursive: true });
    mkdirSync(join(lab, "project", "spec", "notes"), { recursive: true });
    const model = new ModelFileSystem(() => lab);
    model.write("project/spec/trace/requirement/req-y.md", "---\nid: req-y\n---\n", null);
    model.write("project/spec/notes/plain.md", "---\nid: plain\n---\n", null);
    assert.doesNotMatch(readFileSync(join(lab, "project", "spec", "trace", "requirement", "req-y.md"), "utf8"), /minted_in/);
    assert.doesNotMatch(readFileSync(join(lab, "project", "spec", "notes", "plain.md"), "utf8"), /minted_in/);
  });
});

describe("the backfill", { concurrency: true }, () => {
  test("standing nodes without a stamp backfill as i1, and stamped ones stay put", () => {
    const lab = mkdtempSync(join(tmpdir(), "backfill-"));
    const g = (...a: string[]): void => {
      execFileSync("git", a, { cwd: lab, stdio: "ignore" });
    };
    g("init");
    g("config", "user.email", "x@machines.invalid");
    g("config", "user.name", "x");
    g("checkout", "-b", "v3");
    mkdirSync(join(lab, "project", "spec", "trace", "requirement"), { recursive: true });
    writeFileSync(join(lab, "project", "spec", "trace", "requirement", "req-old.md"), "---\nid: req-old\n---\n", "utf8");
    writeFileSync(join(lab, "project", "spec", "trace", "requirement", "req-done.md"), "---\nminted_in: i2-x\nid: req-done\n---\n", "utf8");
    g("add", "-A");
    g("commit", "-m", "standing corpus");
    g("branch", "it/i1-the-standing-record");
    execFileSync("node", ["--experimental-strip-types", BACKFILL], { cwd: lab, stdio: "ignore" });
    assert.match(
      readFileSync(join(lab, "project", "spec", "trace", "requirement", "req-old.md"), "utf8"),
      /^---\nminted_in: i1-the-standing-record\n/,
      "the standing node backfills as i1",
    );
    assert.match(
      readFileSync(join(lab, "project", "spec", "trace", "requirement", "req-done.md"), "utf8"),
      /^---\nminted_in: i2-x\n/,
      "an already-stamped node is untouched",
    );
  });
});
