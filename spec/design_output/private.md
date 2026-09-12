---
kind: [[design_output]]
---

# Scope

The private half of this tree stays home. This note covers what private means
here, and the checks holding it:

1. The run and the token, at the write door.
2. The second door, over a shell command.
3. The commit door, over the delta a commit adds.
4. The shapes rule over prose.
5. The rule reading the box at lint time.
6. The judged question over who a note names.

# What stays home

`.se` holds the private half, and `.gitignore` holds `.se`. A raw note, a log
line and a key each stand there, and git carries none of them.

| what it is | where it lives | what reads it |
|---|---|---|
| a raw note | `.se/notes`, one file per note | the write door, the commit door, and a later level |
| a handover for the next session on this box | `.se/HANDOVER.md` | a person, and the session after this one |
| the log | `.se/log` | `./RUNME.sh log` |

Private means a person's name, a handle, an address, a number, a date in prose
and a path on a disk. Unstructured input somebody stores for later is private
too. A tracked file carries what an author writes for a reader outside this
box.

A date in prose says when somebody looks, which is nothing a reader acts on.
The client version beside it already says which build. So a date in prose
goes, and the version stays.

## The brief stands outside

Git ignores `.se/HANDOVER.md`, so the two checks at the door pass it on.
`HANDOVER.md` at the root is the authored half, and it meets every rule the
tree holds.

# The run and the token

`.claude/skills/level0/lib/private.js` holds the two functions, v3's guard over
strings. Both read strings alone, so a caller hands the two texts in and a
test touches memory.

| what it answers | the function |
|---|---|
| the longest run of words two texts share, in order | `longestSharedRun`, over `longestRun` |
| the identifier-shaped tokens both texts carry | `sharedIdentifiers`, over `sharedTokens` |
| the first note a write carries something from | `carriedFrom` |
| what the door says back | `refusedPrivate` |

A run of six words shared with a note is a copy. Shorter, and an honest
rewrite of a one-line note trips it, because the two texts are about the same
thing and share their nouns. Longer, and a pasted fragment walks through.

`COPY_RUN` in `private.js` holds that six, in the open, so the first run of
real data moves it without archaeology.

The commit door reads the same two checks over the lines a file adds. One word
list covers every line of the file, and each word carries the line it stands
on. So a run crossing two lines refuses, and the refusal points at the line it
opens on.

## The flatten

`wordsOf` lowers the case, drops the punctuation and folds the whitespace.
Punctuation between words is a separator like any other, so a hyphen standing
in for a space carries no paste through.

Punctuation inside a token stays, because that is what makes an address or a
path recognisable to the token check beside it.

`tokensOf` is the same flatten, keeping the raw word beside each flat one. So a
door quotes a run in the writer's own spelling, and names the line it opens
on. `wordsOf` reads the flat half of it, and one flatten serves every door.

## What a secret looks like

One word is enough to leak, and a run of six words reaches past it. A token
counts as an identifier where it carries a separator inside it:

| the mark | an example |
|---|---|
| a slash or a backslash | `/home/somebody/secrets` |
| an at sign | `somebody@example.com` |
| a dot between letters | `example.com` |
| twelve characters with no separator at all | a key, a hash, a password |

A token shorter than eight characters passes, because a short word collides by
chance and a check refusing honest writing is a check nobody keeps.

## A bare name passes

A person's name is an ordinary word of ordinary length carrying no separator,
and nothing tells it from any other word. Lowering the opaque threshold far
enough to catch one flags every long word in the language.

So a name travels where an author writes one, and the author stands alone
against that. `test/level0/private.test.js` says so in a case named for it, and
the judged question below is what reaches the rest.

# The door reads the notes

The write door reads every note under `.se/notes` at each tracked Write and
Edit, and weighs the text the write would land:

1. Refuse a shared identifier, naming the token and the note.
2. Refuse a shared run of six words or more, quoting the run.
3. Pass a write reaching neither.

The token answers first, because one word is the smaller ask of an author. A
write under `.se` stands outside the check, and so does a draft.

## What the refusal says

The refusal names the run or the token, and names the note holding it. Then it
says the road: say what the thing is, in words written for a reader outside
this box.

A note is a dump and carries anything private. The rewrite is what makes a
line safe to commit, and a tracked line stands as long as the tree does.

# The second door

A shell reaches every file a Write reaches, so `lib/bash.js` holds the second
door. `addsIn` reads a command and answers every path under `.se` a `git add`
names, with `-f` or without.

`PrivateStaysHome` is the finding. One door into git means one place the
checks stand, and a `git add -f` reaching round them reaches round the lot.

# The delta a commit carries

A commit is the last door out of this box, so it reads what it adds and stops
there. `git diff --cached --unified=0` names each file and numbers each line
it adds. So a refusal points at the line the person or the session sees.

| the delta carries | the reader does |
|---|---|
| an added line | reads it, under the file the hunk names |
| a removed line | passes it, so a leak leaves this tree |
| a binary file | passes it, because the shapes read text |
| a file under `.se` or `.git` | passes it, because git ignores both |
| a file the delta deletes whole | passes it, because `/dev/null` names no file |

A removed line passing is the load-bearing half: taking a leak out of the tree
is the one commit that lands always. `addedIn` in `lib/private.js` is the
reader, and the three checks below read the lines it answers.

## The three checks

Each check reads the added lines alone, and answers a row naming the file, the
line, the rule and what leaks.

| rule | reads |
|---|---|
| `ShapeStaysHome` | an email address, a phone number, a date in prose, a home path under a user outside `NOBODY` |
| `BoxNameStaysHome` | the user name, the home folder, and the git name and address this box answers |
| `NoteTextStaysHome` | every file under `.se/notes`, against the added lines |

