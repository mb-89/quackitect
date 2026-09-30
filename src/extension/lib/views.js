// The views section of the sidebar: one section a base file under spec/views,
// drawn with the labels, docs, icons and looks the registrations declare. The
// base file names what shows, and writes none of it.
// [[spec/tickets/the-sidebar-renders-generically]]

const NAMES = "index/names";
const ACTIONS = "index/actions";
const COUNT = "count";

function rowIn(rows, name) {
  return (Array.isArray(rows) ? rows : []).find((one) => one?.name === name);
}

// The badge off the row of its name. [[spec/tickets/the-sidebar-renders-generically]]
function badgeOf(names, name) {
  const row = rowIn(names, name);
  if (!row) return "";
  const label = String(row.label ?? "");
  return row.looks === COUNT ? `${label} (${row.value})` : label;
}

// [[spec/tickets/the-sidebar-renders-generically]]
function viewsOf(bases, catalog) {
  const names = catalog?.[NAMES];
  const actions = catalog?.[ACTIONS];
  return (bases ?? []).map((base) => {
    const said = base?.said ?? {};
    const badge = said.badge ? String(said.badge) : "";
    return {
      name: String(base?.name ?? ""),
      badge: badgeOf(names, badge),
      icon: String(rowIn(names, badge)?.icon ?? ""),
      buttons: (Array.isArray(said.actions) ? said.actions : [])
        .filter((one) => one?.button)
        .map((one) => buttonOf(one, rowIn(actions, one.calls))),
    };
  });
}

function buttonOf(one, action) {
  const name = String(one.button);
  return {
    name,
    calls: String(one.calls ?? ""),
    label: String(action?.label || name),
    doc: String(action?.doc ?? ""),
    icon: String(action?.icon ?? ""),
    form: one.edits === "form" && action ? formOf(action) : undefined,
  };
}

// [[spec/tickets/the-sidebar-renders-generically]]
function formOf(action) {
  return {
    fields: (action?.fields ?? []).map((field) => ({
      key: String(field.Key ?? field.Name ?? ""),
      label: String(field.Label || field.Key || field.Name || ""),
      doc: String(field.Doc ?? ""),
    })),
  };
}

module.exports = { badgeOf, formOf, viewsOf };
