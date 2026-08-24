---
minted_in: i62-background-work-reports-its-own-end-the-
id: uc-hold-a-folder-against-a-second-engine
type: "[[use-case]]"
statement: Start the system on a folder, and have it refuse and say so when another instance already holds that folder.
actor: stk-engineer-driving-agents
trigger: the system is started against a folder
precondition: none
guarantee: at most one instance serves a folder and its port at a time, a second instance says which folder is taken and stops, and a start after a crash is never refused
refines:
  - sty-the-second-engine-that-refuses-to-start
priority: should
---

## Main scenario

1. The system is started against a folder.
2. The system attempts to take the folder's network port.
3. The port is free, so the system takes it and serves the folder.
4. The system reports which folder and which port it holds.

## Extensions

- 2a. The port is taken by another instance of this system. The system says which folder and which port are held, stops, and exits non-zero.
- 2b. The port is taken by something that is not this system. The system says the port is unavailable and stops, because it cannot tell whether the holder is serving this folder.
- 2c. The previous instance crashed. The port was released with it, so the take succeeds and the start is not refused. Nothing written to disk is consulted, because a written record can outlive what it describes.
- 3a. Work from the previous instance is still recorded as running. The system settles those entries as it starts, which is safe precisely because only one instance holds the folder.
- 4a. Nobody is present to read the report. It goes to the log, which is the only witness an unattended run has.

## What is deliberately outside it

Coordinating two instances so they can share a folder. That is a different
product, and nothing here moves toward it.

Detecting an instance on another machine that has the same folder checked out.
One agent works one clone, and that is an assumption in the register rather
than a mechanism.
