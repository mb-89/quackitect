// A stub produced for real: every file reads back, the shim reaches the
// vehicle it names, and no file of the method travels.
// [[spec/design_output/vehicle#nothing-of-the-method-travels]]

import assert from "node:assert/strict";
import { basename, dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { skip, test } from "node:test";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";
import { stubInto } from "../../src/scripts/stub.js";
import { copyHere } from "../../src/scripts/vehicle.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const PLUGIN = ".claude/skills/level0";
const MARKER = `${PLUGIN}/.claude-plugin/plugin.json`;
const METHOD = ["package.json", "src/scripts/cli.js", "spec/guidance/voice.md", ".se"];
const quoted = (said) => String(said).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const either = (path) => `(?:${quoted(path)}|${quoted(path.split("\\").join("/"))})`;

function walk(at, rel = "") {
  const out = [];
  for (const one of files.list(at)) {
    const next = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...walk(join(at, one.name), next));
    else out.push(next);
  }
  return out.sort();
}

test("a stub holds its files, reads every one back, and no file of the method", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  try {
    const said = stubInto(files, git(outside, root), clock(), root, dest);
    assert.equal(said.ok, true, said.why);
    assert.ok(files.exists(dest), "the stub stands");
    assert.deepEqual(walk(dest), [...said.files].sort(), "every file the list names, and nothing else");
    for (const one of said.files) assert.ok(files.read(join(dest, one)) !== undefined, one);
    for (const one of METHOD) assert.equal(files.exists(join(dest, one)), false, `${one} stays behind`);
    assert.equal(
      files.read(join(dest, MARKER)),
      files.read(join(root, "src", "stub", MARKER)),
      "the plugin is the template's",
    );
    assert.notEqual(files.read(join(dest, MARKER)), files.read(join(root, MARKER)), "and not the method's");

    const record = JSON.parse(files.read(join(dest, "vehicle.json")));
    assert.equal(record.vehicle, copyHere(files, clock(), root), "the identity is this vehicle's");
    assert.equal(record.name, basename(root), "the name is this folder's");
    const remote = outside.run(["git", "remote", "get-url", "origin"], { cwd: root });
    assert.equal(record.upstream, remote.stdout.trim(), "the upstream is this vehicle's remote");

    const ran = outside.run(["sh", "-c", "test -x RUNME.sh"], { cwd: dest });
    assert.equal(ran.exitCode, 0, "the shim carries its run bit");
  } finally {
    files.remove(where);
  }
});

// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
test("a stub's plugin carries the name its settings allow, so a tool answers to it", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  try {
    const said = stubInto(files, git(outside, root), clock(), root, dest);
    assert.equal(said.ok, true, said.why);
    const name = basename(PLUGIN);
    assert.equal(JSON.parse(files.read(join(dest, MARKER))).name, name, "the manifest names the folder");
    const skills = files.list(join(dest, ".claude", "skills")).map((one) => one.name);
    assert.deepEqual(skills, [name], "the stub carries the one plugin, under that name");
    const allow = JSON.parse(files.read(join(dest, ".claude", "settings.json"))).permissions.allow;
    assert.ok(allow.includes(`mcp__${name}`), `the settings allow mcp__${name}`);
  } finally {
    files.remove(where);
  }
});

test("the shim hands a verb to the vehicle it names", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  try {
    const said = stubInto(files, git(outside, root), clock(), root, dest);
    assert.equal(said.ok, true, said.why);
    const ran = outside.run(["sh", "RUNME.sh", "vehicle"], {
      cwd: dest,
      env: { SE_VEHICLE: root, SE_INSTALL_SKIP: "index se-lsp editor-client" },
    });
    assert.equal(ran.exitCode, 0, ran.stderr);
    assert.match(ran.stdout, new RegExp(`method\\s+${either(root)}`), "the vehicle answers");
    assert.match(ran.stdout, new RegExp(`work\\s+${either(dest)}`, "i"), "the stub is the work");

    const record = JSON.parse(files.read(join(dest, "vehicle.json")));
    const lost = outside.run(["sh", "RUNME.sh", "vehicle"], {
      cwd: dest,
      env: { SE_VEHICLE: join(where, "nowhere"), SE_REGISTRY: join(where, "empty"), HOME: where },
    });
    assert.equal(lost.exitCode, 1, "a shim finding no vehicle exits one");
    assert.equal(lost.stderr.trim().split("\n").length, 1, "one line");
    assert.ok(lost.stderr.includes(record.upstream), "the line names the upstream");
    assert.match(lost.stderr, new RegExp(`\\.se/vehicles/${record.name}`), "and the install road");
  } finally {
    files.remove(where);
  }
});

// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
test("the shim finds the vehicle through the register, and hands argv and the work root on", () => {
  const where = files.tempDir("stub-");
  const vehicle = join(where, "vehicle");
  const register = join(where, "register");
  const dest = join(where, "stub");
  try {
    files.makeDir(vehicle);
    files.write(
      join(vehicle, "RUNME.sh"),
      '#!/usr/bin/env sh\nprintf "argv=%s\\n" "$*"\nprintf "work=%s\\n" "$SE_WORK_ROOT"\n',
    );
    files.makeDir(register);
    files.write(
      join(register, "registry.json"),
      JSON.stringify([{ id: "abc123", version: "0", method_root: vehicle, registered: "now" }]),
    );
    files.makeDir(dest);
    files.write(
      join(dest, "vehicle.json"),
      JSON.stringify({ vehicle: "abc123", name: "acme", upstream: "https://host/a/b.git" }),
    );
    files.write(join(dest, "RUNME.sh"), files.read(join(root, "src", "stub", "RUNME.sh")));
    const env = { SE_VEHICLE: "", SE_REGISTRY: register, HOME: where };

    const ran = outside.run(["sh", "RUNME.sh", "check", "one"], { cwd: dest, env });
    assert.equal(ran.exitCode, 0, ran.stderr);
    assert.match(ran.stdout, /argv=check one/, "every argument reaches the vehicle");
    assert.match(ran.stdout, new RegExp(`work=${either(dest)}`, "i"), "the work root is the stub");

    files.write(join(register, "registry.json"), "[]");
    const lost = outside.run(["sh", "RUNME.sh", "check"], { cwd: dest, env });
    assert.equal(lost.exitCode, 1, "an empty register refuses");
    assert.equal(lost.stderr.trim().split("\n").length, 1, "one line");
    assert.ok(lost.stderr.includes("https://host/a/b.git"), "the line names the upstream");
    assert.match(lost.stderr, /\.se\/vehicles\/acme/, "and the install road");
  } finally {
    files.remove(where);
  }
});

test("a vehicle with no remote refuses, and the folder stands as it was", () => {
  const where = files.tempDir("stub-");
  const repo = join(where, "repo");
  const dest = join(where, "stub");
  files.makeDir(repo);
  try {
    assert.equal(outside.run(["git", "init", "-q"], { cwd: repo }).exitCode, 0);
    const refused = stubInto(files, git(outside, repo), clock(), root, dest);
    assert.equal(refused.ok, false);
    assert.match(refused.why, /--upstream/);
    assert.equal(files.exists(dest), false, "a refusal writes nothing");

    const named = stubInto(files, git(outside, repo), clock(), root, dest, {
      upstream: "https://host/c/d.git",
    });
    assert.equal(named.ok, true, named.why);
    assert.equal(JSON.parse(files.read(join(dest, "vehicle.json"))).upstream, "https://host/c/d.git");
  } finally {
    files.remove(where);
  }
});

