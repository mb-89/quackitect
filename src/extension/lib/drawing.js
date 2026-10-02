// Which files the editor draws: a process or a ticket. The index draws a
// ticket's graph, so no copy of the graph stands here, and no colour and no
// coordinate either: the style sheet holds both.
// [[spec/tickets/the-lens-reads-v1]]

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

module.exports = { PROCESSES, TICKETS, drawable };
