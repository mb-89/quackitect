---
minted_in: i1
id: dsp-quality-toolchain
type: "[[design-spec]]"
statement: the mechanical quality floor, carried by the battery scripts, the inspection runners, the voice lint and the write-path fixer
realizes:
  - "el-test-runner"
  - "if-record-store-to-test-runner"
  - "if-test-runner-to-record-store"
files:
  - "project/deliverable/engine/testreporters.ts"
  - "project/deliverable/engine/tools.ts"
  - "project/deliverable/engine/lint.ts"
  - "project/deliverable/engine/bin/grades-complete.ts"
  - "project/deliverable/engine/bin/backfill-minted.ts"
  - "project/deliverable/engine/lintfix.ts"
  - "project/deliverable/engine/bin/selftest.ts"
  - "project/deliverable/engine/bin/smoketest.ts"
  - "project/deliverable/engine/bin/preflight.ts"
  - "project/deliverable/engine/bin/red-observed.ts"
  - "project/deliverable/engine/bin/battery.ts"
  - "project/deliverable/engine/bin/test-timings.mjs"
  - "project/deliverable/engine/bin/prose-inspect.ts"
  - "project/deliverable/engine/bin/record-inspect.ts"
---

## Responsibility

What a machine can check, a machine checks. Scoped runs by file with
structured counts; the battery as the earned exception; the unchanged
tree keeping its verdict; timings recorded per case. The voice lint
sweeps prose for walls and chains. The fixer returns formatted,
safe-fixed content with the changes named, and leaves uncovered files
exactly as written.

## The full-stop evasion

THE CHAIN RULES COUNT SEPARATORS INSIDE ONE SENTENCE, so the way around them is
a full stop. "Open it. Read it. Fill both cells." Three steps, three sentences,
not one separator anywhere, and nothing fired.

THAT WAS THE ACTUAL EVASION, three times in one afternoon, each time after
being told. A rule an author walks around by changing punctuation is an
advisory, and an advisory is not a rule.

TWO SHAPES, ONE PER SURFACE:

- A PROSE LINE of several short sentences is a list nobody rendered. SHORT is
  the discriminator: ordinary prose runs long and varied, while a buried list
  runs short and parallel because each sentence is one item.
- A LIST ITEM of several sentences is the same thing one level down. Rendering
  the list is half the discipline; one thought per item is the other half.

## Prose in frontmatter is still prose

THE LINT USED TO DROP THE WHOLE FRONTMATTER BLOCK, which meant it never read a
single `guidance:` or `description:` — the exact text a person sees in an
evidence form. The voice rules bind those in as many words, so the one surface
the rule names was the one surface the rule could not see.

IT SURFACED WHEN a six-line anchor list, written as prose inside a field's
guidance, came back clean.

MASK, NEVER STRIP. The structural half of each line is blanked and the prose
half stays where it is, so every finding keeps its real line number and a
person can go straight to it.

A VALUE THAT IS NOT PROSE IS NOT LINTED. An id, a number, a boolean, a path, a
single word — none is a sentence, and complaining about them would teach people
to switch the lint off.

## A lint that cries wolf gets switched off

PROSE IS A SENTENCE, not a token and not a list of tokens. An inline YAML list
of tool names trips the comma-chain rule and there is nothing to fix, because a
list of tool names is not an unrendered sentence. The same goes for a citation
carrying a semicolon.

A ONE-LINE FIELD IS NOT EXEMPT. A statement that trips the chain rule is a
statement carrying too much, and the fix is TWO SHORT SENTENCES rather than an
exemption. The readers are not native English speakers, and a nested one-liner
is the hardest thing to read there is. An exemption would have made the lint
agree with the text instead of the text agree with the rule.

## The shell is not covered by the suite

THE SHELL IS NOT COVERED BY THE SUITE. Nothing imports extension.js, so a
syntax error in it ships GREEN and VS Code then loads no extension at all,
silently. That happened on 2026-07-30: a backtick inside a comment ended
the template literal the webview's script lives in.

Parsing the file is only HALF the guard. The webview's own scripts live
inside template literals, so to the outer parser they are just text: a
syntax error in one ships green, the pane renders, its script throws, and
the pane is silently dead. Each script body is therefore parsed on its own.

## The corpus is what every query and coverage check

