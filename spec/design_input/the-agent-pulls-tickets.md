---
kind: [[design_input]]
---

# Scope

Level zero is agent control, and it stands. Level one is the ticket system.
The owner asks for one thing of the agent: it pulls tickets, works the ticket
in hand, and pulls again. The ticket system decides which ticket comes back. A
person reads and works the same tickets, in the same files, with the same
verbs.

Processes mint the tickets, and the state machines of level two read the
tickets and see where the work stands. The agent knows nothing of either. The
word is ticket. Work token and work item retire, and one word names the thing
everywhere.

This note settles the shape of level one:

- what a ticket is, and the two kinds of ticket
- the lifecycle, the route and the evidence a ticket carries
- the group, which is a branch, and the claim on it
- the pull, and what its other side checks
- hands, escalation and guidance
- what a person sees and does
- what level zero changes, and what level two reads
- the order the work lands in

It reads `main` at commit 3cf9076, with eleven work branches standing. It
carries the rulings v3 and v4 leave behind, and names each one it drops.

# Three rules hold level one

1. The agent pulls. One verb hands it a ticket at a step, and the same verb
   hands the ticket back. It chooses no ticket, edits no state, and reads no
   process.
2. The engine decides. It hands out the next ticket by rules a person reads as
   data, checks every hand-back mechanically, and moves the ticket on.
3. A person works the same files. Every ticket is a markdown note a person
   opens, edits and pulls, under the same rules the agent meets, with no
   refusal.

Level zero keeps every door it holds today. Level two reads the folder of
tickets and mints into it, and it reaches the agent by no other road.

# A ticket is a note

A ticket is one markdown file with frontmatter, under a schema of its own,
`kind: [[ticket]]`. Its file name is its id and holds five words at most,
which is the cap `names.words` already sets. The name is also what a branch
and a link carry.

Two kinds stand, and the folder says which, the way v4 rules it:

| kind | folder | travels | who may pull it |
|---|---|---|---|
| tracked | `spec/tickets/` | yes, on trunk and on a group's branch | any hand the route admits |
| private | `.se/tickets/` | no, it dies with the box | the hand on this box alone |

A private ticket is how a hand organizes its own work. It holds a breakdown
of the ticket in hand, a bug it trips over, or a note for the retro. A ticket
in `spec/tickets/` is a promise the tree keeps. A private ticket moves there
through the mint alone. The mint runs the privacy check the commit door holds,
so a raw note reaches trunk by no other road.

The frontmatter carries what a program reads, and every field names its
reader:

| field | who reads it |
|---|---|
| `state` | the pull rule and the board |
| `reason` | the board, on `closed` alone |
| `step` | the pull, as the row of the route the ticket stands on |
| `steps` | the pull, the checks and the board |
| `process` | the board and the retro, as the route the mint copies from |
| `group` | the pull, as the branch this ticket lands on |
| `parent` | the pull, which hands a child out before its parent |
| `depends_on` | the pull, which holds a ticket until they close |
| `successors` | the board, on reason `became` |
| `urgency` | the pull, as `now`, `soon` or `whenever` |

The body holds the ask, one chapter per step, and a discussion. The schema
demands each, and `mint` writes each one's description as a comment, so a
person meeting a fresh ticket reads what goes where.

# The lifecycle

Three states, and the reason a closed ticket carries:

| state | means | who moves it there |
|---|---|---|
| `draft` | somebody writes it, and nobody pulls it | the mint, and a person |
| `open` | a hand may pull it at its current step | the mint, a person, and the pull at every hand-off |
| `closed` | the work stops here, and `reason` says how | the pull at the last step, and a person |

`reason` reads `done`, `dropped` or `became`. A ticket with reason `became`
names its `successors`, and every one of them exists.

In work is no state. A ticket is in work while a group holds it and a hand
holds it, and the board derives both. Parked is no state either. A wait on a
condition or a person is a step of the route, under the escalation chapter
below. So the un-park is an act with evidence.

`state`, `step` and `steps` are the verbs' to write. The door refuses a hand
edit by an agent to any of the three. That is v4's ruling that a status is the
pull's to write. A person's editor stands outside every door, so a person
edits what they like.

