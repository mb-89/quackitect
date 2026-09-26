---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-agent-pulls-tickets]]
---

# Scope

`src/scripts/pull.js` holds the pull, under `./RUNME.sh ticket`, and the test
verb, under `./RUNME.sh branch`. This note covers the hand-out, the hand-back with its checks,
and the answers. It covers the record, the hold per hand, and what the
stop hook reads off the hold. The verbs around the branch stand in
[[spec/design_output/work]].

# The answers

`ticket pull` answers one word, first on its own line, with the detail under
it:

| answer | when | the hand does |
|---|---|---|
| `work` | one leaf of a ticket, with its fields, its guidance and the file to write in | the step, then pulls again naming the ticket |
| `refused` | a check fails, and the findings stand one a line | fixes it, and the ticket stays in hand |
| `wait` | nothing to hand out, and a reason per ticket the pull skips | says so, and stops. Where a person's step is all that stands, the answer names the road out, and [[spec/design_output/work#a-person-step-leaves]] carries it |
| `spawn` | the only open step excludes this hand, with a helper's name and its prompt | spawns that hand, and pulls again once it answers |
| `done` | a hand under `--as` hands its one step back | stops, because a one-step hand takes no next leaf |
| `cleanup` | a desk meets no ticket, and the check stamp reads red or stale | runs the check, then pulls again. [[spec/design_output/pull#an-empty-queue-hands-cleanup]] carries it |

The hand-out is `ticket pull`. The hand-back is `ticket pull <ticket>` with a
verdict: `--pass`, `--fail "why"`, `--became <ticket>` or `--answered <ticket>`. A leaf holding a
`verdict` field takes the verdict from the field, and the pull refuses the flag
there.

# The hand-out

The pull runs on trunk or on a work branch, and the agent runs the pull and
no other verb to get work. A box on a branch takes the group's leaves around
its tickets. What a box on trunk gets depends on where it runs.

## A name asks for one

A hand names a ticket on the pull, and the pull hands out that ticket's leaf.
The binding decides whether the ask stands:

| the binding | what a name gets |
|---|---|
| `queue` | a refusal, because the queue decides what a session takes |
| `unbound` | that ticket's leaf, where the pools reach it |
| `god` | that ticket's leaf, where the pools reach it |

The pools are the reservation. A ticket naming a group stands in that group's
branch, and a pull on trunk reads the free tickets alone. So a name reaches
what the session already stands beside, and nothing another branch holds.

A name means the hand-back where a leaf stands in hand already, and the hold
is what tells the two apart.

## An empty queue hands cleanup

A desk pull meeting no ticket, no spawn and no name answers `cleanup` in place
of `wait`, and hands the first row that applies. A ticket the pull skips, or a
person's step, keeps the `wait` and its reasons.

| order | applies where | the answer hands |
|---|---|---|
| merge | a done cloud branch stands | nothing new, because the desk pull on trunk hands it ahead of the queue through `it.ready` |
| check | the check stamp reads a failing check or names a commit other than `HEAD` | `./RUNME.sh check` |

A cleanup carries no file and no hold, so each pull reads the stamp again. A
cloud box's pull hands no cleanup.

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

A group a pull names on `main` takes its branch on a cloud box. A desk takes no
group, and takes a done cloud branch in through `branch merge`. For details,
see [[spec/design_output/work#a-desk-works-on-trunk]].

`branch take` stays a verb the engine runs on a cloud box, and a name after it
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

## A closed group hands nothing

A pull on a work branch whose group stands closed hands no leaf out. It
answers `done`, and sends the box to `branch done` and a pull from trunk. A
hand-back still lands, so a leaf in hand closes where it stands.

A box staying past the close works tickets nobody expects on that branch, and
they merge unread. For the run behind this, see [[spec/rationales/pull]].

## Children before their group

`childrenOf` walks `group` up the chain, so a group inside a group runs on the
outer branch. A step under `by: children` belongs to nobody, and the pull
derives it at every hand-out:

| the children say | the pull does |
|---|---|
| one closes `dropped` | writes a return on the step, and sends the group to its `on_fail` |
| one stands open | waits, and names the child it waits for |
| every one closes `done`, `became` or `answered` | writes a pass by `the engine`, and moves on |

A group at `children` hands no leaf out while a child stands open. So a box
with nothing at a step it can take writes no retro. The wait names the person
step each child holds, and `branch done` leaves the group at `todo`. A child
reopening past the `children` step sends the group's last leaf back there,
which leaves the group open the same way.

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
| `by: person` | a hand off a harness, a hand on a cloud box, or one under `--owner-says`. An agent at a desk waits |
| `by: agent` | a hand on a harness |
| `by: helper` | nobody yet, until the spawn lands |
| `by: retro` | a hand while its group stands at a retro step, or a note with the tag |
| `not: draft` | a hand other than the one the record names on `draft`, and every leaf under a phase |
| `not: design`, with `person-1` inserted under it | the hands the record names on the leaves the mint writes, and the person step counts for no `not` |

An agent is a hand whose environment names a harness. The command line reads
that off `CLAUDECODE`, `CLAUDE_CODE_REMOTE` or `SE_CLOUD`. A verdict comes from
a hand that leaves the tip where it stands. So a hand-back on a verdict leaf
reads the commits between the take and the tip, and refuses where one names
this ticket. A sibling hand's commit costs the reading nothing. `commitsFor`,
under `src/scripts/pull-writes.js`, answers that split off the name `landed`
writes before the first colon.

| what the flag says | what the record holds |
|---|---|
| the owner sends this hand into a person's step | the hand, and `the owner says so` beside it |
| the owner answers that step in the chat | the hand writes those words into the step |
| a hand off a harness takes it | `person`, and no name beside it |

A tracked file holds no person's name, and git carries who writes the commit.

`work.personSigns` is the stronger door on a person's hand. Switched on, a
person's hand-back on a tracked ticket meets a signed tip. The signature
reads good or untrusted-good under `git log --format=%G?`, or the pull
refuses the hand-back and names the tip. An agent's hand-back and a private ticket meet no
signature check.

## The hand and the hold

A hand is the box, the session on it, and the agent inside it where the
harness names one. `.se/.runtime/box.json` carries the box id, and the engine mints one
where none stands. It takes the random source as an argument, so a test
replays. `.se/.runtime/session.json` carries the session id and the harness name, and
the plugin wrapper writes it at `session.start`. On a harness the pull reads
both files into one hand. Every session on the box shares the session file,
and it outlives them, so a hand off a harness reads it nowhere.

| the pull reads | the hand |
|---|---|
| the box file and the session file, on a harness | `box <id> · session <id> · <agent>` |
| the box file alone, on a harness | `box <id> · <agent>`, with the agent off the environment |
| the box file alone, off a harness | `person <git author name>` |

A helper the session spawns runs on the same box under the same session file,
so it carries the session's hand. A `not` that excludes the session
excludes the helper. The hold slugs the hand into its file name.

The hold stands at `.se/.runtime/hold/<hand>.json`. It names the ticket, its path, the
step, the group, the take hash, and the guidance notes by name and hash. The
pull refuses a second hand-out while a hold stands, and `ticket pull --drop`
drops the hold with the leaf where it stands. The stop hook reads the
folder, so a turn ending with a hold standing carries on.

A clear and a compaction each empty `reads` in every hold on the box, and the
ticket and the step stay. So the next pull hands the notes again. For details,
see [[spec/design_output/stop#the-context-hands-over]].

## The hold carries ephemeral tickets

An ephemeral ticket carries no file. The pull mints it into the hold, with
`ephemeral: true` and an empty `path`, and its hand-back deletes it or hands
the next. It takes `--pass` alone. The work answer draws it as a held row at
`0`, the way it draws a plan todo.

`src/scripts/ephemeral.js` names the tickets and their asks, and
`src/scripts/ephemeral-pull.js` hands them out and takes them back. The clear
runs as three of them. For details, see
[[spec/design_output/stop#the-context-hands-over]].

## The work answer

The answer says `does` first, then the ask, then one line per field with its
form, its `expects` and what it says. It names the heading depth to write
under. A checklist on the leaf or a phase above it adds the `checked` field,
one line per item. Then come the actionables of every note the leaf reads,
and the line that hands it back.

# The queue is a score

One decider orders the queue, and every column naming an order reads that one
answer. The mark stands over the score, and the score orders everything under
it:

| the term | what it does | its weight |
|---|---|---|
| the mark | puts a ticket over every unmarked one | none, because it overrides |
| what waits under it | raises it, down the whole chain | `work.blockScore` |
| how long it stands | raises it, so nothing sits forever | `work.dayScore` |
| how often a hand-back comes back refused | raises it | `work.failScore` |

The walk reaches the whole chain, so a ticket blocking one that blocks ten
counts eleven. A ticket waiting on one still open leaves the queue before the
score reads it, and the board draws it anyway.

The weights stand in `spec/config/level0.json`, beside `failsBeforePerson`, so
tuning the queue costs an edit. `branch list --queue` writes the order the pull
hands out, and the column a board draws reads that answer.

A ticket's age comes off one `git log` over the folder holding the tickets, so
the cost stands beside the pull, once a pull.

# The queue is an outline

Every open ticket takes a place, and a closed one takes none. The score
orders the lists, and `pull-outline.js` numbers them as one outline, which
every reader draws as it stands.

| the row | its place |
|---|---|
| a step a person owns, and a draft off any route but `trivial` | negative, and the most pressing counts lowest, so `-2` stands over `-1` |
| a ticket a hand holds, or the one the plan names as the work in hand | `0`, so the queue shows what stands in hand and no letter says it |
| a group on a standing cloud branch, and its tickets | `∞`, because the cloud takes it and this box cannot |
| a step an agent takes now | counts up from `1` |
| an open step the pull holds back: one waiting on a dependency, one another hand holds | counts on after the agent's |
| a group | one number, where its best member stands |
| a ticket under a group | the group's number, a dot, and its own place under it, as `1.2` |
| a private ticket on this box | a place of its own, because the pull hands it out too |
| a note on this box | none, because it waits for its retro |
| a closed ticket | none |

An agent takes no negative place, so the person's rows stand for a person
alone. The mark holds inside each list, so an urgent step leads the agent's
rows and an urgent question leads the person's. Then the score orders: what
waits under a ticket, how long it stands, how often a hand-back comes back.

A standing branch speaks for its own group's tickets, and trunk speaks for
the rest. A merged branch speaks for nothing, because trunk holds what the
merge brings in. So a closed ticket leaves the queue whatever a branch says.

## A todo forces a place

A todo overrides the score at its own level. It is an overlay this box
holds: the queue computes first, and the override lays over it. The work
tab writes it under `places` in `.se/.runtime/plan.json`, so it stands on
this box alone, travels into no ticket and reaches no git. A private note's
own `todo` field reads the same way. The value names the row the ticket
stands before, or one of the words below:

| the todo | where the ticket stands |
|---|---|
| the name of a row | right before that row, and before that row's group where the row nests |
| `true` | first at its level |
| `last` | after every other todo at its level, and before the first row no todo places |
| `end` | after every row at its level, which a place digit past the queue writes |
| a name standing nowhere | first at its level, because the row it names stands off the queue |

A todo of the plan stands before every ticket. It anchors at `true` or on
another todo of the plan, and any other anchor reads as `last`.

The place moves as the queue drains, because the todo holds the order and
no number. Todos of the plan tied on every score keep the order the plan
writes them in. The work tab writes it under `p` and a digit, the pull hands a
tagged ticket out first, and the `T` letter lights on every tagged row.

The tab draws the place it reads and holds no rule of its own. A place
compares segment by segment as numbers, so `1.10` stands after `1.2`, and
`branch list --queue` prints the placed rows in that order.

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
| `spawn`, off a plugin | nobody: the shell moves nothing, the step stays parked, and the answer says so |

The roads below reach that answer, and each names its own taker:

| the leaf | who takes it |
|---|---|
| one the `not:` rule excludes | a person, or the hand the engine spawns |
| one under `by: helper` | the hand the engine spawns, and nobody else |

A leaf under `by: helper` reads by the road that asks. The hand-out asks whether
this hand stands under `--as`, and `branch done` asks whether the box carries a
harness to spawn one with. So a box carrying a harness holds the group until
that hand lands, and a box off one leaves the group open behind it.

| the pull says | who acts |
|---|---|
| `work` under `--as <helper>` | the spawned hand, which takes that one leaf |
| `done` after its hand-back | the spawned hand stops, and the session pulls again |

`--as <name>` appends ` · <name>` to the hand, with a hold of its own.
Such a hand works one step: its hand-back answers `done` and hands nothing
out. The record names the helper on the leaf, so `not` reads the hands
apart.

Level zero tags every other spawn. Its `agent.spawn` hook reads the session
file and puts one line at the head of the prompt. The line says this helper
is the session's own hand, and it pulls under no `--as`. A spawn the wrapper makes
itself marks its payload `own`, and carries no tag, because that hand is its own. So the kinds of
helper read apart in the prompt and in the record.

# The hand-back

## Bare pulls show the leaf

A name with no flag on a leaf in hand shows that leaf again, and lands nothing.
A leaf holding a verdict field hands back on the bare name, because the field
is its flag.

## The hand-back matches the hold

The hold names the ticket, the step and the take hash, so a hand-back is
idempotent: one sent twice moves the ticket once. The pull refuses a hand-back
naming another ticket. The record answers one already where an entry for this
step carries the hold's hash as `hash_before` and a `hash_after`. That one gets
the answer on record, pushes where the push is still owed, and drops the hold.

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

The wrapper under `.claude/skills/level0` imports nothing past its own folder,
because the plugin validator refuses an import that leaves it. So the shell
hands it the material: `ticket pull <ticket> --judge` prints the leaf's
evidence and the rules its reads name, as JSON. The wrapper asks the model
once over that, and a label answers `refused` before the shell runs. The
judge run carries the `--fields` payload of the hand-back. The material lays
the payload over the ticket before it reads the evidence, so the judge reads
what the hand writes.

The evidence holds the prose fields alone. The leaf names the form of each
field it asks for. So the material leaves out a field whose form reads
`command`, and a heading carrying no line. A chapter of commands hands the
wrapper nothing, and the wrapper then skips the judge.

### The judge answers a label

The judge picks one answer from `follows` and one label per rule it holds.
`judgeLabels` builds that set, and `ruleBroken` reads a label back to its
rule. So an answer names the rule, and the refusal carries the note, the
number and the rule's own line.

| the answer | what it does |
|---|---|
| `follows` | the shell runs, and the hand-back carries on |
| a label the material holds | `judgeRefusal` names the note, the number and the line |
| a label outside the set | the same as `follows`, because a judge naming nothing refuses nothing |

A label is the note's path under `spec/guidance`, with each slash as a hyphen,
then a hyphen and the rule's number in that note. `labelOf` writes it, and
`forEvidence` hands one per rule. A leaf reads several notes, and `actionables`
numbers from one inside each, so the note's name keeps one label on one rule.

### A rule describing an answer

`forEvidence` drops the rules a note marks, and keeps the chapter's own
numbering across the drop. So a label names the line the note holds under that
number, and a reader opens one place.

| the mark a rule ends in | what it says |
|---|---|
| the star | the rationale this note links argues for the rule |
| the answer mark | the rule describes an answer, which evidence carries nowhere |

`spec/schemas/guidance.schema.yaml` names both marks. A note writes the answer
mark in a code span, because a paragraph admits the character nowhere else,
and `actionables` strips either form. So every reader of the chapter reads the
rule whole, and the output style shows no mark.

Evidence carries no answer, so a judge reading an answer rule over evidence
refuses a hand that keeps every rule. The answer gate holds those rules
already. A leaf whose rules all carry the mark hands the wrapper an empty
list, and the judge stands silent there.

## The fields hold their forms

`chapterOf` reads the leaf's chapter by walking the headings as the route
nests, and each field is the heading one level under it. A comment, an
`answered` line and a fence count for nothing.

| form | passes where |
|---|---|
| `text`, `list`, `checklist` | one line at least |
| `command` | exactly one line |
| `link` | one line, resolving to a file or a note in the tree |
| `files` | the files under this ticket's commits since the first take, and the working tree while the tip stands at the hold's. `commitsFor` answers whose commit is whose |
| `choice` | one line, among the options |
| `verdict` | opens with `pass`, `pass with findings` or `fail`. A fail carries a finding, and a pass with findings carries a row a child, as `- <child-name>: <finding>` |
| `checked` | one line per item of the checklist, where the leaf or a phase above carries one |

The schema renders `checked` as an optional chapter under every leaf whose
chain carries a checklist, and the ticket door lets the hand write it.

## The voice reads the evidence

The hand-back reads its ticket the way `./RUNME.sh lint` reads a file, where
vale stands on the box. `voiceOver` in `src/bridge/findings.js` hands Vale a
ticket's text on stdin through `valeArgvOf`, and `readsText` reads the answer.
`findingsOver` calls both over each file the lint reads. `voiceFaults` in
`src/scripts/pull-chapter.js` hands `voiceOver` the whole ticket, with the
payload's fields under their headings.

| part | what the pull does |
|---|---|
| the text | blanks a field in no prose form and an `answered` row, so every row keeps its file line and a Vale marker holds |
| the lines | keeps a finding on the leaf's chapter, and names it at its line in the ticket |
| the level | refuses on a private name, and warns on a break of form, so the hand-back goes on and the lint names the same lines |

Every verb taking a hand's prose into a ticket reads it through `voiceOver`,
so no fix commit follows a landing.

| the verb | what it reads |
|---|---|
| the pull | the leaf's chapter, with the fields laid in |
| `ticket open` | the Ask, over the whole ticket, as [[spec/design_output/pull#a-draft-opens]] says |
| `ticket note` | the Ask it mints, before it writes |
| `retro new` | the Ask carrying the `--why` line, before it writes |

The road reads through `readsText`, the lint's own reading. `readsProse` in
`src/bridge/prose.js` serves the write door, and it drops a long sentence and a
word outside the vocabulary where it judges the finding false. The lint keeps
those findings, so a verb reading through `readsProse` lets a line through that
the lint names later.

A contract case in `test/contract/process.test.js` mints a ticket off every
route under `spec/processes`, and real Vale reads it. A line a route writes
carries no finding there, so a verb minting off a route meets no refusal over
the route's own words.

## The commands answer

A command field runs, and its exit and last line land in the record under
`answered`. `expects` names an exit code or a word, and the word compares
against the first word of the last line. A miss is a finding.

## The hand-back refused

A refusal keeps the hold and counts on it. At `work.refusalsBeforeFail`
refusals the pull fails the leaf back, carrying the count and the first
finding as the reason. So the fail road below answers from there on.

# The pass

The engine writes one entry into `record`: the step, the hand, the take hash,
the tip now, and every command's answer. It moves `step` to the next leaf,
skipping the ones whose condition fails, or closes the ticket `done` past the
last. It sets `state: open`, stages everything, and commits as `<ticket>:
<what changes>`. Then it drops the hold, pushes, and hands out the next leaf.

## A finding rides out

A verdict opening `pass with findings` mints a child ticket a row, and the
parent goes on to its next leaf. `verdictIn` in `src/scripts/pull-chapter.js`
answers `findings` with each row's name and finding, and a plain `pass` keeps
its rows as the reason.

| the row | what the hand-back does |
|---|---|
| no row under the opener | refuses, and the hold stands |
| a row naming no child | refuses, and names the row |
| a name past `names.words` | refuses, and names the name |
| a name a ticket carries, or a name twice | refuses, and names the name |
| every row sound | mints each child, then passes the parent |

`minted` in `src/scripts/pull-writes.js` builds every child before it writes
any. A child follows `spec/processes/trivial.yaml` and stands at `draft`. It
carries `parent`, the parent's `group` where one stands, and the finding as its
Ask. The children land in the parent's pass commit, whose subject reads
`<parent>: passes <leaf>, mints <a>, <b>`. A private parent writes its children
under `.se/tickets`. The hand that fills a child's ask opens it.

## The record holds the answers

`withEntry` writes one entry as YAML rows. A list of objects under a key nests
one level deeper, which is how `answered` lands.

## The rejected push

`pushed` in `src/scripts/pull-push.js` lands a hand-back on origin, and it
answers `{ ok, local, why }`. Each caller prints `why`, so the hand reads the
real cause. The hold drops before the push, because the hand-back stands by
then. A hold past that point stands on a closed ticket, and the stop hook holds
the turn open for a hand-back nobody owes.

| the road | what `pushed` does |
|---|---|
| a desk | pushes nothing and runs no check: the hand-back stands on this box, as with the commit verb. [[spec/guidance/working]] |
| trunk | runs `./RUNME.sh check` over the commit first, so the stamp names the commit the push carries |
| a red check | pushes nothing, and the answer names the check's own lines |
| a tests-red leaf | stands on this box on trunk, and the next green push carries it |
| a moved branch | fetches, rebases once, and pushes again |
| a rebase on trunk | runs the check again, because the rebase moves the commit off the stamp |
| any other refusal | answers the push door's own lines, and runs no rebase |
| a work branch | pushes with no check, because its push meets no battery |

Git names a moved branch with `fetch first` or `non-fast-forward`, and the
rebase runs on those words alone. A rebase that fails puts the tree back, and
the answer says to push the branch and pull again.

The cost: a pass on trunk runs one full check, and the hand runs none of its
own. At tests-green the `check` field runs the check, and `pushed` runs it again.

The re-push of a hand-back the record holds already answers the same way.
`repairPersonSteps` in `src/scripts/pull-hand.js` lands the engine's own repair,
and it reads no answer, so it stays quiet.

## The refused commit

The pre-commit hook reads the commit a hand-back makes, and a private line
in the tree refuses it. Then nothing lands. The ticket file goes back to
what the hand writes, the index empties, and the hold stays. The pull answers
`refused` with the hook's finding, so the hand fixes the line and hands back
again. So a record's `hash_after` names a commit the branch holds, and a
refused commit writes no record. `src/scripts/pull-landed.js` holds the landing.

A hand-back stages the ticket, the children it mints, and the files its hand's
journals name. The apply door writes the ticket a call serves into its undo
journal, and a journal stamped before the hold takes the ticket counts none. So
a sibling hand's edit stays out of the commit.

A hand writing through no journal hands back the whole tree, less the files the
other tickets' journals name. The engine lands a skip, a close, a repair or an
unblock on the side. Such a
landing stages and commits the ticket files it writes alone. So a hand's edits
stay out of a commit naming another ticket.

# The fail

`--fail "why"` writes an entry with the reason and `returns`, one past the
most this step carries. It sets `step` to the row's `on_fail`, or to the leaf
itself where none stands. A phase named there sends the ticket to its first
leaf. At `work.failsBeforePerson` returns the pull puts a person step in before
the target, asking the fail's reason, and the step rides the fail commit. A
first fail below the cap goes back with no step. For the road past the cap, see
[[spec/design_output/pull#a-count-asks-a-person]].

A fail says the step works not, so its commands run for the record and refuse
nothing. A step whose evidence stands red is exactly a step a hand fails, and
the record carries what each command says. The fields of the chapter still have
to stand, because a fail says why in them.

## A person step goes in

A question carries a grade, and the grade picks the road:

| the grade | who answers it | the road |
|---|---|---|
| design, which the notes under `spec/design_input` leave open | the owner | `branch escalate`, which inserts the person step below |
| craft, which those notes settle | the implementer | a row under the design review's plain `pass`, which the implement step reads |

So a craft question reaches the implementer through a road the engine holds
already, and the route takes on no person step. [[spec/guidance/working]] and
[[spec/guidance/review/design]] each carry the rule naming the grade.

`withPersonStep` puts a step named `person-<n>` before the target, `by:
person`, `to: engine`, with the question under `asks` and one `answer`
field. It points `step` at the inserted row and leaves the state at `open`,
so the ticket is a person's to pull.

- a desk writes `by: person` there
- a cloud box writes `by: anyone`, because it answers every question this branch meets, as [[spec/guidance/cloud]] says

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

## A count asks a person

A design review fails an unusable approach alone, so a second fail says
the approach stays unusable. The owner rules that it goes to the owner. `failed` in
`src/scripts/pull-writes.js` calls `withPersonStep` before it lands, so the
person step and the fail share one commit. The counts below stand:

| the count | what the pull does |
|---|---|
| `work.refusalsBeforeFail` | fails the leaf back, carrying the count and the first finding, and the fail count reads it |
| `work.failsBeforePerson` | puts a person step in before the target, asking the reason |
| `work.stepsBeforeSplit`, at its cap | leaves the person step out, drops the hold and answers `wait` |

A desk writes `by: person` on that step, and a cloud box writes `by: anyone`
and answers it itself.

[[spec/rationales/cloud]] carries what a count costs where it reaches a person
first.

# A leaf comes back

`ticket pull <ticket> --back <leaf>` puts a leaf back into the hand that
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

# Answered

`--answered <ticket>` closes the ticket with `reason: answered`, and the
record entry's `why` names the ticket answering its ask. That ticket stands
in the tree and is another one, or the pull refuses. The hand-back checks the
hold and the hand, and reads no field of the leaf, because the answering
ticket carries the evidence. The reason tells the closes apart: `became`
names where the work goes on, and `answered` names where it stands done.

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
writes, and nothing else. A group opens with its children standing, as
[[spec/design_output/work#a-group-is-a-ticket]] says.

A draft on the `trivial` route waits on no person:

- the pull opens it through `opensDraft` in `src/scripts/ticket.js`, the verb's own road
- the pull hands its first leaf
- the queue counts it among the agent's rows
- a refusal on that road leaves the draft standing, and the wait answer names the refusal

The verb reads the voice rules over the Ask too. A break of form warns, names
each line, and the ticket opens. A private name refuses. `askFaults` in
`src/scripts/ticket-ask-lint.js` hands `voiceOver` the whole ticket, and keeps
the findings on the Ask's lines, so a line number names the file's line. The
Ask is the engine's from the open on, so the ticket door refuses every later
hand there. A box with no Vale opens as it stands.

`ticket note` and `retro new` write an Ask from a hand's line, and read it
through `askFaults` before they write. Their refusal reads as the open's does.

- It writes no file.
- It names each finding at its line.
- It exits with a fault, so a script stops there.

The cost: a draft whose Ask carries a warning stops opening until a hand
rewrites its Ask. The refusal names each line, so the rewrite takes minutes.

The open lands in one commit naming the ticket, through `landedAlone` in
`pull-landed.js`. A commit the hook refuses puts the draft back, and the verb
exits with a fault.

## The blank lines stand

`askFaults` hands Vale the whole ticket, so every blank line and every table
stand as the file holds them. A blank line is what parts a paragraph from a
table, so Vale reads the parts the writer means. `askLines` keeps the Ask's
rows for the test on an empty Ask alone.

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

The tests stand in Node and Go, and the verb runs both. A changed `*.test.js`
joins the node run, and a changed `*_test.go` names the module under `src` that
holds it, which the verb runs with `go test`. The answer reads green where
every run does, and it names the first that does not.

## The test verb takes names

`./RUNME.sh test` with names runs this same verb over them:

- a bare `./RUNME.sh test` runs the whole suite, as the check does
- a named folder under `src` names the module at or above it
- a named run reads no branch point
- a named run takes the check's spawn tally, and a Go run takes `goEnvOf` too

## A test proves red

`./RUNME.sh test --red <test> <source>...` proves a test fails for the reason
it names. It writes each source's working text under `.se/.runtime/red`, with
a list of the sources. Then it writes each source as `HEAD` holds it, and a
source new to the change stands aside whole. It runs the test, and puts every
source back.

| the test answers | the verb answers | exit |
|---|---|---|
| `assertion` | `red` | 0 |
| anything else | `refused` | 1 |

A run killed while the sources stand aside leaves the list on disk, and the
next run puts them back before it starts.
