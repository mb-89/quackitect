---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a stale engine rebuilds
# where the token stands. The process owns these values.
status: closed
author: worker-hollis
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 92583af7ab334770b1fd05729b15efb3daa401cc
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 50a5993f51687c4d14b538eb098272f4f2a6e46d
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "RUNME built only when the command was missing, so once .bin held a binary every later run used it whatever src said, silently answering for code no longer there. RUNME now asks a second question before running the command: is it older than the newest write under the folders it is built from. If so it calls the installer first. The installer was already right, it rebuilds every entry in manifest.json builds on each run, so one rebuild covers every binary in .bin, not only the one about to run. The folders are data, in a new sources field in .se/runme.json, space separated so RUNME.sh can read it with the one line of sed it already has. Absent or empty, RUNME behaves exactly as before. sources is \"src/engine src/viewer src/mcp\" rather than \"src\". src carries src/extension/node_modules here, and walking it would make the one command that always works slow. The three named are manifest.json build sources and the walk measures 42ms. The failed-build half was missing rather than wrong. RUNME ran the installer then only asked whether the command exists. After a failed rebuild the stale binary was still there, and still ran with exit 0. Both scripts now go through build_it in sh and Build-It in PowerShell, which read the installer's exit code and refuse naming the build. Changed: RUNME.ps1, RUNME.sh, both script constants in src/engine/runme.go, Sources on Runme in src/engine/seed.go, src/engine/runmestale_test.go, .se/runme.json. Proof: two tests drive a whole fake vehicle, RUNME included, seen red then green, and TestAVerbThroughRunmeReachesDispatchOnAProject stayed green with them. On the real tree I checked detection only and stopped: sources parses, the walk finds src/engine/batteryshell_test.go at 20:23:51, .bin/se.exe was built 19:01:53, stale answers True. I did not let the real RUNME run the rebuild it now asks for. That is the installer's full three-minute pass, and it would rebuild the engine hosting this session while it serves it. The first person to run RUNME here gets that rebuild, which is the point. NOT FULLY MET: the third done-when, \"Covers se, se.exe, se-linux, logview\". se-linux is in no part of this tree, and nothing builds it. A se find for it hits only this token's own words and the note it came from. se, se.exe and logview are covered. se-linux cannot be, and the token records that rather than pretending. Also worth a reviewer knowing: the root RUNME.ps1 and RUNME.sh are seeded copies of the constants and seeding never overwrites, so they had already drifted. I edited all four by hand and .se/runme.json by hand for the same reason. At submission src/engine will not compile, from two other workers mid-edit in apply.go, applyverb.go, apply_test.go and posixshell_test.go, none of which I opened. The green above was taken after all six of my files were written and before that breakage."
# what it became. They have to exist.
successors:
  - "[[wk-437137c7a1]]"
---

## detail

A change to src/engine takes effect only through a rebuild of .bin/se, and RUNME builds only when the binary is missing. Make RUNME compare the binary against the newest write under src/engine, by modification time or a recorded source hash. When the binary is older, rebuild before executing. A failed rebuild refuses loudly rather than falling back to the stale binary. The same check covers every binary the tree builds: se, se.exe, se-linux, logview.

## done when

- Touch src/engine, run RUNME: rebuild before executing. Decided by se test proposing TestAStaleBinaryIsRebuiltBeforeItRuns.
- Broken build: loud refusal, not the stale binary. Decided by se test proposing TestABrokenRebuildRefusesRatherThanRunningTheStaleBinary.
- Covers se, se.exe, se-linux, logview. Decided by the builds list in util/setup/manifest.json, and se find --regex se-linux over the tree.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Six files: RUNME.ps1, RUNME.sh, runme.go, seed.go, runmestale_test.go, .se/runme.json. | whole |
| [x] | every done-when line is decidable, and names the command where one decides it | As minted none named a command. Each now names the one that decides it. Line 3 decides partly no: se-linux is in no part of this tree, so se, se.exe and logview are covered and it cannot be. Recorded, not hidden. | commands written on |
| [x] | the basics it stands on exist, or are minted first | The installer already rebuilds every manifest.json build each run. Only RUNME deciding to call it was missing. | none owed |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token.md read. Rule 12 red-first is below. | yes |
| [x] | one test was written first and seen red for the reason expected | Written first, seen red: "RUNME ran the stale binary instead of rebuilding it: out: v1". Source v2, RUNME v1, exit 0. | ok:false |
| [x] | the same test was seen green after the change, and named | Same two unedited: ok:true, with TestAVerbThroughRunmeReachesDispatchOnAProject. | ok:true |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Thought through, with one caveat a reviewer needs: this tree is shared, so began..ended also carries other workers' files. Mine is the six in step 1. | read those six |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | wk-437137c7a1, a planted CR that is not mine. | wk-437137c7a1 |

## evidence: restored after submitting

The two tables above were wiped by the submit and put back by hand, verbatim.
The engine read them off this file to decide the move and then wrote the pull's
own evidence map over them, which was empty, so the file came back with the
frontmatter current and every table gone. The words here are the engine's own
read of this file, echoed back when it was taken up again for the submit, and
not written a second time from memory. The defect is one line in
src/engine/pull.go and worker-jory has fixed it in source, but the resident
binary is stale, so the wipe was live when this token closed.

