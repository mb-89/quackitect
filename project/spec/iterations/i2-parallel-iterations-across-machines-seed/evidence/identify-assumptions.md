---
form: identify-assumptions
by: agent
signed_off: 2026-08-11T16:56:52.041Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

The thirteen new rows were swept source by source. Two fresh assumptions surfaced and stand as nodes with probes; the third thing the rows lean on was already registered at the kickoff.

## assumptions

- raid-asm-remote-serializes-claims
- raid-asm-peer-runs-supported-platform
- raid-asm-owner-pushes-keep-remote-fresh

## sweep

- environment: none new - the register already carries the remote-serialization assumption from the kickoff, and no new claim row leans on scale, load or data shape beyond it
- toolchain: none - git is a standing HARD dependency with no version-specific claim among the new rows; the ops used (push, fetch, branch) predate every supported git
- host: none - the claim mechanics run in the engine, not the harness; no new row leans on harness behavior
- platform: raid-asm-peer-runs-supported-platform - the installer and packager are Windows-shaped today, and the second machine's OS is unestablished and uncontrolled
- neighbours: raid-asm-remote-serializes-claims stands for the remote's push serialization (registered at the kickoff, probe scheduled in the build); the credential need is already a DEPENDENCY, not an assumption (raid-dep-claim-push-credentials)
- people: raid-asm-owner-pushes-keep-remote-fresh - dependency gating reads shipped state from the remote, and work pushes stay the owner's own cadence

## follow_up

probe-assumptions probes every standing assumption next - the platform one is a single question to the owner, the other two have runnable probes scheduled in the build.

## anything_else

