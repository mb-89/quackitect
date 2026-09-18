// The declaration as a pane. The editor draws these same widgets in a sidebar
// and this draws them beside the transcript: one group a row of marks, a press
// on a toggle picking a rung, and the config tree under them.
// [[spec/design_output/extension#one-declaration-draws-it]]

const PANE = "quackitect";
const SCHEMA = "spec/config/level0.schema.json";
const TRACKED = "spec/config/level0.json";
const LOCAL = ".se/config.json";
const SAID = "comment";
const MACHINERY = ["session"];
const CONFIG = "config";
const DRAWS = ["action", "toggle", "status", "count", "table", "process"];
const LEAF = 24;
const GAP = 3;
const NARROW = 6;

// This pane holds its own copy of the gesture, because a hooks module reaches its own folder alone. The editor holds the same rungs under src/extension. [[spec/design_output/extension#a-gesture-picks-a-state]]
const BURST = 800;
const DEAD = 600;
const FAR = 5;

const folded = new Set([CONFIG]);
const bursts = new Map();
let last = "the pane draws the declaration the sidebar draws";

export function register(on, _options) {
  on("session.start", async ($, e, next) => {
    await opened($);
    return next(e);
  });

  on("ui.render", { component: "Pane" }, async ($, e, next) => {
    if (e.requestId !== PANE) return next(e);
    return await drawn($, e);
  });
}

async function opened($) {
  try {
    await $.ui.open({ id: PANE, title: PANE });
  } catch (bad) {
    says($, `the pane stays shut: ${bad?.message ?? bad}`);
  }
}

function says($, said) {
  try {
    $.ui.log(said);
  } catch {}
}

async function drawn($, e) {
  const kit = $.ui.resolve(e);
  const { Box } = kit;
  const read = await sectionsIn($);
  const children = [];
  for (const one of read.groups) children.push(...gridOf($, kit, one));
  children.push(...treeOf($, kit, read.sections));
  children.push(footOf(kit, read.groups));
  return Box({ flexDirection: "column", children });
}

// [[spec/design_output/extension#a-mark-alone-says-it]]
function gridOf($, kit, one) {
  const { Box, Button } = kit;
  const head = headOf($, kit.Button, one.name);
  if (folded.has(one.name)) return [head];
  const marks = one.cells.map((cell) =>
    Button({
      key: `widget:${cell.key}`,
      label: labelOf(cell),
      plain: true,
      dimColor: cell.value === undefined || String(cell.value) === String(cell.rest),
      onPress: () => tapped($, cell),
    }),
  );
  return [
    head,
    Box({ key: `grid:${one.name}`, flexDirection: "row", flexWrap: "wrap", gap: 1, children: marks }),
  ];
}

function headOf($, Button, name) {
  const shut = folded.has(name);
  return Button({
    key: `group:${name}`,
    label: `${shut ? "+" : "-"} ${name}`,
    plain: true,
    onPress: () => {
      if (shut) folded.delete(name);
      else folded.add(name);
      last = `${shut ? "opened" : "folded"} ${name}`;
      redraw($);
    },
  });
}

// A mark at rest stands alone, and a mark away from it carries the value. [[spec/design_output/extension#a-mark-alone-says-it]]
function labelOf(cell) {
  const mark = markOf(cell.icon);
  const value = cell.value === undefined ? "" : String(cell.value);
  return !value || value === String(cell.rest) ? mark : `${mark}${value}`;
}

// [[spec/design_output/extension#a-mark-a-person-types]]
function markOf(at) {
  const said = String(at ?? "");
  if (!/U\+[0-9A-Fa-f]+/.test(said)) return said.split(/\s+/).join("") || "?";
  return said
    .split(/\s+/)
    .filter((one) => /^U\+[0-9A-Fa-f]+$/.test(one))
    .map((one) => String.fromCodePoint(Number.parseInt(one.slice(2), 16)))
    .join("");
}

