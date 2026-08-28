---
id: speedup-candidates
statement: Everything standing in the repository that would make the machine faster or smoother to drive, collected 2026-08-28 for the round that has not opened yet.
---

# Speed-up candidates

WHAT THIS IS. On 2026-08-28 the owner decided the next round is a SPEED-UP of the system just built. A sweep read 231 work tokens, 239 open register entries, 287 notes and 70 iteration records, and collected everything that would make the machine faster or smoother to drive.

WHY IT IS HERE RATHER THAN IN A SCRATCHPAD. A scratchpad does not travel and is not in version control. This is the input to a round that has not been seeded, so it has to survive the session that made it.

WHAT IT IS NOT. It is not a plan and not a scope. Every entry names the id it came from, so a reader checks rather than trusts.

# Speed-up candidates

Swept: 231 work tokens in `spec/trace/work-token/`, 476 register entries in
`spec/trace/raid/` (239 of them open issue / debt / risk / dependency), 287
notes in `.se/notes.jsonl` (all drained — none pending), and 70 iteration
records.

There is no `.se/notes/` directory. Notes live in `.se/notes.jsonl` and every
one of the 287 carries a disposition already.

**16 tokens name this iteration by name.** Their `ready_when` reads literally
`ready when the walk-speed iteration is seeded`. They are marked `[PRE-ROUTED]`
below.

Counts: 1. latency 34 — 2. the test loop 32 — 3. rework and ripple 24 —
4. review and hands 26 — 5. the turn itself 34 — 6. step size 22 — maybe 24.
**Total 196.**

---

## 1. latency

- `wt-one-hop-of-the-walk-gets-a-published-time-budget-of-a-twenti` [PRE-ROUTED] — One hop of the walk gets a published time budget of a twentieth of a second, and the engine is held to it.
  - why it belongs: this is the owner's item 3 written down as a target with a number.
  - evidence: "Today a single hop costs ten to twenty seconds, so the gap is roughly three hundredfold. Where that time actually goes has not been established, and finding out comes before any repair."

- `raid-debt-the-per-hop-second-is-measured-and-unattributed` — A hop inside a large record costs about a second more than a hop outside one, the size of the gap is measured, and nothing has been shown to cause it.
  - why it belongs: it is the only measurement of per-hop cost that survived a disproof pass, and it contradicts the token above.
  - evidence: `spec/trace/raid/raid-debt-the-per-hop-second-is-measured-and-unattributed.md` lines 19-45. "A hop that owes nothing — no reading, no script, no evidence form — costs 1,700 to 2,300 ms inside i63. Boot and front-desk hops cost 650 to 990 ms." Disproved: status packet, exit scripts (95 to 619 ms each), trace walk upward (8 ms), work store (23 ms), corpus sweep on the pull path (0 sweeps, 11 ms). Unplaced: "SIXTY-FOUR ASKS FOR THE CORPUS COST 1,461 ms, and the identical loop inside a read-only pass costs 22 ms."

- `raid-iss-reading-one-spilled-answer-back-costs-eight-calls` — Two in every five lane calls in the i37 window were pages of a spilled answer being read back.
  - why it belongs: largest single measured waste of calls anywhere in the corpus.
  - evidence: "Across 16,157 records from 2026-08-19 15:28 to 2026-08-20 13:56: 9,236 calls were `se_file_read`, which is 57% of everything. 6,433 of those read a file under `.se/answers/`. That is 40% of ALL lane calls in the window... A 22 KB survey costs eight round trips to read back."

- `wt-each-machine-works-out-its-own-largest-safe-reply-size-once-` — Each machine works out its own largest safe reply size once, at start-up, and remembers it under a key that identifies that machine.
  - why it belongs: it is the fix for the 40% above, and its `ready_when` says `ready now`.
  - evidence: "On a cloud box the measured figure was more than six times the cautious default, and on this Windows machine no figure has ever been taken, so every reply of a whole session was chopped and handed back in slices." `ready_when: ready now — the owner asked for it on 2026-08-24 and it is the largest single cost measured on both machines`

- `wt-slowness-gets-found-only-when-it-annoys-somebody-since-no-st` — Slowness gets found only when it annoys somebody, since no step is charged with hunting for it.
  - why it belongs: it is the standing-measurement half of the owner's item 3, with a floor already taken.
  - evidence: "Starting one checking session costs 536 milliseconds by itself: roughly 120 to lay the product tree down, roughly 330 to take in the guidance corpus... That same start costs 1453 milliseconds with twelve running at once, and 4013 with forty-two, which is seven and a half times worse at the width really in use. Fewer starts is the lever, not a quicker start."

- `wt-advancing-one-position-costs-a-fraction-of-a-second-rather-t` — Advancing one position costs a fraction of a second rather than several.
  - why it belongs: names a profiled cause of the per-hop cost.
  - evidence: "A profiler traced the cost to the status message: it recomputes the entire path to the destination every time one is sent, even for a position whose own checks do nothing at all. The toll measured almost identical across three consecutive hops, which is the tell that it belongs to the packet and not to the work."

- `wt-the-fix-everybody-names-is-already-built-and-naming-it-again` — The fix everybody names is already built, and naming it again buys nothing.
  - why it belongs: it closes off the wrong repair and says what to do instead.
  - evidence: "Passing the corpus down instead of re-fetching it was done... THE REAL QUESTION IS WHAT ONE ALREADY-FINISHED HOP SPENDS ITS TIME ON, and it needs a profile rather than another proposal."

- `wt-sampling-where-the-time-goes-is-part-of-the-walk-rather-than` — Sampling where the time goes is part of the walk rather than something somebody remembers to do.
  - why it belongs: the instrument every other latency item needs.
  - evidence: "Twice an agent has narrowed a sluggish route by inserting printed lines one at a time, when the runtime ships a sampler that names the whole chain in a single run. The owner asked for it on both occasions."

- `wt-every-screen-a-human-being-reads-is-enumerated-in-one-place-` [PRE-ROUTED] — Every screen a human being reads is enumerated in one place, findable by a reader and by an automated check alike.
  - why it belongs: the token itself declares it the first milestone of this iteration.
  - evidence: `ready_when: ready when the walk-speed iteration is seeded, where it stands as the first milestone`. "This comes before any speed work, because nothing unnamed can be put under a stopwatch."

- `wt-a-large-record-is-built-once-committed-and-kept-solely-as-a-` [PRE-ROUTED] — A large record is built once, committed, and kept solely as a yardstick for timing.
  - why it belongs: without a fixed fixture no time budget is enforceable.
  - evidence: "Anything still being worked on shifts under the measurement, which makes a slowdown indistinguishable from the thing simply growing. Without something that holds still, no time budget is enforceable."

- `wt-starting-a-session-costs-a-handful-of-exchanges-rather-than-` — Starting a session costs a handful of exchanges rather than dozens.
  - why it belongs: boot latency, with the owner's own number attached.
  - evidence: `ready_when: ready when the opening sequence is next measured, and the owner's target is twenty seconds`. Three stacked costs: unused material served, a large answer sliced, an unfinished merge stopping the opening outright.

- `wt-a-document-handed-to-an-agent-for-reading-arrives-whole-rath` [PRE-ROUTED] — A document handed to an agent for reading arrives whole, rather than split across four fetches.
  - why it belongs: the reading loop is the first thing every session pays.
  - evidence: "Measured across the guidance and method library: ninety-four documents need two hundred and six fetches where ninety-four would do."

- `wt-charge-a-state-s-reading-only-to-whoever-walks-into-it-and-g` — Charge a state's reading only to whoever walks into it, and give every guidance card a short form beside the long one.
  - why it belongs: cuts the reading owed per hop by a factor of four in the measured case.
  - evidence: "Reaching one door at the switchboard cost eight documents where that door wanted two, because the loop clears the demands of every neighbouring door before it will open any of them."

- `wt-two-related-guidance-gaps-cost-real-agent-effort-this-sessio` — Two related guidance gaps cost real agent effort this session.
  - why it belongs: half of it is the boot reading loop's token cost.
  - evidence: "boot's read/prove verbatim-quote loop cost roughly 100k tokens before reaching the front desk, with a missed probe re-serving the whole document rather than the missed span."

- `wt-move-the-dated-backstory-out-of-the-pages-the-machine-loads-` — Move the dated backstory out of the pages the machine loads into every prompt.
  - why it belongs: paid on every turn of every session.
  - evidence: "Better than twenty dated attributions still sit inline across the binding rules, the refusal register and three craft cards, and each one is paid for on every turn of every session."

- `wt-the-cage-instructions-move-out-of-every-helper-s-opening-tex` [PRE-ROUTED] — The cage instructions move out of every helper's opening text and into the launch itself.
  - why it belongs: pure per-spawn overhead, and this iteration spawns a lot.
  - evidence: "Three helpers were measured at roughly 230 to 300 words each, and the identical four-line cage block took about a fifth of every one."

- `wt-several-blocks-ride-every-answer-whether-or-not-the-caller-n` — Several blocks ride every answer whether or not the caller needs them, and nobody has ruled which verb owns which block.
  - why it belongs: per-answer payload, and the fix is a naming pass rather than a rewrite.
  - evidence: "Candidates seen shipping on results that never asked: the position's whole guidance text, the elapsed sweep figure, the route's read list, the power toggles, and the legal-tool list repeated at three separate build sites."

