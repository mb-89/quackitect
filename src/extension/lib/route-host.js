// The host of the drawing over a ticket: which page draws it, which side it
// shows, and what the page hears. The editor hands the page, the fold and the
// theme through the door, so a test drives the whole of it with no editor.
// [[spec/tickets/the-inset-folds-the-frontmatter]]

const { drawable } = require("./drawing.js");
const {
  COMMAND,
  STANDING,
  TICKETS,
  actsOn,
  answerOf,
  routeArgvOf,
  standingOf,
  stepsIn,
  ticketOf,
} = require("./lens.js");

const FLIP = "quackitect.route.flip";
// The family each ticket's drawing stands under. [[spec/tickets/the-lens-reads-v1]]
const DRAWN = "tickets/drawn";
// A ticket the index draws nothing for draws an empty graph. [[spec/tickets/the-lens-reads-v1]]
const EMPTY = { nodes: [], edges: [] };
// The inset's height in lines: a node the layout stacks takes a few, between a floor and a ceiling. [[spec/tickets/the-inset-folds-the-frontmatter]]
const LINES_A_NODE = 3;
const FLOOR = 8;
const CEILING = 40;
const YAML = "Show the YAML";
const DRAWING = "Show the drawing";
const HAND_BACKS = ["pass", "fail"];

// [[spec/tickets/the-inset-folds-the-frontmatter]]
function linesOf(graph) {
  const nodes = graph?.nodes?.length ?? 0;
  return Math.min(CEILING, Math.max(FLOOR, nodes * LINES_A_NODE));
}

// The drawing of the ticket at path, off the index. [[spec/tickets/the-lens-reads-v1]]
function drawnAt(door, path) {
  return door.index?.values(`${DRAWN}/${String(path).replace(/\\/g, "/")}`);
}

// [[spec/tickets/the-inset-folds-the-frontmatter]]
function routeHostOf(door) {
  const shown = new Map();
  // A press runs the server's command, whose middleware asks and saves. [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
  const presses = (act, ticket, path) => door.executes(COMMAND, act, ticket, path);

  // The message the page draws: the graph, the route, and whether the person holds the ticket. [[spec/design_output/drawing#the-page-speaks-in-messages]]
  // The graph and the route come off tickets/drawn, so they follow the saved file. [[spec/tickets/the-lens-reads-v1]]
  const graphOf = async (path) => {
    const [drawn, holds] = await Promise.all([drawnAt(door, path), standingOf(door)]);
    const ticket = ticketOf(path);
    const held = holds.some((one) => one.ticket === ticket && one.person);
    const graph = Array.isArray(drawn?.graph?.nodes) ? drawn.graph : EMPTY;
    const steps = Array.isArray(drawn?.steps) ? drawn.steps : [];
    return { kind: "graph", graph, steps, held };
  };

  const theme = () => ({ kind: "theme", theme: door.theme() });

  // The page an inset draws, or the side panel where the editor refuses the inset. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
  // A page the person closes leaves the host, so nothing posts to it again. [[spec/tickets/the-inset-folds-the-frontmatter#reflect]]
  const pageFor = (path, lines, one) => {
    const page = door.page(path, lines) ?? door.panel(path);
    page.onMessage((message) => took(path, one, message));
    page.onGone?.(() => {
      if (shown.get(path) === one) shown.delete(path);
    });
    return page;
  };

  // The side a ticket shows outlives a reopen, so an edit under the YAML folds nothing. [[spec/tickets/the-inset-folds-the-frontmatter#reflect]]
  const opens = (path, text, message, yaml) => {
    shown.get(path)?.page.dispose();
    const one = { text, message, lines: linesOf(message.graph), yaml };
    one.page = pageFor(path, one.lines, one);
    shown.set(path, one);
    if (yaml) one.page.hide();
    else door.folds(path);
    return one;
  };

  // Each press runs the verb it shows, and the next `changed` draws what the verb writes. [[spec/tickets/the-host-runs-the-verbs]]
  const took = async (path, one, message) => {
    const ticket = ticketOf(path);
    const kind = message?.kind;
    if (kind === "ready") {
      one.page.post(one.message);
      one.page.post(theme());
      return undefined;
    }
    if (kind === "jump") return door.jumps(path, Number(message.line ?? 1));
    if (kind === "edit") return routes(path, ticket, message.steps);
    if (kind === "take") return presses("take", ticket, path);
    if (kind === "handback")
      return handsBack(path, ticket, one, String(message.step ?? ""));
    return undefined;
  };

  // The route verb writes the disk, so the ticket saves first, and a refusal raises a warning. [[spec/tickets/the-host-runs-the-verbs]]
  const routes = async (path, ticket, steps) => {
    await door.saves(path);
    const argv = routeArgvOf(ticket, steps);
    const ran = await actsOn(door, argv);
    const said = answerOf(ran);
    door.says([`./RUNME.sh ${argv.join(" ")}`, "", ...said.lines]);
    const refused = refusalIn(ran);
    if (refused) door.tells(`${ticket}: refused`, refused, true);
    return ran;
  };

  // A verdict leaf hands back with no flag, and another leaf asks pass or fail, as the ticket's buttons do. [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
  const handsBack = async (path, ticket, one, step) => {
    const leaf = stepsIn(one.text).find((each) => each.leaf && each.path === step);
    if (leaf?.verdict) return presses("back", ticket, path);
    const picked = await door.picks(`Hand back ${step}`, HAND_BACKS);
    if (!HAND_BACKS.includes(picked)) return undefined;
    return presses(picked, ticket, path);
  };

  // A page draws the message again where the lines hold, and opens again where they move. [[spec/tickets/the-inset-folds-the-frontmatter]]
  const redraws = async (path, one, text) => {
    const message = await graphOf(path);
    if (linesOf(message.graph) !== one.lines)
      return opens(path, text, message, one.yaml);
    one.text = text;
    one.message = message;
    one.page.post(message);
    return one;
  };

  return {
    names: [STANDING, TICKETS],
    // A message for the page a path shows. [[spec/tickets/the-lens-calls-actions]]
    took: (path, message) => took(path, shown.get(path), message),

    async opened(path, text) {
      if (drawable(path) !== "ticket") return undefined;
      return opens(path, text, await graphOf(path), false);
    },

    async changed(path, text) {
      const one = shown.get(path);
      if (!one) return undefined;
      return redraws(path, one, text);
    },

    // An index event draws every page shown again. [[spec/tickets/the-lens-reads-v1]]
    async refreshed() {
      for (const [path, one] of [...shown]) await redraws(path, one, one.text);
    },

    themed() {
      for (const one of shown.values()) one.page.post(theme());
    },

    flipped(path) {
      const one = shown.get(path);
      if (!one) return;
      one.yaml = !one.yaml;
      if (one.yaml) {
        one.page.hide();
        door.unfolds(path);
      } else {
        one.page.show();
        door.folds(path);
      }
    },

    lenses(path) {
      const one = shown.get(path);
      if (!one) return [];
      return [{ title: one.yaml ? DRAWING : YAML, command: FLIP, arguments: [path] }];
    },
  };
}

// The route verb answers JSON, and a refusal names why in `refused`. [[spec/tickets/the-host-runs-the-verbs]]
function refusalIn(ran) {
  if (Number(ran?.code ?? 0) === 0) return "";
  try {
    return String(JSON.parse(String(ran?.out ?? "").trim()).refused ?? "");
  } catch {
    return answerOf(ran).detail || "the verb refused";
  }
}

module.exports = { FLIP, linesOf, routeHostOf };
