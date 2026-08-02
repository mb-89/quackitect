# Handover — from the cowork session, 2026-08-02

Written outside the walk (Claude, cowork session, with the owner), for the
agent walking v3. Everything referenced sits beside this file in
workspace/_incoming/. Nothing in your tree was touched.

## What happened while you walked

The owner and I read the harvest: 17,359 lane calls, 2,589 of them se_run,
46% of those improvised text tools — Select-String standing in for the
searcher, Get-Content for the reader, Set-/Add-Content for the writer. Your
own morning showed the sharpest case: ~60 full selftest batteries in two
hours, each piped to $env:TEMP and grepped for one failure. None of this is
a reproach — every one of those calls was the lane lacking a verb, and the
shell being the only door left open. The patch closes the gap from the lane
side first.

## The patch: lane-verbs.patch (v2 — supersedes any earlier copy)

One commit, 6 files, +1356/−72. In short:

- se_file_patch grows four verbs: {append|prepend: true, new_string};
  {pattern, replacement, flags?, expect_count?} (always global, count
  reported, 0 matches refuses); {at: {from_line, to_line}, new_string,
  base_hash} (hash REQUIRED — a line number only means something against
  the version you read). CRLF/LF mismatches now APPLY in the file's own
  endings and announce themselves in a `corrected` field instead of
  refusing (SE-C-105 still fires for real differences).
- se_file_search grows context: N (marked context lines, rg --json),
  before:/after: (asymmetric), include: "**/*.ts", count_only: true.
- se_run gets the discipline ladder (engine/discipline.ts): a command doing
  a lane tool's job runs ONCE with a lane_warning on the result, then the
  category refuses SE-C-129 with the lane call as remedy. The valve:
  no_tool_reason runs it once and files your reason — when the classifier
  is wrong or a verb is missing, SAY SO THERE; the reasons are the next
  verbs' backlog. Counters persist in .se/discipline.json.
- se_test runs SCOPED: {files: ['pull'], name_pattern?} → structured counts
  plus only the failures' detail. No temp file, no grep — the failure
  detail you used to dig out of $env:TEMP arrives on the result. A bare
  se_test (battery) is EARNED: it refuses SE-C-131 while every change since
  the last green battery maps by name to a test file, and the refusal hands
  you the exact scoped call computed from the diff. Piecemeal past a third
  of the suite flips the other way — the battery becomes the sanctioned,
  cheaper call. SE-C-130 refuses any scope over an unchanged tree.
  force: true overrides both gates (flake hunts).

Verified in the cowork sandbox (Linux, node 22.22): 30/30 new tests green
(tests/discipline.test.ts), files.test.ts unaffected, tsc adds ZERO new
errors over the 10 pre-existing mid-work ones. NOT verified: Windows, the
full battery, preflight/selftest.

## What to do with it

1. Seed or enter an expedition; sync it.
2. `git apply workspace/_incoming/lane-verbs.patch` (or `git am` to keep
   the message) in the worktree.
3. CHECK THE SEAMS FIRST: the diff was cut against the 2026-08-02 morning
   state of errors.ts, files.ts, search.ts, tools.ts (mtimes verified
   unchanged at cut time). If you have since edited the se_run / se_test /
   se_file_patch / se_file_search blocks in tools.ts, expect fuzz there —
   resolve by hand, the blocks are self-contained.
4. If SE-C-129/130/131 are already claimed by other work: renumber in
   errors.ts + discipline.ts + tests/discipline.test.ts (grep the codes).
5. Run tests/discipline.test.ts scoped, then the battery (it will be your
   first — no memory, so it runs), then land through the lane.
6. AFTER LANDING, RESTART THE SE SERVER before trusting the new schemas —
   the running server holds the old tool surface.

## Owner rulings this session (fold into guidance where they belong)

- CORRECT WHAT IS MECHANICAL, ANNOUNCE WHAT YOU CORRECTED, REFUSE ONLY THE
  AMBIGUOUS. (The CRLF auto-correct is the template. A silent correction
  teaches nothing; a refusal over an invisible difference wastes a round.)
- ONE TABLE, THREE OUTPUTS: enforcement, its warning text, and the tool
  description generate from one source (LANE_RULES → classifier + refusal
  + se_run description), so feed-forward and feedback cannot drift.
- SHIP AT WARN, BLOCK ON EVIDENCE: no category flips to threshold-0 until
  calls.jsonl shows its warn-rate near zero AND the lane demonstrably
  serves the job (the tests category only earned its block with scoped
  se_test in this very patch).
- THE BATTERY IS THE EXCEPTION. Scoped runs are the default; the battery is
  earned by an unmapped change, a red standing, the flip, or force.
- THE AGENT THINKS ABOUT THE WORK; THE ENGINE THINKS ABOUT THE BOOKKEEPING.
  Every protocol element that consumes agent attention the engine could
  carry instead is a defect with a deadline. (route_reads, the update
  ruling, and the auto-correct are prior instances of the same law.)
- QA, when it comes, is a PEER ROLE, not a subagent: a gate refuses → the
  engine assembles the packet (reading-loop style) → a FRESH session with a
  qa role and its own thin toolset reads it → files a typed verdict → the
  gate opens. Roles are tool grants: worker sessions simply lack the
  verdict tool. First gate: land. Every QA catch gets asked "could a rule
  have caught this?" — yes means it migrates into the engine.

## For the system's notes / prompts (owner asked these be recorded)

