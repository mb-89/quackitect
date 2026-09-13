// The bridgehead, against the real client. The cheap half asks the client's
// check over the probe plugin. The slow half builds a throwaway stub, copies
// level zero inside the bridgehead's folder, runs one headless turn there, and
// reads the log the vehicle leaves in the stub. SE_SLOW switches the slow half
// on, because it costs a model call.
// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const client = whereIs(files, root, "claude", readTools(files, root));
const PROBE = join(root, "test", "fixtures", "bridgehead");
const CAGE = join(root, ".claude", "skills", "level0");
const ifClient = files.exists(client) ? test : skip;
const asked = String(process.env.SE_SLOW ?? "").trim();
const ifAsked = asked && files.exists(client) ? test : skip;
const WAIT = 900000;

ifClient(
  "the client's check passes the probe, and names the dynamic import nowhere",
  () => {
    const ran = outside.run([client, "plugin", "validate", PROBE], {
      cwd: root,
      timeoutMs: 120000,
    });

    assert.equal(ran.exitCode, 0, ran.stdout + ran.stderr);
    assert.match(ran.stdout, /Validation passed/);
    assert.match(ran.stdout, /\$\.tool\.register \(via handOf\)/);
  },
);

// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]
ifAsked(
  "a headless turn in a stub runs level zero through the bridgehead, and the log says so",
  { timeout: WAIT },
  () => {
    const where = files.tempDir("bridgehead-");
    const stub = join(where, "stub");
    const plugin = join(where, "bridgehead");
    try {
      copyTree(PROBE, plugin);
      copyTree(join(CAGE, "hooks"), join(plugin, "vehicle", "hooks"));
      copyTree(join(CAGE, "lib"), join(plugin, "vehicle", "lib"));

      files.makeDir(join(stub, ".claude"));
      files.write(join(stub, "README.md"), "# a probe stub\n");
      files.write(
        join(stub, "vehicle.json"),
        `${JSON.stringify({ brand: "probe-stub", hooks: "../vehicle/hooks/level0.js" }, null, 2)}\n`,
      );
      files.write(
        join(stub, ".claude", "settings.json"),
        `${JSON.stringify({ env: { CLAUDE_CODE_ENABLE_FUNCTION_HOOKS: "1" } }, null, 2)}\n`,
      );
      git(stub, ["init", "-q"]);
      git(stub, ["add", "-A"]);
      git(stub, [
        "-c",
        "user.name=probe",
        "-c",
        "user.email=probe@example.invalid",
        "commit",
        "-q",
        "-m",
        "a probe stub",
      ]);

      const ran = outside.run(
        [client, "-p", "Say hello in one line.", "--plugin-dir", plugin],
        {
          cwd: stub,
          env: { CLAUDE_CODE_ENABLE_FUNCTION_HOOKS: "1" },
          timeoutMs: WAIT,
        },
      );

      assert.equal(ran.exitCode, 0, ran.stderr);
      assert.equal(
        files.exists(join(stub, ".se", "bridgehead.fault")),
        false,
        "the import holds",
      );
      const rows = files
        .read(join(stub, SESSION))
        .split("\n")
        .filter((one) => one.trim())
        .map((one) => JSON.parse(one));
      assert.ok(
        rows.some((one) => one.kind === "level0" && one.said === "session start"),
        "the vehicle's session.start runs in the stub",
      );
      assert.ok(
        rows.some((one) => one.kind === "reply"),
        "the vehicle's turn.complete reads the reply",
      );
      assert.ok(
        rows.some((one) => /^the canary /.test(String(one.said))),
        "the vehicle reads the answer for its canary",
      );
    } finally {
      files.remove(where);
    }
  },
);

function git(cwd, argv) {
  const ran = outside.run(["git", ...argv], { cwd, timeoutMs: 60000 });
  assert.equal(ran.exitCode, 0, ran.stderr);
}

function copyTree(from, to) {
  files.makeDir(to);
  for (const one of files.list(from)) {
    const here = join(from, one.name);
    const there = join(to, one.name);
    if (one.kind === "dir") copyTree(here, there);
    else files.write(there, files.read(here));
  }
}