THE CORPUS IS WHAT EVERY QUERY AND COVERAGE CHECK IS BUILT ON, so broken
frontmatter there is the worst place for a green check.

MEASURED 2026-08-17: a trace note whose frontmatter block was never
terminated sat in the tree and preflight printed `preflight green`.
SE-C-135 checks that a write ARRIVED VERBATIM, never that it was
WELL-FORMED, and se_file_write is the one lane verb that replaces a whole
file with no structural guard. Nothing else looked.

THE UNTERMINATED BLOCK IS THE HOLE THAT HID. splitNote reports
`fenced: false` for it, which is indistinguishable from a note carrying no
frontmatter at all — so readKeys answers {} and every reader downstream
sees an empty mapping instead of a broken file. The fence is therefore
checked HERE, before the parse, because the parse cannot see it.

## The prose inspection

THE PROSE INSPECTION, as much of it as a command can answer (i33, 2026-08-17).

  node project/deliverable/engine/bin/prose-inspect.ts [--root <project root>]

tsp-prose-inspection has EIGHT checklist items and has had NO RUNNER since
i28. It was hand-judged or skipped at verification after verification, and
i33's own tester found four factual errors sitting in the README while the
spec was marked owed. The register entry is
raid-issue-the-corpus-wide-inspections-have-no-runner, and its stated
repayment is "a command per spec that answers it, or a spec rewritten to
demand what a command can answer". This is the first half, for the three
items that are mechanically answerable.

WHAT IT ANSWERS, and it says which:

  item 1 — entry documents carry zero BARE method terms
  item 3 — stored records carry zero usernames or hostnames
  item 8 — the desk's offer list includes a tour

WHAT IT DOES NOT, and never claims to: items 2, 4, 5, 6 and 7 are judgments
about whether a source supports a claim, whether a comparison carries both
sides, and whether notes were consolidated. No command answers those, and a
runner that pretended to would be worse than none.

EXIT 1 ON FINDINGS, because a check that only ever passes teaches the reader
to skim.

## A bare word the corpus already speaks is the

A BARE WORD THE CORPUS ALREADY SPEAKS IS THE SAME COLLISION, one step
out (measured on the i17 cloud run, 2026-08-18). The product-name guard
above caught the case where the needle is what the product is called;
this catches the case where it is what the AGENT is called. A cloud host
sets `git config user.name` to the agent's own name, and the records
discuss that agent by name on nearly every page — 64 findings, every one
of them false, and boot could not finish because the check never went
green.

ONLY A BARE WORD IS EVER MUTED. A home directory, an email address and a
machine path all carry a separator, so the shapes that actually leak an
identity stay searchable no matter how often they appear.

## The record inspection

THE RECORD INSPECTION, the two items a command can answer (i33, 2026-08-17).

  node project/deliverable/engine/bin/record-inspect.ts [--root <project root>]

tsp-record-inspection has TWELVE checklist items and had no runner. i33's
verification tester ran exactly ONE of them by hand and took the
no-runner argument as the verdict for the other eleven - while citing the
register entry that warns against precisely that. Two of the eleven turned
out to be as mechanical as the one that ran.

WHAT IT ANSWERS:

  item 11 — every trace node carries its upward links in its OWN file
  item 12 — every recorded test run carries the question and scope it answered

WHAT IT DOES NOT: the other ten are about records produced by acts nobody
has performed recently - a begun product, a seeded record, a desk
recommendation, a divergence. They need those acts to have happened, not a
cleverer sweep.

IT READS THE RAW LOG, NEVER se_log_query. That query drops records matching
its filter and reports `older: 0` while doing it
(raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not), so
a check built on it would inherit the defect it is meant to be independent
of.

## The latest run is the live behaviour

THE LATEST RUN IS THE LIVE BEHAVIOUR, and it is what this item judges.

OLD RECORDS CANNOT BE RETRO-FITTED. The verdict did not carry its question
until i33 fixed it on 2026-08-17, so every run before that is missing one
permanently. Going red on history would make this check permanently red,
and a permanently red check gets muted — which is worse than one that
judges what can still be changed and COUNTS the rest out loud.

## The engine observes the red

THE ENGINE OBSERVES THE RED, NOT THE AGENT — the check behind observe-red
(owner ruling 2026-08-16, raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions).

