---
kind: [[design_output]]
describes: [[.claude/skills/level0/lib/projection.js]]
---

# One source, written everywhere

`spec/config/level0.json` says what every value is. A slash command that sets
one has to exist as a file. Hand writing both gives two files that agree for
about a month.

So the tree projects. v4 rules it this way, and the ruling stands:

    Projection is one mechanism and not a feature of one file. What is
    projected where is data. The engine projects and nobody copies by hand. A
    changed original re-projects on its own. A projection is read-only to the
    user, and it says that it is one.

# What goes where is data

`spec/config/projections.json` holds the list. Each entry names one projection,
so adding one is an edit to data and no program changes:

    {
      "name": "the config commands",
      "shape": "config commands",
      "target": ".claude/commands",
      "from": "spec/config/level0.json",
      "schema": "spec/config/level0.schema.json",
      "wrap": "frontmatter"
    }

| field | says |
|---|---|
| `name` | what a refusal and a log line call this projection |
| `shape` | which relation the projector holds, and the tree holds one |
| `target` | the folder every file of this projection lands in |
| `from` | the declaration the files come from |
| `schema` | the file saying the type of each key, and its options |
| `wrap` | `frontmatter` writes the mark into a description, `none` writes none |

## What comes from v4

| field | here |
|---|---|
| `name`, `target`, `wrap` | taken as they stand |
| `sources`, `sources_from` | left, because `from` names one declaration |
| `section` | left, because a chapter of a note projects nowhere yet |
| `preamble` | left, because no target here opens with borrowed text |
| `local` | left, because git tracks every target here |
| `shape`, `schema` | new, because a key needs its type before it is a command |

A target here is a folder holding many files, where v4 writes one file per
entry. One value becomes one command, so the declaration sets how many files
land and the entry sets the folder.

# The first target

One slash command per settable value, under `.claude/commands`:

| the declaration says | the projection writes |
|---|---|
| `log.level`, three options in the schema | three files, one per option |
| `stop.enabled`, a boolean | two files, `true` and `false` |
| `judge.model`, a string | one file, taking the value as an argument |
| `stop.mostInARow`, a number | one file, taking the value as an argument |

The keys come from the declaration and the types come from the schema. A key
the declaration drops loses its file, and a key it gains grows one.

## A name carries the path

A command sits on the same path a person walks in the sidebar. `se-` holds the
commands together in a menu nobody else fills, and the path follows:

    se-config-log-level-info.md
    se-config-judge-model.md
    se-agent-control-hold-stopped.md

Every value the declaration carries takes the config path: `config`, then the
section, then the leaf. That is the tree the config section draws.

The leaf keeps the case the key holds. A name holds five words, and
`se-config-stop-most-in-a-row` holds eight, so kebab casing the leaf writes a
name this tree refuses.

## A widget takes its path

A toggle the schema draws in a group takes a second command down the group's
path: the group in kebab case, then the leaf. So the hold button in agent
control answers `se-agent-control-hold-stopped`, and the config tree answers
`se-config-stop-hold-stopped`. Both run the same verb.

