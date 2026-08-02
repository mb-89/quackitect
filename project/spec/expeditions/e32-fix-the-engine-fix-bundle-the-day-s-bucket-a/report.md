---
form: expedition-leave
status: done
files:
---

# e32-fix-the-engine-fix-bundle-the-day-s-bucket-a — expedition-leave

## What was the goal

The engine-fix bundle — the day's bucket after the retro of 2026-08-02, seeded on the owner's word. Five jobs of small, live-found defects: the encoding seams first (owner priority), the update lane applying its own split, the test pain, the small lane fixes, and the VS Code shell items folded in at the retro. The iterations kickoff was ruled out of scope, for tomorrow's fresh session.

## What was done

JOB 1 — ENCODING (commit 7c953e6). The range verb counts lines the way the reader numbers them, so one stray CRLF can no longer collapse a file to two lines. A byte-order mark is preserved, ignored for matching on both sides, and never buried by a prepend. Both correct-and-announce, per the owner's direction.

JOB 2 — THE UPDATE LANE (commit da9a0ec). A chained narration brief is applied as the plan it wanted to be, with the correction named on the result. A resolution's chain still refuses, because which part resolved the node is not the engine's to guess. walking.md now says exactly this.

JOB 3 — TEST PAIN (commit 6aa47d9). Test children run in the one job registry, whole-tree killed on timeout. jobStopAll — built earlier and wired to NOTHING — now fires on every engine exit path, which was the root cause of the four-hour worker leak. The selftest cap kills its whole tree too. se_test hands back a job handle past a 45-second budget, and the verdict is recorded and served by se_test {job} whatever the client's timeout did.

JOB 4 — SMALL LANE FIXES (commit 10f7ab1). The land gate stops counting untracked files. A resolution reaches a node an earlier session's visit left open, so a multi-session record can close without hand-repair. The survey windows its backlog. The mirror answers an unknown POST with 404. The suite-listing catch swallows only a missing directory. The web-fetch overflow turned out already fixed — its note outlived its fix.

JOB 5 — THE SHELL. Investigated, not built: the junction premise is refuted by VS Code reading package.json before activation (the copy is load-bearing until the brand splits), and the extension already has its onStartupFinished activation event. The remaining rewires need the owner at the screen.

## What settled it

THE FULL BATTERY, EARNED. Changes to se-mcp.ts and run.ts map to no test file. Preflight green; 724 tests, 724 pass, 0 fail — seven new regressions among them. The run itself demonstrated the defect it was fixing: the MCP call timed out, the server-side run carried on, and the counts were fetched from the call log — the last battery that will have to be read that way.

SCOPED RUNS along the way: 85/85 after job 1, 21/21 after job 2, 62/62 after job 3, 92/92 after job 4.

SEVEN NEW REGRESSION CASES pin the fixes: mixed-endings range, three BOM cases, the chained-brief conversion, the chained-item split, the cross-visit resolution, and two untracked-land cases.

THE PROMPT LAYER was regenerated after the walking.md edit, and preflight went green on it.

## What was not done

THE SHELL REWIRES — the launcher's fake-Enter path, the hard-coded second control bar, the brand split that unlocks hot-swap. Each needs a window reload and the owner's eyes to verify, and building them blind risks the one surface the owner drives everything through. The corrected junction premise is note-cb05c419a62e; the shell notes stay parked on "ready when the VS Code shell work resumes".

THE BOOTED TEMPLATE for the suite's per-case boot walk stays parked — its own note says later.

THE ENGINE-TO-TEST MAP stays parked — its own trigger defers to the next retro's measurement of how often the battery was granted for unmapped changes.

THE RETRO'S GUIDANCE EDIT (engineering.md) sits uncommitted on trunk: the bound git lane cannot reach trunk and the harness classifier blocked the shell path. The close commits trunk strays, so closing this record carries it in.

THE RUNNING ENGINE still executes the old code — a reload after the close puts today's fixes live.

## Files


