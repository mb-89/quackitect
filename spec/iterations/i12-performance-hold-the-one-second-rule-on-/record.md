---
id: i12
status: shipped
closed: 2026-08-15T13:18:13.392Z
started: 2026-08-15T09:56:26.198Z
opened: 2026-08-12T19:41:19.492Z
goal: "Performance: hold the one-second rule on the surfaces that break it, and paginate the pull instead of overflowing it."
vision: |-
  ENABLER 4 OF 4 (owner, 2026-08-13). It halves the battery's wall clock, which every later iteration pays on every run.

  DONE LOOKS LIKE: opening the state machine answers inside a second, opening an evidence form from a note does too, a pull never hands back a payload a host has to move to disk, and the survey's window governs every list it prints.

  MEASURE FIRST, FIX SECOND. Nobody has profiled the machine page. A retro noted that the container-green derivation added recordDone calls per paint, so that is the first suspect to measure rather than the first thing to change.

  THE NAMED ITEMS. Opening the state machine takes more than a second against the standing rule. Opening an evidence form from a note breaks it too, and preloading is sanctioned. The comparison walk closes transitively at O(n cubed) on every single call. se_survey with detail full measured 244KB and the backlog list ignored its window. A pull once returned seven thousand lines, and pulls have been persisted to disk at 240KB.

  THE RULING THAT BINDS THE PULL: it never overflows, it PAGINATES.

  THE SURFACE HALF: any operation past one second goes non-blocking with a toast, and a progress bar where one is possible. The engine half of that rule already exists as req-call-answers-in-one-second; this is its other side.

  IF THE BATTERY IS TOUCHED, take v1's shape. Progress, batch and concurrency all live INSIDE the guarded write path: a bounded worker pool whose results flow through the SAME verdict-write guard, so there is ONE serialization point and no second write path. Concurrency caps at spare cores and only order-independent tests qualify. v1 chose that over thinning the test set.

  ONE MEASUREMENT WE ALREADY HAVE: refs.test.ts cost 99 seconds of a 508-second battery. Splitting one file by theme is the only unit that reaches a second core.

  FULL CONTEXT: project/spec/version-planning.md, section i12.

  FROM THE POOL, 2026-08-13. The measured half, and it decides the order of work.

  THE BATTERY'S WALL CLOCK IS ONE FILE'S CAPTIVE (note-ebdbe91f7640). 1144 cases, 1,666,998 ms of summed case time, about 82 seconds wall - so roughly twenty files run in parallel and WALL TIME IS THE SLOWEST FILE, never the total. One file costs 342,971 ms across 13 cases, and its slowest single case is 51,246 ms: 62 percent of the whole battery's wall clock inside one case. The battery got 20 seconds slower on 2026-08-13 because two cases were added to that same file - not the engine slowing, the tallest pole made taller. PARALLELISM IS NOT THE PROBLEM at twenty to one. A RULE WORTH CONSIDERING: a single case over ten seconds is a finding on its own, reported by the reporter that already measures it; the data has been recorded on every run since 2026-07-31 and nobody read it until then.

  AND THE FIX FOR IT IS DESIGNED (note-c25579614b03). That file makes 176 git invocations, because every case builds a whole git universe from zero and throws it away, and this project has already measured a git spawn here at 47 to 54 ms against 0.5 for a disk read. THE SEAM ALREADY EXISTS: the module reaches git through one narrow function plus a few one-line helpers, and everything else is logic over strings. So the logic gets a fake of that one function, a map from arguments to canned results, and the seam gets ONE real-git test proving the real thing does what the fake pretends. THE RISK, NAMED: a fake can drift, and then the logic tests pass against a git that does not exist - which is what the single real-seam test is for, and why the fake must be a fake of the git surface ONLY, never of the module's own functions, which are the subject. The next ceiling after it is 150 seconds, with the same shape.

  THE ASYNC ROUND'S CHARTER (owner design, note-c4dd7f236737, note-d591f5980ef0). Trivial calls still answer directly, and the ticket desk is for what runs long: submit, get a handle back fast, poll it. A ticket desk without workers does not unblock a single-threaded server, so workers are part of the round. MEASUREMENT COMES FIRST and decides what moves, with every call from both doors landing its duration in the log; the owner refuses to stay the profiler. The measurement half is LIVE and the build half is untouched. THE FIRST SLICE IS NAMED: move the trace load, the measured 250-file offender, behind a worker thread with the corpus request and response as plain JSON; then generalise the run-and-test handoff into the dispatch for any call crossing the line; unify the job registry last. IT WANTS A WALK THAT STARTS ON IT, because the round adds a lane verb and a new verb hides behind the engine reload mid-session. KEEP ESTIMATES OUT - running-poll-again is honest, and an estimate is a guess wearing a number.

  PRELOADING IS SANCTIONED (owner ruling, note-7b8b22e9c8b5), which changes the fix from making the render FASTER to making it EARLIER. The evidence forms for the states on screen can be built while the drawing is being looked at, and the drawings of enterable sub-machines can compile ahead of the double-click, since which ones resolve is already known. TWO CAVEATS: the owner believes a UI-streaming rule already exists, unverified - read it first and extend it; and measure before preloading, because preloading the wrong thing is work moved rather than saved. TWO SLOW PATHS MAKE A PATTERN (note-e377c25b39ae), so one round covers both, and the four unranked candidates are the machine compiling per render, the trace corpus loading per call, the whole page re-rendering rather than morphing, and the drawing rebuilding each time. THE TEST THE OWNER ASKED FOR BY NAME: one that fails when a render passes a second. The existing one-second test covers lane CALLS only, which is how both got past.

  THE COMPARISON WALK CLOSES TRANSITIVELY ON EVERY CALL (note-e06d7b099f89) and IS NOT A PROBLEM YET - the note exists so nobody rediscovers it in a panic. 100 items with a fully wrong hint took 1.3 seconds for roughly 620 questions, so one question costs about 2 ms. It becomes a problem past a few hundred items, or if the walk is called in a loop rather than per answer. The fix does not change the interface: cache the closure against a hash of the judgment list.
