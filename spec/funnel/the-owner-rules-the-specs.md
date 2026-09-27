---
kind: [[funnel]]
about: the choices the phase 0 specs of the migration make, which the owner has yet to rule
---

# Scope

The specs phase 0 writes carry choices a box makes, and each stood in a note as
if the owner rules it. The owner rules none of them yet. Each stands here as a
proposal, with the note carrying it and the recommendation. A note carrying one
points here, and a box builds on a proposal where its phase meets it.

The owner rules the model itself in
[[spec/design_input/the-index-holds-the-model]], and those rulings stand.

# The proposals

| the proposal | where it stands | the recommendation |
|---|---|---|
| (a) an action answers a `then`, which the index calls with the answers and which answers the next list of calls | [[spec/design_output/model#an-action-lists-calls]] | take it: a hand-back reads the check's answer before the push, and a `then` keeps each step pure |
| (b) a call without an undo names `q.NoUndo` and a reason | [[spec/design_output/model#an-action-lists-calls]] | take it: a push takes nothing back, and the reason lands in the session log |
| (c) `quack why` follows an input down to `files/`, `session/` and `clock/minute`, and stops short of git | [[spec/design_output/model#quack-why]] | take it: git is live input nowhere, per [[spec/rationales/git-stays-the-archive]] |
| (d) a door writes `session/` and `clock/minute` itself | [[spec/design_output/model#the-topics-the-index-holds]] | change it: a door reports, and the index alone provides its input topics, so a provider writes every name |
| (e) a git hook reads names alone, and queues behind no writing operation | [[spec/design_output/operations#one-writer-per-tree]] | take it: a hook the operation's own commit fires waits on itself otherwise |
| (f) the restarts of a part stop after its alarm, until the alarm clears | [[spec/design_output/watchdogs#restarts]] | take it, with the alarm naming the command that clears it |
| (g) the hook module takes the index as down where no answer comes, and reads no lease | [[spec/design_output/hook-protocol#no-door-answers]] | change it: the hook module reads the index's lease, so an index answering off a hung loop reads as down |
| (h) the index and its processes speak NATS, inside the index process | [[spec/rationales/the-processes-speak-nats]] | take it, with the per-name revisions, the resync and the chunks [[spec/design_output/inner-protocol]] names |
| (i) the editor starts `quack lsp`, which relays stdio to the doors process over its own TCP stream | [[spec/rationales/the-editor-starts-quack-lsp]] | take it: the extension learns no port, and the LSP stays off a bus that drops a message |
| (j) a value past the bus's payload cap rides in numbered chunks on the reply | [[spec/design_output/inner-protocol#large-values-ride-in-chunks]] | take it, and name the cap in the config |
| (k) `q.Given` stays for the index's own input topics alone | [[spec/design_output/model#the-topics-the-index-holds]] | take it: it is how the index provides what a door reports, per (d) |

# What stands open

| the proposals | what hangs on them |
|---|---|
| (a), (b) and (e) | the actions of the foundation's gaps, and the verbs of phase 4 |
| (c), (d) and (k) | the foundation's gaps |
| (f) and (g) | the cage of phase 5 |
| (h) and (j) | the bus, which the foundation's gaps build |
| (i) | the LSP door of phase 7 |

The owner rules a row, the note carrying it drops its pointer here, and the row
leaves this note. The note closes once no row stands.
