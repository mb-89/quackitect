// THE IDENTITY CHECK MUST NOT MISTAKE THE VOCABULARY FOR A LEAK — i17, 2026-08-18.
//
// prose-inspect item 3 hunts a username, an email, a home directory or a
// machine name that got written into a stored record. The needles are read from
// the environment at runtime, and on a cloud box the environment is not the
// owner's: the host sets `git config user.name` to the AGENT's own name, and the
// records discuss that agent by name on nearly every page.
//
// WHAT THAT COST. 64 findings, every one of them false, on the first run of a
// fresh cloud clone. prose-inspect is an EXIT SCRIPT of boot/prepare_idle, so
// boot could not finish — and that state grants no tools, so the check could not
// be repaired from inside the lane either.
//
// TWO GUARDS ARE PINNED HERE, and both are shaped so a REAL leak still fires.
//
//   1. A bare word the records already speak is muted, and said aloud as a
//      blind spot. Only a BARE word — anything carrying a separator is a path,
//      an address or a machine name, and those stay searchable however common.
//   2. The match is word-boundary aware. HOME is `/root` on a container, and a
//      plain substring test read `tests/roots.test.ts` as a leaked home.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const INSPECT = fileURLToPath(new URL("../engine/bin/prose-inspect.ts", import.meta.url));

/** A throwaway product root carrying only what item 3 reads. */
function rootWithRecords(records: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "se-identity-"));
  const spec = join(root, "spec");
  mkdirSync(spec, { recursive: true });
  for (const [name, body] of Object.entries(records)) writeFileSync(join(spec, name), body);
  // Item 8 reads the desk's card and item 1 reads the entry documents. Neither
  // is what this file is about, so both are given something that passes.
  const method = join(root, "guidance", "method");
  mkdirSync(method, { recursive: true });
  writeFileSync(join(method, "front-desk.md"), "# the desk\n\nAsk for a tour.\n");
  return root;
}

/** Run the inspection with a git identity of our choosing. */
function inspect(root: string, userName: string, home: string): { out: string; status: number | null } {
  const git = (...args: string[]): void => {
    const r = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${args.join(" ")} failed: ${r.stderr}`);
  };
  git("init", "--quiet");
  git("config", "user.name", userName);
  git("config", "user.email", "role@example.invalid");
  const r = spawnSync(process.execPath, [INSPECT, "--root", root], {
    encoding: "utf8",
    cwd: root,
    env: { ...process.env, HOME: home, USERPROFILE: home, HOSTNAME: "a-machine-nobody-names", COMPUTERNAME: "a-machine-nobody-names" },
  });
  return { out: `${r.stdout ?? ""}${r.stderr ?? ""}`, status: r.status };
}

// FOUR FILES IS THE FLOOR. The guard mutes a bare word the records use in MORE
// than three files, so five mentions is comfortably the vocabulary case.
const VOCABULARY: Record<string, string> = {
  "a.md": "The Fable harness runs the walk.\n",
  "b.md": "Fable reads the record.\n",
  "c.md": "What Fable cannot see is what nobody wrote.\n",
  "d.md": "A Fable session ends at idle.\n",
  "e.md": "Fable is not a person.\n",
};

test("a bare word the records already speak is a blind spot, not sixty-four findings", () => {
  const root = rootWithRecords(VOCABULARY);
  const { out, status } = inspect(root, "Fable", "/home/somebody-else");
  assert.equal(status, 0, `the check went red on its own vocabulary:\n${out}`);
  assert.match(out, /BLIND SPOT: the git user name is a bare word/, `the mute was silent, which is worse than the false red:\n${out}`);
});

test("a name the records do NOT speak is still hunted", () => {
  const root = rootWithRecords({ ...VOCABULARY, "leak.md": "signed off by Fnordwick\n" });
  const { out, status } = inspect(root, "Fnordwick", "/home/somebody-else");
  assert.equal(status, 1, `a genuine username in a stored record was not found:\n${out}`);
  assert.match(out, /leak\.md:1 — carries the git user name/, `the finding does not name where it is:\n${out}`);
});

test("a home directory is never muted, however often the records carry it", () => {
  const many: Record<string, string> = {};
  for (const n of ["p", "q", "r", "s", "t"]) many[`${n}.md`] = "the path /home/leaky/notes is quoted here\n";
  const root = rootWithRecords(many);
  const { out, status } = inspect(root, "a-role-nobody-is", "/home/leaky");
  assert.equal(status, 1, `a home directory in five records was muted as vocabulary:\n${out}`);
  assert.match(out, /carries the home directory/, `the finding does not say what it found:\n${out}`);
});

test("a needle inside a longer word is not a leak", () => {
  // The container case, exactly: HOME is /root and the record names a test file.
  const root = rootWithRecords({ "paths.md": "- tests/roots.test.ts\n- engine/rootless.ts\n" });
  const { out, status } = inspect(root, "a-role-nobody-is", "/root");
  assert.equal(status, 0, `a longer word containing the needle was read as a leak:\n${out}`);
});

test("a needle that IS the word is a leak, even mid-path", () => {
  const root = rootWithRecords({ "paths.md": "- /root/notes/where-it-lives.md\n" });
  const { out, status } = inspect(root, "a-role-nobody-is", "/root");
  assert.equal(status, 1, `a real home-directory path was missed by the boundary rule:\n${out}`);
  assert.match(out, /carries the home directory/, `the finding does not say what it found:\n${out}`);
});
