---
kind: [[ticket]]
state: open
steps:
  - name: feedback
    does: takes the owner's field feedback one point at a time, and writes each confirmed point as a private note
    by: person
    needs: ["ticket note"]
    tags: ["retro", "feedback"]
    evidence:
      - name: notes
        form: list
        says: every private note this step writes, one a line
  - name: collect
    does: moves everything the private folder holds past its dot folders and .se/scripts into the retro's input folder, and copies .se/scripts, the transcripts, the memory and the scratchpads beside it
    by: anyone
    to: owner
    input: feedback
    needs: ["retro"]
    tags: ["retro", "collect"]
    evidence:
      - name: run
        form: command
        expects: 0
        says: retro collect, which leaves the private folder holding .runtime, .retro and .se/scripts alone
  - name: effect
    does: counts the last retro's class patterns over this input, and says per class whether its failure still occurs and at what rate
    by: anyone
    input: collect
    needs: ["retro"]
    tags: ["retro", "effect"]
    evidence:
      - name: effect
        form: command
        expects: 0
        says: retro effect, which answers each earlier class with its rate before and now
  - name: audit
    does: auditors walk the checklist over what the window lands, and write a findings column each
    by: anyone
    input: effect
    needs: ["retro", "retro audit"]
    tags: ["retro", "audit"]
    checklist: ["the code the window lands follows [[spec/guidance/code/code]]", "every change lands with a test that fails before it and passes after, as [[spec/guidance/code/testing]] asks", "every note the window writes holds the shape [[spec/guidance/guidance]] asks", "the work follows [[spec/guidance/working]], a turn at a time", "a change reaches every place holding the same thing, each writer, each copy and each name", "the running system carries the change, rebuilt, restarted or reloaded", "every claim to the owner rests on a check against what the owner sees", "every mechanical step runs through a verb, and no hand repeats it", "every piece of work lands in the place owning its topic", "no sentence the window writes says what the structure beside it holds: a count, a member, a link, a connection", "every experiment stands decided, which `retro audit` answers", "every refusal teaches the hand, and no hand retries it blind", "the battery's report reads beside the last retro's, and each part that grows has a finding, as [[spec/guidance/retro/effect]] asks", "the chat's answers score under `answer.ceiling` in `spec/config/level0.json`, which `./RUNME.sh voice measure --transcripts` over the window's transcripts answers"]
    evidence:
      - name: audits
        form: list
        says: every audit findings file this step writes, one a line
      - name: trials
        form: command
        expects: 0
        says: retro audit, which answers 0 once every experiment stands decided
  - name: backlog
    does: reads every prose criterion a ticket the window closes carries, and writes each a verdict into backlog.json
    by: anyone
    input: audit
    needs: ["retro"]
    tags: ["retro", "backlog"]
    evidence:
      - name: backlog
        form: command
        expects: 0
        says: retro backlog, which answers 0 once each prose criterion holds a verdict with its reason
  - name: chapter
    does: cuts the window into chapters of about six hours, and the engine hands every chapter its lines
    by: anyone
    input: backlog
    needs: ["retro"]
    tags: ["retro", "chapter"]
    evidence:
      - name: chapters
        form: command
        expects: 0
        says: retro chapters, which refuses a gap or an overlap between two chapters
  - name: read
    does: one reader a chapter answers the five starfish questions and the five improvements, and the engine draws the matrix
    by: anyone
    input: chapter
    needs: ["retro"]
    tags: ["retro", "read", "signals"]
    evidence:
      - name: matrix
        form: command
        expects: 0
        says: retro matrix, which refuses a chapter standing without its findings
  - name: classify
    does: collapses the findings into class fixes with a rate each, gives every finding a disposition, and names every promotion
    by: anyone
    input: read
    needs: ["retro"]
    tags: ["retro", "classify"]
    evidence:
      - name: classes
        form: command
        expects: 0
        says: retro classes, which counts each rate and refuses a finding with no disposition
  - name: check
    does: reads every class against the tree as it stands, closes the ones the tree answers already, writes each promotion its ticket, and draws the report again
    by: anyone
    to: owner
    input: classify
    needs: ["retro"]
    tags: ["retro", "check"]
    evidence:
      - name: report
        form: command
        expects: 0
        says: retro matrix, which draws the report the owner reads, each status and promotion in it
  - name: report
    does: the owner reads the report, and passes the classes and promotions to mint, or sends the check back
    by: person
    on_fail: check
    input: check
    evidence:
      - name: verdict
        form: verdict
        says: pass once the report reads right, or fail with what the check changes, one a line
  - name: mint
    does: mints a ticket a class standing open and a promotion waiting, and opens each draft
    by: anyone
    input: report
    needs: ["retro"]
    tags: ["retro", "check"]
    evidence:
      - name: minted
        form: command
        expects: 0
        says: retro mint, which refuses a class carrying no status or a promotion carrying no ticket, and mints the rest
