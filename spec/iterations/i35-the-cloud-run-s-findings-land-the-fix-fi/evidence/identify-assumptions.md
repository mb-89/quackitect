---
form: identify-assumptions
by: agent
signed_off: 2026-08-17T11:48:01.660Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

The five requirements are swept for what they take as true without establishing it.

Two new assumptions come out of the sweep. Three more were already opened at the kickoff gate and at log-risks, so the register now carries five for this iteration.

## assumptions

- raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from
- raid-asm-the-arrival-runs-before-the-agent-reads-anything
- raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server
- raid-asm-the-declared-node-floor-matches-what-the-engine-needs

## sweep

- environment: TWO FOUND. The arrival assumes the box can reach the git remote its clone came from — opened as raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from. It also assumes a writable .se/ for the client and the call log, which preflight already checks and refuses on, so that one is verified rather than assumed.
- toolchain: ONE FOUND, and it is already open and already measured false at the edge. raid-asm-the-declared-node-floor-matches-what-the-engine-needs: the engine runs its full battery on node 22.22 while declaring >=24.0.0. The arrival also assumes git and npm answer, which preflight checks for git and the install step reports for npm.
- host: TWO FOUND, and they are the sharpest here. raid-asm-the-arrival-runs-before-the-agent-reads-anything — nothing establishes that a host waits for its SessionStart hooks before the first turn. And raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server, which the whole design rests on and which this box can only observe about itself.
- platform: NONE, and the reason is that the platform assumption was tested and held. se-arrive uses npm.cmd on win32 and npm elsewhere, spawns detached, and probes a port rather than a process. The POSIX branch is the one exp-the-posix-branches-have-never-run names as unexercised — and this run exercised it end to end, which retires the question rather than opening one.
- neighbours: NONE. The arrival depends on no service beyond the git remote, which is covered under environment. It deliberately reaches nothing else: no package registry beyond npm's own, no telemetry, no lock service. The claim system that would have needed one was retired by i34.
- people: NONE, and this is the honest none rather than the empty one. The arrival is designed for the case where there are no people, so it assumes nothing about them. The dial is the one place a person is required, and that is a stated non-goal of this iteration rather than an assumption — it is written into the story's last slide as unmet.

## follow_up

- Probe raid-asm-the-arrival-runs-before-the-agent-reads-anything by having the arrival write a marker the first pull can read. That converts an assumption into a check.
- Probe raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from on a runner with a narrower egress allowlist than its cloner.
- The MCP-attach assumption needs a second harness and cannot be probed from here.

## anything_else

THE PLATFORM SWEEP TURNED UP A RETIREMENT RATHER THAN AN ASSUMPTION, and it is worth naming because it answers a standing one.

exp-the-posix-branches-have-never-run records that every machine that ever ran this engine was Windows, so the POSIX path was written and unexercised. This run exercised it: the lane spawned detached and kept running, the mirror answered, the battery ran twice, and the shoot path was fixed for a Linux container specifically.

SO A STANDING UNKNOWN IS NOW MEASURED, and the thing it was worried about — whether a POSIX host reaps the lane — did not happen here. That belongs to whoever owns that experiment node, and it is carried as a note rather than edited into their record from inside this one.
