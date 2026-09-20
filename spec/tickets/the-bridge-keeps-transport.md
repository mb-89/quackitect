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
urgent: true
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box fa49097ce66c · claude-code-remote
    hash_before: c09f7d6b59b03a07bef340db575ad54235c99398
  - step: sync
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 9f8eaf16be55eb3c26138d03d43e72b056b6d826
    hash_after: 9f8eaf16be55eb3c26138d03d43e72b056b6d826
    answered:
      - name: sync
        exit: 0
        said: work/the-bridge-keeps-transport already carries every commit on main.
  - step: split
    hand: box fa49097ce66c · claude-code-remote
    hash_before: eece86491dd64d1b9e71bf59dfcd2f041561440f
    hash_after: eece86491dd64d1b9e71bf59dfcd2f041561440f
  - step: children
    hand: the engine
    hash_before: 02237bc0be71b193126b2526574b8e69a7fbfe87
    hash_after: 02237bc0be71b193126b2526574b8e69a7fbfe87
  - step: retro/notes
    hand: box fa49097ce66c · claude-code-remote
    hash_before: fcd48eea6334a0461a1093b17dad21b6103cb1da
    hash_after: fcd48eea6334a0461a1093b17dad21b6103cb1da
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 9f3c045c581ee93e6956abc48aaee424f7560359
    hash_after: 9f3c045c581ee93e6956abc48aaee424f7560359
  - step: retro/cloud
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 8882f70ac33d82ab614135f87b2b19f7208b15f3
    hash_after: 8882f70ac33d82ab614135f87b2b19f7208b15f3
reason: done
---

# Ask

The session's own machinery holds its state and says when it falls. The retro
found the turn reopening after a standing stop. The canary comes due on every
call. The answer door refuses the work that answers it. Tools answer nothing
after a restart, and the bridge dies unnoticed. Each ticket here fixes one of
those, and the engine takes the work the bridge does past transport.

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

- [[spec/tickets/a-standing-stop-ends-turns]], standard
- [[spec/tickets/the-canary-pays-once]], standard
- [[spec/tickets/the-canary-survives-a-restart]], trivial
- [[spec/tickets/the-answer-door-reads-chat]], standard
- [[spec/tickets/the-session-file-proves-itself]], standard
- [[spec/tickets/the-session-says-its-cage]], trivial
- [[spec/tickets/the-bridgehead-needs-no-shell]], trivial
- [[spec/tickets/the-cloud-setup-installs]], trivial
- [[spec/tickets/the-check-starts-the-server]], trivial
- [[spec/tickets/the-server-holds-its-socket]], trivial
- [[spec/tickets/the-bridge-says-it-falls]], standard
- [[spec/tickets/the-doctor-probes-every-hook]], standard
- [[spec/tickets/the-tools-answer-after-restart]], standard
- [[spec/tickets/an-engine-takes-bridge-work]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child carries one ask, and each one reviews whole under its own verdict
- the ask names a fault a line, and a child answers each one
- no child waits on another, so `depends_on` stands empty on every one

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

- `a-standing-stop-ends-turns`: a turn that ends stays ended, and the hook holds it closed
- `the-canary-pays-once`: one line pays the canary for the session
- `the-canary-survives-a-restart`: the debt reads the session log, so a restart keeps it
- `the-answer-door-reads-chat`: the door lets the calls carrying the work through
- `the-session-file-proves-itself`: a case drives the level one hook, and the wrapper reads every session id
- `the-session-says-its-cage`: a session whose server stands down reads one block saying so
- `the-bridgehead-needs-no-shell`: the start road runs node, so a Windows box starts its server
- `the-cloud-setup-installs`: a cloud box installs its modules, so the cage reaches the first prompt
- `the-check-starts-the-server`: one command off a fresh clone reads every rule
- `the-server-holds-its-socket`: a kept socket outlives the gap between two events
- `the-bridge-says-it-falls`: a bridge answering nothing says so in the chat, beside its log row
- `the-doctor-probes-every-hook`: the doctor probes every hook address the settings files name
- `the-tools-answer-after-restart`: a restarted server fills its box, so the tools register whole
- `an-engine-takes-bridge-work`: each reader stands in the folder owning its topic
- the private box drains, and `.vale.ini` gives it the register a ticket takes

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the write door catches a voice break at the write, so a draft reaches its review clean
- a spawned hand takes the step a `not:` rule holds away from me, and the route runs on
- a verdict hand kills a mutant a case claims to catch, so the case earns its green
- `./RUNME.sh check` answers every hand the same way, so a green branch stays green
- the engine commits each hand-back, so the record and the tree move together

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- hands opening at once all took one leaf. The moment stands at `a-standing-stop-ends-turns`.
- a review failed a draft back for a claim written from memory. The moment stands at `the-tools-answer-after-restart`.
- the canary fix read a torn log line and answered false. The moment stands at `the-canary-survives-a-restart`.
- the write door refuses the word a note's decision takes. The moment stands at `retro/notes` here.
- a rename by `sed` pointed the server at a file standing nowhere. The moment stands at `an-engine-takes-bridge-work`.
- the Vale span times out under load, and the check reads red. The moment stands at `two-checks-time-vale-out`.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- [[spec/design_output/pull]]: the pull takes a held leaf out of its answer, so hands run beside each other
- [[spec/guidance/review/reviewing]]: a draft names what it reads beside each claim
- `.claude/skills/level0/lib/log.js`: every line-per-row reader takes the tolerant one
- `.vale.ini`: the private box takes the register a ticket takes, which this branch lands
- [[spec/guidance/working]]: a rename over many files runs through `mcp__level0__replace`
- `spec/config/styles`: the rule carries a span a slow box meets, and a timeout reads apart from a rule

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The hand rule sets the pace here, and it carries a cost. A `not:` step wants a
hand other than the one that wrote the step before it. So every review and every
verdict opens a hand of its own, and each reads the tree from nothing.

- the engine names the hand to spawn, so the road is clear, and the road is slow
- a review failed a draft for a claim from memory more than once, each at a full round
- the rule an answer takes covers it: make no assertion from recall

The write door refuses a line, and the refusal names the rule and the line. So a
fix takes one edit, and every answer on this branch holds to one voice. A hand
reads that loop as friction, and the friction is the point.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact here points at the ticket or the file holding it, and repeats none of it
- the retro writes no count, and names the command answering one
- each field carries what its header asks for, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the box carries no editor folder, so `doctor` reads the sidebar link as absent
- no host the proxy refused in this window, because the work reaches the tree alone
- no install failed, and every tool the survey wants answers at `./RUNME.sh doctor`
- no right the platform refused, and no tool call met a permission gate

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- `./RUNME.sh branch sync` reads the branch as carrying trunk, so no conflict stands
- the write door refused a write at each voice break, and named the rule and the line
- the private door refused a home path in a case, which then took a user naming nobody
- the hand rule refused my own hand at each review and each verdict, so each opened a hand
- the stop hook held the turn open, so the route ran leaf by leaf with no prompt between
- no case fails on this box alone, and `./RUNME.sh check` answers 0 at every hand-back

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step stands parked, because every leaf here takes an agent
- the notes deciding as `became` name their successor, and nothing stands minted for them
- `HANDOVER.md` carries those successors in a table, because the private box goes with this box
- the handover names the timeout that reads red now and then, and how to tell it apart

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
