---
kind: [[funnel]]
about: a third kind of ticket, which the engine mints at a pull, which stands held alone, and which its hand-back deletes
---

# Scope

Two kinds of ticket stand, tracked and private, and the folder says which. For
details, see [[spec/design_input/the-agent-pulls-tickets]].

The engine also asks the agent for work no ticket carries, and each ask takes
a road of its own:

| the ask | its road | what the work tab draws |
|---|---|---|
| the handover past `context.handoverAt` | a block riding every call, then a hold on the turn's end | nothing |
| a cleanup on an empty queue: refactor, check | the pull's answer, with no file and no hold | nothing |
| the plan's three questions, and the owner's ask for an update | the grace, riding each result | nothing |

For the handover, see [[spec/design_output/stop#the-context-hands-over]]. For
the cleanup, see [[spec/design_output/pull#an-empty-queue-hands-cleanup]]. For
the grace, see [[spec/design_output/stop#the-grace]].

The owner wants the handover to leave the block, and to reach the agent as the
next ticket it pulls. The work tab then shows the agent at it.

# An ephemeral ticket stands held

The shape on offer is a third kind, the ephemeral ticket. The engine mints it
at a pull, it stands `held` from its birth to its hand-back, and the hand-back
deletes it.

| kind | where it stands | travels | its states |
|---|---|---|---|
| tracked | `spec/tickets/` | yes | `draft`, `open`, `closed` |
| private | `.se/tickets/` | no, it dies with the box | `draft`, `open`, `closed` |
| ephemeral | the hold alone, `.se/.runtime/hold/<hand>.json` | no, it dies at its hand-back | `held` |

The hold carries the ask and the route the engine writes, in place of a path
to a ticket file. The hold gives most of the kind today:

| what the hold does today | what the ephemeral ticket takes from it |
|---|---|
| the stop hook carries a turn while a hold stands | the agent ends no turn before the ask closes |
| the queue numbers a held ticket `0` | the ephemeral ticket stands first, as the work in hand |
| the pull refuses a second hand-out while a hold stands | the ask waits for the leaf in hand to go back |

The work tab draws a row off the index, and the index reads ticket files. A
hold with no file reaches the tab the way the plan's todos reach it, as a row
the answer lays over the tree. For details, see
[[spec/design_output/stop#the-plan]].

# The handover becomes recycle

The handover turns into the first ephemeral ticket, named `recycle`:

| step | today | with `recycle` |
|---|---|---|
| a fill past `context.handoverAt` | the block rides every call: finish, start nothing new, write the handover | the session goes due, and no block rides |
| the next pull | hands the next leaf | hands `recycle` ahead of every pool |
| the work | the agent writes the handover under the block | the agent writes the handover the ask names |
| the hand-back | none, and the turn's end holds until the handover stands | checks that the handover stands and names no file under `.se/.retro`, then drops the hold |
| the clear | the bridgehead clears at the turn's end | the same |

The handover runs under `engine.binding` at `queue` alone, and there the pull
stands as the one door to new work. So start nothing new holds with no words:
the agent meets `recycle` the moment it asks for more.

# A step runs long

The pull fires at a hand-back alone. A step running long past
`context.handoverAt` meets no pull, and `context.writeAt` stops the step where
it stands for that case today. These roads answer it:

| road | what it costs |
|---|---|
| past `context.writeAt`, the next call answers with the `recycle` hand-out in place of its result, and the hold carries `recycle` beside the leaf in hand | the hold holds two, and the rule of one hand-out per hold takes an exception |
| `recycle` waits for the next pull, and `context.writeAt` keeps its block | one block stays, and it fires on the rare long step alone |

The first road answers the ask for no warning. The grace refuses a call until
the agent reacts already, so a call carrying a hand-out adds no new door, and
no warning stands. It costs the one-hold rule, and the leaf in hand stays held under
`recycle` until the next conversation picks it up.

# The strongest objection

A hold carrying an ask is no ticket: it meets no mint, no route of steps and no
state the pull moves. Naming it a kind grows the ticket schema for a thing
that stands in no ticket folder.

The objection holds for the storage, so the ticket schema stays as it stands:
no folder, no file, and no `held` in the `state` enum. The hold carries the
fields. The name holds for what a hand meets. The pull hands it out, the work tab
draws it, and the hand-back closes it, as with any ticket. A person
reading the tab asks what the agent works on, and a ticket answers that.

# Other asks turn ephemeral

| the ask | whether it becomes ephemeral | why |
|---|---|---|
| the handover | yes, as `recycle` | the owner's ask |
| a refactor or check cleanup | yes | it carries no file and no hold today, so the tab shows the agent idle while it works |
| the owner's ask for an update | open | a reply in the chat answers it, and a ticket adds a pull and a hand-back to one line |
| the plan's three questions | no | a field on any call answers them, and a pull costs more than the field |

# What stands open

| the question | what hangs on it |
|---|---|
| whether a long step takes `recycle` over the leaf in hand, or keeps the `context.writeAt` block | the one-hold rule, and whether any warning stays |
| whether the cleanups become ephemeral tickets | the tab shows the agent at a refactor, or shows it idle |
| whether the owner's ask for an update becomes one | a reply the tab shows, against a pull and a hand-back for one line |
| whether `recycle` stands as the name | the word the tab, the pull's answer and the log carry |
| whether an unbound or god session takes ephemeral tickets | a session off the queue pulls nothing, so an ask needs another road there |
