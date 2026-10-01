// Copilot events and replies, without harness state or I/O.
// [[spec/design_output/copilot#events-and-feedback]]

import { mutations } from "./mutations.js";

// The shell tools a Copilot host names, which post as Bash. [[spec/tickets/copilot-answers-off-the-door]]
const SHELL = new Set([
  "Bash",
  "bash",
  "powershell",
  "run_in_terminal",
  "send_to_terminal",
]);

// The hooks door's event a Copilot event stands for, as the Claude harness names it. [[spec/tickets/copilot-answers-off-the-door]]
const POSTED = {
  SessionStart: "session.start",
  PreToolUse: "tool.call",
  Stop: "classic.Stop",
};

const EVENTS = {
  sessionStart: "SessionStart",
  preToolUse: "PreToolUse",
  postToolUse: "PostToolUse",
  agentStop: "Stop",
  sessionEnd: "SessionEnd",
};

export function eventOf(input, event, surface) {
  if (!["vscode", "cloud"].includes(surface)) {
    throw new Error("Name the Copilot surface: vscode or cloud.");
  }
  let args = input.tool_input ?? input.toolArgs ?? {};
  if (typeof args === "string") args = JSON.parse(args);
  return {
    event: EVENTS[event] ?? event,
    surface,
    session: input.session_id ?? input.sessionId,
    tool: String(input.tool_name ?? input.toolName ?? "")
      .split(".")
      .at(-1),
    args,
    retry: Boolean(input.stop_hook_active),
  };
}

export function replyOf(event, result = {}) {
  if (result.failed && event.surface === "vscode") {
    return { continue: false, stopReason: result.failed, systemMessage: result.failed };
  }
  if (event.surface === "cloud") {
    if (result.deny) {
      return { permissionDecision: "deny", permissionDecisionReason: result.deny };
    }
    if (result.block) return { decision: "block", reason: result.block };
    return result.context || result.failed
      ? { additionalContext: result.context ?? result.failed }
      : {};
  }
  if (result.deny) {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: result.deny,
        additionalContext: result.deny,
      },
    };
  }
  if (result.block) {
    return {
      hookSpecificOutput: {
        hookEventName: "Stop",
        decision: "block",
        reason: result.block,
      },
    };
  }
  return result.context
    ? {
        hookSpecificOutput: {
          hookEventName: event.event,
          additionalContext: result.context,
        },
      }
    : {};
}

export function failureOf(event, reason) {
  if (event.event === "PreToolUse") return { deny: reason };
  if (event.event === "Stop")
    return event.retry ? { failed: reason } : { block: reason };
  return { context: `${reason} The cage is not ready; do not claim otherwise.` };
}

// The hooks door's event a Copilot event posts as. [[spec/tickets/copilot-answers-off-the-door]]
export function postedAs(event) {
  return POSTED[event] ?? `classic.${event}`;
}

// The Claude calls one Copilot tool call stands for, which the hooks door judges: a shell call as Bash, an edit as one Write a changed file, and any other tool as itself. [[spec/tickets/copilot-answers-off-the-door]]
export function callsOf(event, read) {
  const { tool, args } = event;
  if (SHELL.has(tool)) return [{ tool: "Bash", command: String(args?.command ?? "") }];
  const changed = mutations(event, read);
  if (changed.length)
    return changed.map(({ path, text }) => ({
      tool: "Write",
      file_path: path,
      content: text,
    }));
  return [{ tool, ...args }];
}
