---
kind: [[ticket]]
state: open
step: effect
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
process_hash: f713807a1ec22a1f
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

<!-- reads every class against the tree as it stands, closes the ones the tree answers already, and mints a ticket a class standing open -->

## minted

<!-- retro mint, which refuses a class carrying no status and mints the rest -->

<!-- the form is command -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
