---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

A turn ends where the agent asks for it in one line, last in the answer:

    Stop requested. Reason [<id>]. <what the owner does next>

`./RUNME.sh check` answers 0.

| the piece | where it stands |
|---|---|
| the parser | `stopLineIn` in `lib/stop.js`, reading the last non empty line |
| the challenge | `challenge`, one question the agent reads and answers to itself |
| the ask | `askForLine`, for a turn carrying no line or an id nobody holds |
| the door | `bite` in `hooks/level0.js`, ahead of the vote |
| the vote | `voteNow`, taking the line's reason as the claim |
| the allowance | one flag, refilled by each prompt the owner sends |
| the voice | `withoutStopLine` keeps the line out of the gate's lint |
| the off switch | `stop.enabled` at false votes at once |

The chapters stand under `spec/design_output/stop#the-line-ends-a-turn`.
Eleven tests hold the door across `test/level0/stop.test.js` and
`test/level0/hooks.test.js`.

# What waits

Merge this and close it.

One thing stands open for the owner. `claim_stop` still registers as a tool,
and the line supersedes it. Eighteen references reach nine files, two of them
funnel notes the owner owns, so this branch leaves the tool alone. Removing it
is its own branch.

# What surprises me

Four things come out of the build:

- the stop line trips the voice rules on its own, because `requested` reads as past tense
- its words also shift the score of every answer carrying it, so the gate lints the prose alone
- the off switch reaches the line too, because a tooth standing off holds nothing
- eight tests go red at once, because every turn end in the suite carries no line
- the re-prompt speaks of the claim, and one wording reaches the agent now
