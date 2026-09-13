// THE BRIDGEHEAD. A stub carries this plugin and nothing of the vehicle. At
// session start it reads which vehicle drives the stub, imports that vehicle's
// hooks module from outside its own folder, and hands every event to it.
// This copy is the probe: it reads the module's path off vehicle.json alone,
// and the register comes in behind it.
// [[spec/design_input/a-stub-takes-its-vehicle#the-bridgehead-step-by-step]]

const VEHICLE = "vehicle.json";

export function register(on, options) {
  const held = { table: new Map(), loading: null, fault: "", options };

  on("session.start", async ($, e, next) => {
    await load($, held);
    if (held.fault) await note($, held.fault);
    return chain(handOf($), held, "session.start", e, next);
  });
  on("prompt.submit", ($, e, next) => chain(handOf($), held, "prompt.submit", e, next));
  on("prompt.context", ($, e, next) =>
    chain(handOf($), held, "prompt.context", e, next),
  );
  on("session.compact", ($, e, next) =>
    chain(handOf($), held, "session.compact", e, next),
  );
  on("tool.call", ($, e, next) => chain(handOf($), held, "tool.call", e, next));
  on("tool.describe", ($, e, next) => chain(handOf($), held, "tool.describe", e, next));
  on("turn.complete", ($, e, next) => chain(handOf($), held, "turn.complete", e, next));
  on("agent.spawn", ($, e, next) => chain(handOf($), held, "agent.spawn", e, next));
  on("turn.step", async function* ($, e, next) {
    return yield* stream(handOf($), held, e, next);
  });
}

// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]
function load($, held) {
  if (held.loading) return held.loading;
  held.loading = (async () => {
    try {
      const said = JSON.parse(await $.fs.read(VEHICLE));
      const vehicle = await import(urlOf(String(said.hooks ?? "")));
      vehicle.register((event, filter, handler) => {
        const [when, run] =
          typeof filter === "function" ? [null, filter] : [filter, handler];
        if (!held.table.has(event)) held.table.set(event, []);
        held.table.get(event).push({ when, run });
      }, held.options);
    } catch (error) {
      held.fault = String(error?.stack ?? error);
    }
  })();
  return held.loading;
}

async function note($, fault) {
  try {
    await $.fs.write(".se/bridgehead.fault", `${fault}\n`);
  } catch {}
}

// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]
function handOf($) {
  return {
    fs: {
      read: (...args) => $.fs.read(...args),
      write: (...args) => $.fs.write(...args),
      list: (...args) => $.fs.list(...args),
      exists: (...args) => $.fs.exists(...args),
    },
    process: { run: (...args) => $.process.run(...args) },
    command: { run: (...args) => $.command.run(...args) },
    tool: { register: (...args) => $.tool.register(...args) },
    model: { classify: (...args) => $.model.classify(...args) },
    prompt: { submit: (...args) => $.prompt.submit(...args) },
    session: { messages: (...args) => $.session.messages(...args) },
    agent: { spawn: (...args) => $.agent.spawn(...args) },
  };
}

// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]
function chain(hand, held, event, e, next) {
  const rows = (held.table.get(event) ?? []).filter((one) => matches(one.when, e));
  const step = (at, ev) =>
    at >= rows.length
      ? next(ev)
      : rows[at].run(hand, ev, (later) => step(at + 1, later ?? ev));
  return step(0, e);
}

async function* stream(hand, held, e, next) {
  const rows = held.table.get("turn.step") ?? [];
  if (!rows.length) return yield* next(e);
  return yield* rows[0].run(hand, e, next);
}

function matches(when, e) {
  if (!when) return true;
  return Object.entries(when).every(([key, value]) => e?.[key] === value);
}

// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]
function urlOf(at) {
  if (at.startsWith("file:") || at.startsWith(".")) return at;
  const flat = at.split("\\").join("/");
  return `file://${flat.startsWith("/") ? "" : "/"}${flat}`;
}
