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
step: effect
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

# audit

<!-- auditors walk the checklist over what the window lands, and write a findings column each -->

## audits

<!-- every audit findings file this step writes, one a line -->

<!-- the form is list -->

## trials

<!-- retro audit, which answers 0 once every experiment stands decided -->

<!-- the form is command -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# backlog

<!-- reads every prose criterion a ticket the window closes carries, and writes each a verdict into backlog.json -->

## backlog

<!-- retro backlog, which answers 0 once each prose criterion holds a verdict with its reason -->

<!-- the form is command -->

# chapter

<!-- cuts the window into chapters of about six hours, and the engine hands every chapter its lines -->

## chapters

<!-- retro chapters, which refuses a gap or an overlap between two chapters -->

<!-- the form is command -->

# read

<!-- one reader a chapter answers the five starfish questions and the five improvements, and the engine draws the matrix -->

## matrix

<!-- retro matrix, which refuses a chapter standing without its findings -->

<!-- the form is command -->

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