// A toggle picks a rung and writes it. An action and a process carry a command the editor runs, so the pane names it. [[spec/design_output/extension#a-button-names-its-commands]]
async function tapped($, cell) {
  if (!cell.options.length) {
    last = cell.runs ? `${cell.key} carries ${cell.runs}` : `${cell.key} draws alone`;
    return redraw($);
  }
  const want = await gestured($, cell);
  if (want === undefined) return redraw($);
  try {
    await wrote($, cell.key, want);
    last = `${cell.key} stands at ${want}`;
  } catch (bad) {
    last = `${cell.key} keeps ${cell.value}: ${bad?.message ?? bad}`;
  }
  return redraw($);
}

// The first press of a burst moves one rung, and the count the declaration names reaches the far one. [[spec/design_output/extension#a-gesture-picks-a-state]]
async function gestured($, cell) {
  const at = await $.clock.now();
  const was = bursts.get(cell.key) ?? fresh();
  if (at < was.deadUntil) return undefined;
  const state = at - was.last > BURST ? fresh() : { ...was };
  state.count += 1;
  state.last = at;
  bursts.set(cell.key, state);

  const options = cell.options.map((one) => String(one));
  const far = Number(cell.gesture ?? FAR);
  if (state.count === 1) return String(cell.value) === options[0] ? options[1] : options[0];
  if (state.count === far && options.length > 2) {
    bursts.set(cell.key, { ...fresh(), deadUntil: at + DEAD });
    return options[2];
  }
  return undefined;
}

function fresh() {
  return { last: -Infinity, count: 0, deadUntil: -Infinity };
}

// [[spec/design_output/extension#the-bottom-section]]
function treeOf($, kit, sections) {
  const { Box, Button } = kit;
  const head = headOf($, kit.Button, CONFIG);
  if (folded.has(CONFIG)) return [head];
  const wide = widthIn(sections);
  const under = [];
  for (const one of sections) {
    under.push(Button({ key: `leafgroup:${one.name}`, label: `  ${one.name}`, plain: true, dimColor: true, onPress: () => {} }));
    for (const each of one.rows) under.push(rowOf($, kit, each, wide));
  }
  return [head, Box({ key: "tree", flexDirection: "column", children: under })];
}

function widthIn(sections) {
  let widest = 0;
  for (const one of sections) for (const each of one.rows) widest = Math.max(widest, each.leaf.length);
  return Math.max(NARROW, Math.min(widest + GAP, LEAF));
}

function rowOf($, kit, each, wide) {
  const { Box, Text } = kit;
  const leaf = Text({
    dimColor: true,
    wrap: "truncate-end",
    children: `    ${each.leaf}`.padEnd(wide + 2).slice(0, wide + 2),
  });
  return Box({
    key: `row:${each.key}`,
    flexDirection: "row",
    gap: 1,
    children: [leaf, cellOf($, kit, each)],
  });
}

function cellOf($, kit, each) {
  const { Text, Button } = kit;
  const shown = `${each.value}${each.layer === LOCAL ? " *" : ""}`;
  if (!each.options.length) return Text({ children: shown });
  return Button({
    key: `value:${each.key}`,
    label: shown,
    plain: true,
    onPress: () => tapped($, { ...each, gesture: 1, rest: each.options[0] }),
  });
}

// [[spec/design_output/extension#the-status-bar-says-it]]
function footOf(kit, groups) {
  const { Box, Text } = kit;
  const away = [];
  for (const one of groups) {
    for (const cell of one.cells) {
      if (!cell.options.length || cell.value === undefined) continue;
      if (String(cell.value) !== String(cell.rest)) away.push(`${cell.key} is ${cell.value}`);
    }
  }
  const lines = [Text({ dimColor: true, wrap: "truncate-end", children: last })];
  if (away.length) lines.push(Text({ color: "yellow", wrap: "truncate-end", children: away.join(", ") }));
  return Box({ key: "foot", flexDirection: "column", marginTop: 1, children: lines });
}

function redraw($) {
  try {
    $.ui.invalidate("ui.render");
  } catch {}
}

