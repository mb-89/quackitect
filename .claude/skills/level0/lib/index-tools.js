// The tools the index generates: the hook reads the list off the binary, the
// way the pull reaches cli.js, and a call of one posts its input to its action.
// [[spec/tickets/the-hook-registers-index-tools]]

// The prefix every generated tool's name carries, which tools.go in src/index owns, spelled again here because the hook imports its own folder alone. [[spec/tickets/the-hook-registers-index-tools]]
export const INDEX_TOOL = "index_";

// The binary under the method root. [[spec/tickets/the-hook-registers-index-tools]]
export function binaryOf(_method, _windows) {
  return "";
}

// Registers each tool of the generated list, and answers the list. [[spec/tickets/the-hook-registers-index-tools]]
export async function registersIndexTools(_$, _bin) {
  return [];
}

// Runs the action a called tool names, and answers what the binary prints. [[spec/tickets/the-hook-registers-index-tools]]
export async function callsIndexTool(_$, _bin, _tools, _e) {
  return "";
}
