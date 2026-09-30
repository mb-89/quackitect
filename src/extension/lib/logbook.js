// The sidebar's own lines in the session log. A line posts log/say, whose verb
// appends it, so a line another writer lands in the meantime stays. The row
// shape and the level filter come from the one module every writer reads.
// [[spec/design_output/extension#a-press-writes-a-line]] [[spec/tickets/the-sidebar-writes-through-actions]]

const SHAPE = "../../../.claude/skills/level0/lib/log.js";
const SAY = "log/say";

function logbookOf(door, levelNow) {
  const rows = [];
  let queue = Promise.resolve();

  return {
    lines: () => rows.map((one) => ({ ...one })),
    async say(level, name, said, more) {
      let shape;
      try {
        shape = await import(SHAPE);
      } catch {
        return undefined;
      }
      const row = shape.rowOf(
        new Date(door.now()).toISOString(),
        level,
        name,
        said,
        more,
      );
      if (!shape.writes(await levelNow(), row.level)) return undefined;
      rows.push(row);
      const input = { level: row.level, kind: row.kind, said: row.said };
      if (more) input.extra = more;
      queue = queue.then(() => door.index?.calls(SAY, input)).catch(() => {});
      await queue;
      return row;
    },
  };
}

module.exports = { logbookOf };
