// The sidebar's own lines in the session log. A line appends through the
// editor door, so a line another writer lands in the meantime stays. The row
// shape comes from the one module every writer reads.
// [[spec/design_output/extension#a-press-writes-a-line]]

const SHAPE = "../../../.claude/skills/level0/lib/log.js";

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
      queue = queue
        .then(() => door.append(shape.SESSION, shape.asLines([row])))
        .catch(() => {});
      await queue;
      return row;
    },
  };
}

module.exports = { logbookOf };
