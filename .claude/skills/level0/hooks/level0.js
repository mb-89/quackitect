// THE FORWARDER. The one hook a project carries: it posts every event to the
// hooks door the standing file names, and does what the effects say. Where the
// post fails, the hook verb's down word answers in its place. It imports
// nothing, and a door that answers nothing blocks nothing but a guarded call.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

// The standing file the hooks door writes, which StandingFile in src/modules/hooks/hooks.go owns. [[spec/design_output/level0#the-bridgehead-and-the-server]]
const STANDING = ".se/.runtime/hooks.json"; // .claude/skills/level0/lib/folders.js owns the folder
// The binary under the method root, which serveIndexBin in src/quack/serve_verb.go names, and the scripts folder its verb road takes. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const BINARY = ".se/.runtime/bin/se-index"; // .claude/skills/level0/lib/folders.js owns the folder
const SCRIPTS = "src/scripts";
const INSTALL = "src/scripts/install.sh";
// The skip list of [[spec/design_output/level0#the-setup-writes-the-flag]], which installSkip in src/quack/probe_cold.go spells again.
const INSTALL_SKIP = "editor-link editor-extensions editor-client go";
// The span the down word and the install take: the start of an index on a fresh clone, and an install, each at the host's cap. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const STARTING = 180_000;
const INSTALLING = 600_000;
// The span a clear the Stop answers waits for the turn's completion, before a timer runs it. [[spec/tickets/the-clear-runs-live-remote]]
export const CLEAR_FALLBACK_MS = 2000;
// The newest transcript rows a post carries, which the door picks off. [[spec/tickets/a-reply-follows-its-prompt]]
const ROWS = 64;

let root = "";
let method = "";
let stepText = "";
let waiting = null;
let busy = 0;
// The events the forwarder's own engine calls raise. [[spec/tickets/level0-hooks-forward-to-go]]
const OWN = new Set([
  "fs.read",
  "fs.exists",
  "http.fetch",
  "process.run",
  "session.usage",
  "session.messages",
  "env.get",
  "ui.log",
]);

// The engine takes one session start a module, so this registers none, and pull-tool.js wraps it. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function register(on, options) {
  method = String(options?.method ?? "").replace(/[\\/]+$/, "");
  root = "";
  stepText = "";
  waiting = null;
  busy = 0;
  // It wraps the door road, so a clear the turn's own hooks leave waiting runs once they answer. [[spec/tickets/the-clear-runs-live-remote]]
  on("turn.complete", clearsAtTurnEnd);
  on("*", seen);
  on("turn.step", streams);
}

async function seen($, e, next) {
  const event = String(next?.event ?? "event");
  if (busy > 0 && OWN.has(event)) return next(e);
  if (event === "session.start" && e?.cwd) root = String(e.cwd);
  const sent = await sentOf($, event, e, next);
  let step = stepOf(await asked($, event, sent), event, { asks: true });
  // A held call asks back for the newest rows on agent.spoke, with the effect's call id. [[spec/tickets/spoke-answer-reaches-the-door]]
  if (step.rows !== undefined) {
    const spoken = {
      tool: e?.tool,
      agentId: e?.agentId,
      text: stepText,
      rows: await rowsOf($),
      call: step.rows,
    };
    step = stepOf(await asked($, "agent.spoke", spoken), event, { asks: false });
  }
  if (step.answer?.spawn) return spawns($, step.answer, event);
  // [[spec/tickets/clear-answers-off-the-door]]
  if (step.answer?.clear) return clears($, step.answer, e, next);
  if (step.answer?.event !== undefined) return next(step.answer.event);
  if (step.answer !== undefined) return step.answer;
  const adds = {
    ...(step.blocks ? { blocks: step.blocks } : {}),
    ...(step.after ? { context: step.after } : {}),
  };
  return Object.keys(adds).length ? merged(await next(e), adds) : next(e);
}

// A prompt reaches the door with who sent it and the newest rows before it, which the door picks its before off. [[spec/tickets/a-reply-follows-its-prompt]]
async function sentOf($, event, e, next) {
  if (event !== "prompt.submit" || !e || typeof e !== "object") return e;
  const rows = await rowsOf($);
  return { ...e, rows, ...(next?.origin ? { origin: next.origin } : {}) };
}

// The door's answer, or the down word's where the post fails. [[spec/tickets/level0-hooks-forward-to-go]]
function asked($, event, e) {
  return held(() => posted($, event, e));
}

