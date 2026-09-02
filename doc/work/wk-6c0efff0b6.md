---
id: wk-6c0efff0b6
seq: "9"
type: work
title: just has two meanings
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "1"
minted_by: main
evidence:
  - outcome
---

## detail

voice.md bans five minimiser words, and util/voice-rules.json omits just. A word-boundary pattern cannot tell the minimiser from the time word. The fix belongs in voice.md saying which just it means, not in the pattern.

## evidence: outcome

doc/guidance/voice.md:36 now says not to use just as a minimiser, with the time word allowed, and names the rule as the writer's to keep. util/voice-rules.json keeps its $omitted note and points to voice.md. se --project rewrote AGENTS.md, .claude/output-styles/quackitect.md and .github/copilot-instructions.md, and se lint doc/guidance/voice.md answers clean.
