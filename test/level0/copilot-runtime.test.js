// The Copilot cage runs against fake process and filesystem doors.
// [[spec/design_output/copilot#one-runtime]]

import assert from "node:assert/strict";
import { posix } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeSession } from "../../src/doors/fake/session.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { handle } from "../../.claude/skills/level0/lib/copilot-runtime.js";

function fixture() {
  const root = "/tree";
  const disk = fakeDisk({
    "/tree/spec/config/biome.json": "{}",
    "/tree/.se/bin/vale": "",
    "/tree/.se/bin/biome": "",
    "/tree/spec/guidance/voice.md":
      "# Actionables\n\n1. Write clearly.\n2. Keep it short.\n",
    "/tree/spec/config/styles/VoiceJudged/Actionable.yml":
      'message: "Write the next action."',
    "/tree/HANDOVER.md": "Do the work.",
  });
  const proc = fakeProc({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/example\n" },
    "/tree/.se/bin/vale"(_argv, init) {
      if (init.stdin?.includes("bad prose"))
        return {
          exitCode: 0,
          stdout: JSON.stringify({
            "a.md": [
              {
                Check: "VoiceVale.Rule",
                Line: 1,
                Message: "Use fewer words.",
                Severity: "error",
              },
            ],
          }),
        };
      return { exitCode: 0, stdout: "{}", stderr: "" };
    },
    "/tree/.se/bin/biome"(argv) {
      if (argv[1] === "format") return { stdout: "const value = 1;\n" };
      assert.equal(argv[1], "lint");
      return { stdout: '{"diagnostics":[]}' };
    },
  });
  return {
    root,
    disk,
    proc,
    session: fakeSession(root),
    join: posix.join,
    relative: posix.relative,
    platform: "linux",
    env: {},
    calls: proc.ran,
  };
}

const event = (name, more = {}) => ({
  event: name,
  session: "one",
  surface: "vscode",
  tool: "",
  args: {},
  ...more,
});

test("startup injects actual rules and retains a consumed handover", async () => {
  const it = fixture();
  const result = await handle(event("SessionStart"), it);
  assert.match(result.context, /rules: 2/);
  assert.match(result.context, /Write the next action/);
  assert.match(result.context, /Do the work/);
  assert.equal(it.disk.exists("/tree/HANDOVER.md"), false);
  assert.equal(it.session.records.get("one").handovers[0].text, "Do the work.");
  assert.match((await handle(event("SessionStart"), it)).context, /Do the work/);
  assert.equal(
    it.calls.some((one) => one.argv[0] === "claude"),
    false,
  );
});

test("bad writes and self edits are refused before file creation", async () => {
  const it = fixture();
  await handle(event("SessionStart"), it);
  const result = await handle(
    event("PreToolUse", {
      tool: "create_file",
      args: { filePath: "a.md", content: "bad prose" },
    }),
    it,
  );
  assert.match(result.deny, /fewer words/);
  assert.equal(it.disk.exists("/tree/a.md"), false);
  const own = await handle(
    event("PreToolUse", {
      tool: "create_file",
      args: { filePath: ".claude/skills/level0/hooks/hooks.json", content: "{}" },
    }),
    it,
  );
  assert.match(own.deny, /own runtime/);
});

test("a session can write its local handover and other SE files", async () => {
  const it = fixture();
  it.disk.write("/tree/.se/HANDOVER.md", "Continue the local work.");
  await handle(event("SessionStart"), it);
  assert.equal(it.disk.exists("/tree/.se/HANDOVER.md"), false);
  const create = (filePath, content, session = "one") =>
    event("PreToolUse", {
      session,
      tool: "create_file",
      args: { filePath, content },
    });
  assert.deepEqual(
    await handle(create(".se/HANDOVER.md", "Result and retro."), it),
    {},
  );
  it.disk.write("/tree/.se/HANDOVER.md", "Result and retro.");
  it.disk.write("/tree/HANDOVER.md", "Result and retro.");
  assert.deepEqual(await handle(create(".se/copilot/state.json", "{}"), it), {});
  assert.deepEqual(await handle(create(".se/bin/vale", "replacement"), it), {});
  assert.match(
    (await handle(create(".se/HANDOVER.md", "bad prose"), it)).deny,
    /fewer words/,
  );
  assert.deepEqual(await handle(event("Stop"), it), {});
});

test("SE reads and writes need no handover claim", async () => {
  const it = fixture();
  await handle(event("SessionStart"), it);
  const result = await handle(
    event("PreToolUse", {
      tool: "create_file",
      args: { filePath: ".se/HANDOVER.md", content: "Unclaimed result." },
    }),
    it,
  );
  assert.deepEqual(result, {});
  it.disk.write("/tree/.se/notes.md", "Read the notes.");
  assert.deepEqual(
    await handle(
      event("PreToolUse", {
        tool: "read_file",
        args: { filePath: ".se/notes.md" },
      }),
      it,
    ),
    {},
  );
  assert.deepEqual(
    await handle(
      event("PreToolUse", {
        tool: "replace_string_in_file",
        args: { filePath: ".se/notes.md", oldString: "Read", newString: "Check" },
      }),
      it,
    ),
    {},
  );
  assert.deepEqual(
    await handle(
      event("PreToolUse", {
        tool: "apply_patch",
        args: {
          input: "*** Begin Patch\n*** Delete File: .se/notes.md\n*** End Patch",
        },
      }),
      it,
    ),
    {},
  );
});

