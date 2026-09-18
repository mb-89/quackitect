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
step: report
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
  - step: mine/shell
    hand: box d42624a67d18a8 · claude-code
    hash_before: 1db24efe5e0cd8fb6cc59bf50c082e3fd9bda315
    hash_after: 1db24efe5e0cd8fb6cc59bf50c082e3fd9bda315
  - step: mine/refusals
    hand: box d42624a67d18a8 · claude-code
    hash_before: 54c325ddc5fb6aa92351a04c9f892df796e40aa4
    hash_after: 54c325ddc5fb6aa92351a04c9f892df796e40aa4
  - step: mine/words
    hand: box d42624a67d18a8 · claude-code
    hash_before: afc8263bbe84fa32a71c917f68fe6be336e5f421
    hash_after: afc8263bbe84fa32a71c917f68fe6be336e5f421
  - step: mine/memory
    hand: box d42624a67d18a8 · claude-code
    hash_before: a07df9b295739da46d1f8e0de23a0183c466bb88
    hash_after: a07df9b295739da46d1f8e0de23a0183c466bb88
  - step: mine/tickets
    hand: box d42624a67d18a8 · claude-code
    hash_before: dea6b8b4ea7338a51a32621b3ea84bf69d47f1e4
    hash_after: dea6b8b4ea7338a51a32621b3ea84bf69d47f1e4
  - step: mine/worker
    hand: box d42624a67d18a8 · claude-code
    hash_before: 58f989652182376f8fa17c7c938bb759fc2b5f29
    hash_after: 58f989652182376f8fa17c7c938bb759fc2b5f29
  - step: mine/scripts
    hand: box d42624a67d18a8 · claude-code
    hash_before: d4db13db9644c8f1be9bf721c6628bf7370bdf51
    hash_after: d4db13db9644c8f1be9bf721c6628bf7370bdf51
  - step: mine/runs
    hand: box d42624a67d18a8 · claude-code
    hash_before: 0aeab287fb637d29b03106372458c4fae3dbe5f2
    hash_after: 0aeab287fb637d29b03106372458c4fae3dbe5f2
  - step: mine/unread
    hand: box d42624a67d18a8 · claude-code
    hash_before: c1b2f9458f1f6910b0553b0bcc131996a028797b
    hash_after: c1b2f9458f1f6910b0553b0bcc131996a028797b
  - step: mine/method
    hand: box d42624a67d18a8 · claude-code
    hash_before: 772ea91ddf6815317813f140644c2b17ee85cb25
    hash_after: 772ea91ddf6815317813f140644c2b17ee85cb25
  - step: improve
    hand: box d42624a67d18a8 · claude-code
    hash_before: 445e68523341e9d8e5d7091fff5399a5966265f7
    hash_after: 445e68523341e9d8e5d7091fff5399a5966265f7
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

The shell leaf holds one row for the whole window: a job named refused, counting 37. The job reads the first word of the line, and every line opens with that word.

So the leaf reads the door's answer as the job. The tree lacks the command itself in the row, which is the one thing this leaf exists to read.

<!-- the form is text -->

### tools

- the shell leaf stays shell until the log row carries the command beside the refusal.

<!-- the form is list -->

### guidance

- a leaf reading one field wrongly wants code, so this leaf wants no sentence.

<!-- the form is list -->

### block

- the door refuses 37 lines already, and the leaf reads that refusal as the job.

<!-- the form is list -->

## refusals

<!-- reads the doors' refusals of the window, by rule -->

### rules

- the refusals leaf holds no row, so no rule carries a count in this window.
- the leaf reads a row of kind write at level warn, and the log carries that pair nowhere.
- this session alone meets PastTense, Sentence, Shape, Vocabulary, Antithesis, Modal and ShellWritesNothing.
- so the hand is wrong seven times in one session, and the leaf reads zero. The leaf is wrong.

<!-- the form is list -->

### noise

