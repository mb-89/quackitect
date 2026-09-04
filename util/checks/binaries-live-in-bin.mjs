// BUILT PROGRAMS LIVE UNDER .bin, NEVER BESIDE THEIR SOURCE.
//
// Five built programs sat in the source folders, dropped there by bare go
// builds: a binary beside its source is stale the moment the code moves, gets
// picked up by whatever resolves the shorter path first, and bloats the tree.
// The one way to build is the installer, util/setup, which puts every program
// under .bin from its manifest. For a compile check, go build -o /dev/null and
// go vet leave nothing behind.
//
//   node util/checks/binaries-live-in-bin.mjs <root>
import { openSync, readSync, closeSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// NOT A STRAY, and named here with its reason so a reader can tell an
// exclusion from an oversight.
const notAStray = {
  "util/checks/trycmd/try.exe": "tracked in git as a fixture beside its own "
    + "source; whether it stays is the retro's call (wk-b42c0e9a53), and until "
    + "then this sweep leaves what git carries alone",
};

// AN EXECUTABLE IS KNOWN BY ITS BYTES, NOT ONLY ITS NAME. engine and viewer
// were dropped without an extension, so .exe alone misses most of the class.
// MZ is a Windows program, 0x7f ELF a Linux one.
function isExecutable(path, name) {
  if (name.endsWith(".exe")) return true;
  const head = Buffer.alloc(4);
  const fd = openSync(path, "r");
  const n = readSync(fd, head, 0, 4, 0);
  closeSync(fd);
  if (n < 4) return false;
  if (head[0] === 0x4d && head[1] === 0x5a) return true;
  return head[0] === 0x7f && head[1] === 0x45 && head[2] === 0x4c && head[3] === 0x46;
}

// THE WALK SKIPS WHAT IS NOT THE TREE'S SOURCE: .bin is where programs belong,
// .git and .se are the engine's and git's own, node_modules and the extension
// build output are dependencies and artifacts with executables of their own.
const skip = new Set([".git", ".se", ".bin", "node_modules", "_to_delete", "out"]);
const found = [];
let looked = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (!skip.has(name)) walk(full);
      continue;
    }
    looked++;
    if (isExecutable(full, name)) found.push(relative(root, full).replace(/\\/g, "/"));
  }
}
walk(root);

say("the tree was walked (" + looked + " files)", looked > 0,
  "nothing was read, so this has nothing to judge and is not doing its job");

const strays = found.filter((f) => !(f in notAStray));
for (const f of strays) {
  say(f + " stays out of the source folders", false,
    "a built program sits beside source. It belongs under .bin, and the "
    + "installer, util/setup, is the one way to build");
}
if (strays.length === 0) {
  say("no executable sits outside .bin", true);
}
for (const name of Object.keys(notAStray)) {
  say("the exclusion " + name + " is still there", found.includes(name),
    "it is excluded by name and the tree no longer holds it, so the entry is stale");
}

console.log("\n" + looked + " file(s) looked at. " + bad + " failed.");
process.exit(bad ? 1 : 0);
