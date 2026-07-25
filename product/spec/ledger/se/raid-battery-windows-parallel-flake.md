---
id: se.raid-battery-windows-parallel-flake
kind: raid
statement: "The full test battery flaked on Windows under parallel execution: temp-dir rmSync EPERM'd because a detached verification process briefly held the dir, and cross-file worktree/git/background-process tests raced. Mitigated this iteration (best-effort try/catch temp cleanup + serial --test-concurrency=1), but the deeper root - the loop's background verification process is not cleanly terminable so its temp dir lingers - remains."
provenance:
  iteration: i8c-phone-connect
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: agent
trigger: the loop's background verification process becomes cleanly awaitable/terminable so temp dirs release deterministically; close when the battery is reliably green in parallel without the serial workaround.
---