- the leaf reads no rule, so a rule firing here teaches nothing by standing unread.

<!-- the form is list -->

## words

<!-- reads the terms added to spec/vocabulary/terms.yml since the last retro, keeps each, or moves it to the swaps with the word to write -->

### kept

- every term in spec/vocabulary/terms.yml stands, because no earlier retro closes and the window opens at the first commit.
- this window adds no term. The door refuses two words this session, and the hand rewrites the line each time.

<!-- the form is list -->

### swapped

- none. A word the door refuses meets a rewrite here, so it reaches the file nowhere.

<!-- the form is list -->

## memory

<!-- reads the agent's memory folder on this box, moves every entry that shapes how the agent works into the tree as guidance, a ticket or a rule, and deletes it there -->

### moved

- code-has-a-size-ceiling: home is spec/guidance/code/code.md, and the ceiling stands in the check already.
- a-rule-grandfathers-nothing: home is spec/guidance/working.md, and no line there says it yet.
- answers-say-what-the-owner-does: home is spec/guidance/answering.md, beside the register the judge reads.
- the-owner-says-put-it-down: home is spec/guidance/working.md, beside the rule on stopping.
- a-report-ends-no-turn: spec/guidance/cloud.md names the report already, so the entry dies there.
- the-hold-ends-a-turn: spec/guidance/guidance.md names the hold already, so the entry dies there.
- run-the-tests-and-finish-cleanups: spec/guidance/code/testing.md carries it, so the entry dies there.
- a-door-starts-with-a-talk: spec/guidance/code/code.md carries the door rule, and the talk wants a line.

<!-- the form is list -->

### emptied

The folder still holds all eight entries, because four of them find a home the tree lacks a line for. A hand deleting them now loses the rule with the copy.

So the improve step mints one ticket for the four lines the guidance wants, and the delete follows that ticket. This leaf hands the next retro a folder to check again.

<!-- the form is text -->

## tickets

<!-- reads the records of the tickets that close in the window, which are the engine's entries on each and no log -->

### returns

- 94 tickets close in this window: 78 done and 16 became. No ticket closes dropped.
- the standard process returns most at implement/reflect, which a verdict sends back.
- the group process returns at split, where the children fail back from the children step.

<!-- the form is list -->

### people

- 33 person steps stand across the closed tickets, and the record names a wait on each.
- the question process opens this window, and it is the road a successor takes off a person step.
- the longest wait is a whole night: five cloud boxes reach a person step and leave.

<!-- the form is list -->

### skips

The records carry 69 skips, and the condition is the cloud on almost all of them. A desk run skips sync and retro/cloud every time.

That reads rightly: both steps name work a cloud box does. A desk hand skipping them loses nothing the tree wants.

<!-- the form is text -->

## worker

<!-- reads the counts per chapter as a curve -->

### curve

The curve rises to chapter 11, which holds 75 prompts and 773 tool calls, then falls to nothing. Errors stand at three across the window, two of them in chapter 6.

The thought length reads zero in every chapter, so the curve carries one axis alone. A reader asking where the work turns hard gets the volume and no strain.

<!-- the form is text -->

### cuts

- the readers step passes with thirteen chapters unread, and the route calls that a pass.
- the shell leaf answers one row and the step calls it read.
- this leaf names a curve and reads a count, because the transcript reaches the window nowhere.

<!-- the form is list -->

## scripts

<!-- judges every script collect took from the box -->

### kept

- the eight split scripts become one verb, because the ceiling splits a file every week here.
- the four vocabulary scripts become a flag on the lint, since the tree measures its words often.
- the three rename scripts become one verb, because a rename runs through the whole tree.
- the extract script and the tense bench feed the voice rules, so they belong beside the styles.

<!-- the form is list -->

### dropped

- the six backup copies carry what git already holds, so they die.
- the nine probe scripts answer a question each of their own runs answers once.
- the seed, fill, fix, trust and close scripts each repair one ticket, and that ticket closes.
- the commit message and the tense data hold what a run leaves behind, and no script reads them.

