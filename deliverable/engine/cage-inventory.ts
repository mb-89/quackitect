// see dsp-lane-door.md — the cage inventory.
//
// req-native-project-tools-stay-outside-the-cage. The claim is about what the
// host ENDS UP HOLDING, not about what the cage file says.
//
// THE BLACKLIST IS EXPLICIT, which is the whole risk. A tool the host adds
// later is not blocked by itself, so the cage silently develops a hole and
// nothing says so. On 2026-08-19 a diff against GitHub's own hooks reference
// found five documented built-ins missing from ours, two of which — `bash`
// and `rg` — were an uncaged shell and an uncaged search.

/** Native tools that can read, change, search or execute against the project.
 *  Every one of these must be excluded, on every host that offers it. */
export const NATIVE_PROJECT_TOOLS = [
  // shells
  "bash",
  "powershell",
  "read_powershell",
  "stop_powershell",
  "list_powershell",
  // reads and writes
  "view",
  "create",
  "edit",
  // search
  "grep",
  "glob",
  "rg",
  // reach outside
  "web_fetch",
  // data and subagents
  "sql",
  "session_store_sql",
  "skill",
  "task",
  "read_agent",
  "list_agents",
  "write_agent",
] as const;

/** The one native tool that must SURVIVE. It runs on the provider's backend
 *  and cannot be self-hosted without a key, so research dies without it. */
export const NATIVE_EXCEPTIONS = ["web_search", "WebSearch"] as const;

export interface InventoryProblem {
  tool: string;
  why: string;
}

/** Read the excluded names out of a Copilot cage's argument list. */
export function excludedTools(excludeArgs: string[]): string[] {
  const i = excludeArgs.indexOf("--excluded-tools");
  if (i < 0) return [];
  const out: string[] = [];
  for (const a of excludeArgs.slice(i + 1)) {
    const name = a.trim();
    if (name === "" || name.startsWith("--")) break;
    out.push(name);
  }
  return out;
}

/** What is wrong with an inventory, both ways round.
 *
 *  TWO FAILURES, PULLING OPPOSITE WAYS. A project tool left in is a hole. The
 *  web-search exception taken out is the cage eating the one thing it is meant
 *  to keep. Checking only the first is how the second got shipped. */
export function inventoryProblems(excluded: string[]): InventoryProblem[] {
  const have = new Set(excluded);
  const out: InventoryProblem[] = [];
  for (const t of NATIVE_PROJECT_TOOLS) {
    if (!have.has(t)) out.push({ tool: t, why: "reaches the project and is not excluded, so work through it is invisible" });
  }
  for (const t of NATIVE_EXCEPTIONS) {
    if (have.has(t)) out.push({ tool: t, why: "is the permitted research exception and must not be excluded" });
  }
  return out;
}
