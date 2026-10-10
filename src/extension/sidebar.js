// The sidebar, with the editor handed in. Every value it draws comes off the
// index door, and every write posts an action there, so a fake index drives
// the whole of it.
// [[spec/design_output/extension#the-view-holds-nothing]] [[spec/tickets/the-sidebar-writes-through-actions]]

const { fresh, pressed } = require("./lib/gesture.js");
const { logbookOf } = require("./lib/logbook.js");
const { panelHtml } = require("./lib/panel.js");
const { rowOf } = require("./lib/rows.js");
const { COMMAND, actsOn } = require("./lib/lens.js");
const { viewsOf } = require("./lib/views.js");
const { statesOf } = require("./lib/states.js");
const { asType, plainOf } = require("./lib/values.js");
const {
  LOCAL,
  TRACKED,
  entriesIn,
  groupsIn,
  litBy,
  treeIn,
  valuesOfKeys,
} = require("./lib/widgets.js");
const { lineArgvOf, nameIn, ticketPathOf } = require("./lib/work.js");

const SCHEMA = "spec/config/level0.schema.json";
// The actions a sidebar write posts, each by its name on the index. [[spec/tickets/the-sidebar-writes-through-actions]]
const OVERRIDE = "config/override";
const OPENED = "config/opened";
const BLESS_SET = "bless/set";
const NEW = "tickets/new";
// The values the sidebar draws, each by its name on the index. [[spec/tickets/the-sidebar-reads-v1]]
const KEYS = "config/keys";
const SCHEMA_VALUE = `config/${SCHEMA}`;
const TRACKED_VALUE = `config/${TRACKED}`;
const LOCAL_VALUE = `config/${LOCAL}`;
const BLESSES = "bless/agent";
const BASES = "views/bases";
const OPEN_TASKS = "work/open-tasks";
const ACTIONS = "index/actions";
const CATALOG = ["index/names", ACTIONS];
const NAMES = [
  KEYS,
  SCHEMA_VALUE,
  TRACKED_VALUE,
  LOCAL_VALUE,
  BLESSES,
  BASES,
  OPEN_TASKS,
  ...CATALOG,
];
// The rows of the session log, and the ticket files, which the log button and New ticket read. [[spec/tickets/the-sidebar-reads-v1]]
const LOG_ROWS = "log/rows";
// The rows waiting on a person, in queue order, whose first Pull for me takes. [[spec/tickets/the-lens-calls-actions]]
const YOURS = "work/yours";

function sidebarOf(door) {
  const asked = async (name) => door.index?.values(name);
  const readAll = () => configOf(asked);
  const logbook = logbookOf(
    door,
    async () => (await readAll()).values.get("log.level")?.value ?? "info",
  );
  const held = new Map();
  // The window a click holds its override for: the pid opened takes. [[spec/tickets/the-sidebar-writes-through-actions]]
  let window;
  const windowOf = () => String(window ?? door.pid?.() ?? "");

  // A click holds the key for this window, and the local file stays as the owner wrote it. [[spec/tickets/the-sidebar-writes-through-actions]]
  const set = async (key, value, how) => {
    const said = await readAll();
    const one = entriesIn(said.schema).find((each) => each.key === key);
    const typed = asType(value, one?.type);
    await door.index?.calls(OVERRIDE, {
      key,
      value: typeof typed === "string" ? typed : JSON.stringify(typed),
      window: windowOf(),
    });
    await logbook.say("info", "sidebar", `${key} is ${typed}`, { detail: how });
  };

  const entryOf = async (key) => {
    if (!key) return undefined;
    const { schema } = await readAll();
    return entriesIn(schema).find((each) => each.key === String(key));
  };

  // [[spec/design_output/extension#a-gesture-picks-a-state]]
  const press = async (key) => {
    const said = await readAll();
    const one = entriesIn(said.schema).find((each) => each.key === key);
    if (!one) return undefined;
    const ran = pressed(held.get(key) ?? fresh(), door.now(), {
      options: one.options,
      value: said.values.get(key)?.value,
      gesture: one.gesture,
    });
    held.set(key, ran.state);
    if (ran.writes === undefined) return undefined;
    return set(key, ran.writes, ran.how);
  };

  return {
    logbook,

    // [[spec/design_output/extension#the-status-bar-says-it]]
    async states() {
      const said = await readAll();
      return statesOf(said.values);
    },
    names: NAMES,

    async html() {
      const said = await readAll();
      const groups = await counted(
        asked,
        litBy(groupsIn(said.schema, said.values), door.processes?.() ?? {}),
      );
      const [blesses, bases, catalog] = await Promise.all([
        asked(BLESSES),
        asked(BASES).then((some) => some ?? []),
        catalogOf(asked),
      ]);
      return panelHtml({
        groups,
        tree: treeIn(said.schema, [
          { path: TRACKED, said: said.tracked },
          { path: LOCAL, said: said.local },
        ]),
        views: viewsOf(bases, catalog),
        bless: blesses === true,
        script: door.scriptUri(),
        source: door.source(),
        nonce: door.nonce(),
      });
    },

    // [[spec/design_output/extension#a-click-writes-the-file]]
    async took(message) {
      if (message?.kind === "run") {
        const one = await entryOf(message.key);
        // [[spec/tickets/the-work-group-draws-buttons]]
        if (one?.opens) return newTicket(door, one);
        if (one?.pulls) return pullsNext(door, asked);
        return runsLine(door, asked, logbook, message, one);
      }
      // [[spec/design_output/extension#the-views-section]]
      if (message?.kind === "call" && message.calls)
        return door.index?.calls(String(message.calls), message.input ?? {});
      if (message?.kind === "show")
        return shows(door, asked, String(message.reads ?? ""));
      // [[spec/design_output/extension#the-hook-button]]
      if (message?.kind === "hook" && message.key) {
        const key = String(message.key);
        const state = String(door.processes?.()?.[key] ?? "off");
        if (state !== "off") {
          await logbook.say("info", "sidebar", `${key} stops`, { detail: state });
          return door.stopProcess?.(key);
        }
        const how = message.shift ? "debug" : "on";
        await logbook.say("info", "sidebar", `${key} starts`, { detail: how });
        return door.startProcess?.(key, how);
      }
      if (message?.kind === "press" && message.key) return press(String(message.key));
      // The bless file stands outside the config, so no config key draws or writes it: src/extension/lib/panel.js draws the button, and src/extension/webview/clicks.js sends this kind. [[spec/design_output/pull#the-bless]]
      if (message?.kind === "bless") {
        const agent = message.value === true || message.value === "true";
        await logbook.say("info", "sidebar", `an agent at this desk blesses: ${agent}`);
        return door.index?.calls(BLESS_SET, { agent, person: true });
      }
      if (message?.kind !== "set" || !message.key) return undefined;
      return set(String(message.key), message.value, "the config tree");
    },

    // A new window drops the overrides other windows hold, and writes no file. [[spec/tickets/the-sidebar-writes-through-actions]]
    async opened(pid) {
      window = pid;
      return door.index?.calls(OPENED, { window: windowOf() });
    },
  };
}