# The route

A ticket carries its own route as a list of steps in the frontmatter, in
order. Each step says what it does, who may do it, what it reads, and where a
failed step sends the ticket back to.

    steps:
      - name: draft
        by: anyone
        reads: [[spec/guidance/writing]]
      - name: review-design
        by: not draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
      - name: implement
        by: anyone
      - name: review-build
        by: not implement
        on_fail: implement

| field | holds |
|---|---|
| `name` | one word or a hyphenated pair, unique on the ticket |
| `by` | `anyone`, `person`, `agent`, `children`, or `not <step>` |
| `reads` | links to the guidance notes the step's hand reads |
| `on_fail` | an earlier step, where a failed hand-back sends the ticket |
| `asks` | the question a person answers, on a step a person takes |

The body carries one chapter per step, named after it, in route order. Each
holds two subsections. `Done when` is a list with one criterion a line, and
`Evidence` is prose. A criterion that a command decides names the command
after the words `decided by`, and the engine runs it.

Three keywords join the schema checker for this:

- `x-one-per`: a chapter stands for every entry of a named list, under that entry's name
- `x-names`: a field's value names an entry of a named list
- `x-earlier`: a field names an entry standing before its own

The checker holds them the way it holds `required` and `enum`, so the write
door, the sweep and the language server read one rule.

A review is a step and no state. So is a test, an approval, a translation or a
deploy. A new kind of work adds a row to a route and moves nothing in the
schema.

A step with `by: children` belongs to no hand. It ends when the last ticket
naming this one as `parent` closes. The pull advances the parent the moment it
accepts that child.

# Evidence per step

The evidence chapter of a step carries what the hand sees and what the engine
measures. The hand writes prose: what it does, what surprises it, what it
leaves. The engine appends, at the hand-back:

- one line per criterion with a command: the command, its exit and its last line
- the hand, as the box, the session and the agent where the harness names one
- the branch tip at the take and at the hand-back, the two hashes v4 writes on a token

The diff of the work is the group's branch, and `git log` on the ticket file
is its history. So a ticket carries no time and no line number, which v4
rules, and a reader finds both in git.

A tick stands only where the engine runs the command, because the engine
writes the mechanical lines and the hand cannot. That answers v4's finding of
a token in the archive with its evidence empty.

The tickets folder stands beside the rationales in `.vale.ini`, so an evidence
chapter and a discussion may carry the past tense.

# Processes are routes

A process is a route the mint copies onto a ticket. Level one ships three,
under `spec/processes/`, each a note of kind `process` holding a `steps` list
and nothing more:

| process | route | for |
|---|---|---|
| `trivial` | `do` | a fix small enough that the ask is the design |
| `standard` | `draft`, `review-design`, `implement`, `review-build` | a change that wants an approach first and a second pair of eyes after |
| `complex` | `split`, `children`, `review-whole` | a change too large to review whole |

A complex ticket's work is other tickets. Its `split` step writes the children,
each one trivial, standard or complex, and its done-when says every child
exists with a process and a group. Its `children` step belongs to nobody, and
the children run in its place. Its `review-whole` step reads what the children
add up to. So complexity composes through `parent`, and every route stays
short.

The mint takes `--process <name>` and copies the route, so the ticket depends
on nothing outside itself after that. A process file changes without reaching
a ticket in flight, which is the frozen window v3 rules for an iteration. A
person may edit a route on a ticket by hand, and a machine at level two may
write one row by row.

# A group is a branch

A group is the unit a box works and the unit that lands. It is a branch named
`work/<group>`, and a note of kind `group` under `spec/groups/` holding its
state and its ask:

    ---
    kind: [[group]]
    state: todo
    urgency: soon
    ---

    # Ask
    <!-- what these tickets add up to, for the hand that takes them -->

    # Retro
    <!-- what surprises the hands that work it, and every dead end -->

A ticket names its group in one field, and a person writes that field. A
ticket with no group is backlog a person has yet to sort, and no box takes it.
A group of one ticket is the ordinary case, and a group of five is the same
shape.