- `raid-risk-a-trimmed-payload-costs-a-second-call` — A pull trimmed of something the agent needs costs a second call to fetch it, so the trim raises the call count it was built to lower.
  - why it belongs: the standing counter-argument every trim in this iteration has to answer.
  - evidence: "Every form field carries ten null argument slots, plus the full static template metadata, on every pull. Several answers exceeded 60KB and were spilled to disk."

- `raid-corpus-stays-small` — The engine reads whole files and scans whole folders on every look, and the corpus is no longer small enough for that to be free.
  - why it belongs: the structural cause under most of the latency items.
  - evidence: "Measured that day: 322 nodes, 465 ms cold, 119 ms warm. Unmeasured above that." Also carries 3285 ms / 3275 ms / 134 calls.

- `raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it` — Adding a rule to the sweep costs time nobody is measuring against a bound.
  - why it belongs: the sweep is on the hop path and it is growing superlinearly.
  - evidence: "2026-08-16 | 3053 | 974 ms; 2026-08-26 | 3092 | 1075 ms; 2026-08-26, later the same day | 3113 | 1270 ms. THE THIRD POINT IS THE WORRYING ONE. 21 more nodes cost 195 ms more."

- `raid-un-surface-answers-in-one-second` — No element budgets, caps, defers or degrades a render to stay inside the bound.
  - why it belongs: the person's own surface is the slowest thing measured.
  - evidence: "`/widget/details` at 3468 ms with 7 of 7 requests over the line, `/widget/machine` at 3966 ms, `/` at 4026 ms." And "i33's `fix-what-the-numbers-name` line 15 counts 181 breaches at the one-second line, of which `mirror_slow` is 82."

- `raid-ar-call-answers-in-one-second` — The architecture leaves req-call-answers-in-one-second at risk.
  - why it belongs: the measured breach rate on the pull itself.
  - evidence: "measured 2026-08-10 from the recorded call log: 12 of 118 pulls broke the one-second line, the worst at 15.2 seconds (a full 28-state record re-entry)."

- `raid-ar-a-clear-jump-is-one-call` — The call-count half is built and tested; the three-second half is owned by nothing.
  - why it belongs: names the budget the engine actually enforces, and it is seven times the published one.
  - evidence: "`engine/session.ts` line 2749 sets `SWEEP_BUDGET_MS = 20_000`." And "A SWEEP RECOMPUTES THE ROUTE AFTER EVERY HOP, so a long route pays the green walk once per hop."

- `wt-drawing-every-panel-at-once-was-once-timed-at-more-than-240-` — Drawing every panel at once was once timed at more than 240 seconds here.
  - why it belongs: the surface is what the person waits on.
  - evidence: "The surface now serves a single panel per request and keeps a timing record for two of them, which narrows the cost without ever measuring the whole. No panel is cached."

- `wt-a-state-draws-with-a-stroke-style-the-surface-vocabulary-nev` — Confirming an already-finished record costs upwards of a hundred calls through the lane.
  - why it belongs: re-entry cost, which the walk pays on every restart.
  - evidence: statement, second clause: "confirming an already-finished record costs upwards of a hundred calls through the lane".

- `wt-one-job-has-two-pieces-of-code-doing-it-and-neither-knows-th` — One job has two pieces of code doing it, and neither knows the other exists.
  - why it belongs: carries the largest single measured speed-up in the corpus, already demonstrated.
  - evidence: "Seven checking cases used the second, which made their file the most expensive in the suite at 33.5 seconds out of 296; a single shared read per file brought that to 3.8." And the open question: "which of the two the drawing surface picks when it renders a table."

- `wt-every-look-at-a-file-goes-through-the-warm-copy-the-engine-a` — Every look at a file goes through the warm copy the engine already holds, and a bounded stretch of work reports afterwards what moved underneath it.
  - why it belongs: the owner's own sketch of the caching design.
  - evidence: `ready_when: ready when the reading path is next opened, and the owner sketched it on 2026-08-24`.

- `wt-every-look-at-a-file-goes-through-the-stored-copy-the-system` — Every look at a file goes through the stored copy the system keeps, unless somebody writes down a reason to avoid it.
  - why it belongs: same mechanism, widened into a sweep question.
  - evidence: "A reader holding no memory is not merely slow. Nothing can tell it that its answer expired, so it silently drifts away from what is true as soon as somebody edits."

- `wt-four-hand-rolled-caches-stand-in-the-engine-with-four-differ` — Four hand-rolled caches stand in the engine with four different keys and no shared mechanism.
  - why it belongs: without the counting instrument, every caching candidate is a guess.
  - evidence: "One counter exists, watching a single function... THE SWEEP IS THE HARDER HALF AND THE MISSING ONE: without an instrument that counts how often one operation asks for the same unchanged thing, any list of candidates is a guess."

- `raid-iss-the-matrix-cache-is-keyed-on-size-and-modification-time` — The rigor matrix is cached against a stamp of each row's size and modification time, and the code beside it says in capitals that it must never be.
  - why it belongs: a cache on the hop path that can serve stale rows.
  - evidence: carries `150 FILE` and `4,836 times`. "The content hash is itself memoised against `rowsStamp`, which is `size:mtimeMs` per file."

- `wt-nothing-reads-the-finished-pile-unless-somebody-opens-it-del` — Listing what is open should not touch the finished pile at all, and today it does.
  - why it belongs: taxes every call that asks what stands, which is every call.
  - evidence: "which taxes every call that asks what stands. The owner ruled that finished work is no concern of a running piece."

- `wt-how-long-a-completed-task-s-file-is-worth-keeping-gets-decid` [PRE-ROUTED] — How long a completed task's file is worth keeping gets decided first, and only then is the clearing built.
  - why it belongs: the pile is growing at the rate that makes every folder pass slower.
  - evidence: "The pile stood at 598 one morning and 1,245 by that afternoon. Every pass over the folder opens all of them to reach the handful still live."

- `wt-completed-work-should-exist-only-in-version-history-never-as` — Completed work should exist only in version history, never as folders left where nothing consults them.
  - why it belongs: "an unbounded checkout brought back under control, with every sweep, search and listing no longer paying for material nobody can act upon."
  - evidence: statement's own gain clause, quoted above.

- `wt-keep-interactive-session-controls-responsive-by-measuring-an` — Keep interactive session controls responsive by measuring and removing work that delays visible feedback beyond a quarter second.
  - why it belongs: a published latency budget for the person's controls.
  - evidence: the quarter-second figure in the statement itself.

## 2. the test loop

- `wt-the-largest-of-three-linked-ideas-retire-the-programs-that-r` — Retire the programs that run when a position is left, and turn what each of them checked into work the position owes on entry.
  - why it belongs: this IS the owner's item 2, stated as a mechanism rather than a symptom.
  - evidence: "It is load-bearing today across the compiler, the session, the matrix and fourteen matrix rows, so nothing about this is small. The hardest case is boot, whose five checks run before any record is bound."

- `raid-iss-verification-cannot-repair-the-battery-that-holds-it` — Verification's exit is the full battery and its tools are read-only, so a red battery holds the walk in a state that cannot fix what the battery found.
  - why it belongs: the exact shape the owner named — the whole suite hanging off one state's exit.
  - evidence: carries `155 calls`. "THE STATE THAT REPAIRS IS BEHIND THAT SAME EXIT. `fix-findings` is reached by a fallback, and every crossing pays another full battery." "IT HAPPENS EVERY TIME A BATTERY GOES RED, which is the ordinary case for a record that builds anything. MEASURED TWICE."

- `wt-a-step-whose-leaving-condition-runs-a-long-program-should-no` — A step whose leaving condition runs a long program should not freeze the agent's only verb.
  - why it belongs: the harness-timeout half of the owner's item 2.
  - evidence: "Measured once at sixty-eight seconds, with two calls timing out at the tool boundary. One of those had partly landed, so the caller was told it failed while it had in fact moved."

- `wt-a-departure-check-runs-the-test-suite-keeps-the-exit-code-an` — A departure check runs the test suite, keeps the exit code, and discards the text naming what broke.
  - why it belongs: forces a second full run for information the first run already had.
  - evidence: "The suite had to be asked all over again, costing something over two minutes of wall clock across roughly two hundred files, none of which had changed since the first run."

- `wt-a-single-test-file-eats-a-tenth-of-the-whole-suite-and-sets-` — A single test file eats a tenth of the whole suite and sets a floor nothing else can go under.
  - why it belongs: the wall clock of the battery is set by one file.
  - evidence: `spec/trace/work-token/wt-a-single-test-file-eats-a-tenth-of-the-whole-suite-and-sets-.md` lines 7-15. "Roughly 1,900 cases, none failing, about 316 seconds of work spread over about 112 seconds of clock. THE HEAVIEST FILE takes almost 32 seconds by itself... Twenty-three cases live there and the worst of them finishes inside three seconds."

- `raid-risk-splitting-the-heaviest-test-file-buys-no-wall-clock` — Splitting refs.test.ts shortens nothing, because a different file sets the battery's critical path.
  - why it belongs: it is the disconfirming argument against the item above, and it must be answered first.
  - evidence: "i16's onboard-retro measured `refs.test.ts` at 139,017 ms summed, 14.1 percent of the battery, at 6,044 ms per case. Its own conclusion, in that evidence: halving the file would not shorten the wait by one second."

