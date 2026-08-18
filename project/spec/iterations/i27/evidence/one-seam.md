---
form: one-seam
by: agent
signed_off: 2026-08-14T13:55:35.016Z
authors: agent
files: null
---

# Evidence form / one-seam

## current_situation

THE SEAM IS ACHIEVABLE AND THE SHELL IS INSIDE IT FOR FREE. The probe holds.

A child shell's working directory came back as the record's worktree with nobody setting it. So rooting costs no rule for the common case.

THE PLATFORM REFUSES NOTHING. A path climbing four levels out resolved cleanly to a folder outside the project. Rooting alone is not enough, and the seam's refuse act is required rather than optional.

THE RISK IS NOT A WORRY, IT IS HAPPENING. One path string, `.se/HANDOVER.md`, reads at 148 lines through the file lane and answers PathNotFound in the shell. The file lane is at the machine root and the shell is in the worktree, and nothing on either answer says which.

THE BYPASS SURFACE IS COUNTED: 40 resolver call sites against 88 paths built with a direct join. The dispatch layer is nearly clean already at 7 against 1. The leaks are modules that read the filesystem for themselves.

## built

- exp-one-seam

## follow_up

raid-risk-a-write-lands-in-the-wrong-tree-silently MOVES FROM PREDICTED TO OBSERVED. It reads as a risk and this run makes it an issue: it has happened, twice in one session, with the paths recorded. The kind change belongs at fold-back rather than here.

THE WORK THE BUILD INHERITS IS BOUNDED AND NAMED.

- Route the modules that read the filesystem for themselves through the resolver. lint.ts is the worked example: it imports readFileSync and join from node and calls no resolver.
- Write no rule for the shell. A child inherits the working directory, proved here.
- Keep the refuse act. The platform serves an escaping path without complaint, so nothing below the seam will catch it.

WHAT IS STILL UNTESTED. No satellite exists, so nothing here exercises a seam running in two processes at once. That half rides with the build and cannot be spiked before there is something to run it in.

## anything_else

ONE REFUSAL DURING THE RUN WAS RIGHT AND WORTH RECORDING. SE-C-129 stopped a shell command doing a lane tool's job, because the command used Test-Path and stat is se_file_list's. The probe was reshaped to pure path resolution, which needs no filesystem at all, and it ran.

A SECOND RUN WENT THROUGH ON no_tool_reason, and the reason is the probe itself: the question was which TREE the shell sees, and every lane verb answers from the lane's own root. No lane verb can show me the shell's. Comparing the two copies WAS the measurement.

THE LANE WARNED RATHER THAN REFUSED, which is the right shape. The warning is logged for the retro and the reason travels with it.
