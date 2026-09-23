---
kind: [[ticket]]
state: open
step: read
steps:
  - name: feedback
    does: takes the owner's field feedback one point at a time, and writes each confirmed point as a private note
    by: person
    needs: ["ticket note"]
    reads: [[spec/guidance/retro/feedback]]
    evidence:
      - name: notes
        form: list
        says: every private note this step writes, one a line
  - name: collect
    does: moves everything the private folder holds past its dot folders into the retro's input folder, and copies the transcripts, the memory and the scratchpads beside it
    by: anyone
    to: owner
    input: feedback
    needs: ["retro"]
    reads: [[spec/guidance/retro/collect]]
    evidence:
      - name: run
        form: command
        expects: 0
        says: retro collect, which leaves the private folder holding .runtime and .retro alone
  - name: effect
    does: counts the last retro's class patterns over this input, and says per class whether its failure still occurs and at what rate
    by: anyone
    input: collect
    needs: ["retro"]
    reads: [[spec/guidance/retro/effect]]
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
    reads: [[spec/guidance/retro/audit]]
    checklist:
      - the code the window lands follows [[spec/guidance/code/code]]
      - every change lands with a test that fails before it and passes after, as [[spec/guidance/code/testing]] asks
      - every note the window writes holds the shape [[spec/guidance/guidance]] asks
      - the work follows [[spec/guidance/working]], a turn at a time
      - a change reaches every place holding the same thing, each writer, each copy and each name
      - the running system carries the change, rebuilt, restarted or reloaded
      - every claim to the owner rests on a check against what the owner sees
      - every mechanical step runs through a verb, and no hand repeats it
      - every piece of work lands in the place owning its topic
      - no sentence the window writes says what the structure beside it holds: a count, a member, a link, a connection
      - every experiment stands decided, which `retro audit` answers
      - every refusal teaches the hand, and no hand retries it blind
      - the battery's report reads beside the last retro's, and each part that grows has a finding, as [[spec/guidance/retro/effect]] asks
    evidence:
      - name: audits
        form: list
        says: every audit findings file this step writes, one a line
      - name: trials
        form: command
        expects: 0
        says: retro audit, which answers 0 once every experiment stands decided
  - name: chapter
    does: cuts the window into chapters of about six hours, and the engine hands every chapter its lines
    by: anyone
    input: audit
    needs: ["retro"]
    reads: [[spec/guidance/retro/chapter]]
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
    reads: [[[spec/guidance/retro/read]], [[spec/guidance/retro/signals]]]
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
    reads: [[spec/guidance/retro/classify]]
    evidence:
      - name: classes
        form: command
        expects: 0
        says: retro classes, which counts each rate and refuses a finding with no disposition
  - name: check
    does: reads every class against the tree as it stands, closes the ones the tree answers already, and mints a ticket a class standing open
    by: anyone
    to: owner
    input: classify
    needs: ["retro"]
    reads: [[spec/guidance/retro/check]]
    evidence:
      - name: minted
        form: command
        expects: 0
        says: retro mint, which refuses a class carrying no status and mints the rest