- `wt-measure-governed-test-duration-by-file-and-remove-the-schedu` — Measure governed test duration by file and remove the scheduling or stale-worker delay that keeps a green battery above its expected duration.
  - why it belongs: `ready_when: ready when a performance iteration opens for the governed test runner` — it names this iteration in all but name.
  - evidence: the statement is a single sentence naming the measurement and the suspected cause.

- `wt-a-run-of-the-checks-either-finishes-or-says-where-it-stopped` — A run of the checks either finishes or says where it stopped.
  - why it belongs: the battery can hang for tens of minutes with no diagnostic.
  - evidence: "On 2026-08-25 two runs on one Windows machine were abandoned after seven and twenty-three minutes, having written nothing to the file that records how far along they were, while a run of thirty-three files on the same machine that morning finished in forty-one seconds."

- `wt-the-suite-s-standing-failures-are-counted-and-driven-to-noth` [PRE-ROUTED] — The suite's standing failures are counted and driven to nothing.
  - why it belongs: a red battery makes every scoped question unanswerable.
  - evidence: "They stood at 27 across seventeen files at the close of the last round, and a scoped run four hours later found 2 across the twenty-one files it covered. The full battery has not run since, so the remainder is unconfirmed rather than cleared."

- `wt-the-owner-s-rule-stated-exactly-where-the-engine-and-the-cal` — Where the engine and the caller disagree about how much to run, the smaller of the two wins, in both directions.
  - why it belongs: the owner's own scope rule, unbuildable today.
  - evidence: "The verb takes a question and nothing else, so a caller has no channel to name a smaller set, and the single rule that decides scope is a threshold that promotes everything to the whole battery once crossed. The second half — measuring how often that promotion fires — can be answered from the call log before anything is rebuilt."

- `raid-risk-a-narrower-test-scope-misses-a-break` — Teaching the engine to run fewer tests for a change lets a real break through, because the mapping from a changed file to the tests that answer for it is a guess.
  - why it belongs: the standing risk against every scope cut this iteration makes.
  - evidence: the risk's own statement.

- `wt-half-of-this-is-already-answered-and-half-is-unstarted-the-o` — Nobody has counted the session's check calls against what actually changed, or read the log to see whether the scope rule flipped everything to the whole battery.
  - why it belongs: the measurement that sizes the whole test-loop lane, and it needs no code.
  - evidence: "That measurement can run before anything is rebuilt."

- `wt-a-check-that-runs-on-the-way-out-of-a-position-runs-once-and` — A check that runs on the way out of a position runs once, and a position that already earned its verdict does not pay again.
  - why it belongs: pure repeated work on the hop path.
  - evidence: "Watched live during a session opening on 2026-08-25: the same five checks restarted on every attempt to move on, and each attempt joined a run in flight rather than learning the outcome."

- `raid-debt-demonstration-reds-are-re-asked-every-iteration` — observe-red asks every non-test spec in the corpus for a red observation, including the ones the open delta never touched.
  - why it belongs: work re-answered per iteration for iterations already closed.
  - evidence: carries `16 calls` and `87 seconds`.

- `raid-iss-whole-product-claims-reverified-by-every-record` — Verification serves every record the whole product's non-test specs, including the ones its delta never touched.
  - why it belongs: same shape, at the other end of the walk.
  - evidence: the issue's own statement.

- `wt-the-check-that-catches-a-one-ended-flow-runs-at-exactly-one-` — The check runs at exactly ONE position and nowhere else, so four broken ones reached trunk.
  - why it belongs: a corpus-wide law with a position-local trigger, which is the exit-script pattern the owner wants gone.
  - evidence: "A corpus-wide law with a position-local trigger bills whoever happens to walk that position, and never bills the author who wrote the break."

- `raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger` — A law that reads the whole corpus but fires only at one state accumulates debt nobody is billed for, and then bills whichever iteration next stands there.
  - why it belongs: the general statement of the item above, with the offending line quoted.
  - evidence: "`if (s.id.endsWith(\"specify-build\")) out.push(...specifyBuildLawProblems(...))`" and "Twice now that iteration has been i37."

- `wt-one-case-asserts-against-a-wall-clock-inside-a-run-that-satu` — One case asserts against a wall clock inside a run that saturates the machine, so it fails for load rather than for behaviour.
  - why it belongs: a flaky red costs a whole re-run every time it fires.
  - evidence: "NONE OF THE THREE REPAIRS HAS BEEN TAKEN... two sibling cases still sleep a fixed span each."

- `wt-a-check-that-fails-only-sometimes-teaches-people-to-run-it-a` — One case in the turn-ending guard's suite exits non-zero having written nothing at all to either output stream, and only while dozens of other files run beside it.
  - why it belongs: same cost, different cause, cause never established.
  - evidence: "Run by itself it succeeded twenty times out of twenty... three sibling cases still launch one and the cause was never established."

- `wt-the-check-covering-how-the-version-control-verb-reconciles-t` — The check went red alone at ninety-three seconds and was green on the very next run.
  - why it belongs: a 93-second case that is also a race.
  - evidence: "Its duration is the clue worth starting from."

- `raid-iss-a-bound-record-records-no-test-timings` — A battery run inside a bound record writes no timing record anywhere the lane can read.
  - why it belongs: no timings means no estimates and no measurement of the loop.
  - evidence: "Two full battery runs on 2026-08-15, inside the bound record i12. Both green: 1301 tests, 1301 pass, 0 fail." Carries `76985 ms` and `75218 ms`; `.se/test-timings.jsonl` "260284 lines before and after, same hash".

- `raid-iss-a-fresh-container-has-no-battery-timings-to-design-against` — The test-timing records do not survive a container, so a record that starts on a fresh clone cannot design a performance change against its own battery.
  - why it belongs: this iteration's own measurements will not survive a cloud run.
  - evidence: the issue's own statement.

- `raid-asm-a-first-run-has-timings-to-estimate-from` — A job asked how much longer it needs can answer from work already recorded.
  - why it belongs: falsified for every cloud box's first battery.
  - evidence: "`.se/test-timings.jsonl` and `.se/test-last-run.json` are machine-local. On this very run they did not exist at boot. So the FIRST battery on every cloud box is exactly the case with no inputs."

- `raid-risk-a-time-remaining-is-believed-more-than-it-deserves` — A figure for how much longer a job needs is acted on as though it were measured, when the timings behind it are known to be wrong.
  - why it belongs: the estimate rides every lane call the agent makes.
  - evidence: carries `1,534,695 ms` and `76,985 ms`.

- `wt-a-test-run-closes-its-own-entry-when-the-process-behind-it-e` [PRE-ROUTED] — A test run closes its own entry when the process behind it exits.
  - why it belongs: ghost runs make the work account lie about what is running.
  - evidence: "three stood for fifteen hours, all showing complete."

- `wt-expose-whether-a-test-job-is-queued-its-place-in-line-and-wh` — Expose whether a test job is queued, its place in line, and why no cases have begun.
  - why it belongs: without it, a slow run and a stuck run look identical.
  - evidence: the statement itself.

- `raid-iss-the-battery-is-red-on-a-comment-ratchet-this-milestone-did-not-move` — The full battery is red at the requirements gate on a ratchet this milestone did not move.
  - why it belongs: a red the walk pays for and did not cause.
  - evidence: "1,861 tests, 1,859 passing, 2 failing... The count stands at 207 against a ceiling of 204." And why it ran whole: "96 distinct files would have run piecemeal since the last one and the suite became the cheaper call."

- `raid-iss-half-the-shell-calls-are-one-missing-check-verb` — Nineteen of the thirty-nine shell commands in the i37 window were a typecheck or a lint, and the lane has no verb that runs either on its own.
  - why it belongs: half the shell traffic is a missing verb.
  - evidence: "16 typecheck. `npx tsc --noEmit` and its variants. 3 lint. `npx biome check`. 20 genuine shell work."

- `raid-iss-the-typecheck-is-unreachable-from-the-gates-that-ask-for-it` — Two gates ask round zero for the typecheck, and neither grants a tool that can run one.
  - why it belongs: forces a carried number where a taken one was asked for.
  - evidence: "`gate-validation` grants `se_test` and not `se_run`. `gate-release` grants neither."

- `wt-prove-the-suite-would-notice-if-a-mechanism-vanished-deletin` — Deleting five working parts one at a time left every case passing on a run of over sixteen hundred.
  - why it belongs: sizes how much of the battery's runtime is buying nothing.
  - evidence: the count of over sixteen hundred passing cases against five deleted mechanisms.

- `raid-issue-the-corpus-wide-inspections-have-no-runner` — Three test specs demand a sweep over the whole corpus and nothing runs one, so each verification judges them by hand or not at all.
  - why it belongs: manual work at verification is the slowest part of the slowest state.
  - evidence: names tsp-prose-inspection, tsp-record-inspection, tsp-derivation-analysis.

- `raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented` — The spec says a failed route answers no slower than a drawn one; only the quiet case is implemented.
  - why it belongs: the load case is where the breach lives, and it is the untested half.
  - evidence: "A route-failing call ran past thirty seconds 36 per cent of the time, against 2 per cent for every other call."

