// The tools the index lists, read once a box off the binary the hook registers
// them from, so the standing text and the Bash description name what the
// session holds.
// [[spec/tickets/describe-reaches-the-tool-list]]

import { binaryOf, windowsOf } from "../../.claude/skills/level0/lib/index-tools.js";

// The index's tool list, cached on the box. A binary that stands nowhere or answers nothing lists none. [[spec/tickets/describe-reaches-the-tool-list]]
export function indexToolsOf(box) {
  if (box.indexTools) return box.indexTools;
  let listed = [];
  try {
    const ran = box.proc.run([binaryOf(box.method, windowsOf(box.method)), "tools"], {
      cwd: box.work,
    });
    if (ran.exitCode === 0) listed = JSON.parse(String(ran.stdout ?? ""));
  } catch {}
  box.indexTools = Array.isArray(listed) ? listed : [];
  return box.indexTools;
}
