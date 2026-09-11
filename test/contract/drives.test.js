// A vehicle made here, and a project it drives. The whole chain, against the
// real filesystem: the cage links back, the rules come down, and the project
// overrides what it disagrees with.
// [[spec/design_output/vehicle#a-project-borrows-its-cage]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();

describe("a vehicle drives a project", () => {
  let where = "";
  let vehicle = "";
  let project = "";

  const drives = (argv, cwd) =>
    outside.run(["sh", join(vehicle, "RUNME.sh"), ...argv], {
      cwd,
      env: { ...process.env, SE_REGISTRY: join(where, "register") },
    });

  before(() => {
    where = files.tempDir("drives-");
    vehicle = join(where, "vehicle");
    project = join(where, "pyproject");

    files.makeDir(project);
    files.write(join(project, "app.py"), 'def main():\n    print("hello")\n');

    const made = outside.run(["sh", join(root, "RUNME.sh"), "vehicle", "produce", vehicle], {
      cwd: root,
      env: { ...process.env, SE_REGISTRY: join(where, "register") },
    });
    assert.equal(made.exitCode, 0, made.stderr);

    const said = drives(["drive", "."], project);
    assert.equal(said.exitCode, 0, said.stderr);
  });

  after(() => files.remove(where));

  test("the project holds its driver, its cage, and nothing else", () => {
    const driven = JSON.parse(files.read(join(project, ".se", "project.json")));
    const copy = JSON.parse(files.read(join(vehicle, ".se", "copy.json")));
    assert.equal(driven.driver, copy.id, "the project names the copy driving it");

    const cage = join(project, ".claude", "skills", "level0");
    assert.ok(files.exists(join(cage, ".claude-plugin", "plugin.json")), "the cage reads through");
    assert.ok(
      files.exists(join(vehicle, ".claude", "skills", "level0", "hooks", "level0.js")),
      "and the rules it reaches stand in the vehicle",
    );

    const ignored = files.read(join(project, ".gitignore"));
    assert.match(ignored, /^\.se\/$/m);
    assert.match(ignored, /^\.claude\/skills\/level0$/m);

    for (const path of ["src", "spec", "RUNME.sh", "package.json", "test"]) {
      assert.equal(files.exists(join(project, path)), false, `${path} stays in the vehicle`);
    }
    assert.ok(files.exists(join(project, "app.py")), "and what the project already held stays");
  });

  test("the roots read as the vehicle driving the project", () => {
    const said = drives(["vehicle"], project);
    assert.equal(said.exitCode, 0, said.stderr);
    assert.match(said.stdout, new RegExp(`method\\s+${vehicle}`));
    assert.match(said.stdout, new RegExp(`work\\s+${project}`));
    assert.equal(said.stdout.includes("drives itself"), false);
  });

  test("a rule comes down, and the project overrides one by name", () => {
    files.makeDir(join(project, "spec", "guidance"));
    files.write(
      join(project, "spec", "guidance", "voice.md"),
      "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Write python that reads plainly. *\n",
    );
    files.write(
      join(project, "spec", "guidance", "python.md"),
      "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Keep a script runnable alone. *\n",
    );

    const over = drives(["resolve", "spec/guidance/voice.md"], project);
    assert.match(over.stdout, /^work\s/, "the project's own answers");
    assert.match(over.stdout, new RegExp(`over\\s+${vehicle}`), "and says what it stands over");

    const added = drives(["resolve", "spec/guidance/python.md"], project);
    assert.match(added.stdout, /^work\s/, "a name the project alone holds joins the set");

    const down = drives(["resolve", "spec/guidance/working.md"], project);
    assert.match(down.stdout, /^method\s/, "a name it stays silent about comes down");
  });

  test("the config joins key by key", () => {
    files.makeDir(join(project, "spec", "config"));
    files.write(join(project, "spec", "config", "level0.json"), '{"log":{"level":"warn"}}\n');

    const said = drives(["config"], project);
    assert.equal(said.exitCode, 0, said.stderr);

    const rows = said.stdout.split(/\r?\n/);
    const level = rows.find((one) => one.startsWith("log.level"));
    const stop = rows.find((one) => one.startsWith("stop.enabled"));
    assert.match(level, /warn/, "the project's value wins");
    assert.equal(level.includes(vehicle), false, "and the project's file answers it");
    assert.match(stop, new RegExp(vehicle), "a key it stays silent about comes down");
  });

  test("nothing the project does reaches the vehicle", () => {
    const said = files.read(join(vehicle, "spec", "guidance", "voice.md"));
    assert.equal(said.includes("python"), false, "the vehicle's rule stands as it was");
    assert.equal(
      files.exists(join(vehicle, "spec", "guidance", "python.md")),
      false,
      "and a rule the project adds lands nowhere but the project",
    );
    assert.equal(
      JSON.parse(files.read(join(vehicle, "spec", "config", "level0.json"))).log.level,
      "info",
      "the vehicle keeps the value it had",
    );
  });
});
