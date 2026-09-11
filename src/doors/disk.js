// The filesystem. The one place this tree reaches disk.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { platform, tmpdir } from "node:os";
import { join } from "node:path";

export function disk() {
  return {
    read: (path) => readFileSync(path, "utf8"),
    write: (path, text) => writeFileSync(path, text, { encoding: "utf8" }),
    exists: (path) => existsSync(path),
    runnable: (path) => chmodSync(path, 0o755),
    link: (from, to) => symlinkSync(from, to, platform() === "win32" ? "junction" : "dir"),
    list: (path) => readdirSync(path, { withFileTypes: true }).map(named),
    makeDir: (path) => mkdirSync(path, { recursive: true }),
    remove: (path) => rmSync(path, { force: true, recursive: true }),
    tempDir: (prefix) => mkdtempSync(join(tmpdir(), prefix)),
  };
}

function named(entry) {
  return { name: entry.name, kind: entry.isDirectory() ? "dir" : "file" };
}
