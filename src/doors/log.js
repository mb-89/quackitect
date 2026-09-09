// The log. One file per session under .se/log, and one JSON object per line.
// The disk door offers no append, so each line rewrites the session file, and
// one file per session bounds what that rewrite costs. The level this box
// writes at decides which line reaches the file.
// [[spec/design_output/log#where-the-writer-stands]]

import {
  asLines,
  FOLDER,
  nameOf,
  rowOf,
  writes,
} from "../../.claude/skills/level0/lib/log.js";

export function log(disk, clock, init = {}) {
  const folder = init.folder ?? FOLDER;
  const path = `${folder}/${nameOf(clock.stamp(), init.id ?? id())}`;
  const rows = [];
  let made = false;

  return {
    path,
    lines: () => rows.map((one) => ({ ...one })),
    async say(level, door, said, more) {
      const row = rowOf(clock.stamp(), level, door, said, more);
      if (!writes(init.level, row.level)) return row;
      rows.push(row);
      if (!made) {
        await disk.makeDir(folder);
        made = true;
      }
      await disk.write(path, asLines(rows));
      return row;
    },
  };
}

function id() {
  return Math.random().toString(16).slice(2).padEnd(8, "0").slice(0, 8);
}
