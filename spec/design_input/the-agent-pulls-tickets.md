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

The level pays for the work the tree keeps putting off:

- the design input and the design output phases, whose notes come back as other than the ask
- the retro, which holds only where a hand produces defined evidence at every step, under a schema

That is what the level is for, and no count of briefs decides it.

This note settles the shape of level one:

- what a ticket is, and the two kinds of ticket
- the lifecycle, the route and the evidence a ticket carries
- the group, which is a branch and a ticket, and the claim on it
- the retro, which is a ticket whose readers are its children
- the pull, and what its other side checks
- hands, escalation and guidance
- what a person sees and does
- what level zero changes, and what level two reads
- the order the work lands in

It reads `main` at commit 4f4711d, with five work branches standing. It
carries the rulings v3 and v4 leave behind, and names each one it drops. A
red team, a steel-man and a survey of the field read the first draft, and
what they earn stands folded in.

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

| kind | folder | travels | who can pull it |
|---|---|---|---|
| tracked | `spec/tickets/` | yes, on trunk and on a group's branch | any hand the route admits |
| private | `.se/tickets/` | no, it dies with the box | the hand on this box alone |

A private ticket is how a hand organizes its own work. It holds a note, which
is the smallest ticket there is, or a breakdown of the ticket in hand. A
ticket in `spec/tickets/` is a promise the tree keeps. A private ticket moves
there through the mint alone. The mint runs the privacy check the commit door
holds, so a raw note reaches trunk by no other road.

The frontmatter carries what a program reads, and every field names its
reader:

| field | who reads it |
|---|---|
| `state` | the pull rule and the board |
| `reason` | the board, on `closed` alone |
| `step` | the pull, as the row of the route the ticket stands on |
| `steps` | the pull, the checks and the board |
| `process` | the board and the retro, as the route the mint copies from |
| `process_hash` | `work reroute` and the board, which flag a route older than its process |
| `record` | the render, the checks and the retro, as the engine's entry per leaf handed back |
| `group` | the pull, as the group this ticket lands in, and the branch where that group is the outermost |
| `depends_on` | the pull, which holds a ticket until they close |
| `successors` | the board, on reason `became` |
| `urgency` | the pull, as `now`, `soon` or `whenever` |

The body holds the ask, a chapter per step nested as the steps nest, and a
discussion. The schema demands each, and `mint` writes each one's description
as a comment, so a person meeting a fresh ticket reads what goes where.

A leaf's chapter carries the leaf's name as its heading, one level under its
phase. Each field is a heading one level under the leaf, with the mint's
comment beneath. The comment stays where it is and counts toward nothing, the
way a comment in a brief counts today.

The ask is a form too. The process names its fields with the same forms the
evidence takes, and the mint renders them under the Ask chapter. The verb
that opens a ticket refuses `open` while one of them stands empty. So the
criteria v4 puts on its ask activity come over as slots, and a thin ask stops
at the mint.

# The lifecycle

Three states, and the reason a closed ticket carries:

| state | means | who moves it there |
|---|---|---|
| `draft` | somebody writes it, and nobody pulls it | the mint, and a person |
| `open` | a hand can pull it at its current step | the mint, a person, and the pull at every hand-off |
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

A ticket carries its own route as a tree of steps in the frontmatter. A step
with `steps` under it is a phase, and it carries what its steps share. A step
with none is a leaf, and the pull hands out leaves alone. A leaf carries what
differs: its own reads, its own hand rule, and the form of its evidence.

    steps:
      - name: design
        reads: [[spec/guidance/voice]]
        steps:
          - name: draft
            does: writes the approach the ask calls for
            evidence:
              - name: approach
                form: text
                says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: review
            does: reads the approach against the ask
            not: draft
            on_fail: draft
            reads: [[spec/guidance/review/reviewing]]
            evidence:
              - name: verdict
                form: verdict
                says: pass or fail, with findings one a line
      - name: implement
        reads: [[spec/guidance/code/testing]]
        needs: [work test]
        checklist:
          - the change touches no file the ask leaves out
          - every door the change reaches has a fake
          - a comment names the approach the change implements
        steps:
          - name: tests-red
            does: writes the tests the ask calls for
            input: design/draft
            evidence:
              - name: tests
                form: command
                expects: assertion
                says: the tests you write fail on their own assertion
              - name: seen
                form: text
                says: what you see, and what surprises you
          - name: reflect
            does: names the class of error in the findings, and the fix for the class
            when: returned
            input: verdict
            evidence:
              - name: class
                form: text
                says: the class of error the findings describe, and the fix for the class
          - name: change
            does: makes the change
            reads: [[spec/guidance/code/code]]
            evidence:
              - name: lint
                form: command
                expects: 0
                says: the tree builds and lints
          - name: tests-green
            does: makes the tests pass
            input: tests-red
            evidence:
              - name: tests
                form: command
                expects: green
                says: the same tests pass
              - name: check
                form: command
                expects: 0
                says: the check is green on the commit
              - name: says
                form: text
                says: what changes and why, for a reader who was not there
      - name: verdict
        does: reads every hunk against the ask and the approach
        not: implement
        on_fail: implement/reflect
        reads: [[spec/guidance/review/reviewing]]
        input: [diff, implement]
        to: owner
        evidence:
          - name: read
            form: files
            says: every file you read, one a line
          - name: verdict
            form: verdict
            says: pass or fail, findings one a line

| field | holds |
|---|---|
| `name` | one word or a hyphenated pair, unique among its siblings |
| `steps` | the steps under a phase, in order |
| `by` | `anyone`, `person`, `agent`, `helper`, `retro`, or `children` |
| `not` | a step whose hand this step's hand can not be, as `draft` or `implement` |
| `reads` | links to the guidance notes the step's hand reads |
| `on_fail` | an earlier step, where a failed hand-back sends the ticket |
| `asks` | the question a person answers, on a step a person takes, with `options` where one word answers it |
| `when` | `returned`, `cloud` or `desk`, and the pull skips the leaf where it fails to hold |
| `checklist` | what a hand has to do here, one item a line, which the retro grows |
| `does` | one line on what the hand does at this leaf, which the `work` answer says first |
| `input` | what the step reads: `ask`, `diff`, or earlier evidence by path |
| `needs` | the verbs and tools the step runs, which the pull checks on the box first |
| `from` | who hands the step its input, where that is a person, the engine or the outside |
| `to` | who takes the output, where that is the owner, the retro or the merge |
| `evidence` | the fields a leaf's hand fills, each with a name, a form and a `says` |