inputs:
  - project/spec/version-planning.md
  - req-call-answers-in-one-second
---

# i12

## Goal

Performance: hold the one-second rule on the surfaces that break it, and paginate the pull instead of overflowing it.

## Rough vision

ENABLER 4 OF 4 (owner, 2026-08-13). It halves the battery's wall clock, which every later iteration pays on every run.

DONE LOOKS LIKE: opening the state machine answers inside a second, opening an evidence form from a note does too, a pull never hands back a payload a host has to move to disk, and the survey's window governs every list it prints.

MEASURE FIRST, FIX SECOND. Nobody has profiled the machine page. A retro noted that the container-green derivation added recordDone calls per paint, so that is the first suspect to measure rather than the first thing to change.

THE NAMED ITEMS. Opening the state machine takes more than a second against the standing rule. Opening an evidence form from a note breaks it too, and preloading is sanctioned. The comparison walk closes transitively at O(n cubed) on every single call. se_survey with detail full measured 244KB and the backlog list ignored its window. A pull once returned seven thousand lines, and pulls have been persisted to disk at 240KB.

THE RULING THAT BINDS THE PULL: it never overflows, it PAGINATES.

THE SURFACE HALF: any operation past one second goes non-blocking with a toast, and a progress bar where one is possible. The engine half of that rule already exists as req-call-answers-in-one-second; this is its other side.

IF THE BATTERY IS TOUCHED, take v1's shape. Progress, batch and concurrency all live INSIDE the guarded write path: a bounded worker pool whose results flow through the SAME verdict-write guard, so there is ONE serialization point and no second write path. Concurrency caps at spare cores and only order-independent tests qualify. v1 chose that over thinning the test set.

ONE MEASUREMENT WE ALREADY HAVE: refs.test.ts cost 99 seconds of a 508-second battery. Splitting one file by theme is the only unit that reaches a second core.

FULL CONTEXT: project/spec/version-planning.md, section i12.

FROM THE POOL, 2026-08-13. The measured half, and it decides the order of work.

THE BATTERY'S WALL CLOCK IS ONE FILE'S CAPTIVE (note-ebdbe91f7640). 1144 cases, 1,666,998 ms of summed case time, about 82 seconds wall - so roughly twenty files run in parallel and WALL TIME IS THE SLOWEST FILE, never the total. One file costs 342,971 ms across 13 cases, and its slowest single case is 51,246 ms: 62 percent of the whole battery's wall clock inside one case. The battery got 20 seconds slower on 2026-08-13 because two cases were added to that same file - not the engine slowing, the tallest pole made taller. PARALLELISM IS NOT THE PROBLEM at twenty to one. A RULE WORTH CONSIDERING: a single case over ten seconds is a finding on its own, reported by the reporter that already measures it; the data has been recorded on every run since 2026-07-31 and nobody read it until then.

## Added at the retro, 2026-08-14 — FIND THE REAL CAP, BECAUSE TWO HYPOTHESES DISAGREE AND NEITHER IS MEASURED

