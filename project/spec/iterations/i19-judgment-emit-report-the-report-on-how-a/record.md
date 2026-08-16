---
id: i19-judgment-emit-report-the-report-on-how-a
status: seeded
opened: 2026-08-12T19:45:02.763Z
goal: "JUDGMENT — emit.report: the report on how an iteration went. The owner has ideas and wants to talk before anything is designed."
vision: "NEEDS THE OWNER. Do not design this alone. The owner said plainly that he has ideas about it and wants a discussion first. The kickoff conversation IS the work of this iteration's front half.\n\nWHAT IT IS, as far as it is settled: emit.report emits the report on how an ITERATION went. It is one of three emitters v2 designed — report, book and release. Release already exists here as engine/bin/package.ts. The book is its own iteration and is much larger.\n\nWHAT TO BRING TO THE DISCUSSION, not to decide before it.\n\nThe rigor matrix has 52 rows and M9 runs package, gate-release, shipped. There is NO docs-emission row. Whatever this becomes probably wants one.\n\nv1's three rendering laws are the strongest prior art and they bind any report we build. DERIVED OVER AUTHORED: where a section can be computed from the items it renders as a query, and a derivable section written by hand is a DEFECT. NO GREEN OCEAN: failing and missing items render prominently and easily reachable, while passing masses collapse into counts. ONE SCREEN BY DEFAULT: every derived view fits one screen, with full detail one interaction away.\n\nv1 also rejected agent-drafted section prose outright, because it drifts and duplicates. Worth putting on the table early: how much of a report should the agent WRITE versus COMPUTE.\n\nThe call log already answers a great deal mechanically. It records every call with its verdict, its duration and its outcome, and se_log_query groups by tool and filters since the last retro. A report that computes from it costs nothing to keep true.\n\nFULL CONTEXT: project/spec/version-planning.md, section J1.\n\nFROM THE POOL, 2026-08-13. Three more, all design input for the discussion the owner wants first.\n\nA RETRO SHOULD RENDER WHERE THE TIME WENT (owner, note-2cadf2297e3b), so hotspots get fixed rather than guessed at. THE DATA ALREADY EXISTS and nothing renders it: every call carries its duration and the log can be mined by a minimum, the agent voids are already a named retro step, and every test run appends timings with the last run ranked by summed cost. THREE THINGS ARE MISSING and none is measurement - a breakdown BY PHASE rather than by call, a RENDER, and a comparison across retros so a step getting slower for a fortnight is visible. BY-PHASE IS THE HARD HALF: the grouping key already rides every record as the visit, but summing durations gives machine time only, while the agent's own time is the void between calls and is usually the bigger number. Both belong side by side, because a state where the machine is instant and the agent spends twenty minutes is a guidance problem, never a performance one.\n\nTHE LOG CANNOT TELL A START FROM A POLL (note-1efe327ed3e6), so anything built on it inherits the error. The cloud run measured a test verb 97 times and read it as 97 test runs; it was 16 runs and 81 polls, 56 of those on one dead job. The same error was made from the other side: an update count of 309 was reported as 309 calls and called our most expensive habit, when it is not a verb at all but a line synthesized from whatever call carried the update, at zero duration. TWO DIFFERENT THINGS SHARE A NAME in the grouping: a verb that STARTS work and the same verb POLLING it, and a real round trip against a synthesized line that cost nothing. THE ENGINE KNOWS WHICH IS WHICH AT WRITE TIME, since the synthesized line already carries its carrier and a poll carries a job ref. A raw call count is not a measurement.\n\nEVERY MILESTONE PRODUCES A ONE-PAGER (owner, note-38c4557e996d). It shows in the iteration like a slide to decide on, carrying everything needed to understand the milestone on one page. When the iteration closes, the milestone one-pagers become its SLIDESHOW, and the iteration gets its own one-pager on top - documentation produced while walking rather than after. One piece does not exist today and must be derived rather than typed: the architecture gate's slide carries an architecture diagram, per the rule that diagrams derive."
inputs:
  - "project/spec/version-planning.md"
  - "spec/man-guidance.md at ref main"