A step is a form with six slots, which is v4's SIPOC ruling. The route says
each slot in one field, or derives it:

| slot | the route says it as | the default |
|---|---|---|
| supplier | `from` | the step before |
| input | `input` | the evidence of the step before |
| process | `does` | nothing, since a leaf says what it does |
| output | the `evidence` fields | nothing, since a leaf names its fields |
| customer | `to` | the next step |
| enabler | `reads` and `needs` | nothing |

So an author writes `does` on every leaf, and `input`, `needs`, `from` and
`to` where the default is wrong. The slots earn three mechanical checks:

| check | who runs it | what it refuses |
|---|---|---|
| an output nothing reads | the mint and the lint | an evidence field no later step, no `to` and no engine check reads |
| an input nothing supplies | the mint and the lint | an `input` naming evidence no earlier step holds |
| an enabler out of reach | the pull, at the hand-out | a `needs` the box lacks, which answers `wait` with the reason |

Four rules hold the tree together:

- A leaf inherits from the phases above it. The fields are `by`, `reads`, `on_fail` and `input`. So are `needs`, `from` and `to`. The reads and the needs add up. `from` reaches the first leaf, `to` reaches the last, and the rest take the nearest value.
- A name refers to a sibling first, and to a step from the top second. A path with a slash, as `design/review`, says exactly.
- `not: implement` excludes the hand of every leaf the mint puts under `implement`. `on_fail: implement` sends the ticket to that phase's first leaf.
- `step` names a leaf by its path, as `implement/tests-red`.
- A leaf with no `on_fail` fails back to itself, and an inserted step counts for no `not`.
- A checklist adds up from the phases above, the way reads do. The leaf answers it in a field it takes without naming one, `checked`.
- The pull skips a leaf whose `when` fails to hold. The engine writes `skipped` and the reason into the record.

The route is a closed vocabulary, and the schema names every word of it:

| key | takes |
|---|---|
| `name` | a word, or a hyphenated pair |
| `steps` | a list of steps |
| `does`, `asks` | a line of text |
| `by` | one word from its list |
| `not`, `on_fail` | a step's name or path |
| `when` | one word: `returned`, `cloud` or `desk` |
| `input` | the words `ask` and `diff`, and steps' names or paths |
| `from`, `to` | one word: `anyone`, `person`, `engine`, `retro`, `owner` or `merge` |
| `reads` | links |
| `needs` | words, each a verb or a tool the box names |
| `checklist` | lines of text |
| `evidence` | fields, each with `name`, `form`, `says`, and `expects` or `options` where the form takes one |

Every value is one of six things. It is a word from a list, a name or a
path, a link, a number, a line of text, or a list of those. No value carries
an expression. So a reader takes a route apart with the schema alone and no
parser of its own.

| `when` | holds where |
|---|---|
| `returned` | the ticket arrives at this leaf by an `on_fail` |
| `cloud` | the box runs under the cloud guidance |
| `desk` | a person's box |

So `reflect` runs on the way back from a failed verdict alone. It asks for
the class of error the findings describe and the fix for that class. So the
fix reaches the class and no single instance. The list of conditions is the
engine's, and a route names one or none.

A checklist is what a hand has to do at this step, and it stands in the
process, where guidance stays general:

| moment | the checklist |
|---|---|
| the hand-out | the `work` answer carries it, so the hand knows what it has to do |
| the hand-back | one line per item, on how the hand takes it into account |
| the retro | grows it, so the items are the tree's memory of what goes wrong |

A hand reads the items as institutional knowledge, and no tick answers one.
The first process the tree writes shows how they bake in. Until the judge
reads the lines, the tree trusts the hand.

The chapters follow the tree. A phase's chapter holds its steps' chapters and
nothing else. A leaf's chapter holds its evidence and nothing else, so a
sub-step costs a chapter and a ticket stays one file.

The implement phase of the standard process shows how a step forces a way of
working without a word of prose:

| leaf | the hand does | the engine checks at the hand-back |
|---|---|---|
| `tests-red` | writes the tests the ask calls for | the tests the branch adds or changes since the ticket's first take fail, and the failure is an assertion, with no build fault |
| `change` | makes the change | the tree builds and lints |
| `tests-green` | makes the tests pass | the same tests pass, and the check is green on the commit |

Red for the right reason splits in two. The class of the failure is
mechanical, and the test verb names it. Whether the assertion names the
behaviour the ask describes is a judgement, and the judge reads the failing
assertion against the ask where `judge.enabled` says so.

Three keywords join the schema checker for this:

- `x-one-per`: a chapter stands for every step, nested as the steps nest, under the step's name
- `x-names`: a field's value names an entry of a named list
- `x-earlier`: a field names an entry standing before its own

The checker holds them the way it holds `required` and `enum`, so the write
door, the sweep and the language server read one rule. The checker today
reads top-level scalars alone. Before the keywords land, it learns to recurse
into `steps` and `evidence`, to keep a line per nested key, and to resolve a
path. That is the first branch's real size.

A review is a step and no state. So is a test, an approval, a translation or a
deploy. A new kind of work adds a row to a route and moves nothing in the
schema. A verdict that passes can still carry findings. Each one becomes a
note the reviewer mints with `from` naming the ticket. That is v4's rule that
a finding is a token of its own.

A step with `by: children` belongs to no hand, and it has two ends. The box
leaves it when no child stands at a step an agent can take. The step ends
when every ticket naming this one under `group` closes `done` or `became`. A
child that closes `dropped` sends the ticket to the step's `on_fail`. The
pull derives both at every hand-out from what stands on the branch and on
trunk. The sweep refuses a cycle in `group` or `depends_on`.

# Evidence has a form

A leaf names its evidence as fields, and each field has a form. The mint
renders the fields into the leaf's chapter with a comment each. So a person
sees what goes where, and an agent meets the same slots.

