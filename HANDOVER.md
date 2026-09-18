---
kind: [[handover]]
status: done
urgency: now
---

# Where it stands

A cloud box ends its turn on a question an agent answers. The stop rule asks
whether a person can answer, and a person can answer anything. So the test lets
every hard call out of the box.

This branch replaces that test with the blast radius of a wrong answer, and
stops a claim overriding a check.

| what changes | where |
|---|---|
| `a-person-holds-the-answer` becomes `a-wrong-answer-leaves-the-box` | `spec/config/stop/level0.yml` |
| a stop carrying `yields` loses to any mechanical continue | `.claude/skills/level0/lib/stop.js` |
| the three stops the agent claims over its own work carry `yields` | `spec/config/stop/level0.yml` |
| the cloud guidance asks the blast radius, in rules six and nine | `spec/guidance/cloud.md` |
| the argument, and the failure driving it | `spec/rationales/cloud.md` |
| the chapters a check beats a claim, and the blast radius decides | `spec/design_output/stop.md` |

`./RUNME.sh check` answers 0 on this commit, and the suite answers green.

# What waits

| what | who does it |
|---|---|
| [[spec/tickets/a-return-asks-another-hand]], standing at todo | the next hand |

The engine still stamps `by: person` on a count of returns. That rename reaches
`withEngineReader`, `branch unblock` and the step name, so it stands on its own
ticket.

# What the flag does

A claim reads the agent, and a check reads the tree. A stop the agent claims
over its own work now loses to any mechanical continue that fires, whatever the
priorities say.

A stop the owner drives carries no flag:

- `the-owner-asks-to-talk` reads the owner's own words
- `the-chat-is-new` reads the session log

The band table puts `90` to `100` in the owner's hands. The rule this replaces
sits there while reading the agent, so it overrides every check reading the
branch.

# The test the guidance asks

A box answers a question whose wrong answer a commit undoes. It hands out a
question whose wrong answer reaches past the branch.

The wrong answer leaves the box where it does one of these:

- it spends, sends or opens a door: money, a message to somebody outside, a secret
- it loses work nobody rebuilds: a dropped commit, a deleted row, a release
- it stands outside the brief: a product call the brief leaves open

Everything else the box answers. It names the assumption under the ticket's
discussion and carries on.