| rule | what it says |
|---|---|
| the branch is the claim | taking a group pushes `state: held` on the group note, and the push arbitrates two boxes |
| the tip is the lease | a held group whose branch tip is older than `work.leaseHours` reads as free again |
| one box, one group | a box works one group at a time, and the group's tickets one at a time |
| the branch is the filter | on a group's branch the pull sees that group's tickets alone, and widens nothing |
| the branch holds the truth | while the branch stands, its copy of the group note and of its tickets is the record |
| a group ends | when no ticket in it stands at a step an agent may take |
| the merge is a person's | `work merge` takes an ended group into trunk, and `work close` drops the branch |

A box starting on trunk or on a branch the platform names takes a group first.
On a desk, a person on trunk sees every ticket, and a person on a group's
branch sees that group, as a box does. A filter a person sets in config
outranks the branch, which v4 rules.

The retro chapter replaces the brief's handback. The hand that ends a group
writes it before the last push.

# The pull

The agent holds three verbs: `pull`, `guidance` and `escalate`. Every other
verb belongs to a person or the engine. The shell is the verb, under
`./RUNME.sh work`. A plugin tool wraps it for a session that holds the plugin,
which is v4's ruling that one function runs under both doors.

A pull carries at most two things: the ticket it hands back and a verdict,
`pass` or `fail` with a reason. The file is the payload, because the hand
writes its evidence through the write door before it pulls. The other side
then checks, cheapest first:

1. The ticket passes its schema, and the step's evidence chapter holds text.
2. Every `decided by` command of the step runs from the root and answers zero.
3. The hand may take this step, by the route's `by`.
4. The judge reads the evidence against the step's guidance, where
   `judge.enabled` says so.

Then one of three answers comes back:

| answer | when | the hand does |
|---|---|---|
| `work` | a ticket at a step, with the step's guidance inline and the file's path | the step, then pulls again naming it |
| `refused` | a check fails, and the findings stand one a line | fixes it, and the ticket stays in hand |
| `wait` | nothing to hand out, and the reason with it | says so, and stops |

On `pass` the engine does six things in one call:

1. It appends the evidence lines.
2. It advances `step`, or closes the ticket at the last step with reason
   `done`.
3. It sets `state: open`, so the next hand may pull it.
4. It commits on the group's branch.
5. It pushes.
6. It answers the next ticket.

On `fail` it sets `step` to the row's `on_fail`, writes the reason on the
evidence, and reopens the ticket.

The pull runs at two levels, and the same rule shape holds at each:

| who pulls | what | the rule |
|---|---|---|
| the beat | a box per free group | groups at `todo` or lapsed, none of whose tickets wait on an unmerged group, by urgency |
| the box | the next ticket of its group | tickets at `open` with no open dependency, children before parents, a step this hand may take, by urgency then name |
| a person | anything | the same two lists on the board, and no refusal |

The pull writes `.se/hold.json` naming the ticket, the step, the group and the
hand. The tooth's `work-waiting` check reads it, so a turn ends on a fact where
a ticket stands in hand.

# Hands

A hand is a box, a session on it, and an agent inside it where the harness
names one. The engine mints the box id once into `.se/box.json`, the way v4
does, and reads the session and the agent off level zero. A person's hand is
their git author name.

A role is a property of a step, and no agent holds one for life. When the next
step's `by` excludes the hand that pulls, the pull spawns a hand for it
through the hook. The engine writes the spawn's prompt from the ticket and the
step's guidance. The session sees the outcome and its next ticket, and shapes
nothing of the spawn. That answers v4's objection to a session spawning its
own reviewer. On a box with no plugin, the shell pull parks the step for a
person and says so.

A step whose `by` is `person` waits for a person, and the board lists it
first.

# Escalation is a step

A hand that cannot go on without a person calls `escalate` with the question.
The engine then does four things:

1. It inserts a step before the current one, `by: person`, under a unique
   name, with the question under `asks`.
