---
kind: [[ticket]]
state: open
urgency: now
steps:
  - name: collect
    does: copies the private folder into the retro folder past the folders it skips, cuts the window into chapters, mints a reader per chapter, and lays each leaf's material out as a file
    by: anyone
    needs: ["retro"]
    evidence:
      - name: run
        form: command
        expects: 0
        says: retro collect, which refuses while another hand holds a ticket, and skips the runtime folder and its own
  - name: field
    does: asks what came back from real use since the last retro, and stops
    by: person
    asks: what came back from real use since the last retro?
    evidence:
      - name: answers
        form: list
        says: one line each, and each becomes a note
  - name: score
    does: scores the last retro's improvements against this window's numbers
    input: collect
    evidence:
      - name: scored
        form: list
        says: one line per improvement, with what the numbers show and what that teaches
      - name: rate
        form: command
        expects: 0
        says: retro score, which prints how many stand in the tree
  - name: notes
    does: decides every note, the field's answers among them
    input: field
    needs: ["retro"]
    evidence:
      - name: drained
        form: command
        expects: 0
        says: retro notes, which passes when the private folder is empty
  - name: readers
    by: children
  - name: mine
    reads: [[spec/guidance/working]]
    input: collect
    steps:
      - name: chapters
        does: reads the closed chapter readers into themes with counts
        input: readers
        evidence:
          - name: themes
            form: list
            says: one line per theme, with its count and the chapters it stands in
          - name: repeats
            form: list
            says: each theme an earlier retro names already, with the link
          - name: thoughts
            form: text
            says: what the readers' thoughts fields say together, as doubts and workarounds that repeat
      - name: shell
        does: reads the shell commands of the window, grouped by the job in the retro folder
        evidence:
          - name: learn
            form: text
            says: what the groups say about what the tree lacks
          - name: tools
            form: list
            says: which groups become a verb or a flag, and which stay shell
          - name: guidance
            form: list
            says: which groups want a sentence, and where
          - name: block
            form: list
            says: which groups a door refuses from now on, and why
      - name: refusals
        does: reads the doors' refusals of the window, by rule
        evidence:
          - name: rules
            form: list
            says: one line per rule, with its count, and whether the rule or the hand is wrong
          - name: noise
            form: list
            says: the rules that fire and teach nothing, each with the fix
      - name: words
        does: reads the terms added to spec/vocabulary/terms.yml since the last retro, keeps each, or moves it to the swaps with the word to write
        reads: [[spec/design_output/vocabulary]]
        evidence:
          - name: kept
            form: list
            says: one line per term kept, with the note that defines it
          - name: swapped
            form: list
            says: one line per term moved to the swaps, with the word to write instead
      - name: memory
        does: reads the agent's memory folder on this box, moves every entry that shapes how the agent works into the tree as guidance, a ticket or a rule, and deletes it there
        reads: [[spec/guidance/working]]
        evidence:
          - name: moved
            form: list
            says: one line per entry, with its home in the tree, or the reason it dies
          - name: emptied
            form: text
            says: the memory folder holds no entry that shapes behavior, because git carries none of it
      - name: tickets
        does: reads the records of the tickets that close in the window, which are the engine's entries on each and no log
        evidence:
          - name: returns
            form: list
            says: the steps that fail back or meet refused most, per process, with counts
          - name: people
            form: list
            says: what the person steps ask, and how long each waits
          - name: skips
            form: text
            says: what the conditions skip, and whether rightly
      - name: worker
        does: reads the counts per chapter as a curve
        evidence:
          - name: curve
            form: text
            says: errors and the length of a thought per chapter, and where they turn
          - name: cuts
            form: list
            says: where the worker cuts scope and calls it something else, each with its moment
      - name: scripts
        does: judges every script collect took from the box
        evidence:
          - name: kept
            form: list
            says: each script that becomes a check, a flag or a verb, with its home
          - name: dropped
            form: list
            says: each script that dies, with the reason
      - name: runs
        does: reads the retro leaves of the groups that merged in the window
        evidence:
          - name: lacked
            form: list
            says: what the boxes lacked and met, with what repeats across runs
          - name: left
            form: list
            says: what the boxes left for a person that still stands
      - name: unread
        does: reads the manifest against what every leaf read
        evidence:
          - name: unread
            form: text
            says: every line of the manifest no leaf read, and why, so the next retro inherits no hidden gap
      - name: method
        does: reads this retro's own run, so the next one runs better
        input: ["collect", "readers"]
        evidence:
          - name: earned
            form: list
            says: one line per leaf, with what it earned and what it cost, and the readers' questions with no answer
          - name: change
            form: list
            says: what changes in the retro route or its verb, and why, each a ticket the improve step mints
  - name: improve
    does: mints one ticket per class, each with its home and its card
    input: ["mine", "score"]
    checklist: ["one class, one ticket, and no more than work.retroCap of them", "the home is the earliest in the order that removes the waste", "a keep rule is counted over the tree before it is agreed", "a route edited on a ticket goes back into its process file, or the file says why not", "the process is read against what the field does now"]
    evidence:
      - name: tickets
        form: list
        says: one link per ticket, with its class, its home, the plan, and what the next numbers show if it works
  - name: report
    does: reads the retro whole and says what it misses
    by: person
    asks: what does this retro miss?
    evidence:
      - name: misses
        form: text
        says: what the retro misses, or nothing
  - name: distribute
    does: puts every minted ticket into a group with an urgency, cut into groups that run alone
    input: ["improve", "report"]
    to: owner
    evidence:
      - name: groups
        form: list
        says: one line per ticket, with its group and its urgency
