// The sidebar, with the editor handed in. Every value it draws comes off the
// index door, and every step here is a read, a write or a string, so a fake
// index drives the whole of it.
// [[spec/design_output/extension#the-view-holds-nothing]]

const { fresh, pressed } = require("./lib/gesture.js");
const { logbookOf } = require("./lib/logbook.js");
const { panelHtml } = require("./lib/panel.js");
const { rowOf } = require("./lib/rows.js");
const { ticketLensOf } = require("./lib/lens.js");
const { opened } = require("./lib/session.js");
const { viewsOf } = require("./lib/views.js");
const { apartOf } = require("./lib/views-shadow.js");
const { statesOf } = require("./lib/states.js");
const { asType, plainOf, withValue } = require("./lib/values.js");
const {
  LOCAL,
  TRACKED,
  entriesIn,
  groupsIn,
  litBy,
  treeIn,
  valuesOfKeys,
} = require("./lib/widgets.js");
const {
  NEW_TICKET,
  lineArgvOf,
  nameIn,
  nextIn,
  ticketPathOf,
} = require("./lib/work.js");

const SCHEMA = "spec/config/level0.schema.json";
// A copy of inRun("bless.json") out of .claude/skills/level0/lib/folders.js, which BLESS_FILE in src/scripts/pull-bless.js names, because the extension loads CommonJS and those modules are ESM. [[spec/design_output/pull#the-bless]]
const BLESS = ".se/.runtime/bless.json";
// The values the sidebar draws, each by its name on the index. [[spec/tickets/the-sidebar-reads-v1]]
const KEYS = "config/keys";
const SCHEMA_VALUE = `config/${SCHEMA}`;
const TRACKED_VALUE = `config/${TRACKED}`;
const LOCAL_VALUE = `config/${LOCAL}`;
const SLICE = "migration/config/sidebar";
const BLESSES = "bless/agent";
const BASES = "views/bases";
const OPEN_TASKS = "work/open-tasks";
const CATALOG = ["index/names", "index/actions"];
const NAMES = [
  KEYS,
  SCHEMA_VALUE,
  TRACKED_VALUE,
  LOCAL_VALUE,
  SLICE,
  BLESSES,
  BASES,
  OPEN_TASKS,
  ...CATALOG,
];
// The rows of the session log, and the ticket files, which the log button and New ticket read. [[spec/tickets/the-sidebar-reads-v1]]
const LOG_ROWS = "log/rows";
const NOTES = "tickets/notes";

function sidebarOf(door) {
  const asked = async (name) => door.index?.values(name);
  const readAll = () => configOf(asked);
  const logbook = logbookOf(
    door,
    async () => (await readAll()).values.get("log.level")?.value ?? "info",
  );
  const held = new Map();
  // The shadow lines told this session, each once. [[spec/tickets/the-sidebar-shadow-compares]]
  const told = new Set();

  const set = async (key, value, how) => {
    const said = await readAll();
    const one = entriesIn(said.schema).find((each) => each.key === key);
    const typed = asType(value, one?.type);
    await door.write(LOCAL, withValue(JSON.stringify(said.local), key, typed));
    await logbook.say("info", "sidebar", `${key} is ${typed}`, { detail: how });
  };

  const entryOf = async (key) => {
    if (!key) return undefined;
    const { schema } = await readAll();
    return entriesIn(schema).find((each) => each.key === String(key));
  };

  // [[spec/design_output/extension#two-buttons-make-both]]
  const lineOf = async (message) => {
    const runs = String(message.runs ?? "");
    const one = await entryOf(message.key);
    if (!one?.asks) return runs;
    const said = String((await door.asks(one.asks)) ?? "");
    if (!said) return undefined;
    return runs.split(`<${one.asks}>`).join(`"${said}"`);
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
      const [slice, blesses, bases, catalog] = await Promise.all([
        asked(SLICE),
        asked(BLESSES),
        asked(BASES).then((some) => some ?? []),
        catalogOf(asked),
      ]);
      if (slice === "shadow")
        await tells(logbook, told, apartOf(groups, bases, catalog));
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
        if (one?.opens) return newTicket(door, asked, one);
        if (one?.pulls) return pullsNext(door, one);
        const runs = await lineOf(message);
        if (runs === undefined) return undefined;
        await logbook.say(
          "info",
          "sidebar",
          `${message.key ?? "a button"} runs ${runs}`,
        );
        return door.runs(runs);
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
        return door.write(BLESS, `${JSON.stringify({ agent })}\n`);
      }
      if (message?.kind !== "set" || !message.key) return undefined;
      return set(String(message.key), message.value, "the config tree");
    },

    // [[spec/design_output/extension#the-local-file-dies]]
    async opened(pid) {
      const local = await asked(LOCAL_VALUE);
      if (local === undefined) return { text: "", cleared: [], same: true };
      const said = opened(JSON.stringify(plainOf(local) ?? {}), pid);
      if (!said.same) await door.write(LOCAL, said.text);
      return said;
    },
  };
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

// Under shadow, each pair the two paths draw apart writes one row, once a session. [[spec/tickets/the-sidebar-shadow-compares]]
async function tells(logbook, told, lines) {
  for (const line of lines) {
    if (told.has(line)) continue;
    told.add(line);
    await logbook.say("info", "shadow", line, { slice: "sidebar" });
  }
}

// The two catalog rows off the index door, and none where no index stands. [[spec/design_output/extension#the-views-section]]
async function catalogOf(asked) {
  const rows = await Promise.all(CATALOG.map(asked));
  return Object.fromEntries(CATALOG.map((name, at) => [name, rows[at]]));
}

// Pull for me takes the ticket the queue names, through the road the ticket's buttons run. [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]
async function pullsNext(door, one) {
  const next = nextIn(await door.asksVerb(lineArgvOf(one.runs)));
  if (!next) return door.tells("Nothing waits on you", "", false);
  const said = await ticketLensOf(door).took("take", next.ticket, next.path);
  if (said?.word !== "refused") await door.opens(next.path);
  return said;
}

// New ticket writes a kind and an empty process where no file stands, and the save fills the rest. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
async function newTicket(door, asked, one) {
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
  const note = await asked(`${NOTES}/${path}`);
  if (note && !note.head && !note.body) await door.write(path, NEW_TICKET);
  return door.opens(path);
}

// [[spec/design_output/extension#the-button-prints-the-log]]
async function shows(door, asked, folder) {
  if (!folder) return undefined;
  const rows = (await asked(LOG_ROWS)) ?? [];
  if (!rows.length) {
    return door.says([
      "No log stands yet. A door writes one the next time it says a line.",
    ]);
  }
  return door.says(
    rows.map(({ text, broken, extra, ...one }) =>
      broken ? text : rowOf(JSON.stringify({ ...one, ...extra })),
    ),
  );
}

module.exports = { NAMES, SCHEMA, sidebarOf };