| form | the hand writes | the engine checks |
|---|---|---|
| `text` | prose | it holds text |
| `list` | one item a line | it holds one item at least |
| `command` | one command line | it runs from the root and answers the exit or the word `expects` carries |
| `link` | a link or a path | it resolves in the tree or on the branch |
| `files` | the files read, one a line | every file the branch changes since the ticket's first take stands in it |
| `choice` | one of the words `options` names | it is one of them |
| `checklist` | one line per item of the step's checklist, on how you take it into account | a line stands for every item, and the judge reads them against the items |
| `verdict` | `pass` or `fail`, then findings one a line | one of the two words, and findings where it fails |

`expects` names what a command must answer: an exit code, or a word the verb
prints, such as the test verb's `assertion`. The engine writes each command's
exit and last line into the ticket's `record`, and the render draws them under
the field as an `answered` line. The hand cannot write that line, and a
criterion with no evidence behind it is guidance, so no form takes a tick.

A ticket takes a hand's writing in three places, and each opens with a
comment that says so:

| place | who writes | when |
|---|---|---|
| the ask | the minter, or a person | while the ticket is a draft |
| a leaf's fields | the hand at that step | while it holds the step |
| the discussion | anyone | always |

Everything else on the ticket is the engine's. The write door weighs a ticket
write against the render of the ticket's own frontmatter. That render is the
route and the record drawn as chapters. A changed line stands inside one of
the three places, or the door refuses the write and names the line. So the
door needs no hold to know the places. The Bash door reads what a command
lands, so a heredoc meets the same rule.

A person and an agent meet one form through two doors. The person fills the
slots in the editor. The agent fills them through the write door, or hands the fields back
as the pull's payload. Either way the engine writes them into the same slots.

# Evidence per step

A leaf's chapter carries what the hand fills in and what the engine measures.
The hand fills the fields the leaf names. The engine writes one entry per leaf
into `record` at the hand-back, and the render draws it under the chapter:

- the exit and the last line of each command field, as an `answered` line
- the hand, as the box, the session and the agent where the harness names one
- the branch tip at the take and at the hand-back, the two hashes v4 writes on a token
- the returns, which count how often the leaf fails back
- the tip at a release too, so every hand's delta stands in git whichever way the hand leaves

| who reads a delta | when |
|---|---|
| the retro | now, over every ticket its own delta holds |
| a gate | later, in the retro's place, once the processes stand |
| the test verb | at every hand-back, from the ticket's first take to the tip, so ticket three of a group runs its own tests alone |

The diff of the work is the group's branch, and `git log` on the ticket file
is its history. So a ticket carries no time and no line number, which v4
rules, and a reader finds both in git.

A command field answers only where the engine runs it, because the engine
writes the `answered` line and the hand cannot. That answers v4's finding of
a token in the archive with its evidence empty.

The tickets folder stands beside the rationales in `.vale.ini`, so an evidence
chapter and a discussion can carry the past tense.

# The test verb

`work test` runs the tests the branch adds or changes since the take, or the
ones a step names, and answers one word and a reason:

| answer | means |
|---|---|
| `green` | every test it runs passes |
| `assertion` | a test fails on its own assertion, which is the red a `tests-red` step wants |
| `build` | the file loads no test, because the tree fails to build or to parse |
| `missing` | the branch changes no test, so there is nothing to run |

A command field names it with `expects: assertion` or `expects: green`, so a
build fault or a missing test passes for no red. The verb reads the delta off
git, which is the half of v4's test map that a branch already carries.

# Processes are routes

A process is a route the mint copies onto a ticket. Level one ships six,
as YAML files under `spec/processes/`, and they stand in the tree already.
Each stands under `process.schema.yaml` and holds the ask's fields under
`ask`, the route under `steps`, and nothing more:

| process | route | for |
|---|---|---|
| `note` | `decide` | a thing to look at later, with no work in it yet |
| `trivial` | `do` | a fix small enough that the ask is the design |
| `standard` | `design` (draft, review), `implement` (tests-red, change, tests-green), `verdict` | a change that wants an approach first, tests before code, and a second pair of eyes after |
| `group` | `sync`, `split`, `children`, `retro` (notes, write, cloud) | a set of tickets that lands as one, and what a cloud run does |
| `retro` | `collect`, `field`, `score`, `notes`, `readers`, `mine` (nine leaves), `improve`, `report`, `distribute` | a window of the record, and the changes to the machinery it earns |
| `chapter` | `read` | one chapter of a retro's window, read by one spawned hand |

A note is the smallest ticket, and it is where most work starts. A hand that
meets an idea, a bug or a doubt mid-work writes a note and carries on. Its
hold stays where it is. `work note` takes a name and a line, writes `from`
off the hold as the ticket and step in hand, and answers at once. The note is
private and stays on the box. Its ask is one field, `line`, and the field's
`says` carries three hints and nothing else:

- the smallest case that shows it
- why it matters
- what a stranger needs in order to act on it

Its one step, `decide`, is where a retro reads it later and says what it
becomes. The step closes the note as `dropped`, or as `done` where the answer
is small enough to do on the spot. Or it closes the note as `became`, and
names the tracked ticket the mint cuts from it.

Anyone mints a note, and a retro decides it. The step says `by: retro`, and a
hand at a retro step is the one hand the pull hands a note to. A group's retro
decides the notes its box minted, and the tree's retro decides the rest. A
note that stays behind on a cloud box dies with it.

A note also answers. The answer door holds every tool call until the owner's
prompt has an answer. A prompt that says "make a note of this" wants one thing
back: the note. So three things happen at once:

- `work note` writes a `note` line to the log
- the answer door reads that line off the log, and counts it where the prompt names a note
- the viewer draws it pink, right under the prompt

The owner reads that the agent understood, and the agent carries on. A note
answers no other prompt, so the readback stays owed everywhere else.

A group's work is other tickets. Its `split` step mints the children or
assigns standing ones, each naming the group. Its checklist says every child
is small enough to review whole or is a group itself. Its `children`
step belongs to nobody, and the children run in its place. So a large change
composes through `group`, every route stays short, and the merge is the
verdict over the sum.

