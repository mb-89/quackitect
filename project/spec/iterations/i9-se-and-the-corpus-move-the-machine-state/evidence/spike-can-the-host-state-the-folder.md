---
form: spike-can-the-host-state-the-folder
by: agent
signed_off: 2026-08-19T19:06:26.430Z
authors: agent
files:
---

# Evidence form / spike-can-the-host-state-the-folder

## current_situation

THE ASSUMPTION IS FALSE, and not in the way it predicted. It assumed two host features each name a folder and might disagree. Only one names a folder, and it names it to itself.

THERE IS NO HANDOVER TO DISAGREE WITH. The editor never names a folder to the extension.

### What was read

THE HOST'S OWN SOURCE AND ITS WHOLE PUBLISHED TYPE SURFACE. Not a write-up, not a forum answer. The activation mechanism is one file and it was read end to end.

THE FOLDER IS COMPUTED AND THROWN AWAY. The activation check walks the open folders, finds the first that contains the named file, activates, and returns. The matching folder is in scope on the line that activates and is not passed on. The result type carries one field, the event string.

WITH A WILDCARD PATTERN NO FOLDER IS COMPUTED AT ALL. One search runs across every open folder and returns a boolean.

THE EXTENSION RECEIVES THE WHOLE WORKSPACE and no activation reason. Every published type and every proposed one was checked. The activation event appears in none of them.

### The half this spike did NOT run

THE DRAWN STATEMENT ASKED FOR AN EDITOR SESSION TOO, and no editor was opened. That is stated rather than glossed.

WHY IT WAS NOT NEEDED FOR THE QUESTION ASKED. The source and the type surface answer whether the information exists at all, and they answer it more strongly than one session could: a session shows what happened once, and the source shows there is nothing to happen.

WHY A SESSION IS STILL WORTH SPENDING, on two narrower questions the source cannot settle. A seven-second timeout kills wildcard activation with only a log line to show for it. And the search path is forced under a remote authority, which changes which mechanism runs.

### Two silent failures found on the way

A SEVEN-SECOND TIMEOUT KILLS WILDCARD ACTIVATION. A pattern with no wildcard avoids the search path entirely, which makes it the safer form.

ADDING THE FIRST FOLDER TO A WORKSPACE RESTARTS EVERY EXTENSION rather than firing the folders-changed event.

## built

- exp-can-the-host-state-which-folder-it-handed-over

## follow_up

THE WINNING DESIGN'S ROOT CELL WAS HALF IMPOSSIBLE AND IS REWRITTEN. This is a design change, made because a spike falsified the thing the cell rested on.

### What changed

`opt-ownership-transfers-by-explicit-handover` LOSES THE EDITOR from its list of things that can state a root. A launcher, a hook or a command line still can, and each keeps the two-sided act.

`raid-dec-ownership-is-stated-by-the-host-and-acknowledged-back` IS REWRITTEN ONE-SIDED. The guarantee is unchanged: exactly one tree, or a refusal. The system runs the same content test the host ran, once per open folder, and counts carriers.

- Nought. Refuse. Something claimed a carrier exists.
- One. Bind to it, and echo it where a person reads it.
- Two or more. Refuse, and ask the person.

IT NEVER LEARNS WHICH FOLDER FIRED THE EVENT. It makes that irrelevant, because the only case where the trigger's identity matters is the ambiguous one and that case refuses.

### What the rewrite cost, measured rather than assumed

A SECOND HAND SCORED BOTH DESIGNS ON THE FATAL AXIS AFTER THE REWRITE. Neither score moved. The requirement grades by failure mode rather than by mechanism, and both shapes sit at the same rank.

ONE CLAUSE MOVED IN THE REWRITE'S FAVOUR. The two-sided act had a declared gap for a host that only launches a process with a working directory. The self-check covers that host, so the requirement's environment coverage widened.

WHAT IT DID COST is the argument the design could once have made in principle. The original contrasted itself with inference, and a receiver's content test IS inference. That closes a route to the top rank without changing today's rank.

### One hole the scoring found that nobody had written down

THE SELF-CHECK IS SOUND ONLY WHILE THE SYSTEM'S TEST AND THE HOST'S TEST STAY THE SAME TEST. Both are generated from the shared declaration, so a drift between generated consumers breaks the fallback silently.

THE WINNING DESIGN'S FAILURE-MODE LIST HAS FOUR ITEMS AND THAT DRIFT IS NOT AMONG THEM. The rival names the same mode and gives it a home. This is recorded on the design rather than left in a scoring anchor.

USE THE HOST'S FILE-EXISTS CALL RATHER THAN ITS SEARCH, where the marker is a fixed name. The search applies the person's own exclusion settings unless told otherwise, so it is a different test and can disagree with the host's.

## anything_else