---

# i19-judgment-emit-report-the-report-on-how-a

## Goal

JUDGMENT — emit.report: the report on how an iteration went. The owner has ideas and wants to talk before anything is designed.

## Rough vision

NEEDS THE OWNER. Do not design this alone. The owner said plainly that he has ideas about it and wants a discussion first. The kickoff conversation IS the work of this iteration's front half.

WHAT IT IS, as far as it is settled: emit.report emits the report on how an ITERATION went. It is one of three emitters v2 designed — report, book and release. Release already exists here as engine/bin/package.ts. The book is its own iteration and is much larger.

WHAT TO BRING TO THE DISCUSSION, not to decide before it.

The rigor matrix has 52 rows and M9 runs package, gate-release, shipped. There is NO docs-emission row. Whatever this becomes probably wants one.

v1's three rendering laws are the strongest prior art and they bind any report we build. DERIVED OVER AUTHORED: where a section can be computed from the items it renders as a query, and a derivable section written by hand is a DEFECT. NO GREEN OCEAN: failing and missing items render prominently and easily reachable, while passing masses collapse into counts. ONE SCREEN BY DEFAULT: every derived view fits one screen, with full detail one interaction away.

v1 also rejected agent-drafted section prose outright, because it drifts and duplicates. Worth putting on the table early: how much of a report should the agent WRITE versus COMPUTE.

The call log already answers a great deal mechanically. It records every call with its verdict, its duration and its outcome, and se_log_query groups by tool and filters since the last retro. A report that computes from it costs nothing to keep true.

FULL CONTEXT: project/spec/version-planning.md, section J1.

FROM THE POOL, 2026-08-13. Three more, all design input for the discussion the owner wants first.

A RETRO SHOULD RENDER WHERE THE TIME WENT (owner, note-2cadf2297e3b), so hotspots get fixed rather than guessed at. THE DATA ALREADY EXISTS and nothing renders it: every call carries its duration and the log can be mined by a minimum, the agent voids are already a named retro step, and every test run appends timings with the last run ranked by summed cost. THREE THINGS ARE MISSING and none is measurement - a breakdown BY PHASE rather than by call, a RENDER, and a comparison across retros so a step getting slower for a fortnight is visible. BY-PHASE IS THE HARD HALF: the grouping key already rides every record as the visit, but summing durations gives machine time only, while the agent's own time is the void between calls and is usually the bigger number. Both belong side by side, because a state where the machine is instant and the agent spends twenty minutes is a guidance problem, never a performance one.

THE LOG CANNOT TELL A START FROM A POLL (note-1efe327ed3e6), so anything built on it inherits the error. The cloud run measured a test verb 97 times and read it as 97 test runs; it was 16 runs and 81 polls, 56 of those on one dead job. The same error was made from the other side: an update count of 309 was reported as 309 calls and called our most expensive habit, when it is not a verb at all but a line synthesized from whatever call carried the update, at zero duration. TWO DIFFERENT THINGS SHARE A NAME in the grouping: a verb that STARTS work and the same verb POLLING it, and a real round trip against a synthesized line that cost nothing. THE ENGINE KNOWS WHICH IS WHICH AT WRITE TIME, since the synthesized line already carries its carrier and a poll carries a job ref. A raw call count is not a measurement.

EVERY MILESTONE PRODUCES A ONE-PAGER (owner, note-38c4557e996d). It shows in the iteration like a slide to decide on, carrying everything needed to understand the milestone on one page. When the iteration closes, the milestone one-pagers become its SLIDESHOW, and the iteration gets its own one-pager on top - documentation produced while walking rather than after. One piece does not exist today and must be derived rather than typed: the architecture gate's slide carries an architecture diagram, per the rule that diagrams derive.

## Inputs

- project/spec/version-planning.md
- spec/man-guidance.md at ref main
