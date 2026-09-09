---
kind: [[handover]]
status: todo
urgency: soon
depends_on: the-config-holds-numbers
---

# One source, written everywhere

`spec/config/level0.json` says what every value is, and a slash command that
sets one has to exist as a file. Hand-writing both gives two files that agree
for about a month.

So the tree projects: one source, several targets, and a program keeping that
relation alive.

This branch builds the projector and its first target. The sidebar comes later
and reads the same declaration, so leave every widget field alone.

# What projection is

v4's ruling, and it stands:

    Projection is one mechanism and not a feature of one file. What is
    projected where is data. The engine projects and nobody copies by hand. A
    changed original re-projects on its own. A projection is read-only to the
    user, and it says that it is one.

And the failure it exists to stop:

    v3 placed files as a step in the installer, so a projection could be
    refreshed only by running the installer again. That made a projection
    correct immediately after an install and drifting afterwards.

# What goes where is data

`spec/config/projections.json`, holding a list. Each entry names one
projection, so adding one is an edit to data and no program changes.

v4's entry shape, worth following:

    {
      "name": "the config commands",
      "target": ".claude/commands",
      "from": "spec/config/level0.json",
      "wrap": "frontmatter"
    }

Read v4's own file at `spec/config/projections.json` for the rest of its
vocabulary. It carries `sources`, `sources_from`, `wrap`, `section`, `preamble`
and `local`, each answering a target it meets. Take what this tree needs and
leave the rest.

# The first target

One slash command per settable value. A value with a small set of options gets
one command each; a value taking a number gets one command taking an argument.

| the parameter | the command |
|---|---|
| `stop.hold`, with three options | three files, one per option |
| `judge.model`, a string | one file, taking the value as an argument |

Name a file for the path it sets, so a person reading `.claude/commands` sees
the tree: `se-stop-hold-stopped.md`, `se-judge-model.md`.

## Each file says so

v4 writes this into the description of each one, and the wording earns its
place:

    GENERATED. Edit the source named below, not this file. It is written again
    every time the tree is projected, so an edit here is lost.
    Source: spec/config/level0.json

Say the same thing, and name our source.

## How a command sets it

v4's command body is a magic string, `KEYWORD:ASK=ON`, which a hook matches out
of the prompt. That works, and it costs a hook.

This tree has a cheaper road, because `./RUNME.sh config <key> <value>` already
writes the local file. A command file runs it directly, so the value lands
before the turn starts and no hook reads a prompt.

Take that road, and say in your handback whether it holds.

Where a command file runs no program on this client, take v4's road instead:
hook `prompt.submit`, match the string, write the value, drop the prompt.

# Who projects, and when

Level zero, at `session.start`. It runs there already and it holds
`$.fs.writeFile`, so no engine has to exist for this to work.

Projecting on every session start is what makes the relation stand. A person
edits `level0.json`, starts a session, and the commands are right.

# Two guards

## Check refuses a stale one

`./RUNME.sh check` projects in memory, compares each target against the file on
disk, and refuses a difference. It names the file and the verb that mends it.

Compare in memory, so a fake disk drives the whole thing in a test.

## The write door refuses one

v4 calls a projection the one forbidden destination. A person editing one loses
that edit at the next projection.

The write door already reads every Write and Edit. It reads
`spec/config/projections.json` and refuses a write to anything a projection
owns, naming the source to edit.

That refusal is the one place this branch touches the hooks module.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Every settable value in `level0.json` has a command file, and no file stands
   for a value the declaration no longer names.
3. `check` refuses a projection somebody edits by hand, under test.
4. The write door refuses a write to a generated command, under test.
5. A generated command sets the value, end to end. Run one and read the file.
6. A second entry in `projections.json` projects with no code change.

# What your handback says

- Whether a command file runs `./RUNME.sh config` on this client, or whether
  the keyword road is the one that works.
- What projecting costs at `session.start`, in milliseconds.
- Which of v4's projection fields you take, and which you leave.
- Every place a value resisted becoming a command.

# What this branch leaves alone

Every widget field in the declaration: `group`, `row`, `column`, `icon`. The
sidebar branch adds those and reads the same file. Touch neither, and project
nothing for them.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