The mint takes `--process <name>`, copies the route, and writes the process
file's hash beside it. So the ticket depends on nothing outside itself after
that. A process file changes without reaching a ticket in flight, which is the
frozen window v3 rules for an iteration. A fix to a process reaches a ticket
through `work reroute`, which copies the current route over the leaves the
ticket has yet to reach. It refuses where `step` names a leaf the new route
lacks, and the board flags a ticket whose hash trails its process. A person
can edit a route on a ticket by hand, and a machine at level two can write one
row by row.

# The drawing is a projection

A process file is data, and its drawing derives from it. One emitter reads a
route, and a record where a ticket carries one, into a graph:

| in the graph | from |
|---|---|
| a node per phase and per leaf | `steps` |
| a pass edge between neighbours | the order |
| a fail edge back, with its label | `on_fail` |
| a dotted node | `when` |
| a marked node | `by: person` |
| the pointer, the skips and the returns | `step` and the record |

One reader draws that graph: the editor, live, for a process and for a ticket
with its position. It draws from the file at every open, so no second copy
stands anywhere to drift. Nobody else needs the picture, since an agent reads
the YAML and a person reads the editor. Every earlier version wants that
property under the name executable diagram. The tree reaches it from the
other side: the data runs, and the picture derives.

The drawing carries no style of its own. The extension holds one common style
sheet, and it takes its colours and its type from the editor's theme, which
is VS Code's. A cloud box prepares the emitter and the webview's wiring, and
spends nothing on graphical design, which is desk work.

v1's rules for a drawn model carry over whole:

- the nodes stand declared before the edges, and every edge carries a label
- no coordinates, and the layout derives
- the hash reads the graph, so a comment or a reordered key moves nothing

A ticket's drawing animates nothing, because the record is the run and every
hand-back is a push. A process can animate a run later. The emitter reads a
graph, so a feed that moves the pointer adds that and rewrites nothing.

The editor takes the drawing further, and that is desk work with the owner:

| the editor gains | what a person does with it |
|---|---|
| a library of blocks at the side, the way Simulink shows one | drags a leaf, a phase, a person step, a review, an evidence form or a condition into the drawing |
| wires between blocks | draws the order and the fail edges, and the editor writes the YAML |
| a form behind every leaf | fills a ticket's evidence through the drawing, with one input per checklist item |

One reader serves both files. The tree's YAML reader reads a process file
whole and a ticket's frontmatter. The section reader reads the ticket's body,
which holds the prose places. The editor holds those two and no third.

# A group is a branch

A group is a ticket whose work is other tickets. The outermost group is the
unit a box works and the unit that lands, a branch named `work/<group>` after
it. Its children are the tickets naming it under `group`. A group
inside a group runs on the outer branch, so one schema covers everything that
moves and one relation says where work lands.

    ---
    kind: [[ticket]]
    state: open
    step: children
    process: [[group]]
    process_hash: 2b7e1f0
    urgency: soon
    steps:
      # the route spec/processes/group.yaml copies on: sync, split, children, retro
    record:
      children:
        hand: box 3f9a · session 12
        took: a1b2c3
    ---

    # Ask

    ## goal
    <!-- text · what these tickets add up to, for the hand that takes them -->

The route stands in `spec/processes/group.yaml`, and it is what a cloud run
does step by step. `sync` comes first under `when: cloud`, then `split`, then
the children, then a `retro` phase of three leaves. The hand at `split` mints
the children or assigns standing tickets. In the editor that is a person
dragging tickets in, and the editor hands the step back. A ticket that turns
out too large hands back `became` with a group.

The pull hands out a child whenever one stands at an agent step, and the
group's own leaves only when none does. So a ticket the retro's drain mints
into the group goes to work before the retro's last leaf.

| rule | what it says |
|---|---|
| the branch is the claim | the take writes the hand and `took` into the group's record under `children` and pushes, and the push arbitrates two boxes |
| held derives | a group holds where its newest record entry carries `took` and no `gave`, and `work list` reads it so |
| a stale group is yours | a held group whose tip is older than `work.staleAfter` stands under yours with three answers, and `release`, `take` and `close` are the verbs |
| one box, one group | a box works one group at a time, and the group's children one at a time |
| the branch is the filter | on a group's branch the pull sees that group alone, and widens nothing |
| trunk hands out no group's child | on trunk the pull offers a box a group to take, and a person the tickets of no group |
| the branch holds the truth | while the branch stands, its copy of the group and of its children is the record |
| a box leaves | when the group's last leaf passes, it writes `gave`, closes the group as `done` where every child stands closed, and leaves it open otherwise |
| a group returns | an open group nobody holds comes back to the beat once a person answers on its branch |
| the merge is a person's | `work merge` takes a group into trunk, and `work close` drops the branch |
| the merge lands the truth | `work merge` runs the check on the merge commit and undoes it on red. It refuses where trunk's copy of the group or of a child differs from the branch point, and names the lines |
| the merge frees the tickets | an open child of a merged group loses its `group`, so a ticket waiting on a person stands loose on trunk |

A cloud box differs from a desk in one leaf, `sync`, which takes trunk into
the branch first, and in the retro's `cloud` leaf. Everything else around the
children is the same on both.

The retro phase is the group's own retro, and on a cloud box it is the only
retro that box ever runs:

| leaf | does |
|---|---|
| `retro/notes` | decides every private note on the box, and its command passes when the private folder is empty |
| `retro/write` | the four questions over the box's own window, and what the thoughts say that the actions do not |
| `retro/cloud`, under `when: cloud` | what the box lacks, what it meets, and what it leaves for a person |

A private note stays on its box. So the drain closes each one, and the close
names what comes of it:

| close | what happens |
|---|---|
| `dropped` | nothing, and the reason stands in the field |
| `done` | the hand does it on the spot |
| `became` | a tracked ticket, with its ask filled from the note |

A ticket the drain mints goes one of two ways:

| it names | so |
|---|---|
| this group | the box works it before the group ends |
| no group | it rides the branch, lands on trunk at the merge, and a person sorts it |

It is `open` where the drain fills its ask and `draft` where it cannot. A
ticket names its group in one field, and a person writes that field. A ticket
with no group is backlog a person has yet to sort, and no box takes it. A
group of one ticket is the ordinary case, and a group of five is the same
shape.