## 3. rework and ripple

- `wt-when-something-a-signed-answer-rests-on-moves-the-machine-se` — When something a signed answer rests on moves, the machine sends a hand to look at what the movement actually touched, and a checkpoint rules on the finding.
  - why it belongs: this IS the owner's item 4, in the owner's own words.
  - evidence: "It does not grey out everything downstream on the assumption that all of it fell. The owner's framing: we do not kill ourselves because we are afraid of dying." `ready_when: ready when something upstream next moves under signed work`

- `wt-re-signing-an-answer-that-others-rest-on-knocks-those-others` [PRE-ROUTED] — Re-signing an answer that others rest on knocks those others down every time, whichever way the walk happens to be pointed.
  - why it belongs: the mechanism the ripple rule has to replace.
  - evidence: "One case worked and one did not on the same day, so the guard fires only sometimes. A stale scoring table left standing is the worst outcome."

- `raid-iss-the-knock-down-has-no-reproduction-of-the-case-that-fails` — Nobody has a reproduction of the failing case, so no fix can be aimed at it.
  - why it belongs: blocks the item above and names what has to be built first.
  - evidence: "The knock-down FIRED TODAY, and the engine named the whole chain... WHAT IS NOT: WHICH CASE FAILS."

- `wt-a-signed-claim-sent-back-for-rework-cannot-be-returned-to-on` — A signed claim sent back for rework cannot be returned to once it sits behind where the walk stands, because the engine draws forward edges only.
  - why it belongs: the honest act is the expensive one, so people take the dishonest one.
  - evidence: "The driver must leave through the escape hatch to get there, which pushes people toward quietly correcting a claim they ought to have sent back. Three candidate repairs, in rising size."

- `wt-sending-a-signed-position-back-for-rework-can-leave-it-unrea` — Sending a signed position back for rework can leave it unreachable, because routes are drawn forward only.
  - why it belongs: same trap, and i63 made it tighter.
  - evidence: "i63 made the trap tighter rather than looser by minting work at the returned position, which holds it shut." Routed at i52.

- `wt-stop-a-re-opened-step-landing-where-the-walk-can-never-route` — Stop a re-opened step landing where the walk can never route back to it. Three shapes were sketched and none picked.
  - why it belongs: the decision that unblocks the two above.
  - evidence: "Three shapes were sketched and none picked."

- `raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back` — Reopening a state inside a sub-machine leaves no drawn way back to it.
  - why it belongs: the measured cost of a reopen in the shape this iteration will use most.
  - evidence: "The router's forward path from where the walk stood ran through the implementation gate, validation, package, release, ship and idle before it came back around — twenty-three hops to reach a state two behind it."

- `wt-neither-correction-verb-can-address-a-position-that-sits-ins` — Neither correction verb can address a position that sits inside a nested machine.
  - why it belongs: the ripple rule needs to name a position precisely, and today it cannot.
  - evidence: "One strips a qualified id down to its last segment and looks that up in the top machine only; the other passes it through untouched."

- `wt-the-remedy-printed-when-a-claim-falls-hands-back-a-plain-pos` — The remedy printed when a claim falls hands back a plain position name and tells the reader to go there and fill it.
  - why it belongs: "the remedy is unfollowable in exactly the case it exists for."
  - evidence: the statement's own clause, quoted above.

- `raid-iss-a-state-that-signs-no-form-can-never-be-sent-back` — A state with no evidence fields leaves no form on disk, so a reopen is refused and the work it owns cannot be re-earned.
  - why it belongs: a whole class of state is outside the ripple mechanism.
  - evidence: "`se_reopen fill-story-evidence` was refused SE-C-112, 'no form on disk'."

- `raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed` — A reopened placeholder could not be re-signed and the refusal named the wrong remedy.
  - why it belongs: half fixed, half not, and the unfixed half is remedy-naming.
  - evidence: "MEASURED 2026-08-19 on i37, live... The walk defect is fixed; the remedy-naming one is not." Carries `1518 tests`.

- `wt-warn-before-a-routing-edit-unsigns-work-across-every-open-re` — Warn before a routing edit unsigns work across every open record.
  - why it belongs: the widest ripple in the system, and it fires unannounced.
  - evidence: "touching one row of the rigor matrix quietly invalidates signatures nobody was thinking about."

- `raid-iss-scope-grew-past-a-signed-state` — A signed upstream step does not reopen when scope grows below it.
  - why it belongs: the opposite failure to over-greying, and it is the one the owner's rule risks widening.
  - evidence: "i3's write-requirements signed at 08:32 with three rows. Four mechanisms were built afterwards... The walk carried straight through write-requirements on its standing claim."

- `raid-iss-scope-grew-past-the-kickoff-bless` — Six pieces of behaviour this record carries were never priced by its kickoff gate.
  - why it belongs: same shape at the gate the ripple rule would rule at.
  - evidence: names four that landed before the gate priced them and two pulled forward after the bless.

- `wt-re-entering-work-that-already-passed-walks-straight-over-it-` — Re-entering work that already passed walks straight over it.
  - why it belongs: the owner has raised this cost twice and already ruled on it.
  - evidence: "The cause is a mismatch of lifetimes: proof that something was read belongs to the connection, while the signatures belong to the positions themselves... The owner has raised the cost of this twice, and ruled that a route skipped forward owes no reading along the part it skipped."

- `wt-route-recovery-should-detect-repeated-traversal-through-unch` — Route recovery should detect repeated traversal through unchanged signed states and direct the walk to the first state whose claim is not yet met.
  - why it belongs: the re-entry cost the item above describes, as a mechanism.
  - evidence: the statement itself.

- `wt-half-of-a-stall-is-closed-and-half-is-not-and-the-open-half-` — A route drawn over several steps refuses with a phrase meaning the program never ran, while a single-step aim over the same ground passes.
  - why it belongs: multi-hop re-entry is what a restart costs, and it refuses today.
  - evidence: "Nothing has been walked at that moment, so the route is judged before any of it begins."

- `wt-a-sweep-visits-each-position-once-and-stops` — One report showed the same short ring of five positions walked around six times before it gave up.
  - why it belongs: wasted sweep time with a mechanical detector already available.
  - evidence: "which wastes the whole run and hides whatever it was meant to find. The trail it prints is enough to detect the repetition mechanically."

- `raid-risk-a-hop-that-finishes-later-makes-green-ambiguous` — A state that may be left with its leaving verdict still owed breaks the one rule that makes green cheap to compute.
  - why it belongs: it is the direct cost of moving the battery off the exit script.
  - evidence: carries `86,079 ms`, `175 files`, `88 minutes`. "A gate below it asks whether its feeders are green. The route drawer asks which hops already pass. The panel paints a state by its status. Each of those readers has two answers today and needs three tomorrow."

- `raid-risk-the-graph-shows-a-change-only-after-a-re-walk` — A change to the graph appears only after something walks over it, so the panel and the repository can disagree indefinitely.
  - why it belongs: the owner named it in plain words.
  - evidence: "THE OWNER NAMED IT PLAINLY on 2026-08-15: 'we still have a problem that changes in the graph don't just instantly appear. If we change the graph, it should just instantly recompute.'"

- `raid-risk-a-drawn-token-that-reads-a-live-source-never-settles` — A mechanical token whose script reads a source that keeps moving re-opens every time anything changes.
  - why it belongs: a measured infinite-rework loop at a gate.
  - evidence: "THE KICKOFF GATE REFUSED TO SIGN TWICE in one session, and the onboarding retro was reopened twice, all for the same cause."

- `wt-keep-a-signed-form-valid-when-its-platform-adds-a-computed-r` — Keep a signed form valid when its platform adds a computed result afterward.
  - why it belongs: an amendment rule rather than a reopen rule, which is the owner's preference.
  - evidence: the statement itself.

- `wt-reshaping-a-system-can-leave-older-demands-untrue-and-no-ste` — Reshaping a system can leave older demands untrue, and no step in the walk asks which ones.
  - why it belongs: the ripple that runs upward into requirements, which nothing checks.
  - evidence: "One iteration lost most of a milestone lane to a constraint that was never a demand at all... It outlived four steps, an adversarial pass and a demand check before a single question dissolved it."

- `wt-a-signature-must-not-outlive-what-it-stands-for` — One stalled round holds a signed build form naming seven engine files; three are absent from the tree.
  - why it belongs: the failure mode a ripple rule that defers too long produces.
  - evidence: "three are absent from the tree, and five distinctive symbols it describes match nothing anywhere."

## 4. review and hands

- `wt-a-sketch-not-a-defect-and-it-needs-two-experiments-before-it` — The hand doing the work hands it in, a second hand closes it, and the position cannot be left until that second hand is satisfied.
  - why it belongs: this IS the owner's item 1, and it carries the strongest measured argument for it.
  - evidence: "THIS RETRO MEASURED THE STRONGEST ARGUMENT FOR IT: five checkpoints that got an independent cold reader all failed, and five that got none all passed." Blocked on: "whether a background reviewer really costs no wall clock, and what happens to a position whose reviewer never answers."

