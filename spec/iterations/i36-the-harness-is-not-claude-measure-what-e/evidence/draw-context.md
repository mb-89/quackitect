---
form: draw-context
reopened: "2026-08-19T09:45:06.387Z — Gate motivation was re-signed after restoring the fixed ISO quality hierarchy; boundary remains unchanged."
by: agent
signed_off: 2026-08-19T09:45:28.589Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

The motivation gate is signed.

The agent-harness neighbour was updated and linted cleanly.

A fresh primary-source research scan remains owed before requirements or design claims are finalized.

## boundary

Inside the system are the `se` MCP server, lane tools, boot sequence, hook scripts, generated cage and prompt artifacts, harness measurement logic, call log and refusal remedies.

Outside the system are the agent harness process, editor host, cloud machine, local toolchain and vendor-owned lifecycle behavior.

Quackitect may detect and adapt to outside behavior.

It does not control vendor limits or process scheduling.

## neighbours

- project/spec/trace/neighbour/nbr-agent-harness.md
- project/spec/trace/neighbour/nbr-cloud-host.md
- project/spec/trace/neighbour/nbr-vscode.md
- project/spec/trace/neighbour/nbr-toolchain.md

## intended_use

The harness layer starts and carries a Quackitect walk across supported agent hosts.

It identifies the active host, serves compatible payloads, applies the correct cage and hooks, preserves large results and explains interruptions.

It also turns repeated failed-call shapes into evidence for improving the lane.

## excluded_use

- It does not make unsupported host features exist.
- It does not rely on one hook file reaching every host.
- It does not infer a server crash from a generic cancellation.
- It does not weaken checks to shorten boot.
- It does not use prompt compliance as the only enforcement layer.
- It does not fix unrelated editor UI or archive behavior.
- It does not claim host support without a primary-source citation and a probe.
- It does not treat yesterday's scan as sufficient for current vendor behavior.

## follow_up

Map stakeholder roles next.

Before requirements or design settle, run a fresh primary-source scan covering:

- MCP lifecycle and cancellation
- GitHub Copilot CLI and VS Code hooks, instructions, MCP and result limits
- Claude Code hooks, MCP, instructions and tool-description limits
- OpenAI Codex instructions, MCP and size limits
- Cursor MCP, rules, hooks and tool limits
- server restart and transport diagnostics

## anything_else

The existing 2026-08-18 scan is a starting corpus.

The fresh scan must verify it and add missing first-party evidence.