THE CONSTANT IS NOT CALIBRATED TO ANYTHING. `READ_BUDGET` in engine/files.ts is 50,000 characters. It was set as a defence against an external cap nobody has measured, and the two standing guesses point in OPPOSITE directions.

- THE HANDOVER'S HYPOTHESIS (project/scratchpad/HANDOVERcapdiagnosis.md): we are FAR TOO CONSERVATIVE. cage/claude-settings.json sets MAX_MCP_OUTPUT_TOKENS to 100000, and 50,000 chars is roughly 12,500 tokens — about one EIGHTH of the room already bought on that host. Every oversize refusal and every 400-line chunk may be a tax paid for a limit that host does not impose.
- THE OWNER'S HYPOTHESIS, 2026-08-14, from using it: something blocks FAR BELOW 50,000. "Something is blocking us way earlier than at fifty thousand. Fifty thousand is too much... It's like a small file fits in, a big file doesn't and needs to be paginated." The estimate offered is on the order of a couple of thousand tokens.

BOTH CANNOT BE RIGHT, AND THAT IS THE POINT. A constant guarded in one direction by a guess and contradicted in the other by lived experience is not a budget, it is a superstition. Whichever way the number moves, it moves a long way.

THE TWO HOSTS DO NOT SHARE A CAP, and they fail differently. Claude Code runs over stdio and errors EXPLICITLY. VS Code agent mode runs over HTTP to localhost:7333/mcp and is believed to TRUNCATE SILENTLY. A result from one says nothing about the other, so every trial records its host or the ramp is worthless.

THE METHOD IS IN THE HANDOVER AND IS NOT RESTATED HERE. In short: a synthetic document of exact known size, a unique END MARKER on its last line, position markers every 5KB, and a BISECT rather than a creep. Use `opts.maxChars` per call rather than editing the constant, so the default stands while the measurement runs.

THE END MARKER SEPARATES THE TWO FAILURES. An explicit error is the host's cap. A clean-looking result with the marker MISSING is silent truncation. The reading probes already detect it on the pull path — the third probe sits at 92 percent of the document ON PURPOSE, because truncation drops the end.

WHY IT BLOCKS THE LOOK-AHEAD BELOW. Filling a budget nobody has measured, on a host that truncates without saying so, means the prediction vanishes and NOTHING REPORTS IT. This measurement comes first.

TWO FINDINGS THE HANDOVER CARRIES AND ASKS TO BE ROUTED, both real and neither part of the experiment:

- machine-authoring.md and template-authoring.md are NEVER PULLED. Neither carries `applies_to` or `tags`, and neither sits at the guidance root, so no pull rule can select them. Their own statement says "consulted when authoring, pulled nowhere".
- .se/reading.md MAY EXCEED ITS OWN READ_BUDGET. buildReading() concatenates every owed document, and four mid-sized guidance docs sum to about 53,800 chars against the 50,000 budget.

## The look-ahead, and the measurement it waits on

OWNER PROPOSAL, 2026-08-14: once the budget is known, FILL IT. "We know what the budget is that we can send to the agent in one tool call, and then we fill it up with branch prediction stuff, so the agent doesn't have to call so often."

IT IS ALREADY HALF BUILT. The packet carries `route_reads` today — the documents the route ahead will demand. The engine computes the route hop by hop, weighs each hop against the dial, and knows where it stops. The prediction exists and is simply not filled out.

WHAT IT WOULD ACTUALLY SAVE, from i27's log rather than from theory. The pull refused four separate times naming ONE fallen input while the root sat SIX LEVELS DOWN, costing one se_why per level each time. The chain is computable at refusal time. And 563 file reads were made in one iteration, a large share of them re-reading a file to find the exact text to patch.

WHAT IT WOULD NOT SAVE, which bounds the scope: the shape refusals belong to i29's schema work, the short-id choice refusal is a naming fix, and the stale typecheck answer is a reporting bug. Look-ahead answers the ripple and the reads. Nothing else.

A WRONG PREDICTION IS NOT FREE, and the owner named the answer: MEASURE IT. The engine logs whether a prediction was used, and the retro reads the hit rate. A prediction competes for budget with the reading the walk actually owes, so a hit rate nobody watches is a slow leak.

THE TENSION TO DECIDE TOGETHER, or one lands and quietly reverses the other. i11 carries note-86df58115eb7's refinement: a SUBMIT's answer needs almost nothing, only whether it signed and what refused it. This proposal FATTENS the pull. Slim the submit and fatten the pull is one coherent policy; doing either alone is not.

