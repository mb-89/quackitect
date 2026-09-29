// Copilot's cage shadow: while the slice reads shadow, the hook runs the
// quack hook verb with the runtime's own answer as old, within a short wait.
// [[spec/tickets/copilot-meets-the-hooks-door]]

import { join } from "node:path";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { asksText } from "../bridge/config.js";

const KEY = "migration.cage";
const SHADOW = "shadow";
// The quack binary the installer builds off src/quack. [[spec/tickets/copilot-meets-the-hooks-door]]
const BINARY = `${RUN}/bin/se-index`;
// The span Copilot's reply waits on the shadow, well under the verb's own wait on the door. [[spec/tickets/go-cage-lands-in-shadow]]
export const SHADOW_WAIT = 1000;

// A failing verb, a spent deadline or a config the reader cannot parse leaves the runtime's answer standing. [[spec/design_output/level0#a-door-that-throws-passes]]
export function shadowsHook(it, name, input, result) {
  try {
    if (asksText(it, KEY) !== SHADOW) return null;
    const exe = it.platform === "win32" ? ".exe" : "";
    return it.proc.run([join(it.root, ...BINARY.split("/")) + exe, "hook", name], {
      cwd: it.root,
      timeoutMs: SHADOW_WAIT,
      stdin: JSON.stringify({ ...input, old: { result } }),
    });
  } catch {
    return null;
  }
}