A box starting on trunk or on a branch the platform names takes a group first.
A group's children live on its branch, and a hand works them there alone. On a
desk, a person on trunk sees every ticket, and a person on a group's branch
sees that group, as a box does. A filter a person sets in config outranks the
branch, which v4 rules.

There is no lease. A branch somebody holds stays held until a person looks. A
branch held for a long time is something a person has to look at in any case.
So `work list` names the age of each held branch's tip, and that age is the
signal.

| the tip's age | means |
|---|---|
| under `work.staleAfter` | a box holds the group, and nothing asks |
| past it | the group is implicitly a person's, and stands under yours with three answers: release, take over, or close |

The routine's notification names a stale group, and no box takes it again
before a person answers. The rule derives from the tip, so nothing writes to
a branch nobody holds.

A hand mints where it means to work:

- a ticket it means to do itself goes into its own group, and lands with it
- a ticket it leaves for others carries no group, and a person sorts it later
- on a cloud box a ticket with no group rides the branch to the merge, since trunk refuses the box

The six lines `work new` appends to a brief today are this route, one for
one. So the first cloud run under the pull is the first process running as
data, and the brief's contract retires with it.

# The retro

The tree's retro turns a window of the record into changes to the machinery.
It is blameless, and it repairs the generator of a bad output: a prompt, a
guidance line, a form, a refusal, a tool. Repairing the artefact is fine, and
the finding is the generator. The route stands in `spec/processes/retro.yaml`,
and a retro is a ticket, so its evidence is the report, in git.

The retro keeps missing things because nothing refuses a retro that skips
one. So every question is a field on a step, and the engine hands nothing
back with a field empty. The retro reuses the group's shape: `collect` mints
the readers, a `children` step waits for them, and the retro's own hand mines
what `collect` lays out.

| step | by | evidence |
|---|---|---|
| `collect` | anyone | one command, `retro collect`, which refuses while a hand holds a ticket |
| `field` | person | `answers`, one line each, and each becomes a note |
| `score` | anyone | `scored`, one line per last improvement with what the numbers show and what that teaches, and `rate`, a command |
| `notes` | anyone | one command, which passes when the private folder is empty |
| `readers` | children | none, and it ends when every chapter closes |
| `mine` | anyone | nine leaves, one table below |
| `improve` | anyone | `tickets`, one link each with its class, its home, the plan, and what the next numbers show if it works |
| `report` | person | `misses`, what the retro skips, and the reading itself is the gate |
| `distribute` | anyone | `groups`, one line per ticket with its group and urgency |

`retro collect` takes what it names into the retro folder, and every line it
takes has a reader. Nothing it takes goes unread, and the `unread` leaf
checks the manifest against the leaves to say so:

| what collect takes | from | who reads it |
|---|---|---|
| the log, after a rotation | `.se/log/` | every chapter's reader, its own slice, and the `shell`, `refusals` and `worker` leaves over the whole. A record is no log: it is the engine's entries on a ticket |
| every script anyone writes | `.se/scripts/`, the scratchpad | the `scripts` leaf |
| every private note, as a copy | `.se/tickets/` | the `notes` step, which decides each |
| the transcripts, thoughts and all, as a copy | the harness's own files | every chapter's reader, its own slice, and the `worker` leaf for the length of a thought |
| the tickets that close in the window, with their records | git | the `records` leaf |
| the retro leaves of every group that merges in the window | git | the `runs` leaf |
| the earlier retros | the retro tickets in git | the `score` step, and the `chapters` leaf for repeats |
| the manifest, one line per thing taken | the verb itself | the `unread` leaf |

The verb takes by a list of what it names and by nothing else, so a keep list
that goes stale is no risk. The retro folders themselves, under `.se/retro/`,
stand outside that list, and so do the hold, the box id, the config, the bin
and the handover. A drain has no undo, so the verb refuses while a hand holds
a ticket. `/se-retro` is the slash command that mints a retro and pulls it,
and the projection writes it beside the config commands.

The window runs from the last retro's close commit to now, and for the first
one from the tree's first commit. The verb cuts it into chapters of six hours
that hold activity, off the timestamps in the log and the transcripts. It
writes the counts per chapter before anyone reads a word:

- prompts, tool calls and shell commands
- refusals by kind, and errors
- tickets that move, and notes that appear
- the median length of a thought

So the worker's thinning over a long window, which v4 measures by fifths,
stands per chapter for free.

Each chapter is a private ticket under `chapter`, with the counts as its ask.
The engine spawns `work.retroReaders` hands for them, four by default, and
each takes the next chapter when it closes its own until none stands. That is
v3's reader per slice as a mechanism, under a cap on the hands. `by: helper` is
the word for a hand the engine spawns for a step and nobody else. A chapter's
reader answers five things:

- the work of these hours
- what goes well, and what makes it go well
- what goes badly, each with its moment in the log or the transcript
- how each bad line stops happening, by its home
- what the thoughts say that the actions do not

The rest of the window is one reading, so the retro's own hand does it, leaf
by leaf under `mine`. `collect` lays each leaf's material out as a file in the
retro folder, and a leaf answers its questions and nothing else:

| leaf | reads | answers |
|---|---|---|
| `chapters` | the closed readers | themes with counts and the chapters they stand in, the themes an earlier retro names already, and what the readers' thoughts say together |
| `shell` | the shell commands, grouped by the job with a count and an example | what the groups say the tree lacks, which become a verb or a flag, which want a sentence, which a door refuses from now on |
| `refusals` | the doors' refusals, by rule | which rule fires how often, whether the rule or the hand is wrong, and which rules fire and teach nothing |
| `tickets` | the records of the tickets that close in the window, which are the engine's entries on each and no log | the steps that fail back or meet `refused` most per process, what the person steps ask and how long each waits, and what the conditions skip |
| `worker` | the counts per chapter | where errors and the length of a thought turn, and where the worker cuts scope and calls it something else |
| `scripts` | every script collect takes | which becomes a check, a flag or a verb, with its home, and which dies, with the reason |
| `runs` | the retro leaves of the groups that merge in the window | what the boxes lack and meet, what repeats across runs, and what they leave for a person that still stands |
| `unread` | the manifest, against what every leaf read | every line no leaf read, and why |
| `method` | this retro's own run | what each leaf earned and cost, the readers' questions with no answer, and what changes in the retro route or its verb, as tickets |