// The local layer beats the tracked one, so a press writes there and the tracked file stands as every box reads it. [[spec/design_output/extension#the-view-holds-nothing]]
async function wrote($, key, want) {
  const [name, leaf] = key.split(".");
  const said = await readJson($, LOCAL);
  const at = said[name] && typeof said[name] === "object" ? said[name] : {};
  said[name] = { ...at, [leaf]: typed(want) };
  await $.fs.write(await rooted($, LOCAL), `${JSON.stringify(said, null, 2)}\n`);
}

function typed(want) {
  if (want === "true") return true;
  if (want === "false") return false;
  return want;
}

async function sectionsIn($) {
  const [schema, tracked, local] = await Promise.all([
    readJson($, SCHEMA),
    readJson($, TRACKED),
    readJson($, LOCAL),
  ]);
  const values = valuesIn(tracked, local);
  return { groups: widgetsIn(schema, values), sections: treeIn(schema, tracked, local) };
}

// [[spec/design_output/extension#the-tree-holds-config-alone]]
function widgetsIn(schema, values) {
  const out = new Map();
  for (const one of entriesIn(schema)) {
    if (!one.group || !DRAWS.includes(one.widget)) continue;
    const at = values.get(one.key);
    const cells = out.get(one.group) ?? [];
    cells.push({ ...one, value: at?.value, layer: at?.layer ?? "", rest: one.options[0] });
    out.set(one.group, cells);
  }
  return [...out].map(([name, cells]) => ({
    name,
    cells: cells.sort((a, b) => a.row - b.row || a.column - b.column),
  }));
}

function entriesIn(schema) {
  const out = [];
  for (const [name, block] of Object.entries(schema?.properties ?? {})) {
    if (name === SAID || block?.type !== "object") continue;
    for (const [leaf, one] of Object.entries(block.properties ?? {})) {
      if (leaf === SAID || !one || typeof one !== "object") continue;
      out.push({
        ...one,
        key: `${name}.${leaf}`,
        leaf,
        row: Number(one.row ?? 0),
        column: Number(one.column ?? 0),
        options: Array.isArray(one.enum) ? [...one.enum] : boolish(one),
      });
    }
  }
  return out;
}

function boolish(one) {
  return one.type === "boolean" ? ["true", "false"] : [];
}

function valuesIn(tracked, local) {
  const out = new Map();
  for (const [key, value] of flat(tracked)) out.set(key, { value, layer: TRACKED });
  for (const [key, value] of flat(local)) out.set(key, { value, layer: LOCAL });
  return out;
}

function flat(said) {
  const out = new Map();
  for (const [name, block] of Object.entries(said ?? {})) {
    if (name === SAID || !block || typeof block !== "object") continue;
    for (const [leaf, value] of Object.entries(block)) {
      if (leaf === SAID) continue;
      out.set(`${name}.${leaf}`, value);
    }
  }
  return out;
}

function treeIn(schema, tracked, local) {
  const known = new Map(entriesIn(schema).map((one) => [one.key, one.options]));
  const out = [];
  for (const [name, block] of Object.entries(tracked)) {
    if (name === SAID || MACHINERY.includes(name) || !block || typeof block !== "object") continue;
    const under = [];
    for (const [leaf, value] of Object.entries(block)) {
      if (leaf === SAID) continue;
      const key = `${name}.${leaf}`;
      const over = local?.[name]?.[leaf];
      under.push({
        key,
        leaf,
        value: over === undefined ? value : over,
        layer: over === undefined ? TRACKED : LOCAL,
        options: known.get(key) ?? [],
      });
    }
    if (under.length) out.push({ name, rows: under });
  }
  return out;
}

// A relative path in a hooks module answers the plugin's own folder, so the tree's root leads every read. [[spec/design_output/extension#a-box-names-its-home]]
async function readJson($, path) {
  try {
    return JSON.parse(await $.fs.read(await rooted($, path)));
  } catch {
    return {};
  }
}

async function rooted($, path) {
  const root = await $.session.cwd();
  return root ? `${root}/${path}` : path;
}
