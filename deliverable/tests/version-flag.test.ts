// THE PACKAGE PROVES ITSELF WITH A VERSION FLAG — req-the-entrypoint-answers-its-version-without-starting.
//
// WHAT THIS FILE IS FOR. An install that cannot be asked what it is cannot be
// checked, and the only check available today starts the whole machine. That
// is the one thing a release check must not do: running what the package built
// destroys the lane it runs in.
//
// NOTHING HERE STARTS A LANE, and that is half the claim. The flag is proved by
// the process COMING BACK — a spawn that answers and exits cannot have opened a
// port and waited on it.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const MCP = join(REPO_ROOT, "deliverable", "engine", "bin", "se-mcp.ts");
const MANIFEST = join(REPO_ROOT, "deliverable", "package.json");

function run(args: string[]): { out: string; err: string; status: number | null } {
  const r = spawnSync(process.execPath, [MCP, ...args], {
    encoding: "utf8",
    windowsHide: true,
    // A flag that answers and exits needs no time at all. The ceiling is the
    // proof that nothing waited on a socket.
    timeout: 20_000,
  });
  return { out: String(r.stdout ?? ""), err: String(r.stderr ?? ""), status: r.status };
}

test("--version prints the manifest's version and exits", () => {
  const declared = (JSON.parse(readFileSync(MANIFEST, "utf8")) as { version?: string }).version ?? "";
  assert.notEqual(declared, "", "the manifest declares a version to compare against");
  const r = run(["--version"]);
  assert.equal(r.status, 0, `the flag exits clean — stderr was ${JSON.stringify(r.err)}`);
  assert.equal(r.out.trim(), declared, "the printed line IS the manifest's version, with nothing else on it");
});

test("--version answers with ONE line, so a release check can compare it", () => {
  const r = run(["--version"]);
  const lines = r.out.split(/\r?\n/).filter((l) => l.trim() !== "");
  assert.equal(lines.length, 1, `one line, got ${lines.length}: ${JSON.stringify(lines)}`);
});

test("--version starts no lane: it needs no root and takes none", () => {
  // A ROOT IS WHAT THE SERVER NEEDS, never what the question needs. Asking a
  // package what it is must work before anything is configured, so the flag is
  // answered before the root is resolved — and a root that does not exist is
  // the sharpest way to prove the order.
  const r = run(["--version", "--root", join(REPO_ROOT, "no-such-root-for-a-version-question")]);
  assert.equal(r.status, 0, "the version answer never depends on a root");
  assert.equal(r.out.trim(), (JSON.parse(readFileSync(MANIFEST, "utf8")) as { version: string }).version);
});

test("--help still answers, and it is not the version", () => {
  // The guard on the fix: a new early-exit branch is exactly the shape that
  // swallows the branch beside it.
  const r = run(["--help"]);
  assert.equal(r.status, 0);
  assert.ok(r.out.includes("se — ONE help for the whole system"), "the help text is still the help text");
  assert.ok(r.out.includes("--version"), "and it now lists the flag, so the flag is discoverable");
});
