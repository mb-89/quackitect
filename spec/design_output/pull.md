---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-agent-pulls-tickets]]
---

# Scope

`src/scripts/pull.js` holds the pull and the test verb, under `./RUNME.sh
branch`. This note covers the hand-out, the hand-back with its checks,
and the answers. It covers the record, the hold per hand, and what the
stop hook reads off the hold. The verbs around the branch stand in
[[spec/design_output/work]].

# The answers

`branch pull` answers one word, first on its own line, with the detail under
it:

| answer | when | the hand does |
|---|---|---|
| `work` | one leaf of a ticket, with its fields, its guidance and the file to write in | the step, then pulls again naming the ticket |
| `refused` | a check fails, and the findings stand one a line | fixes it, and the ticket stays in hand |
| `wait` | nothing to hand out, and a reason per ticket the pull skips | says so, and stops |
| `spawn` | the only open step excludes this hand, with a helper's name and its prompt | spawns that hand, and pulls again once it answers |
| `done` | a hand under `--as` hands its one step back | stops, because a one-step hand takes no next leaf |

The hand-out is `branch pull`. The hand-back is `branch pull <ticket>` with a
verdict: `--pass`, `--fail "why"` or `--became <ticket>`. A leaf holding a
`verdict` field takes the verdict from the field, and the pull refuses the flag
there.

# The hand-out

The pull runs on trunk or on a work branch, and the agent runs the pull and
no other verb to get work. A box on a branch takes the group's leaves around
its tickets. What a box on trunk gets depends on where it runs.

## The engine takes the branch

The agent pulls, and the engine decides whether a branch comes with it:

| the box | the plain pull on trunk |
|---|---|
| a cloud box | runs `branch take`, which claims a group and moves the box onto its branch |
| a desk | hands out the free tickets, and takes no branch |

A free ticket stands in no group and is no group, so `freeIn` answers it. A
group works on a branch, and the cloud takes that branch. So a desk pull
meeting an open group standing without a branch cuts `work/<name>` from trunk.
It pushes the branch, and the group leaves the desk's queue with that.

A desk takes a group on two roads alone, and both run through the pull:

| road | the desk types | the engine does |
|---|---|---|
| the owner names it | `branch pull <group>` | `take(group)`, which switches onto that branch alone |
| its urgency reads `now` | `branch pull` | takes the first such group, by name order |

`branch take` stays a verb the engine and a person run, and a name after it
picks one branch. No hand runs it by itself. A free ticket carrying the `todo`
tag comes before every other free ticket, so `ticket todo` orders a desk's
queue the way it orders the notes.

## The pull fetches first

Every hand-out and hand-back fetches the branch. Where origin holds commits
this box lacks, the pull fast-forwards. It refuses where each side holds a
commit the other lacks.

## What a hand-out reads

The pull reads every ticket under `spec/tickets` and `.se/tickets`, and offers
them in pools, each in the order of urgency then name:

1. a private ticket carrying `todo: true`
2. the children of this group, and their children
3. the group's own ticket
4. the private tickets that stay

A ticket offers where it stands `open` and every `depends_on` stands `closed`
here or on trunk. Its current leaf then admits this hand or it stays. The
first leaf that admits a hand goes out, so a child at an agent step comes
before the group's own leaves.

## Children before their group

`childrenOf` walks `group` up the chain, so a group inside a group runs on the
outer branch. A step under `by: children` belongs to nobody, and the pull
derives it at every hand-out:

| the children say | the pull does |
|---|---|
| one closes `dropped` | writes a return on the step, and sends the group to its `on_fail` |
| one stands open | writes `skipped` with the reason, and hands the group's next leaf out |
| every one closes `done` or `became` | writes a pass by `the engine`, and moves on |

The group's last leaf then checks the children again. One still open sends
the step back to `children` and leaves the group open. So `branch done` names
the child, and the group returns to the beat once a person answers on the
branch.

## A condition skips a leaf

`when` reads `cloud`, `desk` or `returned`. `cloud` and `desk` read the doors
the command line hands in off the environment. `returned` holds where the
newest record entry that is no skip carries `returns`, which a fail writes. A
leaf whose condition fails takes a `skipped` entry with the reason. The pull
then moves to the next leaf, or closes the ticket `done` past the last.

## A need is a verb

`needs` names verbs as `branch test` or `retro notes`. The pull holds the table
of what this box answers, and a need it lacks answers `wait` with the reason.
`retro notes` stands as the first retro verb, and passes where `.se/tickets`
holds no open note.