process: [[spec/processes/retro]]
process_hash: 7290e656e7ca2777
record:
  - step: feedback
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 8cdb9d352f6632a63a2318386323b0474ac99af0
    hash_after: 8cdb9d352f6632a63a2318386323b0474ac99af0
  - step: collect
    hand: box d6f05e3a585030 · claude-code
    hash_before: 4e4c65bf1b488dcc601a5bd562b35898c2999e21
    hash_after: 4e4c65bf1b488dcc601a5bd562b35898c2999e21
    answered:
      - name: run
        exit: 0
        said: .se/.retro/retro-899accd/input holds a whole run already, and this one changes nothing.
  - step: effect
    hand: box d6f05e3a585030 · claude-code
    hash_before: 368cc05fa7132de765f72ab8b8f05f81a7db89cb
    hash_after: 368cc05fa7132de765f72ab8b8f05f81a7db89cb
    answered:
      - name: effect
        exit: 0
        said: No earlier retro holds class fixes, so nothing stands to measure.
  - step: audit
    hand: box d6f05e3a585030 · claude-code
    hash_before: dec3dd42cad10ff8848d3628f19eb5ec3f675188
    hash_after: dec3dd42cad10ff8848d3628f19eb5ec3f675188
    answered:
      - name: trials
        exit: 0
        said: Every experiment stands decided, so the retro closes.
  - step: chapter
    hand: box d6f05e3a585030 · claude-code
    hash_before: 03b2a46a7c8edf4dfb6e79c5952a2d716bd5d3e5
    hash_after: 03b2a46a7c8edf4dfb6e79c5952a2d716bd5d3e5
    answered:
      - name: chapters
        exit: 0
        said: "c2  2026-09-23T17:40:00.000Z to 2026-09-23T23:59:59.000Z  2529 line(s)  the landing on main, the queue tickets, and the "
---

# Ask

<!-- why, as text: what calls for it, as notes standing open, an iteration ending, or the owner asking -->

the owner asks for it

# feedback

<!-- takes the owner's field feedback one point at a time, and writes each confirmed point as a private note -->

## notes

<!-- every private note this step writes, one a line -->

<!-- the form is list -->

- the-door-trips-the-hand
- the-agent-writes-few-notes
- notes-stay-off-the-queue
- a-hand-back-lands-unpushed
- the-ask-lint-keeps-errors
- the-awake-case-races
- the-fake-lists-a-file

# collect

<!-- moves everything the private folder holds past its dot folders into the retro's input folder, and copies the transcripts, the memory and the scratchpads beside it -->

## run

<!-- retro collect, which leaves the private folder holding .runtime and .retro alone -->

<!-- the form is command -->

    ./RUNME.sh retro collect retro-899accd

# effect

<!-- counts the last retro's class patterns over this input, and says per class whether its failure still occurs and at what rate -->

## effect

<!-- retro effect, which answers each earlier class with its rate before and now -->

<!-- the form is command -->

    ./RUNME.sh retro effect retro-899accd

# audit

<!-- auditors walk the checklist over what the window lands, and write a findings column each -->

## audits

<!-- every audit findings file this step writes, one a line -->

<!-- the form is list -->

- findings/audit-code.md
- findings/audit-conduct.md
- findings/audit-notes.md

## trials

<!-- retro audit, which answers 0 once every experiment stands decided -->

<!-- the form is command -->

    ./RUNME.sh retro audit retro-899accd

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the code: broken, a spelled copy of the self-test flag and comments carrying prose past their pointer
- the tests: broken, two commits land code with no test, and the door reads JavaScript alone
- the notes: broken twice, a list item and two ask lines land past the caps
- the turn: broken, mid-turn prompts wait behind calls until the answer gate refuses
- one place: broken, the lens reads the route again where `pull-route.js` owns it
- the running system: held, the bridge reloads and the language server rebuilds
- the claims: broken, the todo order reads fixed off unit tests before the owner sees it
- the verbs: broken, raw commits and a hand check before each push stand in for the commit verb
- the owner's place: broken, a commit carries work of another topic
- the counts: broken, a funnel note and a ticket count the structure beside them
- the experiments: held, the audit verb answers every one decided
- the refusals: broken, chained hand-backs land unwanted commits
- the battery: untested, no earlier retro stands to read beside

# chapter

<!-- cuts the window into chapters of about six hours, and the engine hands every chapter its lines -->

## chapters

<!-- retro chapters, which refuses a gap or an overlap between two chapters -->

<!-- the form is command -->

    ./RUNME.sh retro chapters retro-899accd

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

<!-- reads every class against the tree as it stands, closes the ones the tree answers already, and mints a ticket a class standing open -->

## minted

<!-- retro mint, which refuses a class carrying no status and mints the rest -->

<!-- the form is command -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
