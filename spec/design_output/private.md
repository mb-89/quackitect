---
kind: [[design_output]]
---

# Scope

`.claude/skills/level0/lib/private.js` reads what a commit adds and answers
whether it carries something private. This note covers that reader, the three
checks standing on it, and the two doors calling both.

The owner rules that private data lives under `.se`, which git ignores, and
that a commit is the door holding the rest home. Private means a person's name,
a username, an address, a number and a date in prose. It means a path on a
disk, and the raw text of a note somebody dumps for later.

# The delta a commit carries

The check reads what a commit adds, and stops there. `git diff --cached
--unified=0` names each file and numbers each line it adds. So a refusal points
at the line the person or the session sees.

| the delta carries | the reader does |
|---|---|
| an added line | reads it, under the file the hunk names |
| a removed line | passes it, so a leak leaves this tree |
| a binary file | passes it, because the shapes read text |
| a file under `.se` or `.git` | passes it, because git ignores both |
| a file the delta deletes whole | passes it, because `/dev/null` names no file |

A removed line passing is the load-bearing half: taking a leak out of the tree
is the one commit that lands always.

# The three checks

Each check reads the added lines alone, and answers a row naming the file, the
line, the rule and what leaks.

| rule | reads |
|---|---|
| `ShapeStaysHome` | an email address, a phone number, a date in prose, a home path under a user outside the allow list |
| `BoxNameStaysHome` | the user name, the home folder, and the git name and address this box answers |
| `NoteTextStaysHome` | every file under `.se/notes`, against the added lines |

The allow list holds the nobody users, `user`, `root`, `one` and `somebody`,
and nothing else, because a cloud box writes under `/home/user` and a fixture
writes `/Users/one`. An address at a reserved documentation domain passes the
same way, so `duck@example.com` in a fixture stands.

A date reads as a shape in prose alone, under `.md`, `.markdown` and `.txt`. A
timestamp in a fixture or a log line carries a build, and a date in a tracked
note carries when somebody looks.

`BoxNameStaysHome` reads the box at commit time, the way `SurveyFindsNode`
reads it at lint time. It matches a whole word, and the case the box answers,
so a git name of `Duck` holds the word `Duck` home and lets `.duckdb` pass. So
the same tree commits clean on a cloud box and names the owner on the owner's
desk, which is where the leak starts.

# The run and the token

The third check is v3's guard, ported from `deliverable/engine/pool.ts` as two
functions over strings.

1. Flatten both texts: lower the case, drop the punctuation, hold whitespace as one space.
2. Refuse a shared run of six words or more, and quote the run in the refusal.
3. Refuse a shared token carrying a separator inside it, or twelve opaque characters.

One word list covers every line a file adds, and each word carries the line it
stands on. So a run crossing two lines refuses, and the refusal points at the
line it opens on. Flattening the punctuation holds a hyphen to the same rule as
a space: `the-duck-walks-over-the-hill` carries a note's words the same way the
sentence does.

v3 writes one limit down, and it stands here too: a bare name passes, because
nothing tells a name from any other word. The author owns that one alone.

# Two doors, one check

| the commit comes from | the door |
|---|---|
| a session, through the Bash tool | `lib/bash.js` and the hook, before the command runs |
| a person, in a terminal | `.githooks/pre-commit`, which git runs |

Both call `privateNow` over the same delta, so the two refuse the same thing in
the same words, and `refusedDelta` in `lib/refuse.js` writes those words once.

`privateNow` takes a reach answering three things, and each caller builds its
own:

| the caller | its reach |
|---|---|
| the hook module | `$.process` for git, `$.fs` for the notes |
| `src/scripts/precommit.js` | the git door, the disk door, and the delta on stdin |

The hook script stands under `src/scripts` because a reach outside this tree
goes through a door under `src/doors`, and `lib/private.js` reaches nothing.
The shell hook pipes `git diff --cached --unified=0` in, and the script answers
the exit code git reads.

`./RUNME.sh` points `core.hooksPath` at `.githooks` once, the way it links the
editor, and `doctor` names the path it finds. `RUNME.ps1` hands its arguments
to `RUNME.sh`, so one installer wires every box.

# The escape

`--no-verify` steps past a git hook by design, and `-n` is the same flag.

| the box | the door |
|---|---|
| a cloud box | refuses the command, because no person stands behind it |
| a desk box | passes it, and writes a `warn` line naming it |

A person owns their own escape, and the log carries what they take.

# A fixture carries no shape

The check refuses its own proof. A test of the shapes wants an address in it,
and a tracked test file carrying an address meets the door like any other file.

So each test assembles the shape out of parts at runtime:

    const ADDRESS = ["duck", "quacks.org"].join("@");

The tracked line carries two words and a join, and the case carries the whole
shape. So the door reads the delta clean.

This is the second limit standing beside v3's bare name. The door reads the text
a line holds, so a shape a program builds at runtime passes. A leak lands that
way only where somebody writes the join on purpose.

# How a case drives it

Every rule here reads strings, so every case hands one in.

- `test/level0/private.test.js` drives the reader and the three checks over a fixture diff.
- `test/level0/precommit.test.js` drives the hook script over a fake disk and a fake git.
- `test/level0/hooks.test.js` drives the Bash door over a fake engine answering a staged diff.
- `test/level0/bash.test.js` drives the escape over the command line alone.

# What it costs

Every commit pays this check, so the cost belongs beside the rule. The reader
reads the delta once. The run check weighs the words of one file against the
words of each note. That part alone grows with the size of both.

`.se/notes` stands empty today, so the run check answers on an empty list and
the whole cost is the delta walk. `node --test test/level0/private.test.js`
answers in milliseconds, and the handover on the branch carries the reading
over a delta of a hundred files.
