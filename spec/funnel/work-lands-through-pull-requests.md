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
| a routine takes a trigger on the events of a pull request, such as `pull_request.opened`, `pull_request.labeled` and `pull_request.closed` | a routine starts when a branch opens, when it hands back, and when it lands |
| a trigger filters on the base branch, the head branch, the labels, the draft flag, and the merge | a trigger reads `work/` heads alone |
| the Claude GitHub App on the repository carries every such trigger | the owner installs it once |
| each event starts a session of its own, and an hourly cap drops the events past it | a clock stays beside the events |
| a routine pushes a `claude/` branch freely, and refuses a protected branch | a work branch stays open to a box, and a protected trunk refuses every box |

A routine reacts to a pull request, and to no plain push. So a pull request is
the one signal GitHub hands a routine about a branch.

The forge itself deletes a head branch at the merge, where the repository turns
that setting on. So the refusal on a delete stops mattering.

# The shape on offer

The branch stays, and the desk still opens it. Each step, today and with a pull
request:

| step | today | with a pull request |
|---|---|---|
| design talk | the owner and a desk agent write the design input | the same |
| the group ticket | `./RUNME.sh mint ticket` on trunk | the same |
| open the branch | `branch open` pushes `work/<name>`, and a desk fires the routine by hand | `branch open` pushes, and a draft pull request opens with it |
| start a box | the `work` routine's clock, or the desk's hand | a routine on the draft's `pull_request.opened` runs `branch take` at once |
| work | the box pulls, works and pushes | the same |
| hand back | `branch done` sets done, and nothing else moves | `branch done` sets done, and labels the pull request `ready` |
| review | a person reads the branch at a desk | a routine on `pull_request.labeled` reviews the branch against its ask, and posts on the pull request |
| check the merged tree | `branch merge` runs `./RUNME.sh check` on the merge commit, and resets trunk when red | a workflow runs the check, and trunk's protection holds the merge until it passes |
| free the open tickets | the merge commit drops their `group` | `branch done` drops it on the branch, before the label |
| land | a person runs `branch merge` on a desk | the owner approves and merges on GitHub, in a browser or the phone app |
| delete the branch | `branch close` on a desk | GitHub, at the merge |
| catch a stranded branch | the clock | a slower clock, as a chapter below says |

# A draft starts the box

`branch open` pushes a commit of its own, holding trunk's tree, so the branch
stands one commit past trunk. A draft pull request opens over that commit, and
its `pull_request.opened` starts a box on the branch. The desk's hand on
`./RUNME.sh cloud trigger` goes.

Whether GitHub opens a pull request over a commit changing no file stands
unchecked. Where it refuses, `branch open` commits the group ticket onto the
branch instead.

# A clock catches the rest

The events carry the work, and a clock catches a branch no event reaches again:

| the case | why no event fires |
|---|---|
| GitHub sends more events in an hour than the routine's cap | the platform drops the events past the cap |
| the daily run cap refuses the run, or the GitHub connection stands down | the event arrives, and no session starts |
| a box stops mid-branch, or `branch release` hands a stale branch back | the draft stands open already, so nothing opens again |

Each firing of the clock starts a session and counts against the daily cap,
with or without a branch to take. So the clock slows once the events carry the
load, and a stranded branch waits one period at most.

# Review runs in the cloud

The label `ready` fires a routine that runs `review_branch` over the branch. It
reads the branch against its group's ask, and posts the report on the pull
request. The owner reads it where GitHub notifies them, and approves and merges
there. A desk checkout stays open to anyone who wants one.

Whether a trigger names the move from draft to ready on its own stands
unchecked. The label is the event the platform names, so the label carries it.

# Who opens the pull request

| step | who acts | through what |
|---|---|---|
| the draft | the desk, at `branch open` | `gh` on the desk, or the desk agent's GitHub connector |
| the label | the box, at `branch done` | the GitHub connector, which the `work` routine carries already |

The harness tells a cloud session to open no pull request unless asked. A label
on a draft the desk opens leaves that rule standing, and the routine's prompt
names the label in words. A pull request the desk opens carries the owner's
GitHub user, so its events reach a routine like any person's.

A workflow on GitHub's own token opens a pull request no other workflow sees,
and whether a routine sees it stands unchecked. So no workflow opens one.

# What we gain

| gain | why it holds |
|---|---|
| a box starts the moment a branch opens | the draft's event fires the routine |
| a review waits before the owner looks | a routine reviews on the label |
| the owner lands work from a phone | GitHub's merge button replaces the desk verb |
| a branch goes on its own at the merge | GitHub deletes the head at the merge |
| trunk takes nothing unchecked, from any hand | protection on `main` asks for the check on every merge |
| every open branch shows on GitHub | each one stands as a draft or a ready pull request |

# What we lose

| loss | why | what answers it |
|---|---|---|
| the merge verb's own work: the ticket guard, the freed tickets, the check on the merge commit | a GitHub merge runs none of it | a workflow holds the guard and the check, and `branch done` frees the tickets |
| a merge with no network | a protected trunk takes a merge through GitHub alone | the owner's bypass on the protection |
| a push to trunk from a desk, for a note or a fix | the protection refuses it | a small pull request, or the owner's bypass |
| the pre-push stamp as trunk's gate | the protection's required check takes that job | the door stays over a push to a work branch |
| usage | a branch starts a session as it opens and another at its label, under a daily cap and an hourly one | filters narrow each trigger to `work/` heads, and the clock slows |

# What we change

| where | what changes |
|---|---|
| the repository's settings | the Claude GitHub App installs on the repository |
| the same | `main` takes protection, with the `check` job required and the branch up to date |
| the same | a merge commit stands as the one way onto trunk, and a head branch deletes at the merge |
| `.github/workflows/check.yml` | it runs on a pull request against `main` too, so the merged tree carries the check |
| a new workflow | the ticket guard, which `branch merge` holds today, refuses a pull request where trunk moves a ticket the branch touches |
| a scheduled workflow | it deletes every `claude/` branch and every `work/` branch trunk holds whole, with the repository's own token |
| `src/scripts/work.js` | `branch open` opens the draft, `branch done` frees the open tickets and asks for the label, and `branch merge` and `branch close` retire |
| `spec/design_output/work.md` | the round trip, the merge chapters and the close chapter follow the new road |
| `spec/guidance/cloud.md` and `spec/rationales/cloud.md` | the hand-back ends on the label, and the line saying a box opens no pull request stays true |
| the routines | one takes on `pull_request.opened`, one reviews on `pull_request.labeled`, and `work` keeps a slower clock |

A routine run pushes a `claude/` branch of its own and opens no pull request
for it. So the scheduled workflow, and no setting, clears those.

# The impacts

| who | what they meet |
|---|---|
| the owner | a draft at every open branch, a review on every ready one, and a merge on GitHub |
| a desk | a draft opening with every branch, and no merge verb |
| a cloud box | a start the moment its branch opens, and a label at its hand-back |
| the battery | a run on GitHub for every push and every pull request, beside the local run |
| usage | two sessions a branch, beside a slower clock |

# What stands open

- Whether GitHub opens a pull request over a commit changing no file. Where `branch open` commits the ticket hangs on it.
- Whether trunk takes protection, and whether the owner keeps a bypass. A desk's small fix hangs on it.
- How slow the clock runs. The wait for a stranded branch hangs on it.
- Whether a review asking for changes sends the branch back to a box on its own. A loop with no person in it hangs on it.
- Whether `branch merge` stays for a merge with no network. Two roads onto trunk hang on it.
