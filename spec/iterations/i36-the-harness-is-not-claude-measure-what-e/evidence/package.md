---
form: package
by: agent
signed_off: 2026-08-19T19:04:39.074Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

The version is 4.6.0 and the archive assembles by script. Building it found a defect that only building it could find, exactly as this state exists to do.

THE ARCHIVE IS 592 FILES AND 8.2 MB. Before the fix it was 30227 files and 238.9 MB.

WHAT WENT WRONG FIRST, and it was not the script. Four foreground runs through `se_run` were cancelled. A cancel kills the CALL and not the command, so each one orphaned a node process holding a write handle on the output zip, and every retry then died with EPERM until the orphan was found by process id. `engine/run.ts` predicts this in its own comment and offers background jobs; the rule is written where only an implementer reads it.

THEN THE REAL DEFECT. The staged tree was 238.9 MB, and 230.7 MB of it was `.worktrees` — 29635 files, every past iteration's git worktree. i34 introduced that directory and nothing excluded it, so this is the first package since it grew.

## package

- dist/quackitect-4.6.0.zip

## works

yes — and the check is narrower than i35's, which is said here rather than glossed.

WHAT WAS DONE. The archive was expanded into a fresh temporary directory and inspected. Six load-bearing paths are present: `README.md`, `RUNME.ps1`, `.claude/settings.json`, `project/deliverable/engine/bin/se-mcp.ts`, `project/deliverable/package.json` and `project/AGENTS.md`. The packaged `package.json` reports version 4.6.0. `.worktrees` is absent. `project/spec` holds 0 entries. The whole archive is 592 files and 8.2 MB.

THE `.claude/settings.json` CHECK IS NOT INCIDENTAL. i35 shipped an archive carrying both arrival scripts and not the file that fires them, so that path is checked by name every time now.

WHAT WAS NOT DONE, plainly. `se-arrive.ts` was not run against the unpacked copy, and no lane was brought up inside it. So this answers that a receiver gets the right files, not that the arrival still fires. The behavioural check is owed and is written into follow_up.

## emit_back

- engine/bin/package.ts: exclude-by-name lists rot silently. i35 shipped a feature with its wire cut by one; i36 nearly shipped every past iteration's worktree past another. A name list needs a size assertion beside it, not more names.
- engine/run.ts: the background-job rule lives in a code comment. It belongs in se_run's tool description and in guidance/method/lane.md, and the engine already knows a call's duration well enough to refuse or auto-background a slow foreground run.
- se_run cancellation: a cancelled call leaves its child alive and holding its output file. The lane should kill the child it started.
- The package step has no lane verb, which is why `package` is the only state granting se_run and se_git. Node has zlib but no ZIP container, so a verb means a small ZIP writer over deflateRaw or a dependency.
- The zip step shells out per platform: PowerShell on Windows, the `zip` binary on POSIX. Neither ships everywhere, and `zip` is absent from many CI images.
- Compress-Archive -CompressionLevel Optimal ran past three minutes without finishing and was replaced with the .NET one-pass call. Anything that walks files one at a time will do this again.
- The staging copy is never cleaned up on failure. Two 239 MB folders were left in the temp directory by killed runs.

## follow_up

THE RECORDS-STAY-HOME RULE NEEDS A CHECK, NOT A LIST. `project/spec` is excluded so a receiver never gets this project's records, and until today every worktree carried its own copy straight past that rule. The archive now reports 0 entries under `project/spec`, and that assertion is what should run, not another name in a set.

THE FULL ARRIVAL BOOT IS OWED. i35 unpacked its archive and drove `se-arrive.ts` end to end through a real pull. This run checked the archive's contents rather than its behaviour, and that is a weaker check. It is named in `works` rather than hidden, and it should run before this version is given to anyone.

THE SEVEN emit_back LINES belong to the shared method, not to this iteration. They land or are explicitly dropped at the next record's onboard-retro.

## anything_else