- `wt-every-piece-of-work-would-carry-a-failing-check-before-it-op` — Every piece of work would carry a failing check before it opens and a passing one before it closes, or say in writing why it can carry neither.
  - why it belongs: this IS the first half of the owner's item 1, word for word.
  - evidence: "None of that exists. The item has no field for the check, none for the exemption, and closing refuses on nothing but an empty comment. Red-before-green lives at one position's leaving script rather than on the work. THE HARD PART IS NOT THE FIELD, it is what proof means for something that is not code."

- `wt-three-closes-were-wrong-and-a-person-found-all-three-by-look` — Three closes were wrong and a person found all three by looking at a screen. No check found any of them.
  - why it belongs: the measured failure the reviewer exists to catch.
  - evidence: "The one path that closes work takes a status and a non-empty reason and asks nothing else. THE INSTRUMENT IS PROVEN AND POINTED ELSEWHERE: the checkpoint reviewer caught the same shape twice in one round, on a different unit."

- `wt-strictly-downstream-of-another-open-question-and-unjudgeable` — IF every piece of work proved its own failure first, the position whose only job is observing that failure might have nothing left to do.
  - why it belongs: the consequence of the owner's item 1 for the walk's shape, and the owner wanted the conversation.
  - evidence: "IT IS A CONVERSATION THE OWNER WANTED, never a deletion they ordered."

- `wt-a-second-hand-reviews-the-checkpoint-that-opens-a-piece-of-w` — A second hand reviews the checkpoint that opens a piece of work, and it may not be the hand that filled it in.
  - why it belongs: the review at the open end, matching the review at the close end.
  - evidence: "The reason is already on file as the stated purpose, the sketch, and the sources it grew from, so the comparison is mechanical rather than a matter of taste."

- `wt-owner-ruling-the-positions-whose-only-job-is-to-start-a-hand` — OWNER RULING. The positions whose only job is to start a hand are to be taken out. i64 is the round that takes them out.
  - why it belongs: it is the orchestrator half, and it is already routed.
  - evidence: `ready_when: ready when i64-the-diamond-and-the-orchestrator-handove is walked, because that round already rebuilds how a worker is started`

- `wt-a-hand-sent-to-walk-a-segment-can-find-that-segment-already-` — A hand sent to walk a segment can find that segment already signed by somebody else.
  - why it belongs: the orchestrator will hit this every run.
  - evidence: "One whole authored step was thrown away. Three fields landed on a checkpoint by accident... THE CHEAP GUARD IS A READ RATHER THAN A LOCK."

- `wt-two-of-our-own-rules-pull-against-each-other-the-moment-nobo` — One hand keeps custody, a second walks; the second rule forbids the custodian from ending its turn while work remains.
  - why it belongs: the orchestrator pattern is unsafe unattended today.
  - evidence: "Both hands now advance the same walk, each recomputing where it stands from one shared session, and they overwrite each other. WHAT IT COST, SEEN ONCE. One composed answer applied to the wrong position, four abandoned entries."

- `wt-stop-a-spawned-helper-from-moving-the-position-its-parent-is` — Every attached agent shares one walk, so a helper that pulls drags the parent somewhere it never asked to go.
  - why it belongs: fans out the moment the orchestrator spawns more than one.
  - evidence: "this was seen for real with three readers running at once."

- `wt-a-filled-form-travels-anonymously-it-carries-no-mark-saying-` — A filled form carries no mark saying which form it was written against.
  - why it belongs: two hands on one walk is exactly when this loses work.
  - evidence: "Three fields whose names appear on both documents were written onto a checkpoint nobody meant to touch. Two further fields... went nowhere at all and no message said so."

- `wt-the-running-work-summary-prints-a-call-for-checking-on-a-spa` — The running-work summary prints a call for checking on a spawned hand, and the position gate then turns that very call away.
  - why it belongs: the reviewer cannot be asked how it is doing from the state that spawned it.
  - evidence: "One position's own instructions tell the agent to spawn a fresh pair of eyes for testing. That same position permits three reading verbs and none of them reaches the spawned hand."

- `wt-recording-that-a-helper-was-launched-works-from-anywhere-ins` [PRE-ROUTED] — Recording that a helper was launched works from anywhere, instead of depending on which step the walk is standing on.
  - why it belongs: an unrecorded spawn never shows on the board.
  - evidence: "Two faults sit here and only one is mechanical: the driver can also simply forget, and nothing asks."

- `raid-risk-widening-a-verb-s-legality-weakens-the-state-gate` — Making the helper registration legal everywhere widens a verb that carries other powers.
  - why it belongs: the counter-argument to the item above.
  - evidence: the risk's own statement.

- `wt-the-guard-that-limits-how-many-walking-hands-a-record-may-ru` — The guard reads its limit from a checkpoint the record has not reached yet during its opening phase.
  - why it belongs: the orchestrator cannot start its first hand.
  - evidence: "Unreadable counts as zero, so the very first hand a record starts is already one over the line, and the walk cannot leave that position... A hand stood itself down to get through, which silences its own reporting."

- `wt-the-opening-phase-of-a-record-asks-for-a-helper-before-any-b` — The opening phase of a record asks for a helper before any budget for helpers has been agreed, so the request is always turned down.
  - why it belongs: same block, other end.
  - evidence: "Either the budget is agreed earlier, or the phase that asks moves later."

- `raid-a-hand-with-no-role-recorded-is-a-walker` — A registered hand carrying no role is counted as a walker, and reviewers are registered with no role.
  - why it belongs: an always-on reviewer would consume the walker ceiling.
  - evidence: "so a reviewer counts against a ceiling it was ruled to sit outside of."

- `raid-iss-the-spawn-check-refuses-the-answer-its-own-guidance-calls-legitimate` — A spawn state's roster refuses an unchecked box, so a phase that starts no hand cannot sign its own spawn state.
  - why it belongs: the spawn machinery blocks the honest answer.
  - evidence: "THE SUBMIT REFUSED under SE-C-112 with `hands: unchecked`... MINTING ONE ON THE SPOT WAS IMPOSSIBLE. The spawn state is read-only by design."

- `raid-risk-one-hand-authored-graded-and-commissioned-the-review-of-this-phase` — Two adversarial hands ran and both read a summary the author wrote rather than the artifacts.
  - why it belongs: names precisely how an on-call reviewer fails while looking like it worked.
  - evidence: "THE REVIEWERS NEVER READ THE ARTIFACTS. Each read a summary the author wrote into its brief. Anything left out of that summary could not be attacked."

- `raid-risk-every-settle-authority-in-the-design-is-the-hand-that-owes-the-work` — Three separate answers each hand a judgment to the same hand that owes the work.
  - why it belongs: the exact gap the reviewer integration closes.
  - evidence: the risk's own statement.

- `raid-the-reviewing-agent-has-no-use-case-of-its-own` — The gate's reviewing-agent pass has no standing use case of its own, though its stakeholder is mapped and the mechanism is live today.
  - why it belongs: the reviewer role needs specifying before it becomes always-on.
  - evidence: "`se_run` is legal in a gate state for exactly one reason: the gate registers its own reviewer hand, spawned cold, with no shared context, never weaker than the guide (owner ruling 2026-08-23)."

- `raid-risk-every-gate-in-this-record-is-blessed-by-its-own-author` — Every gate in this record is proposed and blessed by the same agent, so no gate carries an outside judgment.
  - why it belongs: the standing cost the reviewer buys back.
  - evidence: "A GATE IS A COMPARISON AGAINST AN OUTSIDE VIEW. Blessed by its author, it still runs every mechanical check the engine holds... and it loses only the part a second person brings."

- `raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker` — A submachine takes the maximum complexity over its items and walks every one of them on a walker sized for the hardest.
  - why it belongs: direct cost of the orchestrator's spawning rule.
  - evidence: "a single hard item multiplies its own cost by the number of easy items beside it."

- `wt-the-engine-keeps-hold-of-everything-it-launches-and-asks-eac` [PRE-ROUTED] — The engine keeps hold of everything it launches and asks each one, on a fixed interval, whether it is still there.
  - why it belongs: the watchdog the orchestrator needs, and the owner placed it here.
  - evidence: "Inspecting a stored record can only ever guess about something that has gone quiet; asking the thing itself does not guess." The retro's own note routed it: "the owner placed the watchdog in the next iteration on 2026-08-24".

- `raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet` — A heartbeat that ends what does not answer will eventually end a process that is working and simply has nothing to say.
  - why it belongs: the counter-argument to the watchdog above.
  - evidence: the risk's own statement.

- `raid-risk-two-closers-reach-one-entry-and-disagree` — A run closing its own entry and a heartbeat closing the same entry can reach it at once.
  - why it belongs: same mechanism, race condition.
  - evidence: "the second closer can reopen or double-count what the first already settled."

- `wt-a-large-result-written-to-disk-is-filed-under-the-name-of-th` — A large result written to disk is filed under the NAME OF THE VERB that produced it, one file per verb, overwritten each time.
  - why it belongs: parallel hands silently corrupt each other's reads.
  - evidence: "two hands calling the same verb at once destroy each other's cursor, and the second reader following the offered continuation silently receives a different document. Nothing refuses and nothing warns. THE SEVERITY IS THE SILENCE."

## 5. the turn itself

