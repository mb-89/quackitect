---
minted_in: i36
id: raid-route-remedy-can-repeat-refusal
type: "[[raid]]"
kind: issue
statement: A route refusal remedy can repeat the same illegal transition instead of moving to the legal next state.
owner: the driving agent
trigger: every SE-C-110 refusal and every gate that signs before moving to its first seeded state
status: open
breaks_how_badly: abrasive
how_likely: expected
impact: The agent can burn calls repeating a remedy that does not change the route. Recovery then depends on manually aiming at the legal next state.
source_refs:
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/gate-kickoff.md
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/define-actual.md
---

## Finding

After the i36 kickoff gate signed, `se_pull` tried to move to `end`.

The legal next state was `draft-vision`.

The typed remedy said to pull again.

Pulling again repeated the same refusal.

## Recovery

`se_aim` recovered the route.
