// The filesystem. The one place this tree reaches disk.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import {
  appendFileSync,
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RUNNABLE = 0o755;

export function disk() {
  return {
    read: (path) => readFileSync(path, "utf8"),
    // A copy carries bytes, because read and write carry text and an archive is no text. [[spec/design_output/doors#a-fake-behaves]]
    copy: (from, to) => copyFileSync(from, to),
    size: (path) => statSync(path).size,
    write: (path, text) => writeFileSync(path, text, { encoding: "utf8" }),
    append: (path, text) => appendFileSync(path, text, { encoding: "utf8" }),
    exists: (path) => existsSync(path),
    runnable: (path) => chmodSync(path, RUNNABLE),
    list: (path) => readdirSync(path, { withFileTypes: true }).map(named),
    makeDir: (path) => mkdirSync(path, { recursive: true }),
    remove: (path) =>
      isLink(path) ? unlinkSync(path) : rmSync(path, { force: true, recursive: true }),
    tempDir: (prefix) => mkdtempSync(join(tmpdir(), prefix)),
    // [[spec/design_output/extension#the-link-stands]]
    link: (target, path) => symlinkSync(target, path, "junction"),
    isLink,
    realOf: (path) => realpathSync(path),
  };
}

function isLink(path) {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

function named(entry) {
  return { name: entry.name, kind: entry.isDirectory() ? "dir" : "file" };
}