- `wt-announcing-that-a-turn-is-finished-and-actually-finishing-it` — Announcing that a turn is finished and actually finishing it should be a single act.
  - why it belongs: four calls where one belongs, on every single turn end.
  - evidence: "The guard only accepts a named reason after it has already pushed back once, which forces a four-beat sequence: the agent says it is done, gets refused, names its reason, and says it again."

- `wt-the-bookkeeping-around-the-work-stops-producing-two-in-every` — The bookkeeping around the work stops producing two in every five refusals.
  - why it belongs: the largest measured share of refusals coming from narration rather than work.
  - evidence: "Over one measured window of 2,124 calls, 41 of 102 typed refusals came from the progress-reporting mechanism rather than from the work itself... A fifth of all failures in the same window carried no clause code at all."

- `raid-iss-a-scripted-loop-cannot-pay-the-narration-toll` — The narration toll is owed per call, so a script that makes many lane calls is refused partway through with no honest line to narrate.
  - why it belongs: the toll blocks the exact loop this iteration will run to measure things.
  - evidence: "MEASURED 2026-08-19 during this retro's own log mining. SE-C-040 fired 15 times and SE-C-133 10 times, out of 129 refusals in the window... The first two attempts reported TOTAL 0 and TOTAL 40 against a true 129."

- `wt-the-once-a-minute-question-asks-about-duration-when-it-shoul` — The once-a-minute question asks about DURATION when it should ask about MATCH.
  - why it belongs: the nudge rides every call and asks the wrong question.
  - evidence: "One of three proposed nudges shipped... Nothing asks about a write made while nothing is in hand, and nothing compares the files being edited against the ones the work started on."

- `wt-being-told-to-keep-walking-is-worthless-advice-when-every-pl` — Being told to keep walking is worthless advice when every place that permits the needed verb lies behind you.
  - why it belongs: a dead end that costs a whole escape-and-return.
  - evidence: "One session had to remove a single file to undo something it had just created, and no destination ahead of it allowed removal; only the front-desk hatch produced a way through."

- `wt-standing-at-a-machine-s-final-position-with-a-document-still` — The walking verb blocks and points at itself as the way through. Following that advice returns the identical block, forever.
  - why it belongs: an infinite loop on the agent's only verb.
  - evidence: "Two calls were thrown away on 2026-08-25 before the advice was distrusted."

- `wt-check-that-the-fix-a-rejection-prints-can-actually-be-run-fr` — Every rejection carries an exact call to make instead, and nothing verifies that call is permitted in the state that raised it.
  - why it belongs: a followed remedy that hits a second wall costs two calls and a recovery.
  - evidence: "A reader who follows one and hits a second wall has been sent in a circle by the machine itself."

- `raid-route-remedy-can-repeat-refusal` — A route refusal remedy can repeat the same illegal transition instead of moving to the legal next state.
  - why it belongs: the same shape, measured live.
  - evidence: "After the i36 kickoff gate signing..."

- `wt-when-a-signature-is-turned-away-for-insufficient-authority-t` — When a signature is turned away for insufficient authority, the message reports the present level and omits its age.
  - why it belongs: measured cost in calls.
  - evidence: "Four calls went into auditing a perfectly correct signed form before anybody suspected the setting."

- `wt-permission-granted-by-the-person-is-lost-whenever-the-server` — Permission granted by the person is lost whenever the server process comes back, while the walk's location is preserved.
  - why it belongs: turns a restart into a false block.
  - evidence: "Twice inside a single day a silent restart returned a raised setting to its floor... the agent reported an obstacle that was actually forgetfulness."

- `wt-a-serving-process-that-dies-and-returns-puts-the-walk-back-w` — A serving process that dies and returns puts the walk back where it stood, not at the entrance.
  - why it belongs: a restart costing a whole re-entry.
  - evidence: "On 2026-08-25 one call failed with a transport error and the next answered from the very beginning, costing a wasted entry."

- `wt-restarting-the-engine-erases-the-running-commentary-s-open-i` — Restarting the engine erases the running commentary's open items, and the next entry naming one is refused for pointing at something unknown.
  - why it belongs: "That refusal reads exactly like a typing error, sending the author hunting for a mistake nobody made."
  - evidence: "Seen on the very first call after a restart."

- `wt-text-printed-by-a-block-has-to-work-when-somebody-follows-it` — One block instructs anyone missing a freshly built capability to restart the serving process, promising the capability will be there afterwards.
  - why it belongs: an instruction that cannot be carried out costs a full restart for nothing.
  - evidence: "Watched on 2026-08-25: the restart happened, the walk began again from the entrance, and the capability was still not callable."

- `wt-what-a-position-advertises-as-permitted-matches-what-the-gua` — What a position advertises as permitted matches what the guard actually allows.
  - why it belongs: a mismatch either blocks offered work or hides available work.
  - evidence: "Seen again on 2026-08-25: the advertised set was empty while seven verbs were in fact accepted."

- `wt-a-departure-check-goes-red-when-the-projected-prompt-layer-i` — The position whose entire job is repairing whatever the checks name does not hold the verb the message names.
  - why it belongs: a red that cannot be cleared from where it fires.
  - evidence: "WHO DOES HOLD IT. Three positions, all of them later in the walk."

- `raid-iss-boot-grants-no-tools-while-promising-repair` — boot/prepare_idle carries legal_tools of nothing at all, and its own guidance says the repair tools are legal there.
  - why it belongs: the first state of every session can hard-block.
  - evidence: "MEASURED ON THE i17 ARRIVAL, 2026-08-18. `prose-inspect.ts` is an exit script of `boot/prepare_idle`. It came back red with 64 findings. The pull answered: legal_tools: []."

- `wt-a-commit-that-lands-a-source-file-and-leaves-behind-the-file` — A commit that lands a source file and leaves behind the files made from it turns the next opening red.
  - why it belongs: a red inherited by whoever opens next, with a measured cost.
  - evidence: "Four calls went on getting from that red check back to a green one."

- `wt-mark-a-file-as-generated-and-have-the-writing-lane-rebuild-i` — Mark a file as generated, and have the writing lane rebuild it the instant its origin changes.
  - why it belongs: the machinery under the item above; the owner asked for it.
  - evidence: "That hands the agent a job the system could do using knowledge the system already holds, and it fires long after whoever caused it has gone."

- `wt-editing-a-rule-page-updates-the-generated-copies-by-itself-a` — Editing a rule page updates the generated copies by itself, and the agent is told what changed rather than asked to trigger it.
  - why it belongs: `ready_when: ready now — the owner ruled it on 2026-08-25 and every piece it needs already exists`.
  - evidence: "the only missing piece is the trigger. Today an agent must remember to run it, and forgetting turns into a red check some steps later."

- `raid-iss-the-lanes-argument-names-disagree-between-its-own-tools` — Tools in one lane take different names for the same thing, so a caller who has just used one guesses wrong on the next and is refused.
  - why it belongs: refusals that cost a call each, measured.
  - evidence: carries `1150 CALLS`, `13 times`, `8 times`.

- `raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not` — se_log_query drops records that match its filter and reports older 0 while doing it.
  - why it belongs: every measurement this iteration takes from the log is a floor, not a number.
  - evidence: "SAME FILTER, DIFFERENT ANSWERS. `{text: \"meth-find-the-fault\"}` returns `total: 7, older: 0`... Adding `since: \"2026-08-17T12:00:00Z\"` returns `total: 10, older: 0`. A narrower query found more." Carries `8424 calls`, `181 calls`.

- `raid-iss-the-log-serves-a-cut-response-while-the-guidance-promises-otherwise` — A result the host moved to disk is re-fetched by ref exactly as the lane's guidance instructs, and the log serves it back CUT.
  - why it belongs: the documented recovery path does not recover.
  - evidence: the issue's own statement.

- `wt-one-lane-call-should-report-the-state-of-every-piece-of-work` — One lane call should report the state of every piece of work running out of sight, each entry carrying a figure for how much longer it needs.
  - why it belongs: the orchestrator's own dashboard, and it pairs with the frozen-pull fix.
  - evidence: `ready_when: ready when the walking core is opened for the frozen-pull fix, which pairs with this as one design`

- `raid-iss-a-blocked-walk-can-kill-the-connection-instead-of-refusing` — A walk that cannot proceed sometimes closes the connection instead of answering with a typed refusal, and the failure reaches no log.
  - why it belongs: the worst possible turn ending, and it is invisible.
  - evidence: "What happened, three times. Entering i34 answered..."

- `wt-when-the-server-behind-the-lane-dies-nothing-counts-the-fail` — When the server behind the lane dies, nothing counts the failures and nothing says whether it will return.
  - why it belongs: "a caller retries forever with no clause, no remedy and nothing to act on."
  - evidence: "The guard that notices a refusal repeating is blind here, because a dead connection never arrives at the counter in the first place."

- `raid-mcp-stop-is-not-diagnosable` — An interrupted lane call does not reveal whether the MCP server, transport, host or stop hook ended it.
  - why it belongs: the turn ends and nobody can tell why.
  - evidence: "A pull was cancelled during i36."

- `wt-make-the-copilot-stop-hook-reject-a-final-response-whenever-` — Make the Copilot stop hook reject a final response whenever the active walk still has legal work.
  - why it belongs: the tooth on the other harness, which is not built.
  - evidence: the statement itself.

