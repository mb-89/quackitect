// The log. One file, .se/log/session.jsonl, holds the session, one JSON object
// per line, and this door appends to it. The level this box writes at decides
// which line reaches the file.
// [[spec/design_output/log#every-writer-appends]]

import { rowOf, SESSION, writes } from "../../.claude/skills/level0/lib/log.js";

export function log(disk, clock, init = {}) {
  const folder = init.folder ?? SESSION.slice(0, SESSION.lastIndexOf("/"));
  const path = `${folder}/${SESSION.slice(SESSION.lastIndexOf("/") + 1)}`;
  const rows = [];
  let made = false;

  return {
    path,
    lines: () => rows.map((one) => ({ ...one })),
    async say(level, kind, said, more) {
      const row = rowOf(clock.stamp(), level, kind, said, more);
      if (!writes(init.level, row.level)) return row;
      rows.push(row);
      if (!made) {
        await disk.makeDir(folder);
        made = true;
      }
      await disk.append(path, `${JSON.stringify(row)}\n`);
      return row;
    },
  };
}