An improvement is a ticket the retro mints, one per class. The retro names
its home by the order that asks the least of anybody:

| home | what it is | where |
|---|---|---|
| a check | runs without being read | the sweep, `check` |
| a refusal | a door rule | level zero |
| a gate | a form, an `expects`, a `needs` on a step | a process file |
| a prefill | a mint comment, a field | a schema or a process |
| a checklist line | what a hand has to do here | a process file |
| a verb or a script | a job the shell keeps doing | level one, `src/scripts` |
| a knob | a default | the config |
| a sentence | works on whoever reads and remembers it | guidance, last |

The kata card spans two retros:

| the retro | writes |
|---|---|
| the one that mints | the plan, and what the next numbers show if it works |
| the next, at `score` | what the numbers show, what that teaches, and the rate |

A cap, `work.retroCap`, keeps the minted list to what gets done, and the
report keeps the rest as themes the repeat check meets next time. The
`improve` step's checklist carries the standing questions:

- one class, one ticket
- the home by the order
- count before a keep rule
- a route edited on a ticket goes back into its process file
- the process read against what the field does now

The group's retro is the small one, and the tree's retro reads it. A cloud
box has nobody to ask and no earlier retro, so the `field` and `score` steps
belong to the desk alone. Its proposals are tickets with no group, which land
at the merge, and the next desk retro scores them like any other. A box that
dies before its retro leaves none, the stale rule catches the group, and the
notes die with the box, as ruled.

A person mints a retro by hand for now, with `/se-retro`. Later the engine
refuses a new iteration while notes stand open, and that refusal is what
mints one.

# The pull

The agent holds three verbs: `pull`, `guidance` and `escalate`. Every other
verb belongs to a person or the engine. The shell is the verb, under
`./RUNME.sh work`. A plugin tool wraps it for a session that holds the plugin,
which is v4's ruling that one function runs under both doors.

The engine is these verbs and the beat, and it runs with nobody on the box.
That is why it stands in level one and outside level zero. Level zero holds
before anything else does, and the engine has to keep working with no person
there.

A pull carries at most two things: the ticket it hands back and a verdict.
The verdict is `pass`, `fail` with a reason, or `became` with the successor
the hand mints, and on `became` the ticket closes with that reason once the
successor exists. The file is the payload, because the hand writes its
evidence through the write door before it pulls. A leaf holding a
`verdict` field takes the verdict from the field, and the pull refuses the
flag there. The other side fetches the branch, then checks, cheapest first:

1. The hand-back matches the hold: this ticket, this step, this take hash. One the record answers already gets the recorded answer. One whose take hash trails the branch gets `refused` as stale.
2. The ticket passes its schema, and every field of the leaf holds what its form asks.
3. Every command field of the leaf runs from the root and answers the exit or the word `expects` carries.
4. The hand can take this step, by the route's `by` and `not`. A verdict comes from a hand that leaves the tip where it stands.
5. The judge reads the evidence against the step's guidance, on every
   hand-back, where `judge.enabled` says so.

The judge runs in the plugin wrapper, since a shell verb reaches no model. A
person's hand-back from the shell meets the four mechanical checks. The judge
reads it at the next agent pull on that ticket.

Then one of three answers comes back:

| answer | when | the hand does |
|---|---|---|
| `work` | one leaf of a ticket, with its fields and its guidance inline and the file's path | the step, then pulls again naming it |
| `refused` | a check fails, and the findings stand one a line | fixes it, and the ticket stays in hand |
| `wait` | nothing to hand out, and the reason with it | says so, and stops |

On `pass` the engine does six things in one call:

1. It writes the leaf's entry into `record`.
2. It advances `step`, or closes the ticket at the last step with reason
   `done`.
3. It sets `state: open`, so the next hand can pull it.
4. It commits the step's work and the ticket as one commit on the group's
   branch, named by the ticket and the step.
5. It pushes. Where the push fails, it fetches, rebases that one commit, and
   tries once more, or answers `refused` and says the branch moves.
6. It answers the next ticket, or `done` to a hand the engine spawns for one
   step.

On `fail` it does four things:

1. It sets `step` to the row's `on_fail`, or to the step itself where none
   stands.
2. It writes the reason on the evidence.
3. It counts the return in `record`.
4. It reopens the ticket.

At `work.failsBeforePerson` returns it inserts a person step carrying the last
findings, the way a refusal does.

A `work` answer says one thing to do, and it hands the leaf, not the whole
ticket. It carries the ask and the leaf alone: its fields, their forms, and
what each says. It carries the guidance the leaf and its phases name. It says
the position too: which leaf of how many, under which phase. It names the
file and the chapter to write in. The whole file stands on disk and nothing
hides it, so a hand that wants the picture reads the file.

The pull runs at two levels, and the same rule shape holds at each:

| who pulls | what | the rule |
|---|---|---|
| the beat | a box per free group | groups at `todo`, none of whose tickets wait on an unmerged group, by urgency |
| the box | the next ticket of its group | tickets at `open` with no open dependency on trunk, children before their group, a step this hand can take, by urgency then name |
| a person | anything | the same two lists on the board, and no refusal |

The pull writes a hold per hand under `.se/hold/`, naming the ticket, the
step, the group, the hand and the take hash. The pull refuses a second live
hold for one session. The tooth's `work-waiting` check reads the session's
own, so a turn ends on a fact where a ticket stands in hand.

# Hands

A hand is a box, a session on it, and an agent inside it where the harness
names one. The engine mints the box id once into `.se/box.json`, the way v4
does, and reads the session and the agent off level zero.

| hand | is |
|---|---|
| a helper the session spawns | the session's own hand, and the spawn hook tags it so |
| a hand the engine spawns for a step | a hand of its own |
| a person | their git author name |

So a session's own helper reviews nothing of the session's work. The verb
refuses `by: person` where the environment names an agent's harness, and
`work.personSigns` asks for a signed commit as the stronger door.

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