- `wt-return-a-required-state-form-in-the-same-entry-response-that` — Return a required state form in the same entry response that declares its required fields, without needing a second pull.
  - why it belongs: one call saved on every state that carries a form.
  - evidence: the statement itself.

- `wt-one-engine-holds-a-given-folder-and-its-network-port-or-the-` [PRE-ROUTED] — One engine holds a given folder and its network port, or the second one says plainly what it did when the port was already taken.
  - why it belongs: "Two engines sharing one folder while keeping separate memory means a decision held by one is invisible to the other."
  - evidence: "Four such processes stood on this machine in two pairs, started 47 seconds apart with identical arguments, and the same four still stood a day later."

- `raid-risk-two-engines-run-one-folder-and-neither-says-so` — Two engines can be started on one folder and one network port, and neither of them says that the other is there.
  - why it belongs: register twin of the item above.
  - evidence: "FOUR PROCESSES ON ONE MACHINE, 2026-08-24, in two pairs." Carries `47 seconds`.

- `wt-on-windows-the-shell-mangles-a-command-carrying-quotes-insid` — On Windows the shell mangles a command carrying quotes inside quotes, and the engine hands the string straight through without looking at it.
  - why it belongs: this iteration will write a lot of measuring scripts, on Windows.
  - evidence: "Neither repair the owner named exists: no escaping, and no spilling the command to a temporary file and running that."

- `wt-running-an-experiment-costs-more-in-machine-setup-than-in-th` — Running an experiment costs more in machine setup than in the question being asked.
  - why it belongs: this iteration is mostly experiments.
  - evidence: "One measured case: four attempts, three of them lost to interpreter naming, file encoding and patch mechanics, none of which touched the design under test."

- `raid-risk-one-blanket-bound-is-given-to-work-nobody-measured` — Every wait site takes the same thirty-minute default, so the bound measures duration rather than trouble and no site has yet chosen its own.
  - why it belongs: the walking rules name this entry by id as the reason every estimate says `default`.
  - evidence: `guidance/walking.md` cites it as `raid-risk-one-blanket-bound-is-given-to-work-nobody-measured`.

- `wt-the-turn-ending-guard-reports-a-check-still-running-that-not` — The guard reads only the folder and never asks the live table, so a record and a process are never compared.
  - why it belongs: a phantom running check holds a turn open.
  - evidence: "A thirty-minute window caps the damage rather than removing it."

## 6. step size

- `wt-the-field-that-would-say-how-hard-a-piece-of-work-is-never-r` — The field that would say how hard a piece of work is never reaches disk.
  - why it belongs: nothing can be sized, routed, budgeted or estimated until it lands.
  - evidence: "It is declared on the item and written as an empty string by the one path that mints, so 33 of 33 items on disk carry it not merely blank but absent. The two timestamps beside it ARE written, so the duration half is free the moment the other half is filled."

- `wt-every-building-milestone-would-spend-a-small-fixed-budget-cl` — Every building milestone would spend a small fixed budget clearing old work, pulled from the standing pile rather than from the round's own scope.
  - why it belongs: the mechanism that drains the 172-item pile, and it is blocked on the item above.
  - evidence: "The pile it would draw from does exist and is now 172 items deep, so the supply is not the problem. THE BLOCKER IS THAT NOTHING SAYS HOW BIG A PIECE OF WORK IS."

- `raid-iss-the-pool-has-no-exit-door-so-no-token-can-be-routed-to-its-owner` — Every one of the 172 work tokens in the pool now has a named owner, and not one of them can be moved to it.
  - why it belongs: this iteration cannot draw its own scope out of the pool.
  - evidence: "`deliverable/engine/pool.ts` exports `mintToken` and `standingTokens` and nothing else. No verb moves a token, edits one or removes one. And `guardNoSecondDoor` refuses every write into the pool that is not a mint."

- `wt-a-retro-s-future-scope-findings-land-in-a-pile-nothing-deliv` — A retro's future-scope findings land in a pile nothing delivers, and a record's opening step never draws them down.
  - why it belongs: same block, from the retro's side.
  - evidence: "THIS RETRO IS THE PROOF: 172 tokens were routed to owners on paper and not one could be moved, because the door out does not exist."

- `wt-nothing-anywhere-removes-a-token-from-the-pool-two-functions` — Nothing anywhere removes a token from the pool. Two functions read it and one adds to it, and no third exists.
  - why it belongs: the pile only grows, and i63 added an inlet.
  - evidence: "Since i63 the situation is slightly worse rather than better: work a hand left unfinished is now carried INTO the pool when its position closes, so the pile has a new inlet and still no outlet."

- `raid-iss-the-offer-withholds-every-piece-of-work-because-nothing-rates-it` — The offer withholds work whose difficulty is unpublished, no state publishes one, and so every token measured is withheld.
  - why it belongs: the routing mechanism is inert.
  - evidence: "the offer hands nothing".

- `wt-not-one-of-the-63-matrix-rows-carries-a-rating-so-every-piec` — Not one of the 63 matrix rows carries a rating, so every piece of work minted from them comes out unrated.
  - why it belongs: the person's own input that unblocks the two above.
  - evidence: "THIS IS A DECISION BLOCKED ON SOMEBODY, not a defect."

- `raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated` — The engine refuses a missing complexity at the point of use rather than when the matrix is loaded.
  - why it belongs: same block, register side, with the count.
  - evidence: "turning the load-time refusal on before the 154 active cells are rated would make the product unloadable."

- `raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so` — A complexity rung is authored once and never contradicted by anything, so a state rated too high spends the difference on every walk forever.
  - why it belongs: over-provisioning is the silent half of the cost.
  - evidence: "UNDER-DECLARATION FAILS LOUDLY AND OVER-DECLARATION FAILS SILENTLY... ASK FOR TOO MUCH AND NOTHING HAPPENS EXCEPT THAT YOU PAY."

- `raid-asm-a-state-is-equally-hard-at-every-change-size` — A row's difficulty varies with change size while the design gives each row ONE complexity value.
  - why it belongs: the size model itself is wrong.
  - evidence: "The SPREAD is established; the NON-MONOTONICITY this entry first claimed was manufactured by quoting half a note and is withdrawn."

- `wt-give-each-record-two-numbers-and-one-list-of-open-questions-` — Give each record two numbers and one list of open questions, then route by them.
  - why it belongs: sizing at the record level, and the owner asked for it to shape the records seeded after the retro.
  - evidence: "Sorting by both splits the queue three ways: what a machine finishes alone, what it finishes once the owner has answered the open questions up front, and what needs somebody watching while it runs."

- `wt-the-store-already-carries-both-fields-needed-to-nest-a-large` — The store already carries both fields needed to nest a large piece of work under its parts, and the editor reads neither.
  - why it belongs: sub-tokens are how a step too big to complete gets cut, and no surface shows them.
  - evidence: "A parent field and a children field are declared on the item and the only code touching them splits paths. So there is no preview, no collapsing and no nesting on any surface."

- `wt-a-chart-row-is-currently-a-whole-group-of-functions-which-is` — A chart row is currently a whole group of functions, which is far too broad to be one choice.
  - why it belongs: a step too big to answer, with a measured instance.
  - evidence: "One round put all thirteen of its ideas into a single row, with six independent questions separating them, so the combinations the chart exists to generate could not be written down at all."

- `wt-a-whole-milestone-can-be-walked-without-anybody-reading-what` — A whole milestone can be walked without anybody reading what the round is actually for.
  - why it belongs: the summary substitutes for the scope, so step sizes are measured against the wrong thing.
  - evidence: "Scanning every position's entry demands, exactly ONE mentions the record at all, and that one is incidental."

- `raid-risk-work-only-a-person-may-settle-now-holds-the-walk-shut` — A person-only item is open work no agent may settle, so one such item parks the walk until somebody who is not the agent acts.
  - why it belongs: a hard stall introduced by i63's own rule.
  - evidence: "LEAVING USED TO SETTLE EVERYTHING OPEN and skip the person-only ones... NOW IT HOLDS."

- `raid-risk-the-exit-rule-can-be-satisfied-by-moving-work-rather-than-doing-it` — The exit rule accepts a token that moved elsewhere, and two documented destinations do not block.
  - why it belongs: the escape valve for a state too big to finish, and it undoes the rule.
  - evidence: "STRIKE THE RULE AND DESCRIBE THE PRODUCT TRUTHFULLY. It would be a filing system for work tokens, not a machine that holds a walk to them."

- `wt-opening-work-whose-statement-matches-something-already-close` — Opening work whose statement matches something already closed at that position succeeds, returns an empty id, and puts nothing anywhere.
  - why it belongs: a silent no-op on the verb the contract makes the default act.
  - evidence: "IT SUCCEEDS, which is the whole problem — a refusal would at least say what happened. The failing expression is one line."

- `wt-a-running-engine-holds-one-open-piece-of-work-at-a-time-ente` — A running engine holds one open piece of work at a time. Entering a second is refused with a message that says which one is held.
  - why it belongs: the owner's ruling on how work switching should behave.
  - evidence: `ready_when: ready when the seeding and entry path is next opened, and the owner ruled it on 2026-08-25`

