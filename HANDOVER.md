---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The stop is one tool call, and the line goes.

| the piece | where | what proves it |
|---|---|---|
| the tool `stop` | `.claude/skills/level0/lib/stop.js`, `stopSpec` | it takes `reason`, one id the schema lists, and `next`, and `test/level0/stop.test.js` reads both |
| the call | `.claude/skills/level0/hooks/level0.js`, under the stop-is-one-call comment | it runs the vote at once, and a sound reason answers "write nothing more" |
| a reason a fact contradicts | the same | the result names the fact in one line, and the claim still reaches the turn's end |
| the claim's life | the generic tool door | it lives until the next tool call or the turn's end |
| the turn's end | `bite` | a standing claim reaches the vote with no challenge, and no prompt goes out |
| a turn with no call | `askForStop` | one line and the ids, five lines |
| the re-prompt | `reprompt` | the continue rule's sentence and the ids, five lines |
| the note | `spec/design_output/stop.md` | one call chapter takes the place of the line, the challenge and the voice chapters |
| the allow list | `.claude/settings.json` | it names `mcp__level0__stop` |
| a commit trailer | `lib/bash.js`, `withoutTrailers` | the last paragraph of `Token: value` lines stays out of the commit lint |

# What waits

| what | who |
|---|---|
| a session restart, so the plugin registers the tool | every open session |
| `work close a-stop-is-one-call` | a desk, because a cloud box deletes no remote branch |

# What surprises me

| surprise | what it costs |
|---|---|
| the canary debt bites a tool call between turn ends | the per-box test ends its first turn with the canary |
| the Role rule on main reaches lines this branch leaves alone | the note's old lines name the owner and the maintainer |
| a session on the old plugin keeps the line until it restarts | this session ends its turns the old way |
| the Characters and Private rules refuse the trailer every commit carries | the door takes the trailer paragraph off before Vale reads the message |
