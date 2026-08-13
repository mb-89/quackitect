---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: sty-ask-the-lane-what-it-can-do
type: "[[story]]"
statement: An agent mid-task does not know the exact verb it needs, asks the lane in plain words, and either gets pointed at the right tool or leaves a trace of what was missing.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

The agent is mid-task. It needs to do something with the lane — maybe search the repo, maybe check what a refusal means — but it does not already know which of the dozen-plus se_ verbs covers it.
|||


---

Today it either guesses a tool name and eats a refusal, or drops to se_run and does the job outside the governed lane, leaving no trace of what it was actually looking for.
|||


---

Instead, it calls se_help with a plain-words description: "find the file that mentions X" or "why is this state grey".
|||


---

se_help ranks the lane's tools and guidance pages by keyword match and returns the closest ones, each with enough of its own description to judge fit. The agent picks the one named in the result.
|||


---

Nothing matches. se_help says so plainly instead of inventing a result, and logs the query to the demand log.
|||


---

Weeks later, a retro calls se_help with demands: true and reads a ranked list of what agents kept failing to find — the same signal that used to take a person hand-grouping se_run commands by shape.
|||

