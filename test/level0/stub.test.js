// A stub out of a vehicle: the files it holds, the record it keeps, and the
// refusal where the vehicle has no upstream.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  brandOf,
  linkOf,
  settingsOf,
  STUB_INSIDE,
  stubFiles,
  stubFolders,
  upstreamOf,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { stubInto } from "../../src/scripts/stub.js";
import { roadsOf } from "../../src/stub/.claude/skills/level0/hooks/bridgehead.js";

const PLUGIN = ".claude/skills/level0";
const MARKER = `${PLUGIN}/.claude-plugin/plugin.json`;
const REMOTE = "git remote get-url origin";
const SETTINGS = JSON.stringify({
  $comment: "the cage",
  env: { CLAUDE_CODE_ENABLE_FUNCTION_HOOKS: "1" },
  permissions: { allow: ["mcp__level0"] },
  skipAutoPermissionPrompt: true,
});

function vehicle() {
  return fakeDisk({
    [`/tools/${MARKER}`]: "{}",
    "/tools/RUNME.sh": "run me",
    "/tools/package.json": '{"version":"0.1.0"}',
    "/tools/.claude/settings.json": SETTINGS,
    "/tools/.se/.runtime/copy.json": '{"id":"abc123","made":"2026-01-01T00:00:00.000Z"}',
    "/tools/src/scripts/cli.js": "the verbs",
    "/tools/src/stub/RUNME.sh": "the shim",
    [`/tools/src/stub/${PLUGIN}/.claude-plugin/plugin.json`]: '{"name":"level0"}',
    [`/tools/src/stub/${PLUGIN}/hooks/hooks.json`]: '{"modules":["./bridgehead.js"]}',
    [`/tools/src/stub/${PLUGIN}/hooks/bridgehead.js`]: "export function register() {}",
  });
}

function origin(url) {
  return fakeGit(
    {
      [REMOTE]: url
        ? { stdout: `${url}\n` }
        : { exitCode: 2, stderr: "error: No such remote 'origin'" },
    },
    "/tools",
  );
}

function walk(files, at, rel = "") {
  const out = [];
  for (const one of files.list(at)) {
    const next = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...walk(files, `${at}/${one.name}`, next));
    else out.push(next);
  }
  return out.sort();
}

test("the brand is the folder the vehicle stands in", () => {
  assert.equal(brandOf("/home/agent/quackitect"), "quackitect");
  assert.equal(brandOf("/home/agent/quackitect/"), "quackitect");
  assert.equal(brandOf("C:\\work\\acme"), "acme");
});

test("the upstream is what --upstream names, else the remote, else nothing", () => {
  assert.equal(
    upstreamOf("git@host:a/b.git\n", "https://host/c/d"),
    "https://host/c/d",
  );
  assert.equal(upstreamOf("git@host:a/b.git\n", ""), "git@host:a/b.git");
  assert.equal(upstreamOf("", undefined), "");
});

test("the record carries the identity, the name, the upstream, the version and when", () => {
  const said = linkOf(
    "abc123",
    "acme",
    "git@host:a/b.git",
    "0.1.0",
    "2026-01-01T00:00:00.000Z",
  );
  assert.deepEqual(said, {
    vehicle: "abc123",
    name: "acme",
    upstream: "git@host:a/b.git",
    version: "0.1.0",
    made: "2026-01-01T00:00:00.000Z",
  });
});

test("the settings keep every tracked key and drop every comment", () => {
  const said = settingsOf(SETTINGS);
  assert.deepEqual(Object.keys(said).sort(), [
    "env",
    "permissions",
    "skipAutoPermissionPrompt",
  ]);
  assert.deepEqual(said.env, { CLAUDE_CODE_ENABLE_FUNCTION_HOOKS: "1" });
  assert.deepEqual(settingsOf("not json"), {});
});

test("the list names the folders, the record, the settings and the template", () => {
  const said = stubFiles(["RUNME.sh", `${PLUGIN}/hooks/hooks.json`], "/here/a-shop");
  for (const folder of stubFolders("/here/a-shop"))
    assert.ok(said.includes(`${folder}/.gitkeep`), folder);
  assert.ok(said.includes("vehicle.json"));
  assert.ok(said.includes(".claude/settings.json"));
  assert.ok(said.includes("RUNME.sh"));
  assert.ok(said.includes(`${PLUGIN}/hooks/hooks.json`));
  assert.equal(said.length, STUB_INSIDE.length + 4);
});

