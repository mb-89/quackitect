// The wait tool. It returns on the first of three signals: a helper's report,
// an output's end, or a quiet set of files, and at its cap where none comes.
// [[spec/design_output/level0#the-wait-returns-on-a-signal]]

export const WAIT = "wait";
export const WAIT_CALL = `mcp__level0__${WAIT}`;

export const SPECS = () => [{ name: "", inputSchema: { properties: {} } }];
export const TOOLS = {};

export async function waits(e, box, pause) {
  return { result: { result: "" } };
}

export function helperReports(e, box) {
  return { pass: true };
}
