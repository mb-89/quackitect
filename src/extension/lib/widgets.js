// The declaration read as widgets. The schema says the type of every key and
// how it draws, and this answers the sections a sidebar holds and the tree the
// bottom section shows.
// [[spec/design_output/extension#one-declaration-draws-it]]

const SAID = "comment";
const WIDE = 5;
const DRAWS = ["action", "toggle", "status", "count", "table"];
const TRACKED = "spec/config/level0.json";
const LOCAL = ".se/config.json";

function entriesIn(schema) {
  const out = [];
  for (const [section, said] of Object.entries(schema?.properties ?? {})) {
    if (section === SAID || said?.type !== "object") continue;
    for (const [leaf, one] of Object.entries(said.properties ?? {})) {
      if (leaf === SAID || !one || typeof one !== "object") continue;
      out.push({
        ...one,
        key: `${section}.${leaf}`,
        section,
        leaf,
        options: Array.isArray(one.enum) ? [...one.enum] : [],
      });
    }
  }
  return out;
}

function drawnIn(schema) {
  return entriesIn(schema).filter((one) => one.group && DRAWS.includes(one.widget));
}

function groupsIn(schema, values) {
  const out = new Map();
  for (const one of drawnIn(schema)) {
    const held = out.get(one.group) ?? [];
    held.push(placed(one, values));
    out.set(one.group, held);
  }
  return [...out].map(([name, cells]) => ({
    name,
    wide: WIDE,
    rows: rowsOf(cells),
  }));
}

function placed(one, values) {
  const at = values?.get(one.key);
  return {
    ...one,
    row: Number(one.row ?? 0),
    column: Number(one.column ?? 0),
    rowSpan: Number(one.rowSpan ?? 1),
    colSpan: Number(one.colSpan ?? 1),
    value: at?.value,
    layer: at?.layer ?? "",
    rest: one.options[0],
    lit: one.widget === "status" ? "dark" : "",
  };
}

function rowsOf(cells) {
  const out = new Map();
  for (const one of cells) {
    const held = out.get(one.row) ?? [];
    held.push(one);
    out.set(one.row, held);
  }
  return [...out]
    .sort((a, b) => a[0] - b[0])
    .map(([row, held]) => ({
      row,
      cells: held.sort((a, b) => a.column - b.column),
    }));
}

// [[spec/design_output/extension#the-bottom-section]]
function treeIn(schema, files) {
  const known = new Map(entriesIn(schema).map((one) => [one.key, one]));
  return files.map((file) => ({
    file: file.path,
    writes: file.path === LOCAL,
    sections: sectionsOf(file.said, known),
  }));
}

function sectionsOf(said, known) {
  const out = [];
  for (const [section, held] of Object.entries(said ?? {})) {
    if (section === SAID || !held || typeof held !== "object") continue;
    const rows = [];
    for (const [leaf, value] of Object.entries(held)) {
      if (leaf === SAID) continue;
      const key = `${section}.${leaf}`;
      const one = known.get(key) ?? {};
      rows.push({
        key,
        leaf,
        value,
        type: one.type ?? typeof value,
        options: one.options ?? [],
        unit: one.unit ?? "",
        help: one.help ?? "",
      });
    }
    if (rows.length) out.push({ name: section, rows });
  }
  return out;
}

// [[spec/design_output/extension#the-view-holds-nothing]]
function valuesOf(tracked, local) {
  const out = new Map();
  for (const [key, value] of flat(tracked)) out.set(key, { value, layer: TRACKED });
  for (const [key, value] of flat(local)) out.set(key, { value, layer: LOCAL });
  return out;
}

function flat(said) {
  const out = new Map();
  for (const [section, held] of Object.entries(said ?? {})) {
    if (section === SAID || !held || typeof held !== "object") continue;
    for (const [leaf, value] of Object.entries(held)) {
      if (leaf === SAID) continue;
      out.set(`${section}.${leaf}`, value);
    }
  }
  return out;
}

module.exports = {
  DRAWS,
  LOCAL,
  TRACKED,
  WIDE,
  drawnIn,
  entriesIn,
  groupsIn,
  treeIn,
  valuesOf,
};
