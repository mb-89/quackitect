---
form: draw-context
by: agent
signed_off: 2026-08-15T15:12:38.460Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

M1 is closed and blessed. The walk is in M2, and the register stands at nine entries with the crashed-walk assumption minted here rather than at the gate that found it.

THE CLOUD HAD NO NODE UNTIL THIS STATE. The trace held ten neighbours and none of them was the machine this iteration exists to reach. [[nbr-cloud-host]] was minted here.

## boundary

INSIDE THE BOX is everything the product owns and can change: the engine, the lane, the walk, the record store, the claim ledger, the mirror, the method and the spec corpus. If a defect in it is ours to fix, it is inside.

OUTSIDE THE BOX is everything the product talks to and does not own. It is named neighbour by neighbour below rather than described here.

THE LINE THIS ITERATION MOVES, and it is the only boundary change: git stops being a place the product writes to and becomes the place the product READS ITS OWN STATE FROM. The remote was already outside. What changes is that the answer to "which iterations exist" now crosses that boundary instead of being answered inside from the disk.

THAT IS WHY THE BOUNDARY WORK BELONGS HERE. A question that used to be internal is now a crossing, and a crossing needs an interface, a failure mode and a latency budget. The offline case, the git-cost probe and the fetch refspec are all consequences of moving one question across the line.

THE DISK IS INSIDE AND DEMOTED. It stays a workspace the product owns entirely, and it stops being a source of truth about anything.

## neighbours

- [[nbr-cloud-host]]
- [[nbr-peer-machine]]
- [[nbr-git]]
- [[nbr-origin-remote]]
- [[nbr-agent-harness]]
- [[nbr-engineer]]
- [[nbr-toolchain]]

## intended_use

A MACHINE IS GIVEN THIS REPOSITORY, ONE ITERATION ID AND ONE COMMAND, and it walks that iteration. It may be a machine somebody uses every day or a cloud host that will not exist tomorrow, and the procedure is identical either way. Nothing is typed by a person after the command, nothing is read as prose, and no step is discovered by trying it. Which iterations exist is answered from git, so every machine sees the same list without copying anything, and a folder appears on disk only while a walk is actually running on that machine. When the walk finishes the folder goes and the work stays, in git, readable from anywhere.

## excluded_use

THE DOES-NOT-DO LIST, and each line is binding rather than a preference.

- IT DOES NOT PROVISION A MACHINE. Somebody else's control plane creates the host. The product is a guest that arrives afterwards.
- IT DOES NOT INSTALL A TOOLCHAIN IT DOES NOT NEED. The entrypoint verifies node and installs the project. It does not guess at build tools; the first cloud run installed python3, make and g++ and none of them was needed.
- IT DOES NOT SYNCHRONISE MACHINES DIRECTLY. Peers never talk to each other. Everything between them rides the remote.
- IT DOES NOT ADJUDICATE FOR THE PERSON. An unattended run may hold gates the owner authorised for that run in advance, host-local and never committed. It does not decide a gate the owner kept.
- IT DOES NOT KILL ANYTHING TO GET ITS PORT. A starting instance refuses a held port and says whose it is. The health answer reports and never kills, restarts or evicts.
- IT DOES NOT KEEP A SESSION ALIVE FOR ITS OWN SAKE. A cloud session ends, and everything it learned travels as backlog rows and register entries rather than as a document about the session.
- IT DOES NOT MAKE THE DISK AUTHORITATIVE AGAIN, in any fallback. A cache is legal; a second source of truth is not.
- IT DOES NOT REACH THE REMOTE TO ANSWER WHAT EXISTS. Local refs answer that, so the question works offline. Only entering an iteration needs the network.

## follow_up

- the crossing this iteration creates wants an interface node both ways between the record store and git, per the crossing-flow law added at i12's retro
- [[nbr-cloud-host]] carries four properties that each produce a demand, and M3 turns them into requirement rows: unconfigured, unattended, ephemeral, and no session to wake
- the offline constraint is now boundary-level rather than a register entry alone, and it needs a testable requirement row
- map-stakeholders is next, and [[nbr-cloud-host]] is not a stakeholder — the roles it implies are the operator who starts a run and the owner who authorises its gates in advance
- nothing is parked from this state

## anything_else

THE NEIGHBOUR LIST IS SEVEN OF THE ELEVEN THAT NOW EXIST, and the four left out are deliberate rather than forgotten. nbr-obsidian, nbr-vscode, nbr-output-tools and nbr-web do not touch anything this iteration moves. Listing every neighbour the product has would make the context drawing a directory rather than a boundary.
