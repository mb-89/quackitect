---
form: the-workspace-is-taken-by-one-instance
by: agent
signed_off: 2026-08-24T16:29:12.171Z
authors: agent
files: null
---

# Evidence form / the-workspace-is-taken-by-one-instance

## current_situation

The workspace hold has no mechanism today, so two instances can serve one folder and neither says so.

The engine already relies on the opposite being true. Settling entries a previous instance left behind is called safe BECAUSE one instance holds the folder, and nothing checks it.

This chunk turns that assumption into something the operating system enforces.

## built

deliverable/engine/run.ts, three exports at the file's end.

- workspacePort derives a stable port from the folder's own path, so two instances pointed at one folder ask for one port and two on different folders never collide.
- takeWorkspace binds it. The bind IS the hold, and there is no second record of it anywhere.
- releaseWorkspace closes it for a shutdown this process chooses. A crash needs no counterpart, which is the point of the mechanism.

NOTHING IS WRITTEN TO DISK. A lock file outlives its writer, and on an unattended machine there is nobody to clear a stale one.

THE REFUSAL SAYS WHICH FOLDER AND WHICH PORT ARE HELD, in one line, with no stack trace. The condition is expected rather than exceptional.

IT DOES NOT WAIT AND RETRY. Waiting would mean two instances racing for one workspace every time the first restarts.

## follow_up

The other strand's chunks follow, and they lean on the registration rather than on this.

ONE THING IS OWED BEYOND THIS RECORD. The engine's own start path does not yet call takeWorkspace, so the mechanism exists and nothing uses it. Wiring it into the entrypoint is the natural next step and it is not in this record's scope, which was to make the hold possible and prove it releases.

## anything_else

THE RELEASE WAS MEASURED BEFORE THE CODE WAS WRITTEN, not assumed afterwards.

2026-08-24, linux, node v22.22.2: a child took a port and was killed with SIGKILL. Rebinding read EADDRINUSE while held, then ok immediately after the kill, and ok again after a pause.

THE IMMEDIATE CASE IS THE ONE THAT MATTERED. A hold that lingers briefly and one that never releases look identical in a single attempt, so the probe asked twice.

WINDOWS IS UNMEASURED, and the assumption node says so rather than implying the result travels.
