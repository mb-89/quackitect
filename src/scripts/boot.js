#!/usr/bin/env node
// The install a session runs as it starts, so a box boots off the repo alone.
// It brings the plugin manifest for the next session on a cloud box lacking
// it, and a failed install holds no session up.
// [[spec/design_input/the-cloud-runs-itself#the-boot]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../doors/disk.js";
import { proc } from "../doors/proc.js";

// The install steps a cloud box skips. It stands here, because this hook runs before any index binary stands, and installSkip in src/quack/probe_cold.go spells it again. [[spec/design_output/level0#the-boot-hook]]
export const INSTALL_SKIP = "editor-link editor-extensions editor-client go";

// The manifest git ignores. Where it stands the plugin loads, and its bridgehead brings the modules. [[spec/design_output/level0#the-boot-hook]]
const MANIFEST = [".claude", "skills", "level0", ".claude-plugin", "plugin.json"];

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
export function boots(it) {
  if (!it.env.CLAUDE_CODE_REMOTE && !it.env.SE_CLOUD) return 0;
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  process.exit(boots({ root, disk: disk(), proc: proc(), join, env: process.env }));
}
