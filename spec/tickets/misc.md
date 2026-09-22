---
kind: [[ticket]]
state: closed
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: mints the children, or assigns standing tickets, each naming this group
    from: anyone
    by: anyone
    input: ask
    reads: [[spec/guidance/working]]
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: retro
    reads: [[spec/guidance/working]]
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not, each with its moment in the log or the transcript
          - name: improve
            form: list
            says: how each bad line stops happening, named by its home
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: d4054418ac93462a3245b794fd231fd0d83e70b7
    hash_after: 09ed3c6e746faffe23db93d52641b7064101cd89
  - step: sync
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 82ff7b56335664bba826a4ec53c101e29c6f90ad
    hash_after: 82ff7b56335664bba826a4ec53c101e29c6f90ad
    answered:
      - name: sync
        exit: 0
        said: work/misc already carries every commit on main.
  - step: split
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 5748967f44d03ad92c37373785e0b55edfd6d210
    hash_after: 5748967f44d03ad92c37373785e0b55edfd6d210
  - step: children
    hand: the engine
    hash_before: db4d7d631d459472a034b5389895b9489b00fa0e
    hash_after: db4d7d631d459472a034b5389895b9489b00fa0e
  - step: retro/notes
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: b250a2f905a08818d8c54f1ec2faa56ed762331a
    hash_after: b250a2f905a08818d8c54f1ec2faa56ed762331a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: adab088c41e7e1c3e72308dbf023db29127d650d
    hash_after: adab088c41e7e1c3e72308dbf023db29127d650d
  - step: retro/cloud
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 228222560befe3167beb43ebf0fd2f7a65291a14
    hash_after: 228222560befe3167beb43ebf0fd2f7a65291a14
reason: done
---

# Ask

Small tickets that share no topic, so one branch takes them all and this box switches off. Each stands at its design draft, and the route of each says the rest.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

./RUNME.sh branch sync


# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/a-door-holds-file-calls]], on [[spec/processes/standard]]
- [[spec/tickets/a-door-holds-three-reads]], on [[spec/processes/standard]]
- [[spec/tickets/a-lone-mark-pairs-wrong]], on [[spec/processes/standard]]
- [[spec/tickets/a-pointer-reaches-a-heading]], on [[spec/processes/standard]]
- [[spec/tickets/a-rule-names-its-failure]], on [[spec/processes/standard]]
- [[spec/tickets/every-road-reads-one-config]], on [[spec/processes/standard]]
- [[spec/tickets/one-door-joins-a-path]], on [[spec/processes/standard]]


## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child stood as one ask with four bullets, and one hand read each whole in a round
- the children are the seven drafts the group named, and the group holds no goal past them
- no child waited on another, so none names a dependency


# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

./RUNME.sh retro notes


## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

- a-lone-mark-pairs-wrong: the shared blanking pairs a span inside one line first, then over one line break
- a-door-holds-file-calls: the door rule refuses an `os` import outside a package's door. The server's tree reads through a disk a case fakes
- a-door-holds-three-reads: the door rule refuses the pid, the version and the exec path past a root. The two modules take them off the hand
- a-pointer-reaches-a-heading: the server draws a pointer at a heading its note lacks. Every such pointer in the tree names a heading now
- a-rule-names-its-failure: a shape rule refuses a marked rule of one sentence. Every marked rule under the guidance names its failure
- every-road-reads-one-config: the findings road and the copilot road hand Vale the config the assembly writes
- one-door-joins-a-path: the shared file reading joins through the hand's own join


### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the reviews and the verdicts came from hands of their own, and each round found a real gap. One found a shape the case skipped, one a caller a search missed, one a pass written under a fail
- the pull commits and pushes at every hand-back, so the branch stood current on the remote through the whole session
- the commit door's ask for a test beside each change made every module change carry a case. The cases caught the fake disk's shape and a missing style
- the route's tests-red step made each case fail on its own assertion first. The stubs answering nothing made that cheap for a Go check


### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first design of the lone mark stopped a span at a line break. The lint over the tree rose by many warnings before the probe over the wrapped spans. That stood at the ticket's first change step
- a second-round verdict wrote its pass under the first round's fail, and the field read fail. The ticket took a third round, at the verdict step of the lone mark ticket
- the pid change missed the bridge's own caller of the identity. The verdict caught an identity ending in no number, at the first verdict of the three reads ticket
- a loop handing back drafts appended one approach five times after a vocabulary refusal. That stood at the draft step of the lone mark ticket
- the commit door refused seven comment-only pointer fixes, at the change step of the pointer ticket. They landed past the door by hand
- the reviewer helpers could take no ticket by name, because the queue binding hands the top leaf to any hand. So each ticket ran alone from review to verdict


### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the lint over the whole tree runs before a rule change hands back. A rule breaking standing prose then shows at the change step
- that stands in `spec/guidance/code/testing.md` under the check rule
- a verdict chapter holds one round. The pull clears the last round's fields before it hands the step out again
- that stands in `src/scripts/pull.js` under the fail
- a changed signature meets a search for every caller before the change closes, named in `spec/guidance/code/code.md` under the search rule
- a hand-back that comes back refused stops a loop, named in the hand's own script under `.se/scripts`
- the commit door reads a hunk holding comment lines alone as prose, in `.claude/skills/level0/lib/tested.js`. The note this box parked becomes that ticket
- the pull hands a helper the ticket its spawn prompt names, so two hands work two tickets at once. This stands in `src/scripts/pull.js` under the hand-out


### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The transcript shows each ticket walked in order. The thoughts show the order was the queue's choice: the binding refused a name, so the small tickets waited behind the large one. The thoughts weighed a change to the binding and left it, because the order changes the outcome nowhere.
- The thoughts weighed writing the missing server chapters back.
- They chose to repoint every pointer at a chapter standing today. A chapter written from the code alone says what the code says twice.
- The comment-only commit past the door was a judgment the thoughts made in the open.
- The door's rule is over code, and a pointer in a comment is prose.
- So the commit says so, and the note parks the door's reading for a ticket.
- The one thing the thoughts kept returning to is the span pairing.
- The ask said one line, and the tree said one line break. The first verdict said the order of the two passes decides it.
- The tree was right on all three.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each fact the children add stands once, and each note points at its file
- the facts: the span patterns in the shared blanking, and the reads list in the door rule
- the disk interface in the server's door
- more facts: the anchor check in its file
- more facts: the sentence count in the shape rule, the assembly in the styles module, the join in the reading
- the children add one number, the count of sentences a marked rule holds. The shape rule names it beside the message, and the door files copy no number
- each header the children write says what its file is for, and counts nothing. That holds for the door of each package, the anchor check, the path readers and the memory fake


## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the index's Go cases fail on the box without the build tag the check passes. A hand running them by hand met a missing module at the change step of the file calls ticket
- nothing else: the proxy refused no host, the platform refused no right, and the installer stood every tool


### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the commit hook refused a change with no test beside it at the change step of five tickets. Each took a case
- the seven comment-only pointer fixes landed past the hook by hand
- the file ceiling met the server's tree file at the change step of the file calls ticket. The path readers moved to a file of their own
- the branch review's worktree fails a contract case that runs without Vale. It fails on the base too, so it stands outside every ask here
- no conflict met the sync, and the trunk guard met no push


### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/a-comment-hunk-is-prose]] stands open at its draft with no group, minted off the note this box parked
- the craft findings the verdicts left for a later hand: the stop channel in two doors
- the note ending pair in three files
- more of them: the box's pid no module reads, and a link check for a pointer at a missing note
- the slashes two readings in the bash door still write
- no person step parked, and the handover says the seven tickets close done and the branch waits for a merge


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