The inserted step carries one field, `answer`, of form `text`, or of form
`choice` where `asks` carries `options`. The person fills it and hands the
step back, and the engine advances into the step behind it.

| trigger | who inserts | the knob |
|---|---|---|
| the hand needs a person | the hand, through the verb | none |
| the same hand-back meets `refused` N times | the engine | `work.refusalsBeforePerson` |
| a step fails back N times | the engine | `work.failsBeforePerson` |
| a step a person takes, from the mint | the mint | none |

A gate and an escalation are one mechanism, one the mint writes and one the
engine inserts on the way. A park is the same: a person step whose `asks`
carries the condition. The group keeps moving, because the box works its
other tickets while a person step waits. When none of them stands at an
agent's step, the box leaves the group at `todo`. A box returns once the
person answers on the branch.

A ticket that gathers more inserted steps than `work.stepsBeforeSplit` is the
wrong size. The engine refuses another insertion and answers the ask: split
it. The ticket closes as `became` once its successors exist, and no sooner.

# Guidance rides the step

Each step names the guidance it reads. The pull's `work` answer carries those
notes' actionables inline, so the hand holds them the moment it holds the
step. The `guidance` verb answers a named note, or, unnamed, the notes the
current step lists and the always-on ones.

The pull is the one road to a hand-back, and the pull hands the guidance. So
a step with `reads` is a step no hand works before the notes reach it, and
the engine keeps no quiz to prove it. What it keeps is the arrival:

| the engine writes | where | it lasts |
|---|---|---|
| one log line per note handed over | the log | for the record |
| the notes this hand holds for this step, by name and hash | the hand's hold file | the session |

The hold says which notes reach this session, so the pull hands them once per
step and session. Three things hand them again:

- a `refused` answer, which quotes the rules its findings cite
- a compaction, which level zero already notices
- a note whose hash moves

A refresher on every pull costs tokens and buys nothing the hold does not
know.

The proof of application is the hand-back: the commands, the evidence and the
judge. The judge reads every hand-back, and the write door's sampling reaches
it nowhere. If its findings run at the rate the transcripts show for a
prompt, three hand-backs in four, the hash-keyed probe returns.

Level one carries no reading probe, and two measurements say why:

| measurement | says |
|---|---|
| v3, on its own probes | evidence, and no enforcement |
| v5, on the field | a door holds a rule in every run, and a prompt in four runs of five |

The standing layer shrinks to the notes that bind every session. A note a step
names leaves the layer and rides the step.

# Children and private tickets

A ticket names its `group`, and the pull hands a child out before its group.
A group at its `children` step waits for its last child, which is v4's scope
rule. A box at autonomy `start` can mint sub-tickets into its own group. A bug
it trips over goes the same way, which is the owner's ruling from v4 on a bug
found in the bucket.

Private tickets carry the same schema in `.se/tickets/`, and two kinds stand
there: a note, and a breakdown of the ticket in hand. The pull hands a
breakdown to the hand on its own box alone, and a note to that box's hand at
a retro step. That is v4's rule that an empty queue drains the notes, with
the retro as the moment. The tooth counts a private ticket in hand the way it
counts a task today.

# What a person sees

Three surfaces draw the folder and the branches, and none keeps a second
record:

| surface | draws |
|---|---|
| the work editor, which a button in the sidebar opens | every ticket, under yours, urgent, in work, open and done, and a ticket's route as a drawing a person works through |
| `./RUNME.sh work list` | the same rows in a terminal, with the age of each held branch |
| the ticket file itself | the ask, the route, the evidence, the discussion |

The board draws what the machine holds, and nothing more. A ticket in a held
group shows its group's state and the age of the branch's tip, and no state
of its own. The branch is responsible for it, and nobody on trunk touches it.
A ticket a branch wants seen on trunk lands there by a merge. The board
fetches on the schedule the tree already has. So a tip nobody fetches yet
stays unknown to the board, and any reader of git expects that.

The editor stands outside the sidebar, in a window of its own. Its shape waits
for a design note of its own once the back end stands, and v4's work editor is
the starting point. It can end as a Kanban board, or as something else. The
sidebar gains one group, `work`, and it holds four controls:

| control | does |
|---|---|
| the engine's switch | starts and stops the beat, which is the `engine.state` widget the schema already declares |
| the editor button | opens the work editor, and carries the count of tickets waiting on you, the way a mail icon carries its unread count |
| `note` | mints a note in one press, which is the shortcut a hand takes mid-work |
| `mint` | mints anything else: a ticket by process, or any note a schema in the tree holds |

The count on the editor button is the declared `count` widget, which the beat
replaces on every tick. So a person sees that something waits on them with the
editor shut, and clicks.

Yours stands first, oldest first: every ticket at a step whose `by` is
`person`, with its `asks`. Every held group whose tip is older than
`work.staleAfter` stands there too, with its three answers. The routine's
notification names each of them with its age. The
routine fires one box on its clock. That box takes a free group, works it,
and takes the next free group until none stands or its cap comes. A second
routine is a second box, and a person creates it.

A person does four things, each with a verb or a click:

- mints from the two buttons or the verb
- fills a leaf's fields through the drawing, and edits no YAML by hand unless they want to
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
| `work-waiting` counts tasks | it reads the session's hold file and counts private tickets |
| the answer door reads the session's text alone | it reads the `note` row off the log too, where the prompt names a note |
| the viewer colours every kind it knows | `note` draws pink, under the prompt it answers |
| the spawn hook hands the guidance to a helper | it tags the helper with the session's hand too |
| `engine.binding` at `queue` and `unbound` draw the status bar | `queue` hands out, `unbound` hands out nothing, and `pull <ticket>` takes a named one |
| `engine.autonomy` draws nowhere | `finish` mints notes alone, `start` mints into its own group, `ideation` mints loose tickets, which ride the group's branch on a cloud box |
| `engine.state` and `engine.beat` draw nowhere | the switch runs the beat on a desk, and `engine.beat` reads the newest tip of a group's branch |
| the trunk guard refuses a commit on `main` | unchanged |

The cloud guidance note changes one line: the first verb is the pull.

# What the machines read