## The hand rule

| the route says | the pull admits |
|---|---|
| `by: person` | a hand off a harness, and an agent waits |
| `by: agent` | a hand on a harness |
| `by: helper` | nobody yet, until the spawn lands |
| `by: retro` | a hand while its group stands at a retro step, or a note with the tag |
| `not: draft` | a hand other than the one the record names on `draft`, and every leaf under a phase |
| `not: design`, with `person-1` inserted under it | the hands the record names on the leaves the mint writes, and the person step counts for no `not` |

An agent is a hand whose environment names a harness. The command line reads
that off `CLAUDECODE`, `CLAUDE_CODE_REMOTE` or `SE_CLOUD`. A verdict comes from
a hand that leaves the tip where it stands. So a hand-back on a verdict leaf
refuses where the tip differs from the take.

`work.personSigns` is the stronger door on a person's hand. Switched on, a
person's hand-back on a tracked ticket meets a signed tip. The signature
reads good or untrusted-good under `git log --format=%G?`, or the pull
refuses the hand-back and names the tip. An agent's hand-back and a private ticket meet no
signature check.

## The hand and the hold

A hand is the box, the session on it, and the agent inside it where the
harness names one. `.se/box.json` carries the box id, and the engine mints one
where none stands. It takes the random source as an argument, so a test
replays. `.se/session.json` carries the session id and the harness name, and
the plugin wrapper writes it at `session.start`. The pull reads the two files
into one hand.

| the pull reads | the hand |
|---|---|
| the box file and the session file | `box <id> · session <id> · <agent>` |
| the box file alone, on a harness | `box <id> · <agent>`, with the agent off the environment |
| the box file alone, off a harness | `person <git author name>` |

A helper the session spawns runs on the same box under the same session file,
so it carries the session's hand. A `not` that excludes the session
excludes the helper. The hold slugs the hand into its file name.

The hold stands at `.se/hold/<hand>.json`. It names the ticket, its path, the
step, the group, the take hash, and the guidance notes by name and hash. The
pull refuses a second hand-out while a hold stands, and `branch pull --drop`
drops the hold with the leaf where it stands. The stop hook reads the
folder, so a turn ending with a hold standing carries on.

## The work answer

The answer says `does` first, then the ask, then one line per field with its
form, its `expects` and what it says. It names the heading depth to write
under. A checklist on the leaf or a phase above it adds the `checked` field,
one line per item. Then come the actionables of every note the leaf reads,
and the line that hands it back.

# A hand of its own

A step under `not` excludes the hand the record names on the step it names,
and one box holds one hand. So where such a step is the only work, the pull answers
`spawn`, with the name of a hand to make and the prompt it takes. The owner
rules that on a cloud box the session spawns that hand itself, and the
wrapper under level one spawns it through the hook. The design input's line
that a session's helper reviews none of its work yields to that ruling.

| the pull says | who acts |
|---|---|
| `spawn`, a helper name and a prompt | the wrapper calls the harness, or the session spawns a subagent with the prompt |
| `spawn`, off a plugin | nobody: the shell moves nothing, the step stays parked for a person or a spawned hand, and the answer says so |
| `work` under `--as <helper>` | the spawned hand, which takes that one leaf |
| `done` after its hand-back | the spawned hand stops, and the session pulls again |

`--as <name>` appends ` · <name>` to the hand, with a hold of its own.
Such a hand works one step: its hand-back answers `done` and hands nothing
out. The record names the helper on the leaf, so `not` reads the two hands
apart.

Level zero tags every other spawn. Its `agent.spawn` hook reads the session
file and puts one line at the head of the prompt. The line says this helper
is the session's own hand, and it pulls under no `--as`. A spawn the wrapper makes
itself marks its payload `own`, and carries no tag, because that hand is its own. So the two kinds of
helper read apart in the prompt and in the record.

# The hand-back

## The hand-back matches the hold

The hold names the ticket, the step and the take hash. The pull refuses a
hand-back naming another ticket. The record answers one already where an
entry for this step carries the hold's hash as `hash_before` and a
`hash_after`. That one gets the answer on record, pushes where the push is
still owed, and drops the hold.

A hold is stale where the ticket stands at another step, or where the take
hash is no ancestor of the tip. Then the hold drops, and the hand pulls again.

## The fields ride the payload

A hand fills the slots through the write door, or hands the fields back as
the pull's payload. `--fields '{"verdict": "pass"}'` carries one key per
field of the leaf in hand, and `checked` where a checklist stands. The engine
puts each text under its heading in memory, past the mint's comments, and runs
the checks over that text. The pull refuses a key naming no field of the leaf.

