---
form: find_by_probing
by: agent
signed_off: 2026-08-14T07:48:21.574Z
reopened: "2026-08-14T07:47:07.136Z — The finder that BUILDS ran three read-only diagnostics and built nothing, then concluded nothing can be measured at M4 — which made an evidence asymmetry look unavoidable…"
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

FOUR PROBES NOW, and the fourth is the one this finder existed for.

THE FIRST THREE WERE DIAGNOSTICS, NOT BUILDS. They measured what the running system already does: the lane's root moves on binding, the lane and the shell agree, and the worktree is not thin. All three findings hold and all three are read-only.

THE ERROR THAT FOLLOWED. This state concluded that nothing can be measured at M4 because nothing is built at M4. That is wrong, and meth-spike-tracer says so in its own words: M4 find_by_probing BUILDS to discover, every other finder reasons about options and this one runs them.

That wrong conclusion is what made an evidence asymmetry look unavoidable. One candidate carried a measurement, three did not, and the axis was scored on which one had a number rather than on what the number said.

THE FOURTH PROBE FIXES IT, and the rest of the evidence turned out to already exist. exp-trunk-read-cost of 2026-08-10 measured every read shape on this chart, not one - and it was read for a single figure.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| While i27 is bound, does the shell resolve a relative path against the repository root or against the record's worktree? | one command | Nothing. The probe ran the real se_run against the real session with the real record bound. | THE WORKTREE. (Get-Location).Path answered C:\...\.worktrees\i27-the-lane-binds-to-the-record-a-bound-wal. |
| Does the LANE resolve the same relative path the same way the shell does, or do the two diverge? | two calls | Nothing stubbed, but the comparison is against a listing taken earlier in the same session rather than a controlled run at both roots. | THEY AGREE. se_file_list on "." returned .worktrees, dist and project at the desk and project alone inside the record. Both point at the worktree while bound. |
| Is the bound worktree thin, holding only the record's own folder, as raid-dec-thin-tree decided? | one call | Nothing. Direct listing of the tree in use. | NO. project/ in the worktree holds deliverable, guidance and spec. The decided thin tree is not the shape on disk. |
| What does starting one engine process cost, and do twenty-seven of them fit inside the one-second rule? | one command, five runs | THE ENGINE LOAD. This times a BARE node process (node -e "0") and not the engine's own module graph, so every figure below is a FLOOR and the real cost is higher by an unmeasured amount. | 67 ms cold, then 36.2, 36.3, 34.2 and 36.9 ms warm. One bind costs about 36 ms, which is inside the one-second rule. TWENTY-SEVEN CONCURRENT COSTS ABOUT 970 ms OF STARTUP FLOOR ALONE, at the limit before the engine is loaded at all. |

## options

- project/spec/trace/option/opt-keep-one-root-and-address-the-record-inside-it.md

## dead_ends

- Reading .worktrees/i27-.../evidence/derive-criteria.md to find which tree held the evidence. It answered exists:false and that was read as proof the file was at trunk. KILLED: the path was itself resolved against the moved root. The instrument was subject to the confusion it was measuring.
- Probing raid-asm-engine-serves-from-the-bound-tree. KILLED before running: its own probe field says it cannot be probed from this repository, because it needs a product that does not edit the engine and Quackitect is the only product here.
- Using se_git to see which tree held the evidence files. KILLED by SE-C-110: se_git is not legal in this state, and se_file_list answered the same question legally.
- Measuring the engine's own load cost rather than a bare node start. NOT KILLED, NOT RUN: the entry point starts a server and the timebox did not cover doing that safely. It is the single most useful number still missing for cand-os-rooted, and it is named rather than guessed.

## follow_up

THE ONE-SECOND AXIS NOW HAS EVIDENCE FOR ALL FOUR CANDIDATES, and it did not need a new experiment for three of them.

exp-trunk-read-cost, 2026-08-10, measured three read shapes on the real repository over twenty real method files: spawn-per-read 47 to 54 ms, the long-lived batch reader 2.04 ms, plain disk 0.46 ms.

- cand-speaking-root, cand-fixed-root and cand-os-rooted read shared content from a worktree on disk: 0.46 ms per file.
- cand-judged-path reads it from trunk through the batch reader: 2.04 ms per file, which is 4.4 times slower.

THE EARLIER SCORING HAD THIS EXACTLY BACKWARDS. cand-judged-path scored 3 and the others 1 or 2, because it had a number. The number says it is the slowest of the four on every shared read.

IT STILL MEETS THE REQUIREMENT. The experiment's own verdict is that 2 ms sits well inside the walk's patience. So the honest reading is that three candidates tie on this axis and the fourth pays a process start.

WHICH MEANS THE AXIS STOPS DECIDING between the three engine-side shapes, and that is a correction to the seat rather than to the paperwork.

## anything_else

WHAT THIS STATE GOT WRONG THE FIRST TIME, recorded because the correction is the finding.

It read "probe" as "diagnose" and ran three read-only checks. meth-spike-tracer's whole argument is the opposite: a spike used to cost days so it was rationed to the riskiest unknown and never spent on whether something is an option at all, and now the cheapest runnable version is an hour, so BUILDING THE THING is how you find out whether it belongs on the chart.

The fourth probe took one command and one minute, and it produced the only number anybody has for cand-os-rooted.

THE OWNER RAISED A LARGER QUESTION that this state cannot answer: whether an M4 probe should be promotable the way an M6 spike is, and whether deep prototypes belong before the winner is declared rather than after. Recorded as note-632985fe279c for the retro.