Level two is processes as machines, and it reaches the agent by no road. It
reads the folder of tickets, and derives where each machine stands from the
states and steps it finds there. It mints tickets with routes, sets `group`
on them, and reacts to a close by minting the next. The agent still pulls, and
the only fact it meets is a route.

# Where it lives

| piece | where |
|---|---|
| the schemas | `spec/schemas/ticket.schema.yaml`, `process.schema.yaml` |
| the folders | `spec/tickets/`, `spec/processes/`, `.se/tickets/`, `.se/retro/` |
| the processes | `spec/processes/<name>.yaml`, six of them, in the tree now |
| the emitter | one module the editor reads, beside the verbs |
| the verbs | `src/scripts/work.js`, under `./RUNME.sh work` |
| the tool wrapper and the spawn | `.claude/skills/level1/`, beside level zero |
| the stop rule | `spec/config/stop/level1.yml` |
| the hold and the box id | `.se/hold/<hand>.json`, `.se/box.json` |
| the config | the `engine` and `work` sections of `spec/config/level0.json` |
| the `work` group and its four controls | `spec/config/level0.schema.json` |

| key | default | what it decides |
|---|---|---|
| `work.refusalsBeforePerson` | 5 | when a refused hand-back becomes a person's step |
| `work.failsBeforePerson` | 2 | when a step that keeps failing back becomes a person's step |
| `work.stepsBeforeSplit` | 3 | when an escalating ticket must split |
| `work.staleAfter` | `12h` | when the notification names a held group as stale |
| `work.retroCap` | 7 | how many improvements one retro mints at most |
| `work.retroReaders` | 4 | how many hands read a retro's chapters at once |
| `work.personSigns` | off | whether a person's hand-back needs a signed commit |
| `work.filter` | empty | what a person's pull sees, over the branch |

# Rulings from v3 and v4

| ruling | from | where it lands |
|---|---|---|
| the pull is the one verb, and a submission rides it | v3, v4 | stays whole |
| one token in hand | v4 | one ticket in hand per hand, under `.se/hold/` |
| the hold is engine state, and the claim travels | v4 | the hold file, and the record's push on the group |
| the token carries no time | v4 | stays, and `work list` reads a branch's age off git |
| a field stands because something reads it | v4 | the field table above |
| a todo is a sub-token | v4 | private sub-tickets, and the tooth counts them |
| every token names its closer | v4 | the route's last step |
| a refusal is a menu | v4 | the `refused` answer names the fix |
| the bucket is the person's | v4 | the group, and the word bucket retires |
| processes as data | v4 | routes now, and machines at level two |
| a write names its token | v4 | out, because the hold names it and the write door is level zero's |
| the staffing gate and the reviewer queue | v4 | out, because a step spawns its own hand |
| the reading proof | v3 | out, for the log line, and open as a level two option |
| a spawn ceiling of zero for delegated writing | v3 | the engine spawns for a step alone, and a hand the session spawns is the session's |
| controls only ever stop the engine refusing | v3 | stays |
| notes, then the retro, then the mint | v3 | the note process, and the mint's privacy check on promotion |
| a claim lapses after a set number of hours | v4 | out, because a stale branch is a person's to look at, and the beat names it |
| the machine builds the form, and a pull carries it back | v3 | the evidence forms, which the mint renders |

# The order of work

Ten branches, and the dependencies make the order binding:

| no | branch | holds | after |
|---|---|---|---|
| 1 | `the-ticket-has-a-schema` | the two schemas, the checker's recursion, a YAML kind under a schema, the three keywords, `mint`, the private folder | |
| 2 | `a-process-is-a-route` | the six route files under the schema, `when`, checklists, the six slots, the emitter, the note verb, the copy at the mint, `reroute` | 1 |
| 3 | `a-group-is-a-branch` | the group as a ticket, the take as a record push, list with the tip's age, merge with the check, close, `adopt` | 1 |
| 4 | `the-agent-pulls-a-ticket` | the pull, its checks, its answers, the record, a hold per hand, the stop rule | 2, 3 |
| 5 | `a-step-changes-hands` | the hand id, the spawn and its tag, person steps, escalation | 4 |
| 6 | `guidance-rides-the-step` | `reads`, the verb, the log line, the standing layer shrinks | 4 |
| 7 | `the-work-group-draws` | the `work` group, its four controls, the count on the editor button, the beat, the notification that names questions and stale groups | 4 |
| 8 | `level-zero-hands-over` | the brief door goes, and the controls wire up | 4 |
| 9 | `the-retro-is-a-ticket` | `retro collect`, the chapters and the counts, the files the mine leaves read, `retro notes` and `score`, the readers as helpers, the first retro on a desk | 4, 5 |
| 10 | `the-box-runs-the-route` | the cloud guidance around the pull, the routine takes a group, the brief's contract retires, `adopt`, the first cloud run | 4, 8, 9 |

Nine briefs stand on their `work/` branches, cut from this note, and each
names the chapters it implements. The tenth is the cloud run, and it waits
for the retro, since a group's retro phase runs the retro's notes command. The editor's live drawing, its block
library and the evidence form wait for branch 2. They are desk work with the
owner, and no cloud brief carries them.

The five work branches standing today finish under the verbs they carry. A
brief branch is one whose tip carries `HANDOVER.md`, and `work list` tells the
two kinds apart by that. `take` keeps serving a brief until `work list` names
none. `adopt` turns a brief into a group ticket and one child, for the
ones a person wants moved. The old verbs go once the last brief merges.

# What this leaves open

- whether a person step can go to a spawned strong model at high autonomy
- whether yours drowns in parked conditions, and a parked state returns
- a heartbeat ref per held group, if a tip's age proves too coarse a sign of a dead box
- how the judge reads a checklist's lines against its items, once the first process shows the shape
- a WIP limit per step, which is Kanban's one knob and stands outside this note
- whether a guidance card's own items become steps at the mint. Card marking in v3 carries the same idea, and level two can take it up
- more forms, such as a number or a date, as the routes come to ask for them
- animation of a process run, which a feed into the emitter's graph adds later
- the pull handing a cloud box its retro early when the cap is near, if the platform names the cap
- the form of a review report, which can take a schema, and what a passing verdict's open points become
- a plainer word than `says` on a field
