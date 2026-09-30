// The tools the index generates: the hook reads the list off the binary, the
// way the pull reaches the ticket program, and a call of one posts its input to its action.
// [[spec/tickets/the-hook-registers-index-tools]]

import { RUN } from "./folders.js";

// The prefix every generated tool's name carries, which tools.go in src/index owns, spelled again here because the hook imports its own folder alone. [[spec/tickets/the-hook-registers-index-tools]]
export const INDEX_TOOL = "index_";

// The prefix the harness sets before a tool the plugin registers. [[spec/tickets/the-hook-registers-index-tools]]
export const SERVED = "mcp__level0__";
const BINARY = `${RUN}/bin/se-index`;

// The binary under the method root. [[spec/tickets/the-hook-registers-index-tools]]
export function binaryOf(method, windows) {
  return `${method}/${BINARY}${windows ? ".exe" : ""}`;
}

// Whether the method root reads as a Windows path, since the hook reaches no platform of its own. [[spec/tickets/the-hook-registers-index-tools]]
export function windowsOf(method) {
  return /^[A-Za-z]:/.test(method) || method.includes("\\");
}

// Whether a call names a tool of the generated list. [[spec/tickets/the-hook-registers-index-tools]]
export function isIndexTool(tool) {
  return String(tool ?? "").startsWith(SERVED + INDEX_TOOL);
}

// Registers each tool of the generated list, and answers the list. A binary that stands nowhere or answers nothing registers none. [[spec/tickets/the-hook-registers-index-tools]]
export async function registersIndexTools($, bin) {
  let tools;
  try {
    const ran = await $.process.run([bin, "tools"]);
    if (ran.exitCode !== 0) return [];
    tools = JSON.parse(String(ran.stdout ?? ""));
  } catch {
    return [];
  }
  if (!Array.isArray(tools)) return [];
  for (const { name, description, inputSchema } of tools) {
    try {
      await $.tool.register({ name, description, inputSchema });
    } catch {}
  }
  return tools;
}

// Runs the action a called tool names, its bare input unwrapped, and answers what the binary prints. [[spec/tickets/the-hook-registers-index-tools]]
export async function callsIndexTool($, bin, tools, e) {
  const name = String(e?.tool ?? "").slice(SERVED.length);
  const one = tools.find((tool) => tool.name === name);
  if (!one) return `the index lists no tool ${name}`;
  const spread = argumentsOf(one, e);
  const input = one.bare ? spread.input : spread;
  const ran = await $.process.run([bin, "act", one.action, JSON.stringify(input)]);
  return `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim();
}

// The arguments a call carries: the host spreads them on the event beside its tool, so each property the schema declares reads off the event. [[spec/tickets/verb-tools-keep-spaced-args]]
function argumentsOf(one, e) {
  const said = {};
  for (const key of Object.keys(one.inputSchema?.properties ?? {})) {
    if (e?.[key] !== undefined) said[key] = e[key];
  }
  return said;
}
