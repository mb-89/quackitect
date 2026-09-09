// The log. One file per session under .se/log, and one JSON object per line.
// The disk door offers no append, so each line rewrites the session file, and
// one file per session bounds what that rewrite costs.
// [[spec/design_output/log#where-the-writer-stands]]

import { asLines, dropping, FOLDER, nameOf, rowOf } from "../../.claude/skills/level0/lib/log.js";

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
      rows.push(row);
      if (!made) {
        await disk.makeDir(folder);
        made = true;
      }
      await disk.write(path, asLines(rows));
      return row;
    },

    // [[spec/design_output/log#rotation-really-a-prune]]
    prune(caps = {}) {
      let names = [];
      try {
        names = disk
          .list(folder)
          .filter((one) => one.kind === "file")
          .map((one) => one.name);
      } catch {
        return [];
      }

      const going = dropping(names, clock.now().getTime(), caps);
      for (const name of going) disk.remove(`${folder}/${name}`);
      return going;
    },
  };
}

function id() {
  return Math.random().toString(16).slice(2).padEnd(8, "0").slice(0, 8);
}