observe-red DOES NOT GRANT se_test. Its legal tools are the file verbs and
se_run, so the state whose whole job is watching new checks fail could not
use the test verb, and the agent reached for the shell instead.

THE OWNER'S ANSWER WAS NOT TO GRANT THE VERB: "How about the engine fires the
tests and observes red? When you submit observe-red, the engine runs the
test." That is the shape verification's row already claims for itself, one
milestone earlier.

WHAT IT READS. A test-spec node carries `minted_in`, `method` and `files`.
The specs minted in the open record with `method: test` name exactly the
checks this record is adding, and their files are the checks themselves.

WHAT IT DEMANDS. At least one case in that set FAILS. A check that is green
before its design is realized is not a check — it is a sentence that happens
to be true, and green-from-birth is the one thing test-first exists to catch.

AND THE FAILURE IS AN ASSERTION, NOT A CRASH (i6,
req-a-red-is-an-assertion-not-a-crash). A check that crashes from birth
proves as little as one that is green from birth: it never reached its
expectation, so nothing about the design was measured. The counts cannot
tell the two apart — `# fail 4` is the same four either way — but the TAP
diagnostic can, and parseTap now carries the kind.

A CRASH ALONGSIDE AN ASSERTION IS REPORTED, NOT REFUSED. Some checks
legitimately throw before the build exists. The refusal is for a red made of
crashes ALONE.

  node engine/bin/red-observed.ts --root <project root>

## The records go where the lane reads them

THE RECORDS GO WHERE THE LANE READS THEM, which is not always beside the
tree being tested. While an iteration is bound, `root` is that iteration's
WORKTREE, so a run records into a .se nothing ever opens: two green
batteries on 2026-08-15 wrote 1301 rows each into a directory the lane does
not resolve, and their output said nothing about it.

The spawner passes the lane's own .se. The local one is the fallback for a
hand-run that sets nothing.

## The cap outgrew its suite once

THE CAP OUTGREW ITS SUITE ONCE (2026-08-02): the pull-lane tests pay a
real boot walk each, the wall clock crossed the old 110s, and spawnSync
KILLED the run mid-stream — truncated output, no summary, an exit code
that read as ordinary failure. A cap that is hit must SAY so.

## The boot smoke test

THE BOOT SMOKE TEST — proves the engine LOADS and ANSWERS, and nothing
more (owner ruling, 2026-07-30). Budget: under ten seconds.

The full battery used to gate boot. On a machine held at its base clock
that cost the best part of a minute before the first useful word, and a
battery at boot is wrong even where it is fast: boot asks "can this
engine run", not "is every behaviour correct". The second question
belongs to validation — se_test, and the end of an expedition.

IT REPORTS ITS PROGRESS. Every step prints
  ##progress <done> <total> <label>
which the engine turns into a real wait bar. A bar that measures nothing
is an animation, and an animation is not information.

  node engine/bin/smoketest.ts --root <project root>

## The voice lint

The VOICE LINT — mechanical checks over PROSE, on demand (se_lint) and
later swept by the overhaul. Catches FORM, never meaning. The rules' LOGIC
lives here; the rules' PARAMETERS are DATA (owner ruling 2026-07-28,
guidance/method/engineering.md): machines/lint/voice-lint.md — edit a
threshold there and the next call uses it, no recompile, no reload.

## A list marker is not a sentence

A LIST MARKER IS NOT A SENTENCE (owner report 2026-08-08). "1." ends in a
 full stop, so an unguarded split counted a numbered item's own marker as a
 sentence. A three-sentence item measured four and fired. The same marker
 also has to make the line an ITEM: a numbered step is a list item exactly
 as a dashed one is, and only the dash was recognised.

## A pipe row is cells

A PIPE ROW IS CELLS, NOT ONE STREAM OF SENTENCES (owner report 2026-08-08).
 A form field is written `- name | help | required`, and the trailing
 `required` was counted as a sentence of the help text. Every field line
 measured one sentence more than it had. Lint the LONGEST cell: on a field
 row that is the help, and on a table row it is the prose cell.

## Run the linters safe fixes over freshly-written files in

Run the linter's SAFE fixes over freshly-written files, in place.
 Undefined when nothing is covered or the tooling is absent. Never
 --unsafe: the unsafe tier rewrote working code once (2026-08-03) and
 is banned in engineering.md.
