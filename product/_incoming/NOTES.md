# lane-verbs.patch — handover notes

Written 2026-08-02 by the cowork session (Markus + Claude), outside the walk.
Apply in a proper expedition worktree through the lane: `git apply
workspace/_incoming/lane-verbs.patch` (or `git am` to keep the message),
then run the suite.

## What this is

The verbs the shell fallback was standing in for, grounded in the harvest of
.se/calls.jsonl (17,359 calls; 2,589 se_run, 46% improvised text tools):

- **engine/files.ts** — se_file_patch grows four verbs beside exact-match:
  - `{append: true, new_string}` / `{prepend: true}` — the 285 Set-/Add-Content
    shell writes, absorbed. Newline seam handled and NAMED on the result.
  - `{pattern, replacement, flags?, expect_count?}` — sed inside the lane:
    always global, count reported, expect_count checked, 0 matches refuses.
  - `{at: {from_line, to_line}, new_string, base_hash}` — line-range replace;
    base_hash REQUIRED (a line number only means something against the
    version you read).
  - CRLF/LF auto-correct: the commonest patch refusal (0-occurrence from
    invisible line endings) now APPLIES in the file's own endings and names
    the correction in a new `corrected` field. Whitespace near-misses still
    refuse.
- **engine/search.ts** — `context: N` (rg --json parse, context lines marked
  `context: true`), asymmetric `before:`/`after:` (the Select-String
  `-Context 1,6` shape), `include: "**/*.ts"`, `count_only: true`. All also
  at a ref via git grep (best-effort parse there; noted in the source).
- **engine/discipline.ts** (new) — the rule table + ladder + test gate:
  - ONE TABLE, THREE OUTPUTS: classifier, warning/refusal text, and the
    se_run description all generate from LANE_RULES — feed-forward and
    feedback cannot drift apart.
  - Ladder: first classified se_run command per category RUNS with a
    `lane_warning` on the result; from then on the category refuses
    SE-C-129 with the lane tool as the remedy. Counters persist in
    .se/discipline.json — stricter across sessions, no amnesia.
  - Valve: `no_tool_reason` runs it once and FILES the reason (same json)
    — a frequent reason is the lane's next verb; abuse is visible.
  - Test gates, per scope: an unchanged tree refuses SE-C-130 quoting the
    standing verdict (GREEN/RED + when); `force: true` is the flake door.
    Fingerprint = HEAD + dirty list + dirty sizes/mtimes, EXCLUDING .se and
    .worktrees (session state moves every call; counting it would mean the
    gate never fires).
  - THE BATTERY IS EARNED (owner ruling 2026-08-02; measured: ~60 full
    selftest runs in one two-hour session): se_test {files: ['pull'],
    name_pattern?} runs scoped with STRUCTURED results — counts plus only
    the failures' detail, killing the >temp-then-grep workflow. A bare
    se_test (battery) refuses SE-C-131 while every change since the last
    green battery maps by name to a test file — the refusal hands over that
    exact scoped call, computed from the diff. Unmapped change, red battery,
    no battery memory, or force: battery runs. THE FLIP: past a third of the
    suite piecemeal (floor 6 distinct files), scoped runs refuse TOWARD the
    battery and the battery is granted — gaming the scope rule is never
    profitable, because approximating the battery makes the battery legal.
- **engine/errors.ts** — SE-C-129 RUN_LANE_JOB, SE-C-130 TEST_UNCHANGED,
  SE-C-131 TEST_SCOPE.
- **engine/run.ts** — jobWait: se_run {job, wait_ms} blocks on the job's own
  done-promise and returns the MOMENT it exits (capped 120s). Measured need:
  ~15 min of one hour burned in 100-second Start-Sleep calls hand-polling a
  background job. A 'waiting' lane rule classifies Start-Sleep/sleep and
  points at the wait verb.
- **Green-streak nudge** — testRecord counts consecutive greens per scope;
  from 3 up, the result carries green_streak + the owner's law: in ~95% of
  cases the change broke nothing; test to answer a question, not to
  reassure. A red resets the streak.
- **Battery timeout** — 150s killed the battery mid-run now that boot walks
  read real guidance (boot.test alone measured 425s). SE_TEST_TIMEOUT_MS
  (default 600s) for battery scripts, SE_TEST_SCOPED_TIMEOUT_MS (default
  150s) for scoped runs.
- **engine/tools.ts** — schemas + front-loaded descriptions for
  se_file_patch / se_file_search / se_run / se_test; se_run handler judges
  before spawning; se_test records its verdict.
- **tests/discipline.test.ts** (new) — 33 tests, incident-style. All green
  on Linux/node 22. files.test.ts still 25/25 of its real checks.

## Verification status (cloud Linux, node 22.22, tsc 5.x)

- tsc: zero NEW errors (baseline had 10 pre-existing from mid-work files —
  bases.ts, iterations.ts, machines/compile.ts, session.ts, tools.ts).
- Not run here: the full suite on Windows, preflight/selftest, anything
  needing the product tree (this workspace held a partial clone).

## Known merge risks

- tools.ts was diffed against the 2026-08-02 morning state (mtime checked at
  patch time — unchanged). If the walking agent has since touched the se_run
  / se_test / se_file_patch / se_file_search blocks, expect fuzz there.
- SE-C-129/130/131: if another expedition claims those numbers first, renumber
  in errors.ts + discipline.ts + tests/discipline.test.ts (3 files, grep'able).
- rules for the ladder live in LANE_RULES (discipline.ts) — thresholds are
  per-rule and owner-tunable; every warning/refusal logs rule id + category
  through the normal call log, so precision is measurable from calls.jsonl
  before tightening any category to threshold 0.

## Follow-ups deliberately NOT in this patch

- Path-escape remedies pointing at .se/roots.json / ref reads (the v2-sibling
  escape driver) — one-line remedy edits, better done by the walking agent.
- se_file_search description still demands `intent`; consider whether
  count_only warrants relaxing it.
- Warn-phase telemetry threshold flips (warn → block at 0) once calls.jsonl
  shows a category's warn-rate at zero. Per the owner: ship at warn first,
  add blocking after the lane has proven it serves the live agent's jobs
  (esp. the tests category — its lane answer only exists as of this patch).
- The engine→test name map is by filename only (engine/pull.ts ↔
  tests/pull.test.ts). Modules whose tests live under a different name
  (e.g. render.ts ↔ feed/grouping/...) read as UNMAPPED and legally buy the
  battery — an explicit map table would tighten that if the retro shows
  it leaking.