step: mine/shell
process: [[spec/processes/retro]]
process_hash: 61a2bb140f0b4632
record:
  - step: collect
    hand: box d42624a67d18a8 · claude-code
    hash_before: ca22b75158abd573db00e1635f0bd8ea5b443cf4
    hash_after: ae7c1c44baa2e22cfc64db923c45a890a5c7a48c
    answered:
      - name: run
        exit: 0
        said: .se/retro/retro-ca22b75 holds a whole run already, and this one changes nothing.
  - step: field
    hand: box d42624a67d18a8 · claude-code · the owner says so
    hash_before: dffce1bd11edfb45add20fbc27a5008c2c9e0c06
    hash_after: dffce1bd11edfb45add20fbc27a5008c2c9e0c06
  - step: score
    hand: box d42624a67d18a8 · claude-code
    hash_before: c6441dfde42fa76ce1f293bd6e5fa7280417e55f
    hash_after: c6441dfde42fa76ce1f293bd6e5fa7280417e55f
    answered:
      - name: rate
        exit: 0
        said: No retro mints an improvement yet, so this one scores nothing.
  - step: notes
    hand: box d42624a67d18a8 · claude-code
    hash_before: 4d9fd763c30476a7d7d9ae3b47c1721fccc11973
    hash_after: 4d9fd763c30476a7d7d9ae3b47c1721fccc11973
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: readers
    hand: the engine
    hash_before: 71391e3439684b2ebffba5c3803203c388a964bc
    hash_after: 71391e3439684b2ebffba5c3803203c388a964bc
  - step: mine/chapters
    hand: box d42624a67d18a8 · claude-code
    hash_before: 9428f2eea28f893d4732edc57b1a3716d65cf4d5
    hash_after: 9428f2eea28f893d4732edc57b1a3716d65cf4d5
---

# Ask

<!-- why, as text: what calls for it, as notes standing open, an iteration ending, or the owner asking -->

the three branches land on trunk, and this reads the window they close

# collect

<!-- copies the private folder into the retro folder past the folders it skips, cuts the window into chapters, mints a reader per chapter, and lays each leaf's material out as a file -->

## run

    ./RUNME.sh retro collect retro-ca22b75

<!-- the form is command -->

# field

<!-- asks what came back from real use since the last retro, and stops -->

## answers

- nothing comes back from real use in this window, and the owner says so.

<!-- the form is list -->

# score

<!-- scores the last retro's improvements against this window's numbers -->

## scored

- no earlier retro mints an improvement, so this window scores against nothing.
- one earlier retro stands open at its field step, and it reads no window.
- what that teaches: this retro is the first to reach the score step, so the baseline starts here.

<!-- the form is list -->

## rate

    ./RUNME.sh retro score

<!-- the form is command -->

# notes

<!-- decides every note, the field's answers among them -->

## drained

    ./RUNME.sh retro notes

<!-- the form is command -->

# readers

# mine

## chapters

<!-- reads the closed chapter readers into themes with counts -->

### themes