A group holding two toggles on one leaf names each by its section and leaf.
An action takes no command, because it runs a program and sets no value. The
sidebar hover names the widget path. For details, see
[[spec/design_output/extension#a-button-names-its-commands]].

## Each file says so

The `generated` key of every file says what it is:

    GENERATED. Edit the source named below, not this file. It is written again
    every time the tree is projected, so an edit here is lost.
    Source: spec/config/level0.json

The `description` is what the command menu shows. It names the path and the
change, and carries the key's help from the schema:

    agent control / hold: sets stop.hold to stopped. What the session does when it reaches the end of a turn.

The body meets the same rules every other markdown file meets, because Vale
reads `.claude/commands` with everything else. So the projector wraps each line
at the width a person holds.

## How a command sets it

Two roads stand open, and this tree takes the second:

| road | what it costs |
|---|---|
| v4's, a magic string `KEYWORD:ASK=ON` that a hook matches | one hook reading every prompt |
| ours, the command file runs `./RUNME.sh config <key> <value>` | nothing, because the verb already writes the local file |

The file carries the run in its body and names the verb in `allowed-tools`:

    ---
    description: "config / log / level: sets log.level to info."
    allowed-tools: Bash(./RUNME.sh config:*)
    generated: "GENERATED. ... Source: spec/config/level0.json"
    ---

    !`./RUNME.sh config log.level info`

A file taking an argument carries `$ARGUMENTS` where the value stands, and an
`argument-hint` of `<value>`. The client puts what a person types there.

### Why the keyword road waits

v4 measures the first road and it fails there. The client submits the name of
the command alone, so a keyword in a body reaches no matcher. v4 answers that
by reading the file back inside the hook. That is a second reader of the one
answer, and it costs a hook over every prompt.

The second road asks the client for nothing but the run it already offers.

# Projecting in memory

`writesOf` takes one entry and the texts it reads, and answers a map from path
to text. It touches no disk, so a fake disk drives the whole relation in a test
and the same function answers three callers:

| caller | what it does with the answer |
|---|---|
| `session.start` | writes each file that differs |
| `./RUNME.sh check` | compares each file against the disk |
| `./RUNME.sh project` | writes the difference, and drops what stands over |

# Who projects, and when

Level zero, at `session.start`. It runs there already and it holds `$.fs.write`,
so no engine has to exist for this to work.

Projecting at every session start is what makes the relation stand. A person
edits `level0.json`, starts a session, and the commands are right. The log
carries the cost of it, door `project`:

    {"door":"project","said":"0 file(s) written","ms":1,"detail":"1 projection(s), 15 target(s)"}

## What it costs

Measured on 2026-09-10 over one projection and fifteen targets, twenty runs of
each, against the real disk on a cloud box:

| the run | cost |
|---|---|
| every target already reads as projected | 0.29 ms median, 0.20 ms low |
| all fifteen take a write | 0.59 ms median, 0.45 ms low |

So the log rounds it to `1` and a session start pays under a millisecond.

These numbers come from the projector over the disk door. The hook reads and
writes through `$.fs` instead, which costs more than the raw call.
A box loading the hooks module measures the whole of it, because the log line
carries the number. This box loads none, and
[[spec/design_output/level0#the-trust-gate-reaches-skills]] says why.

## The hook only writes

A session start writes a file that differs, and adds one that is missing. It
drops nothing. A hook deleting a tracked file costs more than one stale name is
worth, so `./RUNME.sh check` names the file standing over and `./RUNME.sh
project` drops it.

# Check refuses a stale one

`./RUNME.sh check` projects in memory, compares each target against the file on
disk, and refuses a difference:

    .claude/commands/se-config-log-level-info.md differs
    A projection is read-only, so edit the source it names instead.
    Run ./RUNME.sh project, which writes every target again.

`staleIn` answers three kinds, so a person reads which one stands:

| kind | what it means |
|---|---|
| `missing` | the declaration names a value, and no file stands for it |
| `differs` | a file stands, and somebody edits it away from the source |
| `extra` | a file stands for a value the declaration no longer names |

# The write door refuses one

A projection is the one forbidden destination. A person editing one loses that
edit at the next projection, so the door refuses the write instead:

    .claude/commands/se-config-log-level-info.md is projected, so nothing may write it by hand.

      projection: the config commands
      source:     spec/config/level0.json

    Edit spec/config/level0.json instead. Level zero projects at every
    session start, and `./RUNME.sh check` refuses a target standing stale.

The door already reads every `Write` and `Edit`. `ownerOf` answers which entry
owns a path. The refusal stands ahead of the voice rules, so the source alone
meets them and a generated file meets the rules of its own source.

This refusal is the one place the projection branch touches the hooks module.
