// THE BRANCH HEAD BUILDS, AND THE WORKING TREE IS NOT ASKED.
//
// Every other Go check here compiles the folder this runs in, where a file
// somebody has written and not yet committed is present. So an import whose
// package was never added passed every check on the box that wrote it, and
// broke the branch for everybody else: claimsync.go imported
// quackitect/engine/internal/logbook, no commit carried that package, and a
// clean copy of the head answered "package ... is not in std" and then FAIL
// [setup failed] for every test in the engine.
//
// THE COST IS PAID BY WHOEVER CLONES. A reviewer is told to test against a
// clean copy of the head when the working tree is mid-edit, and reads a
// package-wide setup failure instead of the token's own answer.
//
// AND go build NEVER COMPILES A FILE ENDING IN _test.go, so half the source
// went unread. sessiontakesmainback_test.go landed calling OpenLog and Yes
// after both left package main, this check was green over that head, and a
// clean copy of it answered two undefined errors for every test in the engine.
// The same cost, in the same place, for the same reason. So go vet runs beside
// go build: it compiles the test files and reports what the compiler says, and
// it starts no test binary, so the engine TestMain builds is not built here.
//
// So this takes the head as git carries it, into a folder with nothing else in
// it, and builds the engine there.
//
//   node util/checks/the-branch-head-builds.mjs <root>
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok || !why ? "" : "\n         " + why));
};

// THE HEAD, AND NOTHING THE DISK IS HOLDING BESIDE IT. git archive writes what
// the commit carries, so a file that is only on this box cannot answer for one
// that is missing from the branch.
const at = mkdtempSync(join(tmpdir(), "head-builds-"));
let read = true;
try {
  const tar = join(at, "head.tar");
  execFileSync("git", ["-C", root, "archive", "--format=tar", "-o", tar, "HEAD"], { stdio: "pipe" });
  execFileSync("tar", ["-xf", tar, "-C", at], { stdio: "pipe" });
} catch (e) {
  read = false;
  say("the branch head reads into a folder of its own", false, String(e));
}

if (read) {
  say("the head carries the engine's source", existsSync(join(at, "src", "engine", "main.go")),
    "src/engine/main.go is not in the archive, so this would judge an empty folder");

  // THE COMPILER THE INSTALLER PINS, read the way the battery reads it. A go
  // that found its own compiler would build a different program from the one
  // this tree ships, and cgo is what the index needs.
  const cgoEnv = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "quackitect", "cgo.env")
    : join(process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share"), "quackitect", "cgo.env");
  const env = { ...process.env };
  if (existsSync(cgoEnv)) {
    for (const line of readFileSync(cgoEnv, "utf8").split("\n")) {
      const at2 = line.indexOf("=");
      if (at2 <= 0) continue;
      const key = line.slice(0, at2).trim();
      const value = line.slice(at2 + 1).trim().replace(/^"(.*)"$/, "$1");
      if (key === "CC" || key === "CGO_ENABLED" || key === "GOFLAGS") env[key] = value;
    }
  }

  // -gcflags=-e SO ONE RUN NAMES EVERY ERROR, which is what the tree asks of
  // every command that compiles Go here.
  const built = spawnSync("go", ["build", "-gcflags=-e", "./..."],
    { cwd: join(at, "src", "engine"), env, encoding: "utf8" });
  const said = ((built.stdout ?? "") + (built.stderr ?? "")).trim();
  say("go build ./... in src/engine, over a clean copy of the head", built.status === 0,
    said || "go build could not be run at all: " + String(built.error));

  // THE TEST FILES, WHICH go build LEAVES ALONE. A failure here is a compile
  // error in a _test.go file, and it is read the same way as the one above.
  const vetted = spawnSync("go", ["vet", "./..."],
    { cwd: join(at, "src", "engine"), env, encoding: "utf8" });
  const vetSaid = ((vetted.stdout ?? "") + (vetted.stderr ?? "")).trim();
  say("go vet ./... in src/engine, so the test files compile too", vetted.status === 0,
    vetSaid || "go vet could not be run at all: " + String(vetted.error));
}

rmSync(at, { recursive: true, force: true });
console.log("\n1 copy of the head built. " + bad + " failed.");
process.exit(bad ? 1 : 0);