2. It mints the step's chapter.
3. It points `step` at the new row.
4. It leaves the state at `open`, so the ticket is now a person's to pull.

The person writes the answer under the step's evidence and hands it back, and
the engine advances into the step behind it.

| trigger | who inserts | the knob |
|---|---|---|
| the hand needs a person | the hand, through the verb | none |
| the same hand-back meets `refused` N times | the engine | `work.refusalsBeforePerson` |
| the lease lapses N times on one ticket | the engine | `work.lapsesBeforePerson` |
| a step a person takes, from the mint | the mint | none |

A gate and an escalation are one mechanism, one the mint writes and one the
engine inserts on the way. A park is the same: a person step whose `asks`
carries the condition. The group keeps moving, because the box works its
other tickets while a person step waits.

A ticket that gathers more inserted steps than `work.stepsBeforeSplit` is the
wrong size. The engine refuses another insertion and asks for a split into
sub-tickets, closing the ticket with reason `became`.

# Guidance rides the step

Each step names the guidance it reads. The pull's `work` answer carries those
notes' actionables inline, so the hand holds them the moment it holds the
step. The `guidance` verb answers a named note, or, unnamed, the notes the
current step lists and the always-on ones.

Every guidance answer writes a log line, which proves arrival the way the
canary proves the standing layer. The proof of application is the hand-back:
the commands, the evidence and the judge.

Level one carries no reading probe, and two measurements say why:

| measurement | says |
|---|---|
| v3, on its own probes | evidence, and no enforcement |
| v5, on the field | a door holds a rule in every run, and a prompt in four runs of five |

The standing layer shrinks to the notes that bind every session. A note a step
names leaves the layer and rides the step.

# Children and private tickets

A ticket names its `parent`, and the pull hands a child out before its parent.
A parent at a `children` step waits for its last child, which is v4's scope
rule. A box at autonomy `start` may mint sub-tickets into its own group. A bug
it trips over goes the same way, which is the owner's ruling from v4 on a bug
found in the bucket.

Private tickets carry the same schema in `.se/tickets/`. The pull hands one to
the hand on its own box alone, after the group's tracked tickets run out. That
is v4's rule that an empty queue drains the notes. The tooth counts a private
ticket in hand the way it counts a task today.

# What a person sees

The board draws the folder and the branches, and keeps no second record:

| surface | draws |
|---|---|
| the sidebar's `table` widget | every ticket, under yours, urgent, in work, open and done |
| `./RUNME.sh work list` | the same rows in a terminal |
| a projection to `BOARD.md` | the same rows for a reader with no sidebar |
| the ticket file itself | the ask, the route, the evidence, the discussion |

Yours stands first: every ticket at a step whose `by` is `person`, with its
`asks`. The beat counts that list, and the routine's notification carries the
count.

The routine fires one box on its clock. That box runs the beat, which fires
the routine again for every other free group, up to `engine.boxes`.

A person does four things, each with a verb or a click:

- mints from the sidebar's text box or the verb
- edits a ticket in the editor
- drags a ticket into a group by writing the field
- hands a step back with the same verb a box uses

The language server names a departure from the schema as they type. It
completes `state`, `step`, `by` and `group` from the schema, the route and the
folder.

# What level zero changes

| today | after |
|---|---|
| the brief door hands over `HANDOVER.md` and deletes it | the tracked brief goes, and the block on a cloud box says to run the pull |
| `.se/HANDOVER.md` hands one session the next | unchanged |
| `work-waiting` counts tasks | it reads `.se/hold.json` and counts private tickets |
| `engine.binding` at `queue` and `unbound` draw the status bar | `queue` hands out, `unbound` hands out nothing, and a hand may take a named ticket |
| `engine.autonomy` draws nowhere | `finish` mints nothing, `start` mints into its own group, `ideation` mints drafts into the backlog |
| `engine.state` and `engine.beat` draw nowhere | the beat writes them |
| the trunk guard refuses a commit on `main` | unchanged |

The cloud guidance note changes one line: the first verb is the pull.

# What the machines read

