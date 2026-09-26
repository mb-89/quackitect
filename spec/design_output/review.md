---
kind: [[design_output]]
---

# Scope

`src/scripts/work-review.js` gathers what a reader wants off a branch. This note
covers the verb, the worktree it runs in, and the questions it answers.

# What the reader is

A second pair of eyes on a branch standing at `done`, and a list of what to fix
next. It runs when somebody asks for it.

| it is | it is not |
|---|---|
| a second pair of eyes | a gate |
| a list of fixes | a verdict |
| a thing you run when you want it | a thing that fires on its own |

Nothing it says stops a merge. There is no refusal here, no verdict field, and
no switch holding a branch back.

# The halves

| half | who runs it | what it answers |
|---|---|---|
| the verb | `./RUNME.sh branch review <name>` | the check and the retro |
| the reader | the `review_branch` tool | the ask, the diff and the tests |

The verb stands alone. A person runs it, reads the diff themselves, and has the
mechanical answers in front of them while they do.

# What the verb gathers

| the thing | where it comes from |
|---|---|
| the ask | the group ticket at the branch's first commit |
| the handback | the group ticket as the branch carries it now |
| the shape of the diff | `git diff --stat main...<ref>` |
| the whole diff | `git diff main...<ref>` |
| the check | `./RUNME.sh check` on that branch |

The ask and the handback are one file at separate commits. `branch open` cuts the
branch off trunk's tree, so `git rev-list --reverse main..<ref>` names the
commit the ask stands in, and the tip carries the handback.

`--json` prints the whole gathering as one object, which is what the hook reads.

## Which ref it reads

The verb fetches, then takes `origin/work/<name>` where origin carries it and
the local branch otherwise. `branch merge` merges from origin, so origin is what
the merge takes and origin is what the reader reads.

Trunk resolves the same way, and a branch carrying no commit beyond trunk stops
the verb with a line saying so.

## Three dots, not two

`...` reads the diff from where the branch leaves trunk. `..` reads it
from trunk's tip, so a branch standing behind trunk shows every commit trunk
holds since as a removal.

One real review pays that price here. A branch far behind trunk answers
"two entire subsystems, deleted and undisclosed", over code the branch leaves
alone. `rev-list` keeps `..`, because it counts the branch's own commits.

# A worktree runs the check

`git worktree add --detach .se/.runtime/review/<branch>` opens the branch beside the
tree the caller stands in. So a review costs the caller no checkout, and it
reads a branch a person already checks out somewhere else.

The things below follow from where that worktree lands:

| the thing | what the verb does |
|---|---|
| the worktree carries no `.se/.runtime/bin` | copies `.se/.runtime/tools.json` in, whose paths name this box's binaries |
| `RUNME.sh` downloads every tool | runs `node src/scripts/cli.js check`, leaving the install script out |
| the install script stamps the brand, and git ignores what it writes | stamps the worktree through `stamps` in `src/scripts/brand.js`, with the brand of the caller's tree |
| the worktree carries no `node_modules` and no `.se/.runtime/bin/zig`, and the survey names no compiler [[spec/design_output/index#the-compiler-it-needs]] | links the caller's two in, and unlinks them before `git worktree remove` |
| the check writes its own builds into `.se/.runtime/bin` | borrows the compiler's folder alone, so a branch's build lands in the worktree's own bin |
| the check stamps `.se/.runtime/check.json` | lets it land in the worktree, so the caller's own stamp stands |

`.se` is git ignored, so the worktree lands where nothing tracks it, and
removing the worktree takes the whole of it away.

A red check answers with the lines naming the break. It takes every `not ok`
row the test runner writes, and the last lines of the run where it writes none.

# The questions

They live in `spec/guidance/review/reviewing.md`, written as actionables the way every
other guidance note is. Level zero hands them to every session, so the reader
gets them inside the standing layer and the prompt names no rule twice.

A design review reads another note. `design/review` on the standard route reads
[[spec/guidance/review/design]], and no route reads the branch review's note.

# What the reader answers

The reader answers one JSON object, and `readerSays` reads it back:

    {
      "ask": "done, and nothing beyond it",
      "beyond": "src/doors/git.js, a one-line fix, trivial",
      "tests": "2 rules added, 1 carries no test:\nStopRule fires on nothing",
      "fix": 2
    }

`fix` counts the things a person acts on. An answer that parses as no JSON
lands in the report under `reader`, whole, and counts as one thing to fix. So a
reader that wanders still hands its reading over.

`report` takes the gathering and this answer as its arguments, because both
carry a key called `ask`. The verb passes the first alone, so a report with no
reader behind it prints the `check` and `retro` rows the verb owns and no ask.

# What the report looks like

Short, and every line something to do:

    work/the-config-holds-numbers

    check      passes
    retro      present
    ask        done, and nothing beyond it
    tests      2 rules added, 1 carries no test:
               VoiceShape.StopRule fires on nothing under test
    beyond     src/doors/git.js, a one-line fix, trivial

    2 things to fix, and the merge is a desk's.

The count adds the reader's `fix` to what the verb finds: a red check counts
one, and an absent retro counts one. The verb reads the group ticket as the
handback, and `retroOnTicket` reads a filled line under its retro chapter. A
report with nothing to fix fits on one line:

    work/the-config-holds-numbers   nothing to fix, and the merge is a desk's.

# The queue takes done branches

A work branch standing done waits for a review and a merge, and that wait is
the desk's work. So a desk's pull on trunk reads the branches before the free
tickets. It hands out the first done one as its steps: the review, and the
fixes it names, the merge from trunk, and the close. `readyToMerge` in the
review verb prints them, and the pull hands out no ticket beside them. The
merge is the hand-back, and the close takes the branch out of the queue. A
cloud box's pull takes a branch instead, so a done branch is the desk's alone.

# The tool the session calls

Level zero registers `review_branch` at `session.start`, and serves it on
`tool.call`. The hook runs the verb through `$.process.run` with `--json`,
hands the material and the standing rules to `$.agent.spawn`, and answers the
report.

So the session asking for a review spends one tool call and reads a short list.
The diff reaches the reader's context alone.

The table below covers that call, both measured on client 2.1.267:

| the thing | what the hook does |
|---|---|
| `timeoutMs` holds ten minutes at most | asks for five, and a longer ask rejects the call and skips the hook |
| `RUNME.sh` writes install lines to both streams | runs `node src/scripts/cli.js`, whose output is the verb's alone |

A call the engine rejects skips the hook, and the session then reads that level
zero holds a tool nothing answers. So the ask stays inside the cap.

## Where the spawn refuses

`$.agent.spawn` answers `{ deny }` where the engine refuses the spawn, and it
throws where the surface is missing. Either way the hook answers the mechanical
half alone, with a `reader` row saying why the reading is absent.

So part one holds on a build carrying no agent surface, and the tool stays
worth calling.
