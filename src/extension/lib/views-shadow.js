// The sidebar's shadow: the old groups weighed against the views section, one
// line a pair that reads apart. A badge pairs the count of the cell naming it
// under `counts` with its value off index/names, and a button pairs the cell
// whose key swaps the action's slash for a dot with the action off
// index/actions.
// [[spec/tickets/the-sidebar-shadow-compares]]

const { nameIn } = require("./work.js");

// [[spec/tickets/the-sidebar-shadow-compares]]
function apartOf(groups, bases, catalog) {
  const cells = (groups ?? []).flatMap((group) =>
    (group.rows ?? []).flatMap((row) => row.cells ?? []),
  );
  const names = catalog?.["index/names"] ?? [];
  const actions = catalog?.["index/actions"] ?? [];
  const lines = [];
  for (const base of bases ?? []) {
    const badge = base.said?.badge;
    if (badge) {
      const counted = cells.find((cell) => nameIn(cell.counts) === badge);
      const row = names.find((one) => one.name === badge);
      if (counted && row && counted.count !== row.value)
        lines.push(
          `${badge}: the old sidebar counts ${counted.count}, and index/names reads ${row.value}`,
        );
    }
    for (const action of base.said?.actions ?? []) {
      const cell = cells.find(
        (one) => one.key === String(action.calls).replace("/", "."),
      );
      const row = actions.find((one) => one.name === action.calls);
      if (!cell || !row) continue;
      if (cell.help !== row.doc || cell.icon !== row.icon)
        lines.push(
          `${action.calls}: the old sidebar reads ${cell.icon} ${JSON.stringify(cell.help)}, and index/actions reads ${row.icon} ${JSON.stringify(row.doc)}`,
        );
    }
  }
  return lines;
}

module.exports = { apartOf };