// The line a button runs, with the answer to its ask in the hole, bare and quoted. [[spec/design_output/extension#two-buttons-make-both]]
async function lineOf(door, message, one) {
  const runs = String(message.runs ?? "");
  if (!one?.asks) return { runs, words: lineArgvOf(runs) };
  const said = String((await door.asks(one.asks)) ?? "");
  if (!said) return undefined;
  const hole = `<${one.asks}>`;
  return {
    runs: runs.split(hole).join(`"${said}"`),
    words: lineArgvOf(runs).map((word) => (word === hole ? said : word)),
  };
}

// A line naming a topic and a verb the index answers posts that action, and any other runs in the terminal. [[spec/tickets/the-sidebar-writes-through-actions]]
async function runsLine(door, asked, logbook, message, one) {
  const line = await lineOf(door, message, one);
  if (line === undefined) return undefined;
  const [topic, verb] = line.words;
  const actions = await asked(ACTIONS);
  const named = (Array.isArray(actions) ? actions : []).some(
    (row) => row?.name === `${topic}/${verb}`,
  );
  const how = named ? `posts ${topic}/${verb}` : `runs ${line.runs}`;
  await logbook.say("info", "sidebar", `${message.key ?? "a button"} ${how}`);
  if (named) return actsOn(door, line.words);
  return door.runs(line.runs);
}

// Every key's value and layer, the schema, and both config files, off the index. [[spec/tickets/the-sidebar-reads-v1]]
async function configOf(asked) {
  const [rows, schema, tracked, local] = await Promise.all(
    [KEYS, SCHEMA_VALUE, TRACKED_VALUE, LOCAL_VALUE].map(asked),
  );
  return {
    values: valuesOfKeys(rows),
    schema: plainOf(schema) ?? {},
    tracked: plainOf(tracked) ?? {},
    local: plainOf(local) ?? {},
  };
}

// A button naming `counts` carries the count the index answers at the name its line asks for. [[spec/tickets/the-sidebar-reads-v1]]
async function counted(asked, groups) {
  for (const group of groups) {
    for (const row of group.rows ?? []) {
      for (const cell of row.cells) {
        if (!cell.counts) continue;
        const said = await asked(nameIn(cell.counts));
        if (Number.isInteger(said)) cell.count = said;
      }
    }
  }
  return groups;
}

// The two catalog rows off the index door, and none where no index stands. [[spec/design_output/extension#the-views-section]]
async function catalogOf(asked) {
  const rows = await Promise.all(CATALOG.map(asked));
  return Object.fromEntries(CATALOG.map((name, at) => [name, rows[at]]));
}

// Pull for me takes the first row of work/yours, through the server's command the ticket's buttons run. [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
async function pullsNext(door, asked) {
  const next = (await asked(YOURS))?.[0];
  if (!next?.ticket || !next?.path)
    return door.tells("Nothing waits on you", "", false);
  const said = await door.executes(COMMAND, "take", next.ticket, next.path);
  if (said?.word !== "refused") await door.opens(next.path);
  return said;
}

// New ticket posts tickets/new, whose verb writes a kind and an empty process where no file stands, and the save fills the rest. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]] [[spec/tickets/the-sidebar-writes-through-actions]]
async function newTicket(door, one) {
  const name = String(
    (await door.asksLine("Name the new ticket, in lower-case words")) ?? "",
  );
  if (!name.trim()) return undefined;
  const path = ticketPathOf(one.opens, name);
  if (!path)
    return door.tells(
      `${name} names no ticket`,
      "Write lower-case words joined by a dash.",
      true,
    );
  await door.index?.acts(NEW, { path });
  return door.opens(path);
}

// [[spec/design_output/extension#the-button-prints-the-log]]
async function shows(door, asked, folder) {
  if (!folder) return undefined;
  const rows = (await asked(LOG_ROWS)) ?? [];
  if (!rows.length) {
    return door.says(["No log stands yet. The next line a door says starts one."]);
  }
  return door.says(
    rows.map(({ text, broken, extra, ...one }) =>
      broken ? text : rowOf(JSON.stringify({ ...one, ...extra })),
    ),
  );
}

module.exports = { NAMES, SCHEMA, sidebarOf };