A refused payload reaches no disk. It rides the hold, so the next hand-back
with no `--fields` meets the same checks over the same text. A refusal at the
cap inserts the person step on the ticket without the payload, so a word the
rules refuse reaches no branch.

## The checks

1. the hold, as above
2. the schema over the whole ticket, then every field of the leaf against its form
3. every command field, run from the root through `sh -c`
4. the hand rule, and the tip on a verdict leaf
5. the judge, which runs in the plugin wrapper alone

Every check but the judge runs in the shell, so a person's hand-back meets them too.

The wrapper under `.claude/skills/level1` imports nothing past its own folder,
because the plugin validator refuses an import that leaves it. So the shell
hands it the material: `branch pull <ticket> --judge` prints the leaf's
evidence and the rules its reads name, as JSON. The wrapper asks the model
once over that, and a `breaks` answers `refused` before the shell runs. The
judge run carries the `--fields` payload of the hand-back. The material lays
the payload over the ticket before it reads the evidence, so the judge reads
what the hand writes.

## The fields hold their forms

`chapterOf` reads the leaf's chapter by walking the headings as the route
nests, and each field is the heading one level under it. A comment, an
`answered` line and a fence count for nothing.

| form | passes where |
|---|---|
| `text`, `list`, `checklist` | one line at least |
| `command` | exactly one line |
| `link` | one line, resolving to a file or a note in the tree |
| `files` | every file the branch changes since the first take stands in it |
| `choice` | one line, among the options |
| `verdict` | opens with `pass` or `fail`, and a fail carries a finding |
| `checked` | one line per item of the checklist, where the leaf or a phase above carries one |

The schema renders `checked` as an optional chapter under every leaf whose
chain carries a checklist, and the ticket door lets the hand write it.

## The voice reads the evidence

The hand-back runs the voice rules over the leaf's chapter where vale stands
on the box, the way the write door does. An error is a finding, so the sweep
names nothing later that the hand-back let through.

## The commands answer

A command field runs, and its exit and last line land in the record under
`answered`. `expects` names an exit code or a word, and the word compares
against the first word of the last line. A miss is a finding.

## The hand-back refused

A refusal keeps the hold and counts on it. At `work.refusalsBeforePerson`
refusals the pull inserts a person step carrying the first finding, and the
ticket waits for a person.

# The pass

The engine writes one entry into `record`: the step, the hand, the take hash,
the tip now, and every command's answer. It moves `step` to the next leaf,
skipping the ones whose condition fails, or closes the ticket `done` past the
last. It sets `state: open`, stages everything, and commits as `<ticket>:
<what changes>`. Then it drops the hold, pushes, and hands out the next leaf.

## The record holds the answers

`withEntry` writes one entry as YAML rows. A list of objects under a key nests
one level deeper, which is how `answered` lands.

## The rejected push

A push origin refuses fetches the branch, rebases once, and pushes again. A
rebase that fails stops and puts the tree back, and the pull answers
`refused` with the branch moving. The hand-back stands by then. The record
carries its answer, the ticket stands at its next leaf or closed, and the
commit stands on the box. So the hold drops before the push, and the refusal
says to push the branch and pull again. A hold past that point stands on a
closed ticket, and the stop hook holds the turn open for a hand-back nobody
owes.

## The refused commit

The pre-commit hook reads the commit a hand-back makes, and a private line
in the tree refuses it. Then nothing lands. The ticket file goes back to
what the hand writes, the index empties, and the hold stays. The pull answers
`refused` with the hook's finding, so the hand fixes the line and hands back
again. So a record's `hash_after` names a commit the branch holds, and a
refused commit writes no record. `src/scripts/landed.js` holds the landing.

# The fail

`--fail "why"` writes an entry with the reason and `returns`, one past the
most this step carries. It sets `step` to the row's `on_fail`, or to the leaf
itself where none stands. A phase named there sends the ticket to its first
leaf. At `work.failsBeforePerson` returns the pull inserts a person step
before the target.

## A person step goes in

`withPersonStep` puts a step named `person-<n>` before the target, `by:
person`, `to: engine`, with the question under `asks` and one `answer`
field. It points `step` at the inserted row and leaves the state at `open`,
so the ticket is a person's to pull.

