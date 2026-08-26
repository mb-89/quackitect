---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-wake-on-what-the-folder-contains
type: "[[option]]"
statement: Let the host start the product only when the folder being opened contains something the system owns, so a folder that is not a project never wakes anything at all.
cluster: the-bootstrap
question: what happens when a folder is opened
found_by: prior-art
source: VS Code api/references/activation-events.md — workspaceContains fires when a folder is opened and contains at least one file matching a glob
---

## Mechanism

THE CONDITION IS EVALUATED BY THE HOST, BEFORE OUR CODE EXISTS. A pattern is
declared once; the host tests every opened folder against it and starts
nothing when it does not match.

WHAT IT REPLACES HERE, and this is measured rather than assumed. The extension
today declares one activation event that fires when the EDITOR finishes
starting. It is the latest of the available events by definition, and it is
blind to which folder is open, so our code wakes in every window on every
folder including ones that are not projects.

WHAT IT COSTS HERE. The pattern is a marker by another name, so it commits to
the machine-state folder being recognisable from outside. It also fires only
where the host implements it, which means a second answer for anything that
starts the product without an editor.

WHAT IT BUYS HERE. Two demands at once, for one declaration. A folder that is
not a project is left completely alone without any code of ours running to
decide that. And the entry point stops depending on an event defined as
happening after everything else, which is the only lever this iteration has
on how long a person waits.

THE OWNER'S RULING NARROWS WHAT THIS HAS TO PROVE. Waking everywhere is
acceptable provided a folder with no machine state is identified and then
left alone. So this option competes on TIMING and on doing nothing rather
than on permission.
