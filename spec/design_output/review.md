---
kind: [[design_output]]
---

# Scope

`src/scripts/review.js` gathers what a reader wants off a branch. This note
covers the verb, the worktree it runs in, and the five questions it answers.

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

# The two halves

| half | who runs it | what it answers |
|---|---|---|
| the verb | `./RUNME.sh work review <name>` | the check and the retro |
| the reader | the `review_branch` tool | the brief, the diff and the tests |

The verb stands alone. A person runs it, reads the diff themselves, and has the
mechanical answers in front of them while they do.

# What the verb gathers

| the thing | where it comes from |
|---|---|
| the brief | `HANDOVER.md` at the branch's first commit |
| the handback | `HANDOVER.md` as the branch carries it now |
| the shape of the diff | `git diff --stat main...<ref>` |
| the whole diff | `git diff main...<ref>` |
| the check | `./RUNME.sh check` on that branch |

The brief and the handback are one file at two commits. `work new` writes the
brief in the branch's first commit, so `git rev-list --reverse main..<ref>`
names the commit the brief lives in, and the tip carries the handback.

`--json` prints the whole gathering as one object, which is what the hook reads.

## Which ref it reads

The verb fetches, then takes `origin/work/<name>` where origin carries it and
the local branch otherwise. `work merge` merges from origin, so origin is what
the merge takes and origin is what the reader reads.

Trunk resolves the same way, and a branch carrying no commit beyond trunk stops
the verb with a line saying so.

## Three dots, not two

Three dots read the diff from where the branch leaves trunk. Two dots read it
from trunk's tip, so a branch standing behind trunk shows every commit trunk
holds since as a removal.

One real review pays that price here. A branch 19 commits behind trunk answers
"two entire subsystems, deleted and undisclosed", over code the branch leaves
alone. `rev-list` keeps two dots, because it counts the branch's own commits.

# A worktree runs the check

`git worktree add --detach .se/review/<branch>` opens the branch beside the
tree the caller stands in. So a review costs the caller no checkout, and it
reads a branch a person already checks out somewhere else.

Three things follow from where that worktree lands:

| the thing | what the verb does |
|---|---|
| the worktree carries no `.se/bin` | copies `.se/tools.json` in, whose paths name this box's binaries |
| `RUNME.sh` downloads every tool | runs `node src/scripts/cli.js check`, leaving the install script out |
| the check stamps `.se/check.json` | lets it land in the worktree, so the caller's own stamp stands |

`.se` is git ignored, so the worktree lands where nothing tracks it, and
removing the worktree takes the whole of it away.

A red check answers with the lines naming the break. It takes every `not ok`
row the test runner writes, and the last lines of the run where it writes none.

# The five questions

They live in `spec/guidance/review/reviewing.md`, written as actionables the way every
other guidance note is. Level zero hands them to every session, so the reader
gets them inside the standing layer and the prompt names no rule twice.

# What the reader answers

The reader answers one JSON object, and `readerSays` reads it back:

    {
      "brief": "done, and nothing beyond it",
      "beyond": "src/doors/git.js, a one-line fix, trivial",
      "tests": "2 rules added, 1 carries no test:\nStopRule fires on nothing",
      "fix": 2
    }

`fix` counts the things a person acts on. An answer that parses as no JSON
lands in the report under `reader`, whole, and counts as one thing to fix. So a
reader that wanders still hands its reading over.

`report` takes the gathering and this answer as two arguments, because both
carry a key called `brief`. The verb passes the first alone, so a report with
no reader behind it prints the two rows the verb owns and no brief.

# What the report looks like

Short, and every line something to do:

    work/the-config-holds-numbers

    check      passes
    retro      present
    brief      done, and nothing beyond it
    tests      2 rules added, 1 carries no test:
               VoiceShape.StopRule fires on nothing under test
    beyond     src/doors/git.js, a one-line fix, trivial

    2 things to fix, and the merge is a person's.

The count adds the reader's `fix` to what the verb finds: a red check counts
one, and an absent retro counts one. A report with nothing to fix fits on one
line:

    work/the-config-holds-numbers   nothing to fix, and the merge is a person's.

# The tool the session calls

Level zero registers `review_branch` at `session.start`, and serves it on
`tool.call`. The hook runs the verb through `$.process.run` with `--json`,
hands the material and the standing rules to `$.agent.spawn`, and answers the
report.

So the session asking for a review spends one tool call and reads a short list.
The diff reaches the reader's context alone.

Two things about that call, both measured on client 2.1.267:

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