// The forwarder's own engine calls raise events of their own, which pass by it while the calls run. [[spec/tickets/level0-hooks-forward-to-go]]
async function held(work) {
  busy += 1;
  try {
    return await work();
  } finally {
    busy -= 1;
  }
}

async function posted($, event, e) {
  const fill = await fillOf($);
  try {
    const standing = JSON.parse(String(await $.fs.read(STANDING)));
    const said = await $.http.fetch(`http://127.0.0.1:${standing?.port}/hook`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${standing?.token}`,
      },
      body: JSON.stringify({ event, e: e ?? null, root, ...fill }),
    });
    if (!said.ok) throw new Error(`status ${said.status}`);
    return JSON.parse(said.text || "{}");
  } catch {
    return down($, event, e);
  }
}

// The hook verb's down word, once, with the event's fields on its input. A cloud box carrying no binary installs first. A box where neither runs passes the event, and says so. [[spec/tickets/level0-hooks-forward-to-go]]
async function down($, event, e) {
  const bin = `${method || "."}/${BINARY}${windowsOf(method) ? ".exe" : ""}`;
  try {
    if (!(await exists($, bin)) && (await cloud($))) {
      await $.process.run(["sh", `${method || "."}/${INSTALL}`], {
        cwd: method || undefined,
        env: { SE_INSTALL_SKIP: INSTALL_SKIP },
        timeoutMs: INSTALLING,
      });
    }
    const ran = await $.process.run(
      [bin, "verb", `${method || "."}/${SCRIPTS}`, "hook", "down", event],
      { stdin: JSON.stringify(e ?? {}), timeoutMs: STARTING, ...(root ? { cwd: root } : {}) },
    );
    says($, String(ran?.stderr ?? "").trim());
    return JSON.parse(String(ran?.stdout ?? "").trim() || "{}");
  } catch (error) {
    says($, `Level zero runs uncaged here: neither the hooks door nor its down word answers. ${error?.message ?? error}`);
    return {};
  }
}

async function exists($, at) {
  try {
    return Boolean(await $.fs.exists(at));
  } catch {
    return false;
  }
}

// The engine reads each env call off the source, so each cloud variable stands spelled at its own call. [[spec/tickets/pull-env-meets-the-engine]]
async function cloud($) {
  try {
    return Boolean((await $.env.get("CLAUDE_CODE_REMOTE")) || (await $.env.get("SE_CLOUD")));
  } catch {
    return false;
  }
}

// Whether the method root reads as a Windows path, since the hook reaches no platform of its own. [[spec/tickets/the-hook-registers-index-tools]]
function windowsOf(at) {
  return /^[A-Za-z]:/.test(at) || at.includes("\\");
}

// The fill of the context, which the door keeps on the events it measures. [[spec/design_output/stop#the-context-hands-over]]
async function fillOf($) {
  try {
    const tokens = (await $.session.usage())?.context?.tokens;
    return Number.isFinite(tokens) ? { fill: tokens } : {};
  } catch {
    return {};
  }
}

// The newest transcript rows, cut to the role, the id, the text and whether the row carries results, so the body stays under the door's cap. [[spec/tickets/a-reply-follows-its-prompt]]
function rowsOf($) {
  return held(() => rowsRead($));
}

async function rowsRead($) {
  try {
    const rows = await $.session.messages();
    return (Array.isArray(rows) ? rows : []).slice(-ROWS).map((row) => {
      const id = row?.id ?? row?.uuid;
      return {
        role: String(row?.role ?? ""),
        ...(id ? { id: String(id) } : {}),
        ...(typeof row?.text === "string" ? { text: row.text } : {}),
        ...((row?.toolResults ?? []).length ? { results: true } : {}),
      };
    });
  } catch {
    return [];
  }
}

// The step the effects answer, in order: a result answers the call, with its text as a deny, a block holds the Stop, rows ask back, and an after rides the answer as context. [[spec/design_output/model#the-effects]]
export function stepOf(answer, event, { asks }) {
  const after = [];
  const blocks = [];
  for (const one of answer?.effects ?? []) {
    const kind = String(one?.kind ?? "");
    if (kind === "result")
      return { answer: one.text ? { deny: String(one.text) } : one.result };
    if (kind === "block") return { answer: { block: String(one.text ?? "") } };
    // A clear passes the turn, and the conversation clears behind it. [[spec/tickets/clear-answers-off-the-door]]
    if (kind === "clear")
      return { answer: { pass: true, clear: { prompt: String(one.text ?? "") } } };
    if (kind === "event") return { answer: { event: one.result } };
    if (kind === "rows" && asks) return { rows: String(one.call ?? "") };
    if (kind !== "after" || !one.text) continue;
    const text = String(one.text);
    const name = String(one.name ?? "");
    // A named after on a describe answers the field it names, and one on the prompt context rides as a named block. [[spec/tickets/brief-answers-off-the-door]] [[spec/tickets/describe-answers-off-the-door]]
    if (name && event === "tool.describe") return { answer: { after: { [name]: text } } };
    if (name && event === "prompt.context") blocks.push({ name, text });
    else after.push(name ? `# ${name}\n${text}` : text);
  }
  return {
    ...(blocks.length ? { blocks } : {}),
    ...(after.length ? { after } : {}),
  };
}

// An answer with an after merged in: a list grows, a text takes the new one below it, and anything else stands replaced. [[spec/design_output/schema#the-verbs-own-their-fields]]
export function merged(said, after) {
  const out = said && typeof said === "object" ? { ...said } : {};
  for (const [key, value] of Object.entries(after ?? {})) {
    if (Array.isArray(value) && Array.isArray(out[key])) out[key] = [...out[key], ...value];
    else if (typeof value === "string" && typeof out[key] === "string" && out[key])
      out[key] = `${out[key]}\n\n${value}`;
    else out[key] = value;
  }
  return out;
}

// A door's answer carrying a spawn: the helper runs, its answer goes back to the door, and the door's step answers the call. [[spec/tickets/review-spawns-off-the-door]]
async function spawns($, answer, event) {
  let said;
  try {
    said = await $.agent.spawn(answer.spawn);
  } catch (error) {
    said = { deny: String(error?.message ?? error) };
  }
  const back = {
    ...(answer.back ?? {}),
    text: said?.text ?? "",
    isError: Boolean(said?.isError),
    deny: said?.deny ?? "",
  };
  const step = stepOf(
    await asked($, String(answer.back?.event ?? "agent.answered"), back),
    event,
    { asks: false },
  );
  return step.answer ?? { result: "the helper answered, and the door said nothing" };
}

// The turn the handover ends: the event goes on, and the conversation clears at the turn's completion, or on a timer where it came first. [[spec/tickets/the-clear-runs-live-remote]]
async function clears($, answer, e, next) {
  const out = await next(e);
  waiting = String(answer.clear?.prompt ?? "");
  if (next.event === "turn.complete" && !e?.agentId) await cleared($);
  else $.clock.after(CLEAR_FALLBACK_MS, () => cleared($));
  return out;
}

// The main agent's turn completes, the hooks inside it answer, and a clear left waiting runs. [[spec/tickets/the-clear-runs-live-remote]]
async function clearsAtTurnEnd($, e, next) {
  const out = await next(e);
  if (!e?.agentId) await cleared($);
  return out;
}

async function cleared($) {
  const prompt = waiting;
  waiting = null;
  if (prompt === null) return;
  try {
    await $.command.run({ command: "clear" });
    await $.prompt.submit({ text: prompt });
  } catch (error) {
    says($, `The clear the handover asks for fails: ${error?.message ?? error}`);
  }
}

// The step's text reaches the door whole at the stream's end, which hears the canary off it. [[spec/design_output/level0#the-bridgehead-and-the-server]]
async function* streams($, e, next) {
  const kinds = {};
  stepText = "";
  for await (const chunk of next(e)) {
    const kind = String(chunk?.kind ?? typeof chunk);
    kinds[kind] = (kinds[kind] ?? 0) + 1;
    if (chunk?.kind === "text" && typeof chunk.text === "string") stepText += chunk.text;
    yield chunk;
  }
  await asked($, "turn.said", { turnId: e?.turnId, index: e?.index, kinds, text: stepText });
}

// The line reaches the person through the harness, and a harness carrying no such door leaves it unsaid. [[spec/design_output/level0#the-bridge-says-it-falls]]
function says($, line) {
  if (!line) return;
  busy += 1;
  try {
    $.ui.log(line);
  } catch {
  } finally {
    busy -= 1;
  }
}