Level two is processes as machines, and it reaches the agent by no road. It
reads the folder of tickets, and derives where each machine stands from the
states and steps it finds there. It mints tickets with routes, sets `parent`
on them, and reacts to a close by minting the next. The agent still pulls, and
the only fact it meets is a route.

# Where it lives

| piece | where |
|---|---|
| the schemas | `spec/schemas/ticket.schema.yaml`, `group.schema.yaml`, `process.schema.yaml` |
| the folders | `spec/tickets/`, `spec/groups/`, `spec/processes/`, `.se/tickets/` |
| the verbs | `src/scripts/work.js`, under `./RUNME.sh work` |
| the tool wrapper and the spawn | `.claude/skills/level1/`, beside level zero |
| the stop rule | `spec/config/stop/level1.yml` |
| the hold and the box id | `.se/hold.json`, `.se/box.json` |
| the config | the `engine` and `work` sections of `spec/config/level0.json` |

| key | default | what it decides |
|---|---|---|
| `work.leaseHours` | 3 | when a held group reads as free |
| `work.refusalsBeforePerson` | 5 | when a refused hand-back becomes a person's step |
| `work.lapsesBeforePerson` | 2 | when a lapsed ticket becomes a person's step |
| `work.stepsBeforeSplit` | 3 | when an escalating ticket must split |
| `work.filter` | empty | what a person's pull sees, over the branch |
| `engine.boxes` | 1 | how many boxes the beat fires at most |

# Rulings from v3 and v4

| ruling | from | where it lands |
|---|---|---|
| the pull is the one verb, and a submission rides it | v3, v4 | stays whole |
| one token in hand | v4 | one ticket in hand, in `.se/hold.json` |
| the hold is engine state, and the claim travels | v4 | the hold file, and the group's push |
| the token carries no time | v4 | stays, and the lease reads git |
| a field stands because something reads it | v4 | the field table above |
| a todo is a sub-token | v4 | private sub-tickets, and the tooth counts them |
| every token names its closer | v4 | the route's last step |
| a refusal is a menu | v4 | the `refused` answer names the fix |
| the bucket is the person's | v4 | the group, and the word bucket retires |
| processes as data | v4 | routes now, and machines at level two |
| a write names its token | v4 | out, because the hold names it and the write door is level zero's |
| the staffing gate and the reviewer queue | v4 | out, because a step spawns its own hand |
| the reading proof | v3 | out, for the log line, and open as a level two option |
| a spawn ceiling of zero for delegated writing | v3 | the engine spawns for a step alone, and the session spawns for nothing |
| controls only ever stop the engine refusing | v3 | stays |
| notes, then the retro, then the mint | v3 | the mint's privacy check on promotion |

# The order of work

Eight branches, and the dependencies make the order binding:

| # | branch | holds | after |
|---|---|---|---|
| 1 | `the-ticket-has-a-schema` | the three schemas, the three keywords, `mint`, the private folder | |
| 2 | `a-process-is-a-route` | the three route files, the copy at the mint, a chapter per step | 1 |
| 3 | `a-group-is-a-branch` | the group note, take, lease, list, merge, close, and `adopt` for a brief | 1 |
| 4 | `the-agent-pulls-a-ticket` | the pull, its checks, its answers, the hold file, the stop rule | 2, 3 |
| 5 | `a-step-changes-hands` | the hand id, the spawn, person steps, escalation | 4 |
| 6 | `guidance-rides-the-step` | `reads`, the verb, the log line, the standing layer shrinks | 4 |
| 7 | `the-board-draws-the-folder` | the table widget, yours, the beat, the routine fires by count | 4 |
| 8 | `level-zero-hands-over-the-pull` | the brief door goes, and the controls wire up | 4 |

The eleven work branches standing today finish under the verbs they carry.
`adopt` turns a brief into a group note and one ticket, for the ones a person
wants moved. The old verbs go once the last brief merges.

# What this leaves open

- the lease length, which three hours seeds from v4
- whether a person step may go to a spawned strong model at high autonomy
- whether yours drowns in parked conditions, and a parked state returns
- a WIP limit per step, which is Kanban's one knob and stands outside this note
