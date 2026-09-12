// The editor's reader of the graph. The emitter stands beside the verbs, this
// hands it the file, and the drawing derives at every open. No copy of the
// graph stands here, so nothing drifts, and no colour and no coordinate either:
// the style sheet holds both, and that is desk work with the owner.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]

const EMITTER = "src/scripts/graph.js";
const PROCESSES = "spec/processes/";
const TICKETS = ["spec/tickets/", ".se/tickets/"];

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function drawable(path) {
  const said = String(path ?? "")
    .split("\\")
    .join("/");
  if (said.startsWith(PROCESSES) && said.endsWith(".yaml")) return "process";
  if (TICKETS.some((one) => said.startsWith(one)) && said.endsWith(".md"))
    return "ticket";
  return "";
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
async function graphAt(door, path) {
  if (!drawable(path)) return null;
  const text = await door.read(path);
  if (!String(text ?? "").trim()) return null;
  const { graphIn } = await door.imports(EMITTER);
  return graphIn(text);
}

module.exports = { EMITTER, PROCESSES, TICKETS, drawable, graphAt };
