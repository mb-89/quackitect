---
id: i28-the-cloud-runs-from-its-seed-alone-a-fre
status: seeded
opened: 2026-08-13T15:43:52.568Z
goal: "The cloud runs from its seed alone: a fresh machine, a record id and one command produce a working walk, with nothing typed by a person and nothing read as prose."
vision: "THE ACCEPTANCE CRITERION IS ONE SENTENCE. A fresh machine, plus a seed id, plus one command, produces a walking agent. No handover is read. No step is discovered from prose.\n\nWHY NOT A HANDOVER. Handovers are the owner's private input and stay out of version control — they may carry credentials, host detail and whatever the owner wants from that run. That is settled and correct. What must NOT live in one is procedure. The bootstrap recipe is not knowledge to be read; it is steps to be run, and every one of them is prose today only because no script exists.\n\nWHERE IT FAILS TODAY, six named points, each a step rather than a wish.\n\n- THE SERVER DIES WHEN BACKGROUNDED. se-mcp.ts still treats stdin EOF as a shutdown, and backgrounding is the only way to run unattended. The cloud run held stdin open with `sleep infinity`. The real fix is a daemon mode, or not quitting on EOF while serving HTTP.\n- THERE IS NO ENTRYPOINT. Version 1 shipped a runme.sh beside the PowerShell one; this version ships only PowerShell. It must verify Node, install, start the lane with the panel suppressed, WAIT for the health check rather than racing it, fetch the refspec, adopt the record, launch the caged walker with the cage on its command line, and exit non-zero with ONE clear sentence when a step fails. Every failure in the first run presented as \"the server is not there\", which is the least informative symptom available.\n- itAdopt IS NOT A LANE VERB. A peer machine cannot pick up a pushed record by itself; the operator ran it through `node -e` from outside the cage.\n- THE FETCH REFSPEC IS MANUAL. A fresh clone sees no iterations until somebody fetches refs/heads/it/*. The lane should own that rather than leaving it to a shell.\n- THE LANE HAS NO LIFECYCLE. A starting instance KILLS whatever holds its port and takes it, turning a careless restart into a cascade. It should refuse and say whose the port is. There is no health endpoint reporting whether a session is attached and when it last called, so the only safe restart is one nobody needs.\n- THE LAST GATE PARKS THE RUN. gate-release needs a person by design, and in an unattended run the person is not there, so a finished iteration waits at the final step. The dial already carries per-session authority; the same idea extends to naming gates the owner authorised for this run — host-local, never committed, recorded in the gate as authorised-in-advance rather than blessed on the agent's own judgment.\n\nTHE CLOUD IS A NEIGHBOUR, NOT A SETTING. It sits outside the system and the system talks to it, so it wants a neighbour node and an interface, and the run itself wants a story. That trace work is part of this iteration rather than a side effect of it.\n\nNO MORE FIELD REPORTS (owner ruling 2026-08-13). A cloud session ends with its own retro, and everything it learned is packed into backlog rows or technical-debt entries. Those travel; the session disappears. This iteration is the last consumer of a field report, and it should leave nothing that needs another one.\n\nWHAT IT IS NOT. Not the worktree binding, not the ride-along, not the walk-back cost. Those are i27, and i27 runs first."
inputs:
depends_on:
---

# i28-the-cloud-runs-from-its-seed-alone-a-fre

## Goal

The cloud runs from its seed alone: a fresh machine, a record id and one command produce a working walk, with nothing typed by a person and nothing read as prose.

## Rough vision

THE ACCEPTANCE CRITERION IS ONE SENTENCE. A fresh machine, plus a seed id, plus one command, produces a walking agent. No handover is read. No step is discovered from prose.

WHY NOT A HANDOVER. Handovers are the owner's private input and stay out of version control — they may carry credentials, host detail and whatever the owner wants from that run. That is settled and correct. What must NOT live in one is procedure. The bootstrap recipe is not knowledge to be read; it is steps to be run, and every one of them is prose today only because no script exists.

WHERE IT FAILS TODAY, six named points, each a step rather than a wish.

- THE SERVER DIES WHEN BACKGROUNDED. se-mcp.ts still treats stdin EOF as a shutdown, and backgrounding is the only way to run unattended. The cloud run held stdin open with `sleep infinity`. The real fix is a daemon mode, or not quitting on EOF while serving HTTP.
- THERE IS NO ENTRYPOINT. Version 1 shipped a runme.sh beside the PowerShell one; this version ships only PowerShell. It must verify Node, install, start the lane with the panel suppressed, WAIT for the health check rather than racing it, fetch the refspec, adopt the record, launch the caged walker with the cage on its command line, and exit non-zero with ONE clear sentence when a step fails. Every failure in the first run presented as "the server is not there", which is the least informative symptom available.
- itAdopt IS NOT A LANE VERB. A peer machine cannot pick up a pushed record by itself; the operator ran it through `node -e` from outside the cage.
- THE FETCH REFSPEC IS MANUAL. A fresh clone sees no iterations until somebody fetches refs/heads/it/*. The lane should own that rather than leaving it to a shell.
- THE LANE HAS NO LIFECYCLE. A starting instance KILLS whatever holds its port and takes it, turning a careless restart into a cascade. It should refuse and say whose the port is. There is no health endpoint reporting whether a session is attached and when it last called, so the only safe restart is one nobody needs.
- THE LAST GATE PARKS THE RUN. gate-release needs a person by design, and in an unattended run the person is not there, so a finished iteration waits at the final step. The dial already carries per-session authority; the same idea extends to naming gates the owner authorised for this run — host-local, never committed, recorded in the gate as authorised-in-advance rather than blessed on the agent's own judgment.

THE CLOUD IS A NEIGHBOUR, NOT A SETTING. It sits outside the system and the system talks to it, so it wants a neighbour node and an interface, and the run itself wants a story. That trace work is part of this iteration rather than a side effect of it.

NO MORE FIELD REPORTS (owner ruling 2026-08-13). A cloud session ends with its own retro, and everything it learned is packed into backlog rows or technical-debt entries. Those travel; the session disappears. This iteration is the last consumer of a field report, and it should leave nothing that needs another one.

WHAT IT IS NOT. Not the worktree binding, not the ride-along, not the walk-back cost. Those are i27, and i27 runs first.
