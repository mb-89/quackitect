// Copilot events and replies, without harness state or I/O.
// [[spec/design_output/copilot#events-and-feedback]]

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
