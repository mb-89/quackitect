---
id: se.raid-se-run-bypasses-the-lane
kind: raid
statement: "se_run IS A HOLE IN THE FENCE - and the problem is INVISIBILITY, not the workaround itself. se-fence blocks Bash/Grep/Read against the locked product, but se_run executes arbitrary node, so a script run through it edits product files with no CAS base_hash guard, no recorded diff, no per-file provenance, and no trace the ledger can see. Owner ruling 2026-07-25 sharpens this: working around the tooling is FINE when the tooling cannot do the job (see se.law-workaround-then-record-the-gap) - what is not fine is that the record then shows work which appears to have ridden the lane when it did not. Same class as the blacklist-guard failures: the fence enumerated the tools that must not touch the product instead of naming the one way it may be touched."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
raid_kind: issue
raid_owner: agent
trigger: "Open now; owner-reported, routed to i9. WHITELIST FIX per se.law-whitelist-guards: define the lane positively - the only writer to the product is se_file_*, and se_run's working tree is read+execute, not write. Detection is cheap even before enforcement: hash the product tree around an se_run call and refuse, or at minimum loudly record, an unrecorded mutation. Evidence of the failure mode: ctor-sweep.mjs rewrote six product sites during i8d with no ledger trace. Note note-e5472bad08a3."
---


