---
id: wk-affb3449c2
seq: "5"
type: work
title: prompts lost mid-turn
status: closed
assignee: main
scope: single-step
traced: true
disposition: became
successors:
  - wk-2e71b41afd
evidence:
  - outcome
minted_by: main
---

## detail

UserPromptSubmit does not fire for a message sent mid-turn. In session 20260831-101714 the guard wrote 20 PreToolUse records, one Stop and zero prompt records while four messages arrived. If the harness will not fire it, the Stop hook reads the harness transcript and back-fills any prompt the record does not hold. That is the same reader se --voice needs, so it is one piece of work. Related: wk-2e71b41afd.

## evidence: outcome

Became wk-2e71b41afd, which builds the transcript reader that back-fills missing prompts from the Stop hook and serves se --voice.
