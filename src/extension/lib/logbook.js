// The sidebar's own lines in the session log. A line posts log/say, whose verb
// shapes and appends it, so a line another writer lands in the meantime stays.
// The logbook keeps the level filter alone.
// [[spec/design_output/extension#a-press-writes-a-line]] [[spec/tickets/extension-imports-stay-inside]]

// The ladder Ladder in src/modules/log/log.go names, spelled again here because the extension imports its own folder alone. [[spec/tickets/extension-imports-stay-inside]]
const LADDER = ["debug", "info", "warn", "error", "fatal"];
const DEFAULT = "info";
const SAY = "log/say";

// The place of a level on the ladder, an unknown one reading as the default. [[spec/tickets/extension-imports-stay-inside]]
function rankOf(level) {
  const found = LADDER.indexOf(String(level ?? "").toLowerCase());
  return found < 0 ? LADDER.indexOf(DEFAULT) : found;
}

function logbookOf(door, levelNow) {
  const rows = [];
  let queue = Promise.resolve();

  return {
    lines: () => rows.map((one) => ({ ...one })),
    async say(level, name, said, more) {
      const row = {
        ...more,
        at: new Date(door.now()).toISOString(),
        level: LADDER.includes(level) ? level : DEFAULT,
        kind: String(name),
        said: String(said),
      };
      if (rankOf(row.level) < rankOf(await levelNow())) return undefined;
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
