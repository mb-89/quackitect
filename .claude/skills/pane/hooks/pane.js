// The config tree as a pane. The editor draws this declaration in a sidebar,
// and this draws the same rows beside the transcript: a group folds under a
// press, a value with options cycles, and the local layer takes the write.
// [[spec/design_output/extension#one-declaration-draws-it]]

const PANE = "quackitect";
const SCHEMA = "spec/config/level0.schema.json";
const TRACKED = "spec/config/level0.json";
const LOCAL = ".se/config.json";
const SAID = "comment";
const MACHINERY = ["session"];
const LEAF = 24;
const GAP = 3;

const folded = new Set();
let last = "the pane reads the tracked layer and the local one";

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

// [[spec/design_output/extension#the-bottom-section]]
async function drawn($, e) {
  const kit = $.ui.resolve(e);
  const { Box, Text } = kit;
  const groups = await sectionsIn($);
  const wide = widthIn(groups, e.props.bodyColumns);
  const children = [];
  for (const one of groups) children.push(...groupOf($, kit, one, wide));
  children.push(
    Box({
      key: "foot",
      marginTop: 1,
      children: [Text({ dimColor: true, wrap: "truncate-end", children: last })],
    }),
  );
  return Box({ flexDirection: "column", children });
}

// The leaf column takes the longest name the tree holds, and the body's own
// width caps it, so a narrow pane keeps the value in view.
function widthIn(groups, columns) {
  let wide = 0;
  for (const one of groups) for (const each of one.rows) wide = Math.max(wide, each.leaf.length);
  return Math.max(6, Math.min(wide + GAP, LEAF, Math.max(8, Number(columns ?? LEAF) - 12)));
}

function groupOf($, kit, one, wide) {
  const { Box, Button } = kit;
  const shut = folded.has(one.name);
  const head = Button({
    key: `group:${one.name}`,
    label: `${shut ? "+" : "-"} ${one.name}`,
    plain: true,
    onPress: () => {
      if (shut) folded.delete(one.name);
      else folded.add(one.name);
      last = `${shut ? "opened" : "folded"} ${one.name}`;
      redraw($);
    },
  });
  if (shut) return [head];
  const under = one.rows.map((each) => rowOf($, kit, each, wide));
  return [head, Box({ key: `rows:${one.name}`, flexDirection: "column", children: under })];
}

function rowOf($, kit, each, wide) {
  const { Box, Text } = kit;
  const leaf = Text({
    dimColor: true,
    wrap: "truncate-end",
    children: `  ${each.leaf}`.padEnd(wide).slice(0, wide),
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
    onPress: () => cycled($, each),
  });
}

async function cycled($, each) {
  const at = each.options.indexOf(each.value);
  const want = each.options[(at + 1) % each.options.length];
  try {
    await wrote($, each.key, want);
    last = `${each.key} stands at ${want}`;
  } catch (bad) {
    last = `${each.key} keeps ${each.value}: ${bad?.message ?? bad}`;
  }
  redraw($);
}

function redraw($) {
  try {
    $.ui.invalidate("ui.render");
  } catch {}
}

// The local layer beats the tracked one, so a press writes there and the
// tracked file stands as every box reads it.
// [[spec/design_output/extension#the-view-holds-nothing]]
async function wrote($, key, want) {
  const [name, leaf] = key.split(".");
  const said = await readJson($, LOCAL);
  const at = said[name] && typeof said[name] === "object" ? said[name] : {};
  said[name] = { ...at, [leaf]: want };
  await $.fs.write(await rooted($, LOCAL), `${JSON.stringify(said, null, 2)}\n`);
}

async function sectionsIn($) {
  const [schema, tracked, local] = await Promise.all([
    readJson($, SCHEMA),
    readJson($, TRACKED),
    readJson($, LOCAL),
  ]);
  const known = knownIn(schema);
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

function knownIn(schema) {
  const out = new Map();
  for (const [name, block] of Object.entries(schema?.properties ?? {})) {
    if (name === SAID || block?.type !== "object") continue;
    for (const [leaf, one] of Object.entries(block.properties ?? {})) {
      if (leaf === SAID || !one || typeof one !== "object") continue;
      out.set(`${name}.${leaf}`, Array.isArray(one.enum) ? [...one.enum] : boolish(one));
    }
  }
  return out;
}

function boolish(one) {
  return one.type === "boolean" ? [true, false] : [];
}

// A relative path in a hooks module answers the plugin's own folder, so the
// tree's root leads every read and the pane draws the session's own config.
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