- `raid-risk-an-ephemeral-token-dies-on-restart-and-work-underway-has-no-home` — A restart deletes every ephemeral token, so anything marked in work outside a record loses the only record that it was underway.
  - why it belongs: the drained note recorded a real specimen already lost this way.
  - evidence: "the token deliberately left standing was ephemeral and went when its position was left, so no reader can now open the case this note was written about" (`.se/notes.jsonl`, 2026-08-28 drain).

- `wt-a-parked-item-whose-moment-has-arrived-announces-itself-rath` — A parked item whose moment has arrived announces itself, rather than waiting to be remembered.
  - why it belongs: the 16 pre-routed tokens for this iteration will not announce themselves when it is seeded.
  - evidence: "Ninety-two stand in the pool and at least three name a moment already past; one of those names a round that has since started, run and shipped."

- `wt-sixteen-parked-items-name-one-record-as-the-moment-they-shou` — Sixteen parked items name one record as the moment they should come back. Not one of them was collected.
  - why it belongs: exactly what will happen to this iteration's 16 unless the mechanism is built.
  - evidence: "That record was opened, walked and finished on 2026-08-24, and not one of them was collected... a condition naming a record has to fire when the record is SEEDED." `ready_when: ready now`

- `wt-an-idea-whose-own-dependency-is-unmet-a-checkpoint-would-jud` — A checkpoint would judge every piece of work finished in its phase against what actually changed in the tree, rather than against a form somebody filled in.
  - why it belongs: the gate half of the owner's item 1.
  - evidence: "Nothing links a piece of work to a change today — the item carries no diff, no review and no delta field."

## maybe

- `raid-iss-the-running-lane-is-not-the-code-the-walk-is-editing` — The lane process loads the engine once at start and never reloads it.
  - unsure because: it reads as a correctness defect, not a speed one.
  - but: it invalidates every measurement taken inside a walk, which is the whole first milestone. Evidence: "`deliverable/package.json` says version `6.0.0`. Every record the call log wrote today says `\"se_version\":\"5.0.0\"`... Across 16,157 records in this window, the count carrying that stamp is ZERO."

- `wt-a-way-exists-to-make-one-engine-call-take-a-long-time-delibe` — A way exists to make one engine call take a long time deliberately, for use by checks.
  - unsure because: it is a test affordance rather than a speed-up.
  - but: two latency rows are blocked on it. Evidence: "Two planned rows need it and neither can proceed."

- `raid-iss-the-surface-row-has-no-harness-that-could-fail-it` — A requirement demanding that a surface answers no worse while the engine is busy has no check that could ever fail it.
  - unsure because: same affordance, stated as coverage.
  - but: it means the surface-under-load bound is unmeasurable today.

- `raid-asm-one-second-resolution-is-enough-to-time-a-lane-call` — The one-second convention that bounds every modelled interface is fine enough to time a lane call.
  - unsure because: it is a measurement-unit question, not a repair.
  - but: the hop budget in `wt-one-hop-...` is a twentieth of a second, so the convention has to be re-decided. Evidence: carries `0 ms`, `1 ms`, `580 ms`, `1712 ms`, `2275 ms`, `290 calls`, `6.6 percent`.

- `raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work` — The agent-to-entrypoint bound of one second is measured against every lane call, including the verbs whose whole job is to spawn a process and wait for it.
  - unsure because: it may be a definition fix rather than a speed fix.
  - but: it is why the breach counts are unusable. Evidence: carries `2421 ms`, `1903 ms`, `3903 ms`, `111765 ms`, `1456 tests`.

- `raid-ar-work-past-its-bound-says-it-is-working` — The signal cannot see the operations that breach.
  - unsure because: it is about the honesty signal, not the duration.
  - but: it carries the breach count. Evidence: "the harness-to-entrypoint bound was breached 93 times in one day, worst 20.5 seconds, typical 2 to 4."

- `raid-un-a-slowness-signal-never-shortens-the-wait` — The design spec deliberately leaves what the signal says undecided, and the measure has never been executed.
  - unsure because: the decision is the owner's and it is about wording.
  - but: it is the smoothness half of the owner's framing.

- `raid-risk-an-honest-slow-interface-becomes-noise-nobody-reads` — Requiring every slow interface to say so could produce a stream of progress messages the person stops reading.
  - unsure because: it is a design risk against the smoothness work, not work itself.
  - but: it is the standing counter-argument. Evidence: carries `324 times`, `1.1 seconds`.

- `raid-risk-an-accurate-progress-signal-can-drive-abandonment` — The most accurate progress bar produced the highest abandonment.
  - unsure because: the primary source was not seen.
  - but: it argues directly against a ruling already made. Evidence: "the slow-to-fast bar... produced the highest abandonment rate at 21.8 percent. PRIMARY NOT SEEN."

- `wt-show-which-boot-preparation-check-is-active-when-the-desk-pr` — Show which boot preparation check is active when the desk preparation takes longer than a normal pull.
  - unsure because: it is a display item.
  - but: boot is the slowest measured stretch and this makes it diagnosable.

- `wt-retire-the-http-page-server-and-leave-the-editor-sidebar-as-` — Retire the HTTP page server and leave the editor sidebar as the only place a person looks.
  - unsure because: it is a UI consolidation, owned by i23.
  - but: `ready_when: ready when somebody starts the next piece of engine work — the owner named it the first thing after this retro`.

- `wt-the-editor-panel-is-the-single-place-that-counts-and-any-oth` [PRE-ROUTED] — The editor panel is the single place that counts, and any other renderer is incidental.
  - unsure because: it reads as a UI ruling.
  - but: it is pre-routed to this iteration and it cuts 21 emitters. Evidence: "Twenty-one stray emitters get sorted on that one question."

- `wt-the-matrix-rows-served-to-a-reader-match-the-rows-on-disk-a-` [PRE-ROUTED] — A check currently reads 126 where 63 stand, and a companion view reads 34 where 68 are listed.
  - unsure because: it is a correctness defect, not a latency one.
  - but: it is pre-routed here, and the doubled read is a likely cost. Evidence: "Each figure is off by a clean multiple, so one fault is likelier than two limits drifting apart."

- `wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words-` [PRE-ROUTED] — A score cell with no evidence behind it may say so in words, and the ranking maths then treats that cell as absent rather than as a value.
  - unsure because: it is scoring correctness, not speed.
  - but: pre-routed here by the retro's own drain.

- `raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker` — The consistency sweep was rewired to run after the demonstrations rather than beside them.
  - unsure because: recorded as a method concession.
  - but: it is lost parallelism, taken to route around an engine defect. Evidence: "the method lost a parallel branch to get past an engine defect."

- `raid-walk-all-fans-manual` — Covering a fan took one manual pass per branch, because the route found the nearest path rather than every path the gate collects.
  - unsure because: marked mitigated.
  - but: it is per-branch manual work on a fan, which the orchestrator will multiply.

- `wt-a-disposable-machine-cannot-carry-anything-into-its-own-open` — A disposable machine cannot carry anything into its own opening look-back.
  - unsure because: it reads as a cloud correctness item.
  - but: the owner asked for a skippable-position mechanism, which is step-size machinery. Evidence: "WHAT THE OWNER ASKED FOR is a mechanism, not another paragraph of advice."

- `wt-checks-do-seed-a-record-and-each-builds-its-own-throwaway-ro` — WHAT IS MISSING IS A SACRIFICIAL RECORD sitting where the product itself looks.
  - unsure because: it is test-fixture design.
  - but: "Today nobody exercises the machinery without walking a genuine round, so faults surface in real work rather than in a fixture" — which is exactly what makes a walk slow.

- `wt-two-connected-changes-about-throwaway-programs-first-the-mac` — The machine should test at start-up which outside interpreters this computer actually carries; the look-back should turn repeated throwaway programs into proper tools.
  - unsure because: half of it is a retro process change.
  - but: this iteration will write many measuring scripts.

- `wt-a-boundary-between-two-parts-can-be-designed-specified-and-n` — A boundary between two parts can be designed, specified and never built, and both checks pass over the hole.
  - unsure because: it is a plan-completeness check, not speed.
  - but: it carries the biggest waste figure in the corpus. Evidence: "THIS IS EXACTLY WHAT COST ONE ROUND 43% OF ITS CALLS: seven chunks were planned, none of them connected the new store to the walk, and the whole thing shipped inert."

- `raid-the-read-proof-locks-weaker-models-out-of-the-system` — Weaker models cannot produce the boot reading proof at all.
  - unsure because: it is a capability gap.
  - but: routing cheap states to cheap hands is a speed and cost lever, and this shuts the door on it.

- `raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all` — Routing a cheaper driver to a cheaper state is worth nothing while a weaker model cannot boot.
  - unsure because: a dependency, not work.
  - but: it names what has to move first for the cheap-hand lever to pay.

- `wt-a-person-who-confirms-having-finished-a-document-does-not-th` — A person who confirms having finished a document does not thereby satisfy the demand for it.
  - unsure because: it is about driving without an agent.
  - but: "a person is halted at the first document on any route" is the smoothest possible failure of smoothness.

- `wt-evidence-produced-during-the-first-two-milestones-is-never-w` — No state in the first two milestones declares the version-control verb, so everything sits unsaved until a much later checkpoint.
  - unsure because: it reads as durability, not speed.
  - but: on ephemeral hardware it costs a whole re-walk. Evidence: "an interrupted session loses every form it signed."
