// The host of the drawing over a ticket: which page draws it, which side it
// shows, and what the page hears. The editor hands the page, the fold and the
// theme through the door, so a test drives the whole of it with no editor.
// [[spec/tickets/the-inset-folds-the-frontmatter]]

const { EMITTER, drawable } = require("./drawing.js");
const { HOLDS, holdsIn, personHolds, ticketOf } = require("./lens.js");

const FLIP = "quackitect.route.flip";
const SCHEMA = ".claude/skills/level0/lib/schema.js";
// The inset's height in lines: a node the layout stacks takes a few, between a floor and a ceiling. [[spec/tickets/the-inset-folds-the-frontmatter]]
const LINES_A_NODE = 3;
const FLOOR = 8;
const CEILING = 40;
const YAML = "Show the YAML";
const DRAWING = "Show the drawing";

// [[spec/tickets/the-inset-folds-the-frontmatter]]
function linesOf(graph) {
  const nodes = graph?.nodes?.length ?? 0;
  return Math.min(CEILING, Math.max(FLOOR, nodes * LINES_A_NODE));
}

// [[spec/tickets/the-inset-folds-the-frontmatter]]
function routeHostOf(door) {
  const shown = new Map();

  // The message the page draws: the graph, the route, and whether the person holds the ticket. [[spec/design_output/drawing#the-page-speaks-in-messages]]
  const graphOf = async (path, text) => {
    const [{ graphIn }, { readNote }] = await Promise.all([
      door.imports(EMITTER),
      door.imports(SCHEMA),
    ]);
    const steps = readNote(String(text ?? "")).front.said?.steps ?? [];
    const holds = await holdsIn(await door.list(HOLDS), (one) => door.read(one));
    const ticket = ticketOf(path);
    const held = holds.some((one) => one.ticket === ticket && personHolds(one));
    return { kind: "graph", graph: graphIn(text), steps, held };
  };

  const theme = () => ({ kind: "theme", theme: door.theme() });

  // The page an inset draws, or the side panel where the editor refuses the inset. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
  const pageFor = (path, lines, one) => {
    const page = door.page(path, lines) ?? door.panel(path);
    page.onMessage((message) => took(one, message));
    return page;
  };

  // A press on a node, the pointer or an edit waits for [[spec/tickets/the-host-runs-the-verbs]].
  const took = async (one, message) => {
    if (message?.kind !== "ready") return undefined;
    one.page.post(one.message);
    one.page.post(theme());
    return undefined;
  };

  return {
    watches: [],

    async opened(path, text) {
      if (drawable(path) !== "ticket") return undefined;
      shown.get(path)?.page.dispose();
      const message = await graphOf(path, text);
      const one = { message, lines: linesOf(message.graph), yaml: false };
      one.page = pageFor(path, one.lines, one);
      shown.set(path, one);
      door.folds(path);
      return one;
    },

    async changed(path, text) {
      const one = shown.get(path);
      if (!one) return undefined;
      const message = await graphOf(path, text);
      if (linesOf(message.graph) !== one.lines) return this.opened(path, text);
      one.message = message;
      one.page.post(message);
      return one;
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

module.exports = { FLIP, linesOf, routeHostOf };