// A reader opening a stub reads the project it names. [[spec/tickets/a-rename-reaches-every-note]]
test("the folders take the stub's own name, and a nameless one falls back", () => {
  assert.deepEqual(stubFolders("/here/a-shop"), [
    "a-shop/spec/tickets",
    "a-shop/spec/guidance",
    "a-shop/src",
  ]);
  assert.deepEqual(stubFolders(""), STUB_INSIDE.map((one) => `project/${one}`));
});

test("a stub holds every file the list names, and nothing else", () => {
  const files = vehicle();
  const said = stubInto(
    files,
    origin("git@host:a/b.git"),
    fakeClock(),
    "/tools",
    "/stub",
  );
  assert.equal(said.ok, true, said.why);
  assert.deepEqual(walk(files, "/stub"), [...said.files].sort());
  for (const one of said.files) assert.ok(files.exists(`/stub/${one}`), one);
  assert.equal(
    files.read(`/stub/${MARKER}`),
    files.read(`/tools/src/stub/${MARKER}`),
    "the plugin is the template's",
  );
  assert.notEqual(
    files.read(`/stub/${MARKER}`),
    files.read(`/tools/${MARKER}`),
    "the method's marker stays behind",
  );
  assert.equal(files.exists("/stub/src/scripts"), false, "the verbs stay behind");
  assert.ok(files.runs.has("/stub/RUNME.sh"), "the shim carries its run bit");
  assert.equal(files.read("/stub/RUNME.sh"), "the shim");
  assert.equal(
    files.read(`/stub/${PLUGIN}/hooks/bridgehead.js`),
    "export function register() {}",
  );
});

test("the record reads off the register and the remote", () => {
  const files = vehicle();
  const said = stubInto(
    files,
    origin("git@host:a/b.git"),
    fakeClock(),
    "/tools",
    "/stub",
  );
  assert.equal(said.ok, true, said.why);
  const record = JSON.parse(files.read("/stub/vehicle.json"));
  assert.equal(record.vehicle, "abc123", "the identity off the register entry");
  assert.equal(record.name, "tools", "the brand off the folder");
  assert.equal(record.upstream, "git@host:a/b.git", "the remote off git");
  assert.equal(record.version, "0.1.0");
  assert.equal(record.made, "2026-01-01T00:00:00.000Z");
  const settings = JSON.parse(files.read("/stub/.claude/settings.json"));
  assert.deepEqual(settings, settingsOf(SETTINGS));
});

test("a vehicle with no remote refuses, and writes nothing", () => {
  const files = vehicle();
  const said = stubInto(files, origin(""), fakeClock(), "/tools", "/stub");
  assert.equal(said.ok, false);
  assert.match(said.why, /--upstream/);
  assert.equal(files.exists("/stub"), false);
});

test("--upstream goes past the refusal, and the record carries it", () => {
  const files = vehicle();
  const said = stubInto(files, origin(""), fakeClock(), "/tools", "/stub", {
    upstream: "https://host/c/d.git",
  });
  assert.equal(said.ok, true, said.why);
  assert.equal(
    JSON.parse(files.read("/stub/vehicle.json")).upstream,
    "https://host/c/d.git",
  );
});

test("a stub lands in the vehicle nowhere", () => {
  const files = vehicle();
  const said = stubInto(
    files,
    origin("git@host:a/b.git"),
    fakeClock(),
    "/tools",
    "/tools",
  );
  assert.equal(said.ok, false);
  assert.equal(files.exists("/tools/vehicle.json"), false);
});

test("the bridgehead takes SE_VEHICLE first, then the folder a cloud box clones into", () => {
  const link = { name: "acme" };
  assert.deepEqual(roadsOf(link, { vehicle: "/desk/acme", home: "/home/agent" }), [
    "/desk/acme",
    "/home/agent/.se/vehicles/acme",
  ]);
  assert.deepEqual(roadsOf(link, { vehicle: "", home: "/home/agent" }), [
    "/home/agent/.se/vehicles/acme",
  ]);
  assert.deepEqual(roadsOf({}, { home: "/home/agent" }), [], "no name, no cloned road");
});