- no chapter carries a reader's answer, because the readers step spawns no hand. Thirteen chapters stand unread.
- the work sits in four chapters of thirteen. Chapters 8, 10 and 11 hold most of the prompts, the tools and the ticket moves.
- five chapters hold no count at all, and they open the window. The log writes nothing a chapter counts there.
- the last chapter covers this session, and it reads one prompt and no tool. The session runs hundreds.

<!-- the form is list -->

### repeats

- no earlier retro reaches this step, so no theme repeats yet.

<!-- the form is list -->

### thoughts

The chapters carry no thought, because the counts read no transcript. The median thought reads zero in every chapter, and that zero means nothing measured.

So the chapter ask promises a reader the numbers before a word, and hands them a page of zeroes. A reader meeting that page reads past it.

<!-- the form is text -->

## shell

<!-- reads the shell commands of the window, grouped by the job in the retro folder -->

### learn

<!-- what the groups say about what the tree lacks -->

<!-- the form is text -->

### tools

<!-- which groups become a verb or a flag, and which stay shell -->

<!-- the form is list -->

### guidance

<!-- which groups want a sentence, and where -->

<!-- the form is list -->

### block

<!-- which groups a door refuses from now on, and why -->

<!-- the form is list -->

## refusals

<!-- reads the doors' refusals of the window, by rule -->

### rules

<!-- one line per rule, with its count, and whether the rule or the hand is wrong -->

<!-- the form is list -->

### noise

<!-- the rules that fire and teach nothing, each with the fix -->

<!-- the form is list -->

## words

<!-- reads the terms added to spec/vocabulary/terms.yml since the last retro, keeps each, or moves it to the swaps with the word to write -->

### kept

<!-- one line per term kept, with the note that defines it -->

<!-- the form is list -->

### swapped

<!-- one line per term moved to the swaps, with the word to write instead -->

<!-- the form is list -->

## memory

<!-- reads the agent's memory folder on this box, moves every entry that shapes how the agent works into the tree as guidance, a ticket or a rule, and deletes it there -->

### moved

<!-- one line per entry, with its home in the tree, or the reason it dies -->

<!-- the form is list -->

### emptied

<!-- the memory folder holds no entry that shapes behavior, because git carries none of it -->

<!-- the form is text -->

## tickets

<!-- reads the records of the tickets that close in the window, which are the engine's entries on each and no log -->

### returns

<!-- the steps that fail back or meet refused most, per process, with counts -->

<!-- the form is list -->

### people

<!-- what the person steps ask, and how long each waits -->

<!-- the form is list -->

### skips

<!-- what the conditions skip, and whether rightly -->

<!-- the form is text -->

## worker

<!-- reads the counts per chapter as a curve -->

### curve

<!-- errors and the length of a thought per chapter, and where they turn -->

<!-- the form is text -->

### cuts

<!-- where the worker cuts scope and calls it something else, each with its moment -->

<!-- the form is list -->

## scripts

<!-- judges every script collect took from the box -->

### kept

<!-- each script that becomes a check, a flag or a verb, with its home -->

<!-- the form is list -->

### dropped

<!-- each script that dies, with the reason -->

<!-- the form is list -->

## runs

<!-- reads the retro leaves of the groups that merged in the window -->

### lacked

<!-- what the boxes lacked and met, with what repeats across runs -->

<!-- the form is list -->

### left

<!-- what the boxes left for a person that still stands -->

<!-- the form is list -->

## unread

<!-- reads the manifest against what every leaf read -->

### unread

<!-- every line of the manifest no leaf read, and why, so the next retro inherits no hidden gap -->

<!-- the form is text -->

## method

<!-- reads this retro's own run, so the next one runs better -->

### earned

<!-- one line per leaf, with what it earned and what it cost, and the readers' questions with no answer -->

<!-- the form is list -->

### change

<!-- what changes in the retro route or its verb, and why, each a ticket the improve step mints -->

<!-- the form is list -->

# improve

<!-- mints one ticket per class, each with its home and its card -->

## tickets

<!-- one link per ticket, with its class, its home, the plan, and what the next numbers show if it works -->

<!-- the form is list -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# report

<!-- reads the retro whole and says what it misses -->

## misses

<!-- what the retro misses, or nothing -->

<!-- the form is text -->

# distribute

<!-- puts every minted ticket into a group with an urgency, cut into groups that run alone -->

## groups

<!-- one line per ticket, with its group and its urgency -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
