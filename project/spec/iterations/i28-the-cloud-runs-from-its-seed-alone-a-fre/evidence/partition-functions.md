---
form: partition-functions
by: agent
signed_off: 2026-08-15T16:36:00.406Z
authors: agent
files:
---

# Evidence form / partition-functions

## current_situation

M4's shared partitioning. The function structure did not change in this iteration, so the DSM inherits and this state confirms rather than re-clusters.

THE MATRIX IS DERIVED FROM THE FLOW EDGES on the function notes and never drawn by hand. Twenty functions, five clusters, and the engine ordered the rows so the blocks show.

TWO FUNCTIONS SAT IN CLUSTERS THAT DO NOT EXIST, and finding that is what this state was for.

## clusters

| fn-run-a-governed-walk.keep-the-record | the-account |
| fn-run-a-governed-walk.show-where-it-stands | the-account |
| fn-run-a-governed-walk.teach-the-newcomer | the-account |
| fn-run-a-governed-walk.work-the-register | the-account |
| fn-run-a-governed-walk.help-find-a-capability | the-account |
| fn-run-a-governed-walk.stand-up-a-product | the-bootstrap |
| fn-run-a-governed-walk.diverge-before-deciding | the-holding-pen |
| fn-run-a-governed-walk.hold-a-stray | the-holding-pen |
| fn-run-a-governed-walk.answer-with-tests | the-record-life |
| fn-run-a-governed-walk.close-a-record | the-record-life |
| fn-run-a-governed-walk.hold-the-work | the-record-life |
| fn-run-a-governed-walk.keep-the-archive | the-record-life |
| fn-run-a-governed-walk.land-the-work | the-record-life |
| fn-run-a-governed-walk.route-the-work | the-record-life |
| fn-run-a-governed-walk.share-the-pool | the-record-life |
| fn-run-a-governed-walk.catch-the-system-up | the-walk |
| fn-run-a-governed-walk.hold-the-method | the-walk |
| fn-run-a-governed-walk.judge-a-claim | the-walk |
| fn-run-a-governed-walk.serve-a-step | the-walk |

## follow_up

- THE ROOT FUNCTION IS IN THE PARTITION AND SHOULD NOT BE. The engine gave fn-run-a-governed-walk the placeholder cluster `c01`, because the node carries no cluster key and the overall function is not a cluster member by definition. It is the parent of everything being clustered.
- THAT IS AN ENGINE FINDING RATHER THAN A DATA ONE, and it was left rather than papered over: giving the root a cluster would make the tree's parent a peer of its own children.
- HELP-FIND-A-CAPABILITY WAS IN A CLUSTER THAT DOES NOT EXIST. Its node said `self-description`, which resolves to no cluster node. It is now in the-account, whose members are the four functions that tell somebody what is going on.
- enumerate-space is next, and it is the AND-join this state was the missing leg of.
- nothing is parked from this state.

## anything_else

### What this state actually caught

NOTHING MOVED FOR DESIGN REASONS. The change adds no function, so the partition inherits whole. What it caught was two rows whose cluster did not resolve.

- `self-description` on help-find-a-capability. No such cluster node. Five exist: the-account, the-bootstrap, the-holding-pen, the-record-life, the-walk. A name somebody typed once and nothing checked.
- `c01` on the root. The engine's own placeholder for a node with no cluster key.

NEITHER WOULD HAVE SHOWN IN A DRAWING. Both render as a box like any other, and only reading the cluster values against the cluster nodes finds them.

### The coupling classes, per cluster

Read off what the flows actually carry rather than chosen from the list by feel.

- THE-ACCOUNT: shared-data. Every member reads or writes the same record of what happened, and flow-call-log and flow-trace-graph pass between them.
- THE-RECORD-LIFE: same-lifecycle. Its members act on a record at different moments of one life, from routing through holding to closing and archiving, and flow-worktree and flow-open-record carry it.
- THE-WALK: sequence. Its members hand one step to the next, and flow-compiled-machine and flow-dispatched-call are the order.
- THE-HOLDING-PEN: shared-data. Both members hold something out of the way and hand it back, over flow-note-inbox.
- THE-BOOTSTRAP: same-lifecycle, and it has one member. A cluster of one is a smell, and it is honest here: standing up a product happens once and shares nothing with the running system except its output.

### Why the root was not simply placed

A CLUSTER IS A GROUP OF FUNCTIONS AND THE ROOT IS THEIR PARENT. Placing it beside its own children would make the partition claim something false about the structure, to satisfy a form. The method card warns that mistaking a cluster for something it is not is the commonest way this step goes wrong.