- voice.md → OUTPUT STYLE, GENERATED: the extension already places cage
  files on activation; add one step that reads product/guidance/voice.md,
  prepends the 3-line frontmatter, writes workspace/.claude/output-styles/
  voice.md, and sets "outputStyle": "voice" in the placed settings. Voice
  stays single-source; the style is a projection and cannot drift. Once
  live, consider dropping voice.md from boot reading — the prompt layer
  survives compaction; boot gets shorter.
- claude-settings.proposed.json (beside this file): the current cage plus
  model pin, alwaysThinkingEnabled, MAX_THINKING_TOKENS. Diff against
  workspace/_cage/claude-settings.json; adopt deliberately. A/B it: two
  sidebar sessions, same kickoff, compare the first ~20 calls in the log.
- se-terse.output-style.md is a DRAFT for the owner, superseded by the
  voice.md projection above — mine it for the two mechanical lines (show
  banners verbatim; PROSE_WALL shape) if voice.md lacks them, then discard.
- PATH-ESCAPE REMEDIES SHOULD NAME THE DOOR: a SE-C-102 refusal should say
  "if this folder should be reachable it belongs in .se/roots.json (ask
  the owner); v1/v2 history is reachable via ref:". Measured driver: a
  large share of shell reads/searches were reaching the v2 sibling.
- Consider whether count_only searches still owe an `intent`.
- The engine→test map is filename-only (engine/pull.ts ↔ pull.test.ts).
  Modules tested under other names read as unmapped and legally buy the
  battery; add an explicit map table if the retro shows it leaking.
- Small lesson from building this: suiteFiles' try/catch swallowed a
  missing-import ReferenceError and returned [] — a catch that broad hides
  defects. Worth a lint thought someday.

## Inventory of workspace/_incoming/

- lane-verbs.patch — the commit (v2).
- NOTES.md — the patch's own notes (risks, follow-ups, verification).
- HANDOVER.md — this file.
- claude-settings.proposed.json, se-terse.output-style.md,
  SIDEBAR-NOTES.md — owner-facing config proposals, not for the walk.

Land it well. The lane is better than it was this morning — make the shell
miss you.

## Addendum (same day, later): ICM, and guidance budgets

The owner surfaced ICM — "Interpretable Context Methodology"
(github.com/txmyer-dev/icm): folder-structured workflows, markdown
"contracts" per stage, layered context loading with token budgets. Verdict
after reading it: it is the UNENFORCED version of this system — a Skill
wearing a methodology costume; conventions, no engine, no evidence. Keep
the name as a search keyword: when describing this project, "folder
workflows + markdown contracts" is now the market's phrase for the passive
end of our spectrum.

Two things it sharpened, both settled with the owner and belonging to the
voice-matrix/lint lane, NOT to the patch:

- A `size` ROW for the voice matrix. Budgets are per content KIND — the
  matrix's column axis is the budget axis. Proposed cells: guidance fields
  ~100 words must@write; documents soft 1,200 tokens should@review, hard
  2,000 must@review with the remedy "split into a folder cluster"
  (walking.md → guidance/walking/*.md — the v1/v2 classes-by-folder
  pattern, revived). Today four documents exceed the hard cap: walking,
  voice, authoring/machines, software. Folder clusters over section
  routing, deliberately: small files ARE section routing, and pull-by-file
  plus hash-per-file keep working unchanged. Follow-through owed: the pull
  config must address cluster members (note-f568ad9cd8a4 already demands
  this).
- Bind the existing STE rows hardest on the `guidance` column
  (ste-sentences → must@write there; the 20-word cap is tier-one
  countable). Documents keep should@review so teaching prose keeps its
  registers — the Diátaxis row already rules that split. A telegraphic
  ("caveman") register for state guidance is an EXPERIMENT, not a rule:
  rewrite one much-walked state, A/B against the log, adopt only if
  calls-per-outcome improves.

## Addendum 2: the afternoon's diagnosis, and the stance ruling

MEASURED FROM THE LIVE LOG (13:00–13:22Z): nine foreground
Start-Sleep-100s calls hand-polling background test jobs — ~15 minutes of
one hour asleep — plus repeated re-runs of the same green test files, plus
boot.test.ts at 425 seconds because suite boot walks read the REAL
guidance corpus, so the battery grows with every guidance file. The patch
now answers the first two mechanically: se_run {job, wait_ms} (the wait
returns the moment the job exits), a 'waiting' lane rule, the green-streak
nudge on se_test results, and battery timeout raised to a configurable
600s. The third is yours to fix in the suite: boot ONCE per suite run and
share the template, and let test boots read FIXTURE guidance, not the
production corpus — otherwise the battery's cost scales with the book.

THE STANCE RULING (owner, 2026-08-02, verbatim intent): overcautiousness
costs more than wrong guesses. If told to remove everything, remove
everything — note your objection, act, report after. Disagree and commit.
Unsure? se_note {priority} and KEEP WALKING. Mid-work is not the place to
discuss; retros and the front desk are. Mechanically: the ONLY sanctioned
stop is the machine's own (SE-C-113 threshold, a gate, or idle) — a
question to the owner outside those is an unsanctioned stop. The engine
cannot see chat questions, so enforcement is (a) the packet/output-style
layer carries the rule on every turn, and (b) the retro measures it: walk
stalls in calls.jsonl (long gaps in an open work state with no note filed)
are countable. Add the rule to the voice output style when it lands; count
stalls at the next retro before tightening further.