process: [[spec/processes/retro]]
process_hash: 437ae3e9f952ac3c
group: the-fleet-week-retro
step: classify
record:
  - step: feedback
    hand: box 8f95d4cd1cfb · claude-code-remote · the owner says so
    hash_before: 4efd1fe6fe4d5150ac8fea8d26410c2ac2ac2487
    hash_after: 4efd1fe6fe4d5150ac8fea8d26410c2ac2ac2487
    def: 469f394c7eccd7de
  - step: collect
    hand: box 8f95d4cd1cfb · claude-code-remote
    hash_before: e4c8a61f2a223a91aeec51c3ba00c9b906c4c969
    hash_after: e4c8a61f2a223a91aeec51c3ba00c9b906c4c969
    answered:
      - name: run
        exit: 0
        said: .se/.retro/retro-0d14eda/input holds a whole run already, and this one changes nothing.
    inputs:
      - name: feedback
        hash: ad7d848022d200b6
        size: 605
    def: 6cbd13ac719e276f
  - step: effect
    hand: box 8f95d4cd1cfb · claude-code-remote
    hash_before: e3a3aa25d53d1fd1e6caccef4d8292312f0192fd
    hash_after: e3a3aa25d53d1fd1e6caccef4d8292312f0192fd
    answered:
      - name: effect
        exit: 0
        said: battery  baseline 167981 ms, which the next retro reads against
    inputs:
      - name: collect
        hash: f3cc2717aa4cc2f3
        size: 47
    def: 0a500fbc7d589467
  - step: audit
    hand: box 8f95d4cd1cfb · claude-code-remote
    hash_before: 74297b9ac84a48b20a752026e24707c17e238e7e
    hash_after: ae4463a2281eb5b8113dc79dad11b942ee6d17b4
    answered:
      - name: trials
        exit: 0
        said: Every experiment stands decided, so the retro closes.
    inputs:
      - name: effect
        hash: 0d0ba34c12e954be
        size: 49
    def: f993cc8b0a8c580c
  - step: backlog
    hand: box 8f95d4cd1cfb · claude-code-remote
    hash_before: d8610df2df72313ea7deebda4e62a25af454728f
    hash_after: d8610df2df72313ea7deebda4e62a25af454728f
    answered:
      - name: backlog
        exit: 0
        said: the-pull-takes-the-branch  a group at urgency now reaches a desk through the plain pull, and a test drives it  falls sho
    inputs:
      - name: audit
        hash: abbc1492b1d54237
        size: 1547
    def: 9cf43185b299fada
  - step: chapter
    hand: box 8f95d4cd1cfb · claude-code-remote
    hash_before: f1829c985fc0ecffa79ef89fe61d8ece21f11709
    hash_after: f1829c985fc0ecffa79ef89fe61d8ece21f11709
    answered:
      - name: chapters
        exit: 0
        said: c14  2026-10-06T07:00:00.000Z to 2026-10-06T13:00:00.000Z  698 line(s)  the verbs port takes a phase (#110), a Windows-o
    inputs:
      - name: backlog
        hash: 5534f0f00dd07c73
        size: 55
    def: 9bedae769f3b2577
  - step: read
    hand: box 8f95d4cd1cfb · claude-code-remote
    hash_before: ed121e220288a2df71e732e28e9c8c30a9bca458
    hash_after: ed121e220288a2df71e732e28e9c8c30a9bca458
    answered:
      - name: matrix
        exit: 0
        said: The report of retro-0d14eda draws 17 column(s), bottom line first, in its retro folder.
    inputs:
      - name: chapter
        hash: d9f11f0c6509207d
        size: 57
    def: eebf9c438d0f9b8b
---

# Ask

<!-- why, as text: what calls for it, as notes standing open, an iteration ending, or the owner asking -->

The owner asks for a retro over the fleet's week of cloud-box work, from Sep 29 to Oct 6 2026. It asks what goes well, what goes badly, what to improve and what to learn.

# feedback

<!-- takes the owner's field feedback one point at a time, and writes each confirmed point as a private note -->

## notes

<!-- every private note this step writes, one a line -->
<!-- the form is list -->

- `a-box-reads-each-chapter`
- `a-stuck-box-gets-killed`
- `decided-steps-need-no-person`
- `doors-test-once-modules-pure`
- `green-needs-no-agent`
- `io-modules-declare-their-own`
- `level-zero-never-breaks`
- `merging-runs-without-a-hand`
- `nothing-red-reaches-main`
- `only-main-takes-the-gate`
- `stale-holds-stop-mechanically`
- `tests-wait-for-events`
- `the-check-stays-near-ninety`
- `the-fleet-works-a-week`
- `the-handover-only-clears`
- `the-owner-asks-how-far`
- `the-verbs-port-fans-out`
- `the-week-spends-its-tokens`
- `three-boxes-open-no-pr`
- `unpushed-commits-get-discarded`

# collect

<!-- moves everything the private folder holds past its dot folders and .se/scripts into the retro's input folder, and copies .se/scripts, the transcripts, the memory and the scratchpads beside it -->

## run

<!-- retro collect, which leaves the private folder holding .runtime, .retro and .se/scripts alone -->
<!-- the form is command -->

./RUNME.sh retro collect retro-0d14eda

# effect

<!-- counts the last retro's class patterns over this input, and says per class whether its failure still occurs and at what rate -->

## effect

<!-- retro effect, which answers each earlier class with its rate before and now -->
<!-- the form is command -->

./RUNME.sh retro effect retro-0d14eda

# audit

<!-- auditors walk the checklist over what the window lands, and write a findings column each -->

## audits

<!-- every audit findings file this step writes, one a line -->
<!-- the form is list -->

- `findings/audit-code.md`
- `findings/audit-conduct.md`
- `findings/audit-engine.md`

## trials

<!-- retro audit, which answers 0 once every experiment stands decided -->
<!-- the form is command -->

    ./RUNME.sh retro audit

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the code: broken, prose comments and ticket pointers past code.md rules 1, 3 and 4, and 17 function bodies copied across packages
- the tests: held, every code route carries a red test first, though 25 fixed sleeps land in tests
- the notes: held, every guidance note links its rationale and keeps its shape
- the turn: broken for the coordinator, which ran outside the plugin, and untested for the boxes, whose transcripts are gone
- one place: broken, 29 note lines name 18 deleted paths, and one key carries two built-in defaults
- the running system: broken, a hooks change merges that no running level zero has run, and boxes keep old rules after a fix
- the claims: broken, the level-zero run skips Windows and claims rest on no read in four chapters
- the verbs: broken, the coordinator commits with raw git and flips phases with sed
- the owner's place: broken, the coordinator cuts its own work branches and 11 PRs come from other branches
- the counts: broken, a design note counts its own table, and tickets stand exempt from the count rules
- the experiments: held, the audit verb answers every one decided
- the refusals: broken, two pull refusals point at each other and the coordinator retries one blind
- the battery: untested, no earlier retro's battery stands on this box, so effect writes a baseline
- the voice: broken, 197 of 198 coordinator answers score past the ceiling

# backlog

<!-- reads every prose criterion a ticket the window closes carries, and writes each a verdict into backlog.json -->

## backlog

<!-- retro backlog, which answers 0 once each prose criterion holds a verdict with its reason -->
<!-- the form is command -->

    ./RUNME.sh retro backlog retro-0d14eda

# chapter

<!-- cuts the window into chapters of about six hours, and the engine hands every chapter its lines -->

## chapters

<!-- retro chapters, which refuses a gap or an overlap between two chapters -->
<!-- the form is command -->

    ./RUNME.sh retro chapters retro-0d14eda

# read

<!-- one reader a chapter answers the five starfish questions and the five improvements, and the engine draws the matrix -->

## matrix

<!-- retro matrix, which refuses a chapter standing without its findings -->
<!-- the form is command -->

    ./RUNME.sh retro matrix retro-0d14eda

# classify

<!-- collapses the findings into class fixes with a rate each, gives every finding a disposition, and names every promotion -->

## classes

<!-- retro classes, which counts each rate and refuses a finding with no disposition -->

<!-- the form is command -->

# check

<!-- reads every class against the tree as it stands, closes the ones the tree answers already, writes each promotion its ticket, and draws the report again -->

## report

<!-- retro matrix, which draws the report the owner reads, each status and promotion in it -->

<!-- the form is command -->

# report

<!-- the owner reads the report, and passes the classes and promotions to mint, or sends the check back -->

## verdict

<!-- pass once the report reads right, or fail with what the check changes, one a line -->

<!-- the form is verdict -->

# mint

<!-- mints a ticket a class standing open and a promotion waiting, and opens each draft -->

## minted

<!-- retro mint, which refuses a class carrying no status or a promotion carrying no ticket, and mints the rest -->

<!-- the form is command -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The collect step's reading, and what the later steps read past it:

- The coordinator's transcript and the session records reach the input through the private folder, by hand. Collect reads transcripts filed under the tree's own path alone, and the coordinator runs from the home folder.
- `transcripts/fleet-sessions/sessions.jsonl` times each session record at its start and its last update. So every chapter holds the boxes of its hours.
- The boxes' own transcripts die with their containers. A session record keeps its title, cost, tokens and final status line alone.
- Effect measures nothing, since the earlier retros keep their classes in a desk's private folder, which no box reads.
- The input holds the owner's email and a token hint, so it stays private. A chapter's reader takes its lines from the coordinator, and git carries the cuts alone.
- The first check on this box fails two contract tests under load: a 30-second client timeout and a Vale expectation. The second run passes untouched.
- The owner narrows this hand to the chapters, so the ticket waits at audit. The cuts stand ahead of audit and backlog.

The cuts in `chapters.json`:

| id | from (UTC) | to (UTC) | what it holds |
|---|---|---|---|
| c1 | Sep 29 00:00 | Sep 30 16:00 | the boxes of phases 2 to 8 by their session records alone, and the first coordinator flagged |
| c2 | Sep 30 16:00 | Oct 1 00:00 | phase 7 on (PR 63), lsp-door lands (PR 65), go-cage stalls and the dispatch takes it over |
| c3 | Oct 1 00:00 | Oct 1 07:00 | go-cage through the night: stall after stall, stale holds, and a replacement box |
| c4 | Oct 1 07:00 | Oct 1 14:00 | go-cage closes its last tickets, a finish box, and the coordinator opens PR 66 |
| c5 | Oct 1 14:00 | Oct 1 19:00 | PR 66 lands level zero red on main, the cold probe, the fix forward (PR 67), and the owner asks why red reaches main |
| c6 | Oct 1 19:00 | Oct 2 04:00 | the phase 9 shadow group: a double take, four unpushed commits stranded, the stale hold at 90 minutes (PR 68), and PR 69 |
| c7 | Oct 2 04:00 | Oct 2 12:00 | the phase 9 shadow fix (PR 70), the Windows Vale timeout, phase 9 on (PR 71), and a takeover |
| c8 | Oct 2 12:00 | Oct 2 18:00 | phase 10 on (PR 74), boxes stop at a handover, the slow check, and PR 75, PR 76 and PR 77 |
| c9 | Oct 2 18:00 | Oct 3 14:00 | phase 10 lands (PR 82), the test-speed box loops on its handover, and an idle night |
| c10 | Oct 3 14:00 | Oct 4 12:00 | the hold goes stale at 60 minutes with the handover guard (PR 83), the phase 11 groups, and idle hours |
| c11 | Oct 4 12:00 | Oct 4 17:00 | phase 11 on (PR 86), the verb registry (PR 89), nine verb boxes, the cage lock-out (PR 91), the plan stall (PR 92) |
| c12 | Oct 4 17:00 | Oct 5 19:00 | boxes replaced, groups merge past conflicts (PR 93, PR 96, PR 97), and the usage limit stops the fleet |
| c13 | Oct 5 19:00 | Oct 6 07:00 | phase 11 closes (PR 105 to 107), the closed-group child (PR 108), the check budget (PR 109) |
| c14 | Oct 6 07:00 | Oct 6 13:00 | the verbs port takes a phase (PR 110), a Windows-only red, the handover loop fix (PR 111), and the retro opens |
