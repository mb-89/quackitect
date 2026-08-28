---
id: wt-speed-up-latency-the-candidates-the-last-round-s-own-call-lo
type: "[[work-token]]"
statement: |-
  Speed-up, latency: the candidates the last round's own call log paid for.

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

  HOW THE WHOLE SET WAS ARRIVED AT.

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
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

Speed-up, latency: the candidates the last round's own call log paid for.

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

HOW THE WHOLE SET WAS ARRIVED AT.

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

## When it comes back

ready when the speed-up round scopes its build
