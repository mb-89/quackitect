---
kind: [[design_input]]
---

# Scope

One level zero over two harnesses, Claude and Copilot. The owner asks for the
same rules, the same branches and the same commands on each one.

# One level zero

Keep all harness differences in level zero. Levels above it use the same
rules, work branches, briefs and commands. Leave Claude's hooks and model
judge unchanged. Use JavaScript, dependency injection through doors and Node tests.

# A session starts

Load applicable guidance on the first prompt, without a slash command.
Inject its numbered rules and request the existing `rules: <n>` receipt.
Count the actual guidance, not a fixed number. Name unavailable checks.
An acknowledgement does not prove comprehension or successful enforcement.

# A write meets rules

Run the existing mechanical checkers before supported file mutations.
Refuse violations with corrective feedback. Reject unknown edit shapes.
Formatting may follow the edit. Limit it to the files the session touches.

Inject the judged rules as guidance; make no Copilot classification calls.
Do not change the shared judge configuration.

# State outlives a callback

Command hooks use separate processes. Store handover copies before
removing their originals. Isolate sessions and serialize state updates.
Retain recoverable state after interruption. Keep incomplete work open.

Allow ordinary reads and writes under `.se`, including handovers and runtime state.
Apply the same content checks as elsewhere; impose no folder-specific access gate.
Count validation progress separately from failures, so remaining files alone
do not exhaust the failure retry budget.

Cloud progress must reach the remote work branch; local cache is temporary.

# A cloud works one branch

Keep `work/<name>` and `todo`, `held`, `done` as the work contract.
Claim before dispatch. Use a draft pull request with that branch as its head.
Invoke Copilot on that pull request, which authorizes that head branch.
The dispatcher creates the pull request; the worker does not create one.

Leave merging to a person. Report dispatch failures for recovery.
Do not give the worker broader credentials to evade branch restrictions.

Give each claim its own dispatch identity. Reuse that identity for a request
retry; issue a new request after release and a new claim on the same branch.

# Installation reaches both harnesses

Reuse the installers for dependencies. Generate Copilot registrations without
overwriting user customizations. Permit both harnesses on one machine.
An explicit setup target handles cloud preparation and ambiguous detection.
Cloud hook and setup registrations must reach the default branch before use.
Claude must not import or invoke the Copilot runtime.

# Checks define acceptance

Test event translation, denial feedback, rule counts, interrupted handovers,
session isolation, formatting after edits and branch restrictions.
Test each outside boundary once through its door contract. Use mocks for
runtime and dispatch behavior; add no duplicate real-Git workflow tests.
Run the existing checks to detect Claude regressions.
Verify VS Code startup and a real cloud branch round trip before claiming
live compatibility. Unit tests alone cannot prove platform integration.

# Known platform limits

Copilot does not expose Claude's prompt-block middleware or answer rewrite.
Do not depend on transcript parsing for the initial implementation.
Hook timeout can fail open in cloud: bound internal work below that timeout.
This reduces risk; the host still permits tools after a timeout.
Shell programs can mutate files outside edit tools; use a sandbox for filesystem isolation.

# Source contracts

- https://code.visualstudio.com/docs/agents/reference/hooks-reference
- https://docs.github.com/en/copilot/reference/hooks-reference
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/use-hooks
- https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github

Confirm preview behavior against these contracts during integration testing.