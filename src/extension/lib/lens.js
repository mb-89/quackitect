// What the route host and the sidebar read off a ticket: its id, its route,
// the server's command a press runs, and the word a verb answers. Every choice
// here reads a string, so a test holds it with no editor running.
// [[spec/design_output/lsp#a-ticket-carries-its-buttons]]

const FOLDERS = ["spec/tickets", ".se/tickets"];
// The index values the drawing reads: the standing holds, and every ticket, whose change draws a ticket again. [[spec/tickets/the-lens-reads-v1]]
const STANDING = "holds/standing";
const TICKETS = "tickets/all";
// The command the server runs a press through, owned by TicketCommand in src/modules/lsp/lenses.go and spelled again here because the extension bundles alone. [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
const COMMAND = "quackitect.ticket";
// The names the pull reads a harness off, from [[spec/design_output/pull#the-hand-rule]].
const HARNESS = ["CLAUDECODE", "CLAUDE_CODE_REMOTE", "SE_CLOUD"];
const ANSWERS = ["work", "refused", "wait", "spawn", "done"];
const WORK_ROOT = "SE_WORK_ROOT";

// [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
function ticketOf(path) {
  const said = String(path ?? "").replace(/\\/g, "/");
  for (const folder of FOLDERS) {
    const found = new RegExp(`(?:^|/)${folder.replace(".", "\\.")}/([^/]+)\\.md$`).exec(
      said,
    );
    if (found) return found[1];
  }
  return "";
}

function frontLines(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return [];
  const ends = lines.indexOf("---", 1);
  return ends < 0 ? [] : lines.slice(1, ends);
}

function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

// One row per step as the frontmatter nests it, with its `by` and whether a verdict field stands. [[spec/design_output/pull#the-answers]]
function stepsIn(text) {
  const steps = [];
  let openers = [];
  let items = [];
  for (const line of frontLines(text)) {
    const found = /^(\s*)(- )?([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!found) continue;
    const [, space, dash, key, value] = found;
    const at = space.length;
    if (dash) {
      openers = openers.filter((one) => one.at <= at);
      items = items.filter((one) => one.at < at);
      items.push(itemOf(openers.at(-1), at, steps));
      keyOn(items.at(-1), key, value);
      continue;
    }
    openers = openers.filter((one) => one.at < at);
    items = items.filter((one) => one.at + 2 <= at);
    const owner = items.at(-1);
    if (!value) openers.push({ at, key, owner });
    else keyOn(owner, key, value);
  }
  return steps;
}

// An item under a route's steps is a step whatever key opens it, and its name arrives on any of its lines. [[spec/tickets/a-count-meets-the-lint]]
function itemOf(opener, at, steps) {
  if (opener?.key === "evidence" && opener.owner?.kind === "step")
    return { at, kind: "evidence", step: opener.owner.step };
  if (opener?.key !== "steps") return { at, kind: "other" };
  const above = opener.owner?.kind === "step" ? opener.owner.step : null;
  if (above) above.leaf = false;
  const step = { path: "", by: "", verdict: false, leaf: true, above };
  steps.push(step);
  return { at, kind: "step", step };
}

function keyOn(item, key, value) {
  if (item?.kind === "step" && key === "name") {
    const above = item.step.above;
    item.step.path = above ? `${above.path}/${bare(value)}` : bare(value);
  }
  if (item?.kind === "step" && key === "by") item.step.by = bare(value);
  if (item?.kind === "evidence" && key === "form" && bare(value) === "verdict")
    item.step.verdict = true;
}

// The route a press in the drawing moves, as the whole list `ticket route` takes. [[spec/tickets/the-host-runs-the-verbs]]
function routeArgvOf(ticket, steps) {
  return ["ticket", "route", ticket, `--steps=${JSON.stringify(steps ?? [])}`];
}

// The action a verb's words post to, with the words past the verb and the person mark. [[spec/tickets/the-lens-calls-actions]]
function actionOf(argv) {
  const [topic, verb, ...args] = argv;
  return { name: `${topic}/${verb}`, input: { args, person: true } };
}

// [[spec/tickets/the-lens-calls-actions]]
function actsOn(door, argv) {
  const one = actionOf(argv);
  return door.index.acts(one.name, one.input);
}

// The child runs as a person, so the names a harness sets stay behind. [[spec/design_output/pull#the-hand-rule]]
function personEnv(env, root) {
  const out = { ...(env ?? {}) };
  for (const name of HARNESS) delete out[name];
  if (root) out[WORK_ROOT] = root;
  return out;
}

// [[spec/design_output/pull#the-answers]]
function answerOf(ran) {
  const lines = `${ran?.out ?? ""}\n${ran?.err ?? ""}`
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean);
  const at = lines.findIndex((one) => ANSWERS.includes(one));
  if (at >= 0) return { word: lines[at], detail: lines[at + 1] ?? "", lines };
  const word = Number(ran?.code ?? 0) === 0 ? "work" : "refused";
  return { word, detail: lines[0] ?? "", lines };
}

// The standing holds off the index, one row a hold whose ticket stands. [[spec/tickets/the-lens-reads-v1]]
async function standingOf(door) {
  const said = await door.index?.values(STANDING);
  return Array.isArray(said) ? said : [];
}

module.exports = {
  COMMAND,
  FOLDERS,
  HARNESS,
  STANDING,
  TICKETS,
  actionOf,
  actsOn,
  answerOf,
  personEnv,
  routeArgvOf,
  standingOf,
  stepsIn,
  ticketOf,
};
