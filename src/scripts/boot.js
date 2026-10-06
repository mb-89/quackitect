#!/usr/bin/env node
// The install a session runs as it starts, so a box boots off the repo alone.
// It brings the plugin manifest for the next session on a cloud box lacking
// it, and a failed install holds no session up.
// [[spec/design_input/the-cloud-runs-itself#the-boot]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";
import { disk } from "../doors/disk.js";
import { proc } from "../doors/proc.js";

// The install steps a cloud box skips. It stands here, because this hook runs before any index binary stands, and installSkip in src/quack/probe_cold.go spells it again. [[spec/design_output/level0#the-boot-hook]]
export const INSTALL_SKIP = "editor-link editor-extensions editor-client go";

// The manifest git ignores. Where it stands the plugin loads, and its bridgehead brings the modules. [[spec/design_output/level0#the-boot-hook]]
const MANIFEST = [".claude", "skills", "level0", ".claude-plugin", "plugin.json"];

// The binary the start verb runs in, and the span a desk session waits on it. [[spec/tickets/the-coordinator-runs-under-level0]]
const BINARY = inRun("bin/se-index").split("/");
export const ASKING = 10_000;

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
export function boots(it) {
  if (!it.env.CLAUDE_CODE_REMOTE && !it.env.SE_CLOUD) return asks(it);
  if (it.disk.exists(it.join(it.root, ...MANIFEST))) return 0;
  const install = it.join(it.root, "src", "scripts", "install.sh");
  try {
    it.proc.run(["sh", install], {
      cwd: it.root,
      env: { SE_INSTALL_SKIP: INSTALL_SKIP },
    });
  } catch {
    // A box carrying no sh starts its session all the same. [[spec/design_output/level0#the-boot-hook]]
  }
  return 0;
}

// A desk session hands its hook input to the start verb, and prints the stop it answers; a binary failing, missing or slow holds no session up. [[spec/tickets/the-coordinator-runs-under-level0]]
function asks(it) {
  const binary = it.join(it.root, ...BINARY);
  if (!it.disk.exists(binary)) return 0;
  try {
    const argv = [binary, "verb", it.join(it.root, "src", "scripts"), "start"];
    const said = it.proc.run(argv, {
      cwd: it.root,
      stdin: it.input(),
      timeoutMs: ASKING,
    });
    if (said.exitCode === 0 && said.stdout.trim()) it.say(said.stdout);
  } catch {
    // A binary that cannot start or outlives the span starts the session all the same. [[spec/tickets/the-coordinator-runs-under-level0]]
  }
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const outside = disk();
  process.exit(
    boots({
      root,
      disk: outside,
      proc: proc(),
      join,
      env: process.env,
      input: () => outside.read(0),
      say: (text) => process.stdout.write(text),
    }),
  );
}
