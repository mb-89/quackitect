---
id: wk-2e71b41afd
seq: "15"
type: work
title: the engine copies prompts
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "2"
minted_by: main
evidence:
  - outcome
---

## detail

Recording what the person said must be mechanical, not something the agent chooses to do. The harness fires UserPromptSubmit for a message that starts a turn, and the guard records it. It fires nothing for a message written into a turn already running. Find a mechanical path for it. If there is none, say so plainly rather than leaving a rule the agent can forget.

## evidence: outcome

The engine copies a mid-turn message on the next tool call. CopyWhatWasHeard in heard.go reads queued_command entries from the transcript, and SaidCount reconciles by count so two identical messages make two records. The said verb in src/mcp/said.go sends the guidance's own sentence as the fallback, and TestTheToolSaysWhatTheGuidanceSays keeps the two in step. TestTwoIdenticalMessagesAreTwoRecords and TestTheEngineDoesNotCopyWhatTheAgentAlreadyWrote were both watched red. The battery now runs the tests of all three Go packages and answers all ok.
