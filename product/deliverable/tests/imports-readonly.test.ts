// se.law-imports-are-read-only, made mechanical. An import may resolve its
// source and READ it. It may never write into it, nor create any structure a
// later write could follow. Witnessed once for real: an npm file: dependency
// became a symlink into the sibling checkout, and a worktree removal followed
// it and deleted that repository. The law is mechanism-agnostic, so these
// checks guard the DIRECTION OF WRITES rather than any one mechanism.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, lstatSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";

const deliverable = resolve(import.meta.dirname, "..");
const repoRoot = resolve(deliverable, "..", "..");

test("no dependency is declared through a path protocol - those install as links into the source", () => {
  const pkg = JSON.parse(readFileSync(join(deliverable, "package.json"), "utf8")) as Record<string, Record<string, string>>;
  for (const group of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    for (const [name, spec] of Object.entries(pkg[group] ?? {})) {
      assert.ok(
        !/^(file:|link:|portal:)/.test(spec),
        `${group}.${name} = "${spec}" is a path dependency; the package manager implements these as a link INTO the imported source, which is how a consumer can delete what it imports`,
      );
    }
  }
});

test("nothing installed reaches outside the repository", () => {
  const nm = join(deliverable, "node_modules");
  if (!existsSync(nm)) return; // an uninstalled tree has nothing to check
  for (const entry of readdirSync(nm)) {
    const p = join(nm, entry);
    let link = false;
    try {
      link = lstatSync(p).isSymbolicLink();
    } catch {
      continue;
    }
    if (!link) continue;
    const target = realpathSync(p);
    assert.ok(
      target.startsWith(repoRoot),
      `node_modules/${entry} resolves to ${target}, outside the repository - a removal here would delete through it`,
    );
  }
});

test("the engine's import resolver only reads", () => {
  // modules.ts is where an import is resolved. Every write call is forbidden
  // there: the resolver reads the manifest and asks git for a version, nothing more.
  const src = readFileSync(join(deliverable, "engine", "modules.ts"), "utf8");
  const writes = [
    "writeFileSync",
    "appendFileSync",
    "mkdirSync",
    "rmSync",
    "rmdirSync",
    "unlinkSync",
    "renameSync",
    "symlinkSync",
    "linkSync",
    "cpSync",
    "copyFileSync",
  ];
  for (const w of writes) {
    assert.ok(!src.includes(w), `engine/modules.ts calls ${w} - an import resolver may only read its source`);
  }
});

test("provisioning installs the toolchain rather than linking a shared one", () => {
  const src = readFileSync(join(deliverable, "engine", "worktree.ts"), "utf8");
  assert.ok(
    !/symlinkSync\([^)]*node_modules/.test(src),
    "a linked toolchain is a path a worktree removal can follow into the shared install",
  );
  assert.match(src, /npm[\s\S]{0,40}install/, "the toolchain is installed into the worktree");
});
