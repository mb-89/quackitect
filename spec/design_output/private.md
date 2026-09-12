---
kind: [[design_output]]
---

# Scope

The private half of this tree stays home. This note covers what private means
here, and the checks holding it:

1. The run and the token, at the write door.
2. The second door, over a shell command.
3. The shapes rule over prose.
4. The rule reading the box at lint time.
5. The judged question over who a note names.

# What stays home

`.se` holds the private half, and `.gitignore` holds `.se`. A raw note, a log
line and a key each stand there, and git carries none of them.

| what it is | where it lives | what reads it |
|---|---|---|
| a raw note | `.se/notes`, one file per note | the write door, and a later level |
| a handover for the next session on this box | `.se/HANDOVER.md` | a person, and the session after this one |
| the log | `.se/log` | `./RUNME.sh log` |

Private means a person's name, a handle, an address, a date in prose and a
path on a disk. Unstructured input somebody stores for later is private too. A
tracked file carries what an author writes for a reader outside this box.

A date in prose says when somebody looks, which is nothing a reader acts on.
The client version beside it already says which build. So a date in prose
goes, and the version stays.

## The brief stands outside

Git ignores `.se/HANDOVER.md`, so the two checks at the door pass it on.
`HANDOVER.md` at the root is the authored half, and it meets every rule the
tree holds.

# The run and the token

`.claude/skills/level0/lib/private.js` holds the two functions. Both read
strings alone, so a caller hands the two texts in and a test touches memory.

| what it answers | the function |
|---|---|
| the longest run of words two texts share, in order | `longestSharedRun` |
| the identifier-shaped tokens both texts carry | `sharedIdentifiers` |
| the first note a write carries something from | `carriedFrom` |
| what the door says back | `refusedPrivate` |

A run of six words shared with a note is a copy. Shorter, and an honest
rewrite of a one-line note trips it, because the two texts are about the same
thing and share their nouns. Longer, and a pasted fragment walks through.

`COPY_RUN` in `private.js` holds that six, in the open, so the first run of
real data moves it without archaeology.

## The flatten

`wordsOf` lowers the case, drops the punctuation and folds the whitespace.
Punctuation between words is a separator like any other, so a hyphen standing
in for a space carries no paste through.

Punctuation inside a token stays, because that is what makes an address or a
path recognisable to the token check beside it.

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

# The shapes

`spec/config/styles/VoiceVale/Private.yml` holds the mechanical shapes over
prose, as one script rule:

| the shape | what it reads |
|---|---|
| an address | a local part, an at sign and a domain |
| a phone number | an international form, or three groups a separator apart |
| a date | the ISO form, or a month's name beside a day |
| a home path | `/home`, `/Users`, or a drive letter over `Users` |

The nobody users pass: `user`, `root`, `one` and `somebody`. A cloud box
writes paths under `/home/user`, and a fixture writes `/Users/one`.

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