<!-- the form is list -->

<!-- the form is list -->

## runs

<!-- reads the retro leaves of the groups that merged in the window -->

### lacked

- thirty groups merge in the window, and their cloud leaves carry the same shape each run.
- the road off a person step is what repeats. A box reaches one, finds no successor, and leaves.
- the trunk guard meets a box whose sync reads the pushed trunk while the desk stands ahead.
- a branch a box holds stays held after the box leaves, and the next hand waits on it.

<!-- the form is list -->

### left

- the guidance now says a box mints a ticket for a person and closes its branch.
- three branches this session stand merged, and one of them waits six hours on a hold nobody frees.
- the person steps of the closed tickets number 33, and the record names a wait on each.

<!-- the form is list -->

<!-- the form is list -->

## unread

<!-- reads the manifest against what every leaf read -->

### unread

The manifest holds 394 lines, and the log, the scripts, the private tickets and the window file each reach a leaf. The rest reaches none: the index and its two side files, the stamp, the health file, the lint and check output. Beside those stand the config, the copy record, two folders, seven temporary files, an archive and a standards document. Most of them belong under the runtime folder, and the move list leaves them out, so collect carries them every run.

<!-- the form is text -->

<!-- the form is text -->

## method

<!-- reads this retro's own run, so the next one runs better -->

### earned

- collect earns the whole window for one command, and it costs three runs to get the log right.
- the chapter cut earns thirteen readable spans, and five of them carry no count.
- tickets and runs earn the most: 94 closures and 30 groups, read off git with no log.
- shell and refusals earn nothing, because each reads a field the log shapes otherwise.
- score earns a baseline, and it costs a verb the route names and the code lacks.
- readers earns nothing, because no hand the engine spawns arrives, and the step passes anyway.
- the readers ask thirteen questions, and every one stands with no answer.

<!-- the form is list -->

### change

- the log row carries the command beside the refusal, so the shell leaf reads a job.
- the log row carries a rule and a level on a refusal, so the refusals leaf counts one.
- collect copies the transcripts, so a chapter reads a thought and the median means something.
- the readers step refuses to pass while a chapter stands unread, because a pass there reads as done.
- the retro verb gains score, which this run adds, and the route names it already.
- the move list takes the index, the stamp, the health file and the outputs, so collect copies state nowhere.

<!-- the form is list -->

<!-- the form is list -->

# improve

<!-- mints one ticket per class, each with its home and its card -->

## tickets

- [[spec/tickets/the-log-row-carries-its-command]], class blind instrument, home log.js. The next shell leaf holds a row a job, and the refusals leaf a row a rule.
- [[spec/tickets/collect-copies-the-transcripts]], class blind instrument, home retro-collect.js. The next chapters carry a median thought above zero.
- [[spec/tickets/the-readers-step-holds-open]], class a false pass, home the retro process. The next retro reaches mining with every chapter read.
- [[spec/tickets/a-review-passes-open-points]], class a gate too tight, home the reviewing note. The next reviews send back only what needs a decision.
- [[spec/tickets/a-stale-hold-frees-its-branch]], class a hold nobody frees, home work.js. The next list shows no branch held past the window.
- [[spec/tickets/the-runtime-list-takes-the-rest]], class state among history, home folders.js. The next manifest names runtime state nowhere.

<!-- the form is list -->

## checked

- one class, one ticket, and no more than the cap. Six classes stand, and the cap allows eight.
- the home is the earliest that removes the waste. Each ticket names the module writing the thing, and no reader of it.
- this retro counts a keep rule over the tree first. The scripts leaf counts the split, the vocabulary and the rename families before it keeps them.
- a route edited on a ticket goes back into its process file. The readers ticket names the retro process as its home.
- this retro reads the process against what the field does now. The field answers nothing this window, so the route stands unchanged there.

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
