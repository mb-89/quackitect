// The file lane's laws, each tested against the incident that ruled it.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { fileDelete, fileGlob, filePatch, fileRead, fileWrite, globToRegExp, READ_BUDGET } from "../engine/files.ts";
import { search } from "../engine/search.ts";

function fresh(): string {
  return mkdtempSync(join(tmpdir(), "se-v3-"));
}

test("read returns hash and numbered lines", () => {
  const root = fresh();
  writeFileSync(join(root, "a.md"), "one\ntwo\nthree\n");
  const r = fileRead(root, "a.md");
  assert.equal(r.total_lines, 4);
  assert.match(r.content, /    1\tone/);
  assert.equal(r.hash.length, 12);
});

test("oversize whole-file read is REFUSED with offset/limit remedy — never silently truncated (i8d law)", () => {
  const root = fresh();
  writeFileSync(join(root, "big.md"), "x".repeat(READ_BUDGET + 1));
  assert.throws(
    () => fileRead(root, "big.md"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-103" && e.remedy.args.offset === 1,
  );
  // and the range read works
  const r = fileRead(root, "big.md", { offset: 1, limit: 1 });
  assert.ok(r.content.includes("[line truncated"));
});

test("path escape is refused", () => {
  const root = fresh();
  assert.throws(
    () => fileRead(root, "../outside.txt"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-102",
  );
});

test("CAS: write demands the disk hash; null creates; create-over-existing refused", () => {
  const root = fresh();
  const w = fileWrite(root, "n.md", "hello", null);
  assert.equal(w.created, true);
  assert.throws(
    () => fileWrite(root, "n.md", "clobber", null),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-104",
  );
  assert.throws(
    () => fileWrite(root, "n.md", "clobber", "wronghash0000"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-104",
  );
  const r = fileRead(root, "n.md");
  const w2 = fileWrite(root, "n.md", "hello2", r.hash);
  assert.equal(w2.created, false);
});

test("patch: ambiguous or absent old_string refused, batch is atomic across files", () => {
  const root = fresh();
  writeFileSync(join(root, "p.md"), "aaa bbb aaa");
  writeFileSync(join(root, "q.md"), "ccc");
  assert.throws(
    () => filePatch(root, [{ path: "p.md", old_string: "aaa", new_string: "z" }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-105",
  );
  // atomicity: second op fails, first op must NOT have written
  assert.throws(() =>
    filePatch(root, [
      { path: "q.md", old_string: "ccc", new_string: "CCC" },
      { path: "p.md", old_string: "missing", new_string: "x" },
    ]),
  );
  assert.equal(readFileSync(join(root, "q.md"), "utf8"), "ccc");
  // replace_all and multi-file batch
  const ok = filePatch(root, [
    { path: "p.md", old_string: "aaa", new_string: "z", replace_all: true },
    { path: "q.md", old_string: "ccc", new_string: "CCC" },
  ]);
  assert.equal(ok.applied.length, 2);
  assert.equal(readFileSync(join(root, "p.md"), "utf8"), "z bbb z");
});

test("sequential ops on the same file within one batch compose", () => {
  const root = fresh();
  writeFileSync(join(root, "s.md"), "one two");
  filePatch(root, [
    { path: "s.md", old_string: "one", new_string: "1" },
    { path: "s.md", old_string: "two", new_string: "2" },
  ]);
  assert.equal(readFileSync(join(root, "s.md"), "utf8"), "1 2");
});

test("delete is hash-guarded", () => {
  const root = fresh();
  writeFileSync(join(root, "d.md"), "bye");
  assert.throws(
    () => fileDelete(root, "d.md", "nope00000000"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-104",
  );
  const r = fileRead(root, "d.md");
  assert.deepEqual(fileDelete(root, "d.md", r.hash), { deleted: "d.md" });
});

test("glob matches ** and excludes junk dirs", () => {
  const root = fresh();
  writeFileSync(join(root, "top.test.ts"), "");
  fileWrite(root, "deep/nested/x.test.ts", "", null);
  fileWrite(root, "node_modules/hidden.test.ts", "", null);
  const g = fileGlob(root, "**/*.test.ts");
  assert.deepEqual(g.files, ["deep/nested/x.test.ts", "top.test.ts"]);
  assert.ok(globToRegExp("*.md").test("a.md"));
  assert.ok(!globToRegExp("*.md").test("d/a.md"));
});

test("search finds matches with locations (ripgrep — hard dependency, no fallback)", () => {
  const root = fresh();
  writeFileSync(join(root, "s1.md"), "alpha\nbeta needle gamma\n");
  writeFileSync(join(root, "s2.md"), "no match here\n");
  const r = search(root, "needle");
  assert.equal(r.engine, "ripgrep");
  assert.equal(r.total, 1);
  assert.equal(r.matches[0].path, "s1.md");
  assert.equal(r.matches[0].line, 2);
  // A SINGLE-FILE scope finds its matches too (rg omits the filename
  // there — the parser starved and every match vanished).
  const scoped = search(root, "needle", { path: "s1.md" });
  assert.equal(scoped.total, 1);
  assert.equal(scoped.matches[0].line, 2);
});

test("ref search runs through git grep against a committed state (v2 parity)", () => {
  const root = fresh();
  const git = (...a: string[]) => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a[0]}: ${r.stderr}`);
  };
  git("init", "-q", "-b", "main");
  writeFileSync(join(root, "h.md"), "the committed needle\n");
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "c1");
  writeFileSync(join(root, "h.md"), "needle removed from the tree\n");
  const atRef = search(root, "committed needle", { ref: "main" });
  assert.equal(atRef.engine, "git-grep");
  assert.equal(atRef.total, 1);
  assert.equal(atRef.matches[0].path, "h.md");
  const inTree = search(root, "committed needle");
  assert.equal(inTree.total, 0);
});

test("ref READS reach committed states too: git show + ls-tree through the lane", () => {
  const root = fresh();
  const git = (...a: string[]) => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a[0]}: ${r.stderr}`);
  };
  git("init", "-q", "-b", "main");
  writeFileSync(join(root, "doc.md"), "the committed text\n");
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "c1");
  // The tree loses the file — the ref still serves it.
  rmSync(join(root, "doc.md"));
  const r = fileRead(root, "doc.md", { ref: "main" });
  assert.match(r.content, /the committed text/);
  assert.equal(r.ref, "main");
  const g = fileGlob(root, "**/*.md", { ref: "main" });
  assert.deepEqual(g.files, ["doc.md"]);
  assert.equal(g.ref, "main");
  // A missing path names the spec; an unknown ref names the ref.
  assert.throws(() => fileRead(root, "nope.md", { ref: "main" }), (e) => (e as Rejection).clause === "SE-C-102");
  assert.throws(() => fileGlob(root, "**", { ref: "nope" }), (e) => (e as Rejection).clause === "SE-C-102");
});

test("move fixes every reference form: root-relative, vault-relative, wiki link", async () => {
  const { fileMove } = await import("../engine/move.ts");
  const root = fresh();
  fileWrite(root, "product/guidance/old.md", "# Doc", null);
  fileWrite(root, "product/notes/uses.md", "See product/guidance/old.md and [[guidance/old|the doc]].", null);
  fileWrite(root, "product/m/x.canvas", '{"nodes":[{"id":"a","type":"file","file":"guidance/old.md","x":0,"y":0,"width":1,"height":1}]}', null);
  const r = fileMove(root, "product/guidance/old.md", "product/guidance/new/doc.md");
  assert.equal(r.rewritten.length, 2);
  assert.ok(readFileSync(join(root, "product/notes/uses.md"), "utf8").includes("product/guidance/new/doc.md"));
  assert.ok(readFileSync(join(root, "product/notes/uses.md"), "utf8").includes("[[guidance/new/doc|the doc]]"));
  assert.ok(readFileSync(join(root, "product/m/x.canvas"), "utf8").includes("guidance/new/doc.md"));
  // no silent overwrite
  fileWrite(root, "product/guidance/other.md", "x", null);
  assert.throws(() => fileMove(root, "product/guidance/other.md", "product/guidance/new/doc.md"), (e) => (e as Rejection).clause === "SE-C-104");
});
