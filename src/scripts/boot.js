#!/usr/bin/env node
// The install a session runs as it starts, so a box boots off the repo alone.
// It brings the plugin manifest and the modules for the next session on a
// cloud box lacking either, and a failed install holds no session up.
// [[spec/design_input/the-cloud-runs-itself#the-boot]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INSTALL_SKIP } from "../../.claude/skills/level0/hooks/level0.js";
import { disk } from "../doors/disk.js";
import { proc } from "../doors/proc.js";

// What a session needs standing: the manifest git ignores, and a module the server imports. [[spec/design_output/level0#the-boot-hook]]
const NEEDS = [
  [".claude", "skills", "level0", ".claude-plugin", "plugin.json"],
  ["node_modules", "wink-nlp", "package.json"],
];

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
export function boots(it) {
  if (!it.env.CLAUDE_CODE_REMOTE && !it.env.SE_CLOUD) return 0;
  if (NEEDS.every((parts) => it.disk.exists(it.join(it.root, ...parts)))) return 0;
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  process.exit(boots({ root, disk: disk(), proc: proc(), join, env: process.env }));
}
