---
form: identify-assumptions
by: agent
signed_off: 2026-08-24T15:32:33.179Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

The new guidance contract depends on the harness providing the current session mode. No other unestablished external condition was found in the four workflow requirements.

## assumptions

- raid-the-harness-reports-the-session-mode-correctly

## sweep

- environment: none; the requirements operate on the current session rather than an external workload.
- toolchain: none; no installed-tool version is assumed by the contracts.
- host: recorded raid-the-harness-reports-the-session-mode-correctly.
- platform: none; these contracts are platform-independent engine behavior.
- neighbours: none; no external service provides the guidance, form, or routing result.
- people: none; the requirements constrain engine responses rather than operator behavior.

## follow_up

Probe the host-mode assumption with attended and unattended fixtures while implementing guidance selection. Implement the four traced requirements and add matching test specifications.

## anything_else