test("the command line writes a stub where it says, and refuses with no folder", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  const env = { SE_INSTALL_SKIP: "index se-lsp editor-client" };
  try {
    const bare = outside.run([process.execPath, "src/scripts/cli.js", "stub"], { cwd: root, env });
    assert.equal(bare.exitCode, 2, "no folder, no stub");
    assert.match(bare.stderr, /stub into/);

    const said = outside.run([process.execPath, "src/scripts/cli.js", "stub", "into", dest], {
      cwd: root,
      env,
    });
    assert.equal(said.exitCode, 0, said.stderr);
    assert.match(said.stdout, /file\(s\) written/);
    assert.ok(files.exists(join(dest, "vehicle.json")), "the record stands where the verb says");

    const named = outside.run(
      [process.execPath, "src/scripts/cli.js", "stub", "into", `${dest}2`, "--upstream", "https://host/c/d.git"],
      { cwd: root, env },
    );
    assert.equal(named.exitCode, 0, named.stderr);
    assert.equal(JSON.parse(files.read(join(`${dest}2`, "vehicle.json"))).upstream, "https://host/c/d.git");
  } finally {
    files.remove(where);
  }
});

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
const slow = String(process.env.SE_SLOW ?? "").trim() ? test : skip;

slow(
  "the bridgehead installs the upstream into an empty home, and the stub reads its driver, its pointer and its hook back",
  { timeout: 600000 },
  async () => {
    const where = files.tempDir("stub-");
    const home = join(where, "home");
    const dest = join(where, "stub");
    files.makeDir(home);
    try {
      const said = stubInto(files, git(outside, root), clock(), root, dest, { upstream: root });
      assert.equal(said.ok, true, said.why);
      const hooks = {};
      const { register } = await import("../../src/stub/.claude/skills/level0/hooks/bridgehead.js");
      register((event, fn) => {
        hooks[event] = fn;
      }, {});
      const logged = [];
      const at = (rel) => (isAbsolute(rel) ? rel : join(dest, rel));
      const env = {
        HOME: home,
        SE_VEHICLE: "",
        SE_INSTALL_SKIP: "vale biome vale-ls go index se-lsp editor-client editor-link editor-extensions git-hooks",
      };
      const $ = {
        fs: {
          read: async (rel) => files.read(at(rel)),
          exists: async (rel) => files.exists(at(rel)),
          write: async (rel, text) => {
            files.makeDir(dirname(at(rel)));
            files.write(at(rel), text);
          },
        },
        process: { run: async (argv, init = {}) => outside.run(argv, { ...init, cwd: dest, env }) },
        http: { fetch: async () => ({ ok: true, status: 200, text: "{}" }) },
        ui: { log: (text) => logged.push(text) },
      };
      await hooks["session.start"]($, { cwd: dest }, async (e) => e);

      const cloned = join(home, ".se", "vehicles", basename(root));
      assert.ok(files.exists(join(cloned, "RUNME.sh")), `the upstream stands at ${cloned}: ${logged.join(" ")}`);
      const driver = JSON.parse(files.read(join(dest, ".se", "project.json"))).driver;
      assert.equal(driver, copyHere(files, clock(), cloned), "the driver is the clone's identity");
      const pointer = JSON.parse(files.read(join(dest, ".se", "vehicle.json")));
      assert.equal(pointer.method, cloned, "the pointer names the clone");
      assert.ok(pointer.port >= 6510, "the pointer carries a port");
      assert.equal(
        files.read(join(dest, ".claude", "skills", "level0", "hooks", "level0.js")),
        files.read(join(cloned, ".claude", "skills", "level0", "hooks", "level0.js")),
        "the hook is the clone's",
      );
      const entry = JSON.parse(files.read(join(home, ".se", "registry.json"))).find(
        (one) => one.method_root === cloned,
      );
      assert.equal(entry.port, pointer.port, "the register holds the clone at the pointer's port");
      assert.equal(logged.length, 1, "one line");
      assert.match(logged[0], /stands/);

      const shim = outside.run(["sh", "RUNME.sh", "vehicle"], { cwd: dest, env });
      assert.equal(shim.exitCode, 0, shim.stderr);
      assert.match(shim.stdout, new RegExp(`method\\s+${either(cloned)}`), "the shim finds the clone");
    } finally {
      files.remove(where);
    }
  },
);