test("missing initialization refuses and formatting waits until completion", async () => {
  const it = fixture();
  await assert.rejects(handle(event("PreToolUse"), it), /initialization/);
  await handle(event("SessionStart"), it);
  await handle(
    event("PreToolUse", {
      tool: "create_file",
      args: { filePath: "a.js", content: "const value=1" },
    }),
    it,
  );
  assert.equal(
    it.calls.some((one) => one.argv[1] === "format"),
    false,
  );
  it.disk.write("/tree/a.js", "const value=1");
  it.disk.write("/tree/HANDOVER.md", "The result and retro.");
  await handle(event("Stop"), it);
  assert.equal(it.disk.read("/tree/a.js"), "const value = 1;\n");
});

test("cloud requires a claimed work branch", async () => {
  const it = fixture();
  await assert.rejects(
    handle(event("SessionStart", { surface: "cloud" }), it),
    /claim/,
  );
  it.disk.write("/tree/HANDOVER.md", "---\nstatus: held\n---\nDo the work.");
  await handle(event("SessionStart", { surface: "cloud" }), it);
  const result = await handle(
    event("PreToolUse", {
      surface: "cloud",
      tool: "bash",
      args: { command: "git push origin main" },
    }),
    it,
  );
  assert.match(result.deny, /assigned branch/);
});

test("invalid checker reports refuse instead of passing silently", async () => {
  const it = fixture();
  await handle(event("SessionStart"), it);
  it.proc.run = () => ({ exitCode: 0, stdout: "not JSON" });
  const result = await handle(
    event("PreToolUse", {
      tool: "create_file",
      args: { filePath: "a.js", content: "const value=1" },
    }),
    it,
  );
  assert.match(result.deny, /checker cannot run/);
});

test("cloud guards every tool and leaves PR operations to the dispatcher", async () => {
  const it = fixture();
  it.disk.write("/tree/HANDOVER.md", "---\nstatus: held\n---\nDo the work.");
  await handle(event("SessionStart", { surface: "cloud" }), it);
  for (const command of [
    "git switch main",
    "gh pr create",
    "gh pr merge 7",
    "node src/scripts/cli.js work release another",
  ]) {
    assert.ok(
      (
        await handle(
          event("PreToolUse", { surface: "cloud", tool: "bash", args: { command } }),
          it,
        )
      ).deny,
    );
  }
  it.proc.run = () => ({ exitCode: 0, stdout: "main\n" });
  const result = await handle(
    event("PreToolUse", {
      surface: "cloud",
      tool: "create_file",
      args: { filePath: "a.md", content: "good prose" },
    }),
    it,
  );
  assert.match(result.deny, /left its assigned branch/);
});

test("completion rechecks changed content and bounds forced retries", async () => {
  const it = fixture();
  await handle(event("SessionStart"), it);
  await handle(
    event("PreToolUse", {
      tool: "create_file",
      args: { filePath: "a.md", content: "good prose" },
    }),
    it,
  );
  it.disk.write("/tree/a.md", "good prose");
  it.disk.write("/tree/HANDOVER.md", "Result and retro.");
  assert.deepEqual(await handle(event("Stop"), it), {});
  it.disk.write("/tree/a.md", "bad prose");
  assert.match((await handle(event("Stop"), it)).block, /fewer words/);
  for (let retry = 0; retry < 2; retry++)
    assert.ok((await handle(event("Stop", { retry: true }), it)).block);
  assert.match(
    (await handle(event("Stop", { retry: true }), it)).failed,
    /not accepted/,
  );
});

test("twenty valid files finish in five batches without spending failure retries", async () => {
  const it = fixture();
  await handle(event("SessionStart"), it);
  it.disk.write("/tree/HANDOVER.md", "Result and retro.");
  for (let index = 0; index < 20; index++) {
    const filePath = `result-${index}.md`;
    assert.deepEqual(
      await handle(
        event("PreToolUse", {
          tool: "create_file",
          args: { filePath, content: "Good prose." },
        }),
        it,
      ),
      {},
    );
    it.disk.write(`/tree/${filePath}`, "Good prose.");
  }
  for (let batch = 0; batch < 4; batch++) {
    const result = await handle(event("Stop", { retry: batch > 0 }), it);
    assert.match(result.block, /bounded batches/);
    assert.equal(it.session.records.get("one").retries, 0);
    assert.equal(
      Object.keys(it.session.records.get("one").checked).length,
      (batch + 1) * 4,
    );
  }
  assert.deepEqual(await handle(event("Stop", { retry: true }), it), {});
  assert.equal(Object.keys(it.session.records.get("one").checked).length, 20);
});
