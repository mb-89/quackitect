// The mint stamp and the backfill — the mechanical halves of
// tsp-node-scoping (req-nodes-scoped-to-iteration). A node minted in a
// bound record carries minted_in; the backfill stamps the
// standing corpus. The delta-default view rides these stamps.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { ModelFileSystem } from "../engine/model-fs.ts";
import { fieldArgsFor } from "../engine/stateform.ts";

const BACKFILL = fileURLToPath(new URL("../engine/bin/backfill-minted.ts", import.meta.url));

describe("the mint stamp", { concurrency: true }, () => {
  // THE STAMP ASKS THE WALK, never the path. A path cannot say which record
  // is bound, and a derivation that cannot fail loudly stops stamping in
  // silence.
  test("a trace node written while a record is bound carries minted_in", () => {
    const lab = mkdtempSync(join(tmpdir(), "mint-"));
    mkdirSync(join(lab, "spec", "trace", "requirement"), { recursive: true });
    const model = new ModelFileSystem(
      () => lab,
      () => "i9-the-fixture-record",
    );
    model.write("spec/trace/requirement/req-x.md", "---\nid: req-x\n---\n", null);
    const written = readFileSync(join(lab, "spec", "trace", "requirement", "req-x.md"), "utf8");
    assert.match(written, /^---\nminted_in: i9-the-fixture-record\n/, "the record id rides the node");
  });

  test("with no record bound, and outside the trace, nothing is stamped", () => {
    const lab = mkdtempSync(join(tmpdir(), "mint-"));
    mkdirSync(join(lab, "spec", "trace", "requirement"), { recursive: true });
    mkdirSync(join(lab, "spec", "notes"), { recursive: true });
    const model = new ModelFileSystem(() => lab);
    model.write("spec/trace/requirement/req-y.md", "---\nid: req-y\n---\n", null);
    model.write("spec/notes/plain.md", "---\nid: plain\n---\n", null);
    assert.doesNotMatch(readFileSync(join(lab, "spec", "trace", "requirement", "req-y.md"), "utf8"), /minted_in/);
    assert.doesNotMatch(readFileSync(join(lab, "spec", "notes", "plain.md"), "utf8"), /minted_in/);
  });
});

// raid-debt-delta-default-views: THE VIEW HALF of req-nodes-scoped-to-iteration.
// The stamp already lands (see "the mint stamp" above); this is the resolver
// that reads it — a $-item source defaults to the BOUND record's own
// minted_in, and `:all` on the source name is the explicit opt-in that
// widens back to the whole corpus.
describe("the delta-default view", { concurrency: true }, () => {
  /** Two requirement nodes, minted in two different records, plus a bound
   *  evidence folder for one of them — the exact shape the debt's own
   *  closure bar names: "a reference table in a fresh record showing only
   *  that record's own nodes until the opt-in is set". */
  function twoRecordsRoot(): { root: string; traceRoot: string; evidenceDir: string } {
    const root = mkdtempSync(join(tmpdir(), "se-delta-"));
    const reqDir = join(root, "spec", "trace", "requirement");
    mkdirSync(reqDir, { recursive: true });
    writeFileSync(
      join(reqDir, "req-own.md"),
      '---\nminted_in: i9-the-fixture-record\nid: req-own\ntype: "[[requirement]]"\n---\n\n# own\n',
    );
    writeFileSync(join(reqDir, "req-other.md"), '---\nminted_in: i2-elsewhere\nid: req-other\ntype: "[[requirement]]"\n---\n\n# other\n');
    const evidenceDir = join(root, "spec", "iterations", "i9-the-fixture-record", "evidence");
    mkdirSync(evidenceDir, { recursive: true });
    // loadTrace(traceDir(traceRoot)) appends spec/trace ITSELF —
    // traceRoot is the PROJECT ROOT to resolve trace under, not the trace
    // folder already joined on (see engine/trace.ts's traceDir). Passing the
    // already-joined folder here would look one level too deep and silently
    // find nothing, which is exactly the trap empty-source.test.ts's
    // superficially similar helper never has to notice, because it wants
    // empty regardless.
    return { root, traceRoot: root, evidenceDir };
  }

  test("a bare $-item source defaults to the bound record's own nodes", () => {
    const { root, traceRoot, evidenceDir } = twoRecordsRoot();
    const args = fieldArgsFor(
      { name: "reqs", template: "list", items: ["$requirements"] } as never,
      root,
      traceRoot,
      undefined,
      evidenceDir,
    );
    assert.deepEqual(args.items, ["req-own"], "only the bound record's own requirement shows, not the other record's");
  });

  test("the :all suffix is the explicit opt-in back to the whole corpus", () => {
    const { root, traceRoot, evidenceDir } = twoRecordsRoot();
    const args = fieldArgsFor(
      { name: "reqs", template: "list", items: ["$requirements:all"] } as never,
      root,
      traceRoot,
      undefined,
      evidenceDir,
    );
    assert.deepEqual(args.items, ["req-other", "req-own"], "the opt-in widens the view to both records");
  });

  test("with nothing bound, a $-item source stays corpus-wide (unchanged legacy behaviour)", () => {
    const { root, traceRoot } = twoRecordsRoot();
    const args = fieldArgsFor({ name: "reqs", template: "list", items: ["$requirements"] } as never, root, traceRoot);
    assert.deepEqual(args.items, ["req-other", "req-own"], "no bound record means nothing to scope against");
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
    mkdirSync(join(lab, "spec", "trace", "requirement"), { recursive: true });
    writeFileSync(join(lab, "spec", "trace", "requirement", "req-old.md"), "---\nid: req-old\n---\n", "utf8");
    writeFileSync(join(lab, "spec", "trace", "requirement", "req-done.md"), "---\nminted_in: i2-x\nid: req-done\n---\n", "utf8");
    g("add", "-A");
    g("commit", "-m", "standing corpus");
    g("branch", "it/i1-the-standing-record");
    execFileSync("node", ["--experimental-strip-types", BACKFILL], { cwd: lab, stdio: "ignore" });
    assert.match(
      readFileSync(join(lab, "spec", "trace", "requirement", "req-old.md"), "utf8"),
      /^---\nminted_in: i1-the-standing-record\n/,
      "the standing node backfills as i1",
    );
    assert.match(
      readFileSync(join(lab, "spec", "trace", "requirement", "req-done.md"), "utf8"),
      /^---\nminted_in: i2-x\n/,
      "an already-stamped node is untouched",
    );
  });
});