The engine reads the answer, so the slot check finds a reader. A
hand-out repairs a standing person step that names no reader. The route
re-renders through the reader the mint uses. So every chapter the hand fills
stays, and the new one takes its comment. A ticket carrying
`work.stepsBeforeSplit` person steps refuses another, and asks for a split.

A hand that cannot go on without a person runs `branch escalate <question>`,
and `--options a,b,c` makes the answer a choice. The verb reads the hold
and puts the person step before the held leaf through the same function.
Then it drops the hold, commits by ticket and step, pushes, and hands out
the next ticket. With no hold standing it refuses and names the pull. So a
hand reaches the person step, and one mechanism inserts every kind.

## A settle step goes in

A count of returns says two agent hands disagree. It says nothing about who
settles that, so the count inserts a step another agent takes:

| the step | what it reads |
|---|---|
| `settle-<n>` | `by: anyone`, `to: engine`, the findings under `asks` |
| the answer | the decision, and why it stands |

`withSettleStep` puts it in through the same inserter the person step uses.
Two counts reach it:

- a step failing back, at `work.failsBeforePerson`
- a hand-back meeting refused, at `work.refusalsBeforePerson`

A ticket carrying `work.stepsBeforeSplit` settle steps hands the question to a
person instead. So the agents settle first, and a person answers where they
reach no answer.

[[spec/rationales/cloud]] carries what a count costs where it reaches a person
first.

# A leaf comes back

`branch pull <ticket> --back <leaf>` puts a leaf back into the hand that
holds its record entry. The record names this hand on that leaf, or the pull
refuses, so nobody takes another hand's work back. The pull writes a return with the
reason, sets `step` to the leaf, commits, pushes and hands the leaf out again.
So a hand fixes what the sweep names later through the one road there is.

# Done leaves no takeable step

`branch done` refuses while a ticket of the group stands at a step a hand
can take. A hand can take a step where `by` names no person, no child and no
helper, and the box holds every verb it needs. A step under `not` counts, because a spawned hand takes
it. So a box leaves a group only when every open step waits for a person, or
when the group closes.

# The group holds the turn

The stop hook reads the group ticket of the branch the box stands on. A
newest record entry with `hash_before` and no `hash_after` on an open group
fires `the-group-stands-in-hand`, which carries the turn. So a cloud box
keeps pulling until `branch done` writes `hash_after`, and the rule
`the-session-is-new` stays off on a cloud box, because nobody sits beside it
to ask.

# Became

`--became <ticket>` closes the ticket with `reason: became` and names the
successor. The successor stands in the tree already, or the pull refuses.
The hand-back checks the hold and the hand, and reads no field of the leaf,
because the successor carries the work from here.

# The private queue

A private ticket takes no hash, no commit and no push, because git ignores
`.se`. A note, `by: retro`, goes to the hand whose group stands at a retro
step. A note with the tag goes first, to anybody.

The stop hook counts an open private ticket the way it counts a hold, so a
breakdown a hand mints carries the turn. A note carries nothing, because it
waits for a retro.

# A draft opens

`ticket open <name>` turns a draft into an open ticket at its first leaf, and
refuses while the ask stands empty. So the pull hands out what a person
writes, and nothing else.

The verb reads the voice rules over the Ask too, and refuses one that breaks
a rule at the error level. The Ask is the engine's from the open on, so the
ticket door refuses every later hand there. A rule broken past the open
stands in the lint over the tree until a person reaches for the door.
`src/scripts/ask-lint.js` holds the run, and a box with no Vale opens as it
stands.

## The blank lines stand

`askLines` hands Vale the Ask with every blank line in it, and drops the
placeholder comments alone. A blank line is what parts a paragraph from a
table, so Vale reads the parts the writer means.

Rows that drop the blanks run a table into the prose around it. Vale then reads
the run as one paragraph, and the sentence rule counts the whole of it as one
sentence. An Ask passing the lint over the tree comes back refused at the open,
and the line it names holds no words at all.

# The test verb

`branch test` runs the tests the branch adds or changes since the ticket's
first take, or the files it names. It answers one word with a reason:

| answer | exit | means |
|---|---|---|
| `green` | 0 | every test it runs passes |
| `assertion` | 1 | a test fails on its own assertion |
| `build` | 1 | a file loads no test, or a test fails outside an assertion |
| `missing` | 1 | the branch changes no test |

The delta reads off `git diff` from the first `hash_before` on the ticket in
hand, or from the branch point where no hold stands. The files git has yet to
see count too.

The run names the tap reporter. Node past version 23 answers a pipe with the
spec reporter too, so the count reads the tap lines.