AND THE FIX FOR IT IS DESIGNED (note-c25579614b03). That file makes 176 git invocations, because every case builds a whole git universe from zero and throws it away, and this project has already measured a git spawn here at 47 to 54 ms against 0.5 for a disk read. THE SEAM ALREADY EXISTS: the module reaches git through one narrow function plus a few one-line helpers, and everything else is logic over strings. So the logic gets a fake of that one function, a map from arguments to canned results, and the seam gets ONE real-git test proving the real thing does what the fake pretends. THE RISK, NAMED: a fake can drift, and then the logic tests pass against a git that does not exist - which is what the single real-seam test is for, and why the fake must be a fake of the git surface ONLY, never of the module's own functions, which are the subject. The next ceiling after it is 150 seconds, with the same shape.

THE ASYNC ROUND'S CHARTER (owner design, note-c4dd7f236737, note-d591f5980ef0). Trivial calls still answer directly, and the ticket desk is for what runs long: submit, get a handle back fast, poll it. A ticket desk without workers does not unblock a single-threaded server, so workers are part of the round. MEASUREMENT COMES FIRST and decides what moves, with every call from both doors landing its duration in the log; the owner refuses to stay the profiler. The measurement half is LIVE and the build half is untouched. THE FIRST SLICE IS NAMED: move the trace load, the measured 250-file offender, behind a worker thread with the corpus request and response as plain JSON; then generalise the run-and-test handoff into the dispatch for any call crossing the line; unify the job registry last. IT WANTS A WALK THAT STARTS ON IT, because the round adds a lane verb and a new verb hides behind the engine reload mid-session. KEEP ESTIMATES OUT - running-poll-again is honest, and an estimate is a guess wearing a number.

PRELOADING IS SANCTIONED (owner ruling, note-7b8b22e9c8b5), which changes the fix from making the render FASTER to making it EARLIER. The evidence forms for the states on screen can be built while the drawing is being looked at, and the drawings of enterable sub-machines can compile ahead of the double-click, since which ones resolve is already known. TWO CAVEATS: the owner believes a UI-streaming rule already exists, unverified - read it first and extend it; and measure before preloading, because preloading the wrong thing is work moved rather than saved. TWO SLOW PATHS MAKE A PATTERN (note-e377c25b39ae), so one round covers both, and the four unranked candidates are the machine compiling per render, the trace corpus loading per call, the whole page re-rendering rather than morphing, and the drawing rebuilding each time. THE TEST THE OWNER ASKED FOR BY NAME: one that fails when a render passes a second. The existing one-second test covers lane CALLS only, which is how both got past.

THE COMPARISON WALK CLOSES TRANSITIVELY ON EVERY CALL (note-e06d7b099f89) and IS NOT A PROBLEM YET - the note exists so nobody rediscovers it in a panic. 100 items with a fully wrong hint took 1.3 seconds for roughly 620 questions, so one question costs about 2 ms. It becomes a problem past a few hundred items, or if the walk is called in a loop rather than per answer. The fix does not change the interface: cache the closure against a hash of the judgment list.

## Inputs

- project/spec/version-planning.md
- req-call-answers-in-one-second

## The cubic clause was struck from the goal, 2026-08-15

OWNER RULING: "So the cubic clause goes away from the goal. If it's not a
problem, we don't need to fix it."

WHAT WAS STRUCK: "and kill the cubic comparison walk", from the goal line and
from the Goal heading.

WHY IT WAS ALWAYS WRONG THERE. The vision above already retires it, with a
measurement, on the day both were written. See the last paragraph of the
look-ahead: 100 items with a fully wrong hint took 1.3 seconds for roughly 620
questions, so one question costs about 2 ms. It becomes a problem past a few
hundred items, and the note exists so nobody rediscovers it in a panic.

The algorithm is `closeOrder` in engine/compare.ts, a Floyd-Warshall transitive
closure over the equivalence-group representatives. It is correct, and its
input is tens of groups rather than thousands.

WHAT IT COST TO LEAVE IT STANDING. The implementation gate judged this record
against the summary line and reported the goal unmet. That finding was
fabricated: the record's own vision had answered it. The owner caught it, not
the gate.

THE RULE THIS WANTS TO BECOME. A goal item that measurement retires is STRUCK
from the goal, with the measurement as its reason. Leaving it standing makes
every later reader judge against a demand that was already answered, and
contract rule 5 says a contradiction is resolved rather than recorded.
