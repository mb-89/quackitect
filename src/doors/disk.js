// The filesystem. The one place this tree reaches disk.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import {
  appendFileSync,
  chmodSync,
  closeSync,
  copyFileSync,
  cpSync,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";

const RUNNABLE = 0o755;

export function disk() {
  return {
    read: (path) => readFileSync(path, "utf8"),
    // A copy carries bytes, because read and write carry text and an archive is no text. [[spec/design_output/doors#a-fake-behaves]]
    copy: (from, to) => copyFileSync(from, to),
    // A folder lands in one call, bytes and all, and `keeps` prunes a path and everything under it. [[spec/tickets/disk-door-copies-a-folder]]
    copyFolder,
    size: (path) => statSync(path).size,
    // The text past a byte offset, so a reader of a growing file reads what it has yet to see. [[spec/design_output/log#a-reader-reads-new-rows]]
    readFrom,
    // A move keeps the bytes and leaves nothing behind, where a copy doubles the file. [[spec/guidance/retro/collect]]
    move: (from, to) => renameSync(from, to),
    modified: (path) => statSync(path).mtimeMs,
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

// The files it copies, counted. `keeps` reads a path relative to the folder, in slashes, and a folder it refuses carries nothing under it along. [[spec/tickets/disk-door-copies-a-folder]]
function copyFolder(from, to, keeps = () => true) {
  let count = 0;
  cpSync(from, to, {
    recursive: true,
    filter: (at) => {
      if (at === from) return true;
      if (!keeps(relative(from, at).split(sep).join("/"))) return false;
      if (statSync(at).isFile()) count++;
      return true;
    },
  });
  return count;
}

function readFrom(path, at) {
  const held = openSync(path, "r");
  try {
    const from = Math.max(0, Number(at) || 0);
    const bytes = Buffer.alloc(Math.max(0, fstatSync(held).size - from));
    const got = bytes.length ? readSync(held, bytes, 0, bytes.length, from) : 0;
    return bytes.subarray(0, got).toString("utf8");
  } finally {
    closeSync(held);
  }
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
