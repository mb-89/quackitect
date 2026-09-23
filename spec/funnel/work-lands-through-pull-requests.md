---
kind: [[funnel]]
about: whether finished work lands on trunk through a pull request, and what the routines do then
---

# Scope

A box hands a branch back with `./RUNME.sh branch done`, and a desk lands it
with `./RUNME.sh branch merge`. The merge runs on the desk's clone, checks the
merged tree, and frees the open tickets. `branch close` then deletes the branch.
For the road, see [[spec/design_output/work#the-round-trip]].

Two frictions push toward a pull request:

| friction | where it bites |
|---|---|
| the merge needs a desk holding trunk | a phone reads a branch and lands nothing |
| a cloud session meets a refusal on a branch delete | branches pile up on origin until a person deletes them |

The one routine, `work`, fires on a clock with `./RUNME.sh branch take`, and
carries no GitHub trigger. So a pull request fires nothing today.

# What the platform offers

The routines page at code.claude.com says, as this note stands:

| what the platform does | what it means here |
|---|---|
| a routine takes a trigger on the events of a pull request, such as `pull_request.opened` and `pull_request.closed` | a routine starts on a hand-back, and on a merge |
| a trigger filters on the base branch, the head branch, the labels, and the merge | a trigger reads `work/` heads alone |
| the Claude GitHub App on the repository carries every such trigger | the owner installs it once |
| each event starts a session of its own, and an hourly cap drops the events past it | the clock on `work` stays, and catches a dropped event |
| a routine pushes a `claude/` branch freely, and refuses a protected branch | a work branch stays open to a box, and a protected trunk refuses every box |

GitHub itself deletes a head branch at the merge, where the repository turns
that setting on. So the refusal on a delete stops mattering.

# The shape on offer

Each step of a branch's life, today and with a pull request:

| step | today | with a pull request |
|---|---|---|
| take | the `work` routine runs `branch take` on its clock | the same |
| hand back | `branch done` pushes the branch | `branch done` pushes, and a pull request opens against `main` |
| review | a person reads the branch at a desk | a routine on `pull_request.opened` reviews the branch against its ask, and posts on the pull request |
| check the merged tree | `branch merge` runs `./RUNME.sh check` on the merge commit, and resets trunk when red | a workflow runs the check, and trunk's protection holds the merge until it passes |
| free the open tickets | the merge commit drops their `group` | `branch done` drops it on the branch, before the pull request opens |
| land | a person runs `branch merge` on a desk | a person merges the pull request, from a phone or a desk |
| delete the branch | `branch close` on a desk | GitHub, at the merge |
| start the next branch | the clock, up to four hours later | a routine on `pull_request.closed` runs `branch take` at once, and the clock stays |

# Who opens the pull request

| road | what holds it | what it costs |
|---|---|---|
| the box, through the GitHub connector | the `work` routine carries that connector already | the harness tells a cloud session to open none unless asked. So the routine's prompt and the cloud guidance ask for it in words |
| a workflow on a push to a `work/` branch whose group ticket stands at done | GitHub's own token opens it, and no session has to remember | a pull request that token opens starts no other workflow, and whether it reaches a routine stands unchecked |
| `branch done` itself, through `gh` | the verb opens it on a desk | a cloud box carries no `gh`, and reaches GitHub through the connector alone |

The recommendation is the box, through the connector. The pull request then
carries the owner's GitHub user, the way every routine action does. So its
`pull_request.opened` reaches a routine like any person's. It costs a rule held
in words: `branch done` prints the title and the body, and the box makes the
call.

# What we gain

| gain | why it holds |
|---|---|
| a person lands work from a phone | GitHub's merge button replaces the desk verb |
| a branch goes on its own at the merge | GitHub deletes the head at the merge |
| a review waits before a person looks | a routine on `pull_request.opened` reviews the branch against its ask |
| the next branch starts at the merge | a routine on `pull_request.closed` takes it, in place of the clock |
| trunk takes nothing unchecked, from any hand | protection on `main` asks for the check on every merge |
| one record of a branch's review | the pull request holds the review, the comments and the merge |

# What we lose

| loss | why | what answers it |
|---|---|---|
| the merge verb's own work: the ticket guard, the freed tickets, the check on the merge commit | a GitHub merge runs none of it | a workflow holds the guard and the check, and `branch done` frees the tickets |
| a merge with no network | a protected trunk takes a merge through GitHub alone | the owner's bypass on the protection |
| a push to trunk from a desk, for a note or a fix | the protection refuses it | a small pull request, or the owner's bypass |
| the pre-push stamp as trunk's gate | the protection's required check takes that job | the door stays over a push to a work branch |
| usage | each pull request starts a session as it opens, and another as it lands, under a daily cap and an hourly one | filters narrow each trigger to `work/` heads, and the clock catches a dropped event |

# What we change

| where | what changes |
|---|---|
| the repository's settings | the Claude GitHub App installs on the repository |
| the same | `main` takes protection, with the `check` job required and the branch up to date |
| the same | a merge commit stands as the one way onto trunk, and a head branch deletes at the merge |
| `.github/workflows/check.yml` | it runs on a pull request against `main` too, so the merged tree carries the check |
| a new workflow | the ticket guard, which `branch merge` holds today, refuses a pull request where trunk moves a ticket the branch touches |
| a scheduled workflow | it deletes every `claude/` branch and every `work/` branch trunk holds whole, with the repository's own token |
| `src/scripts/work.js` | `branch done` frees the open tickets and prints the pull request's title and body, and `branch merge` and `branch close` retire |
| `spec/design_output/work.md` | the round trip, the merge chapters and the close chapter follow the new road |
| `spec/guidance/cloud.md` and `spec/rationales/cloud.md` | the hand-back ends on an open pull request, and the line saying a box opens none goes |
| the routines | `work` keeps its clock, one routine reviews on `pull_request.opened`, and one takes on `pull_request.closed` |

A routine run pushes a `claude/` branch of its own and opens no pull request
for it. So the scheduled workflow, and no setting, clears those.

# The impacts

| who | what they meet |
|---|---|
| the owner | a review and a merge on GitHub, and no merge verb |
| a cloud box | a branch ending on an open pull request |
| a desk agent | its own work landing through a pull request too, because trunk takes no push |
| the battery | a run on GitHub for every push and every pull request, beside the local run |
| usage | two sessions a branch beside the clock |

# What stands open

- Who opens the pull request: the box through the connector, or a workflow. Whether a routine reacts to a pull request a workflow opens hangs on it, and stands unchecked.
- Whether trunk takes protection, and whether the owner keeps a bypass. A desk's small fix hangs on it.
- Whether a routine reviews every pull request, or those carrying a label. Usage hangs on it.
- Whether the landing takes the next branch, or the clock stays the one road. The wait between branches hangs on it.
- Whether `branch merge` stays for a merge with no network. Two roads onto trunk hang on it.
