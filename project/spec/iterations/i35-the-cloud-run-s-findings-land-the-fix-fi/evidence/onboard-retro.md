---
form: onboard-retro
by: agent
signed_off: 2026-08-17T10:55:09.304Z
authors: agent
files: null
---

# Evidence form / onboard-retro

## current_situation

26 iterations stand open, no expeditions, and the notes inbox and parked backlog are both at zero. This clone is a fresh cloud checkout on branch claude/iteration-35-field-report-ixm3sb, seeded with i35 and nothing walked on it yet. The battery stands at 1391 tests, 1386 green, 5 red, 71s wall clock.

## field_feedback

The inbox is empty, so this row is the skip case its own guidance describes — and the machine still demanded the form. That contradiction is the first field finding of this run.

Five reds measured on this box before any change: 3 in shoot.test.ts (no Chromium in the BROWSERS list), 1 in emergency.test.ts, 1 in nesting.test.ts. The 3 shoot reds are i35 finding 4, reproduced exactly as the field report predicted.

The short-name split is reproduced live. Aiming at iterations/i35-the-cloud-run-s-findings-land-the-fix-fi is refused SE-C-110 with no drawn path and a remedy that leads nowhere; iterations/i35 walks. The pull answer then carries the LONG id back in its expedition field, so the surface that refuses the long name is the same surface that hands it to you.

The runtime pin is over-tight. package.json declares node >=24.0.0 and the recorded reason is that unflagged TypeScript execution is not what 22.6 buys. That reason expired: 22.18 shipped type stripping unflagged, and this box runs 22.22, which executes .ts directly. The pin should read >=22.18.0.

## notes_drained

- inbox: nothing to drain — se_survey reports notes 0 and backlog 0, so this retro has nothing to judge and produces no report.

## call_log_mined

- The call log for this record starts at this session; there is no prior trail on this clone to mine.
- The boot read loop cost 6 pulls and 2 wrong probe answers, both from a quoted anchor whose continuation crossed a line break.
- One aim was refused SE-C-110 for the long record id, which is the cost finding 6 predicts and it landed on the first try.

## waste_leads

- The read-probe answers are line-break sensitive: an anchor whose 4 words cross a newline reads as a different string, and the only feedback is that did not answer every probe with no indication which one.
- onboard-retro demands a 5-field form in the case its own guidance says to skip.

## promotions

- Nothing to promote: the previous record left no emit_back list on this clone.

## process_stale

The retro method and the retro row disagree about the empty-inbox case. The row says AN EMPTY INBOX SKIPS THIS ROW and pull onward; the engine answers fill and holds the walk until 5 required fields are written. One of the two has to move, and the row is the one claiming the behaviour.

## follow_up

- Fix the 3 shoot reds (i35 finding 4) so an unattended POSIX box is 2 red, not 5.
- Fix the preflight YAML blind spot (finding 5).
- Reproduce and fix the fix-findings wedge (finding 1).
- Take the runtime pin down to >=22.18.0, the floor the recorded reason actually supports.

## anything_else