`NOBODY` is the one allow list: the nobody users, and the agent names a cloud
box runs under. [[spec/design_output/private#the-box-names-the-owner]] says
what stands on it. So a cloud box writes under `/home/user` and a fixture
writes `/Users/one`, and a real handle refuses. An address at a reserved
documentation domain passes the same way, so `duck@example.com` in a fixture
stands.

A date reads as a shape in prose alone, under `.md`, `.markdown` and `.txt`. A
timestamp in a fixture or a log line carries a build, and a date in a tracked
note carries when somebody looks.

`BoxNameStaysHome` reads the box at commit time, the way `NothingPrivateTravels`
reads it at lint time. `namesAPerson` decides for both which of the four names
count. It matches a whole word, and the case the box answers, so a git name of
`Duck` holds the word `Duck` home and lets `.duckdb` pass. So the same tree
commits clean on a cloud box and names the owner on the owner's desk, which is
where the leak starts.

## Two doors, one check

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
the exit code git reads. It reads the box through `boxOf`, the way `lint` does.

`./RUNME.sh` points `core.hooksPath` at `.githooks` once, the way it links the
editor, and `doctor` names the path it finds. `RUNME.ps1` hands its arguments
to `RUNME.sh`, so one installer wires every box.

## The escape

`--no-verify` steps past a git hook by design, and `-n` is the same flag.

| the box | the door |
|---|---|
| a cloud box | refuses the command, because no person stands behind it |
| a desk box | passes it, and writes a `warn` line naming it |

A person owns their own escape, and the log carries what they take.

## A fixture carries no shape

The check refuses its own proof. A test of the shapes wants an address in it,
and a tracked test file carrying an address meets the door like any other file.

So each test assembles the shape out of parts at runtime:

    const ADDRESS = ["duck", "quacks.org"].join("@");

The tracked line carries two words and a join, and the case carries the whole
shape. So the door reads the delta clean. The contract tests over the lint rule
and the Vale shapes assemble theirs the same way. So the door reads its own
proof clean, at every door.

This is the second limit standing beside v3's bare name. The door reads the text
a line holds, so a shape a program builds at runtime passes. A leak lands that
way only where somebody writes the join on purpose.

## How a case drives it

Every rule here reads strings, so every case hands one in.

- `test/level0/private.test.js` drives the two functions, the reader and the three checks over strings and a fixture diff.
- `test/level0/precommit.test.js` drives the hook script over a fake disk and a fake git.
- `test/level0/hooks.test.js` drives the write door over a fake note, and the Bash door over a fake engine answering a staged diff.
- `test/level0/bash.test.js` drives the escape and the second door over the command line alone.

## What it costs

Every commit pays this check, so the cost belongs beside the rule. The reader
reads the delta once. The run check weighs the words of one file against the
words of each note. That part alone grows with the size of both.

`.se/notes` stands empty today, so the run check answers on an empty list and
the whole cost is the delta walk. `node --test test/level0/private.test.js`
answers in milliseconds, and ten notes of five thousand words over a delta of
a hundred files cost twelve seconds. Two roads out stand open: cap what the
run check reads, or index the note words once per commit.

# The shapes

`spec/config/styles/VoiceVale/Private.yml` holds the mechanical shapes over
prose, as one script rule:

| the shape | what it reads |
|---|---|
| an address | a local part, an at sign and a domain |
| a phone number | an international form, or three groups a separator apart |
| a date | the ISO form, or a month's name beside a day |
| a home path | `/home`, `/Users`, or a drive letter over `Users` |

The names on `NOBODY` pass, the same list the commit door reads, and a
contract test holds the rule's list to it. A cloud box writes paths under
`/home/user`, a runner under `/home/runner`, and a fixture writes `/Users/one`.

The rule reads prose alone. A fence, a four-space indent and an inline code
span each open an example. An example says what a shape looks like, so the
timestamped file name in [[spec/design_output/log]] stands where it stands.

RE2 carries no negative lookahead, so a script holds this rule and a token list
holds none of it. The script reads one line at a time, which is what puts the
finding on the line carrying it.

# The box names the owner

`NothingPrivateTravels` in `lib/tree.js` reads the box at lint time, the way
`SurveyFindsNode` reads it, and walks every tracked text file for what it
finds:

| what it reads | where it comes from |
|---|---|
| the user this box runs as | `USER`, `USERNAME` or `LOGNAME` |
| the home folder on this box | `HOME` or `USERPROFILE` |
| the git name on this box | `git config user.name` |
| the git address on this box | `git config user.email` |

`boxOf` in `lib/private.js` reads those four, and `./RUNME.sh lint` hands them
to the tree. So the same tree lints clean on a cloud box and names the owner on
the owner's desk, which is where the leak starts.

A name matches on a word boundary, so a two-letter handle stands out of the
middle of an ordinary word. `NOBODY` in `private.js` holds the names carrying
no person: the nobody users, and the agent names a cloud box runs under.

# The judged half

`spec/config/styles/VoiceJudged/Role.yml` asks the judge one question per span,
on the tracked notes alone: does this text name a role, or one person?

| label | what the rule does |
|---|---|
| `role` | passes |
| `person` | refuses |

The roles this tree uses are the owner, the agent, the reader, the reviewer and
the maintainer. [[spec/guidance/voice]] says so, so an author reads the answer
before the refusal.

The rule reads `*.md` at the root and every note under `spec`, and it ignores
`.se`. A raw note costs no model call, because the two checks at the door
already stand between it and what git carries.
