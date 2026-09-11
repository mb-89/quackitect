---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The funnel note `spec/funnel/a-paragraph-has-a-schema.md` names six branches,
and this is the first. Read that note before anything else. It stands on the
branch `claude/friendly-brown-k6kohy` until the owner merges it, so take that
branch in where `work sync` leaves the note absent.

The door log under `.se/log` writes one row per refusal, with the rule, the
tool and the phrase. Nothing reads those rows. The measurement behind the note
lives as three scripts under `.se/scripts` on one box, off git. This branch
brings it into the tree as a verb.

# What waits

| the piece | where | proves it |
|---|---|---|
| `./RUNME.sh voice measure <folder>` | `src/scripts/cli.js`, and a lib beside it | a fixture folder scores a known number |
| `./RUNME.sh voice measure --transcripts <folder>` | the same | a fixture transcript yields its answers as files |
| `./RUNME.sh voice refused [days]` | the same | a fixture log ranks its rows in a known order |
| the two verbs in `RUNME.sh help` | `RUNME.sh` | the help names both |

# What measure does

`voice measure <folder>` reads every markdown file under a folder. It runs the
tree's own Vale over each one under the answer register, the way the write door
runs it. It prints one row per file and one total row:

    file            words  findings  per 1000 words  top rules
    003-answer.md     517         6            11.6  LongSentence 4, Passive 2

The per-1000 number is the score. Lower is cleaner, and the delta between two
runs is the signal. Print the rule counts over the whole folder last, in rank
order.

`--transcripts <folder>` first pulls the answers out of a folder of session
transcripts, the `.jsonl` files the client writes under its projects folder.
Keep the rows of type `assistant` that carry no `agentId` and stand on no
sidechain. Join their text blocks. Skip an answer under 25 words. Write one file
per answer as `<session>/NNN-answer.md` under `.se/measure`, then measure that
folder. The file name ends in `answer.md`, so `.vale.ini` reads it as an answer.

# What refused does

`voice refused [days]` reads every `.se/log/*.jsonl` from the last days, seven
by default. It keeps the rows at level `warn` that carry a rule. It ranks rule
by phrase, so the retro sees which rule fires most and on what:

    rule            fires   phrase
    PastTense          14   bold
    LongSentence       11   ...
    ShellWritesNothing  3   {vid}.txt

The retro reads that table and names what the door refused wrongly. So print
the phrase where the row carries one, and the tool where it carries none.

# How to build it

Reach the disk and the log through `src/doors`, and test against the fakes in
`src/doors/fake`. Keep the extraction and the ranking as pure functions that
take rows and answer rows. A test then feeds them a fixture and asserts the
order. Vale runs through the process door, the way `lib/vale.js` runs it.

Change no rule and no door on this branch. The verbs read, and later branches
report their delta through them.

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
