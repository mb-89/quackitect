---
kind: [[handover]]
status: done
urgency: now
depends_on: [the-private-half-stays-home]
---

# Where it stands

The commit door stands, and it holds this branch's own commits. A delta reader
answers the lines a commit adds, three checks read those alone, and two doors
call the one check over the one delta.

| the piece | where | what proves it |
|---|---|---|
| the delta check | `lib/private.js` | `test/level0/private.test.js`, fourteen cases over a fixture diff |
| the commit in the Bash door | `hooks/level0.js`, `lib/bash.js` | `test/level0/hooks.test.js`, a fake engine answering a staged diff |
| the git hook | `.githooks/pre-commit`, `src/scripts/precommit.js` | `test/level0/precommit.test.js`, six cases over a fake disk and a fake git |
| the hook in place | `install.sh` | `./RUNME.sh doctor` names `.githooks/pre-commit, which git reads` |
| the allow list | `NOBODY` in `lib/private.js`, out of trunk | the nobody users and the agent names pass, and a real handle refuses |
| the added lines alone | `lib/private.js` | the fixture diff removes the same line it adds, and the reader answers one |
| the escape | `lib/bash.js` | `test/level0/bash.test.js`, every form `-n` takes |
| the note | `spec/design_output/private.md` | `./RUNME.sh lint` passes, and every marker in the new code points at a chapter |

The suite runs 582, up 25. `./RUNME.sh lint` passes over everything this branch
writes. This commit itself lands through `.githooks/pre-commit`, so the door
holds the hand that builds it.

# What waits

| the thing | who | what it costs |
|---|---|---|
| the `turn.step` hook migrates to an async generator | trunk, out of `work/the-private-half-stays-home` | the sync below takes it, and `./RUNME.sh check` stands green |
| the paragraph schema finds its folder | trunk | `isNoteSchema` tells a note schema from a model schema, and the two contract cases pass |
| the write door and the sweep | trunk | both stand, and the sync below joins the two copies of `lib/private.js` into one |
| a note under `.se/notes` | a later level | the run check answers on an empty list today |

Both reds stand on `origin/main` ahead of the first line this branch writes,
and trunk carries the fix for both now. The sync below takes it in.

# The cost of every commit

Every commit pays this check, so here is the reading. The delta carries a
hundred files and two thousand lines it adds, and `.se/notes` holds one note:

| what the box reads | median |
|---|---|
| the delta alone, no note | 10 ms |
| one note of 500 words | 129 ms |
| one note of 5000 words | 1219 ms |
| the hook end to end, over node and git | 94 ms |

The delta walk is cheap and flat. The run check weighs the words of one file
against the words of each note, and that product is the whole slope. Ten notes
of 5000 words on a delta of this size costs twelve seconds, which no commit
should pay. Two roads out, and the owner picks one:

- Cap what the run check reads, by words of note or by files of delta.
- Index the note words once per commit, and read each file against the index.

The reading comes out of `privateIn` over a generated diff, under
`.se/scripts`, which git ignores. `node --test test/level0/private.test.js`
answers the same shape in milliseconds.

# The retro

What surprises me, in the order it arrives:

1. The check refuses its own proof. A test of the shapes wants an address in it,
   and the door reads a tracked test file like any other. Every fixture here now
   assembles its shape at runtime, and
   [[spec/design_output/private#a-fixture-carries-no-shape]] says so. That is a
   second limit beside v3's bare name, and it belongs in the note.
2. `./RUNME.sh check` already stands red on two counts, out of main.
   `the-answer-gate-bites` says the same thing in its own handback, and a reader
   of both meets one message twice. So the battery comes first, ahead of any
   line of code.
3. `./RUNME.sh fix` reformats thirty-one files this branch reaches nowhere near.
   The current Biome sorts imports differently from the tree as it stands, so
   one `fix` over a folder buries a small diff. This branch reverts every file
   it owns nothing in, and formats its own four. A person wanting one clean
   sweep of the tree owns that as its own commit.
4. The brief puts the delta on stdin into `lib/private.js` itself. A module
   under `lib` reaches nothing outside, by the rule `DoorsOnly` holds, so the
   hook runs `src/scripts/precommit.js`, which builds the doors and hands the
   text in. The pipe stands where the brief puts it, one layer out.
5. The three checks stand in `lib/private.js` on this branch, and the brief reads
   as though the privacy branch writes them first. That branch stands at `todo`,
   so this one ports v3's run and token itself. The privacy branch calls the same
   functions at the write door and on the sweep, and writes no second copy.
6. A box's git name of one word collides with ordinary prose. This cloud box
   answers a name this tree's own prose carries. The match reads a whole word in
   the case the box answers, which keeps a lowercase `.claude/` in a path
   passing. So the door holds the hand writing this note, which is the point. A
   handle of one lowercase word would refuse half the tree, so read that row
   again on a desk box before you trust it.

The one dead end: the run check reporting a line. Reading the added lines one at
a time misses a run crossing two of them, and joining the file loses the line
number. One word list per file, each word carrying its line, answers both.

# The sync

Trunk comes in with two branches: `work/the-private-half-stays-home`, holding
its own port of the run and the token, and `work/the-answer-gate-bites`. Six
files conflict, and two ports of one guard become one `lib/private.js`:

| what stands | where it comes from |
|---|---|
| `wordsOf`, `isIdentifier`, `longestSharedRun`, `sharedIdentifiers`, `carriedFrom` | trunk, at the write door |
| `tokensOf`, `longestRun`, `sharedTokens` | this branch, as the primitives both doors read |
| `addedIn`, the three checks, `privateIn`, `privateNow` | this branch, at the commit door |
| `NOBODY`, `namesAPerson`, `boxOf`, `carriesTheName` | trunk, and the commit door reads them too |

So the token reads a dot between letters at both doors, `NOBODY` is the one
allow list, and `precommit.js` reads the box through trunk's `boxOf`. The two
design notes become one the same way, and the two test files stand in one
file. `bash.js` keeps `addsIn` beside `skipsTheHook`, the hook keeps both
doors, and `doctor` names the sidebar link beside the commit hook.

One fixture in `test/contract/tree.test.js` carries the owner's handle as a
whole word, so `NothingPrivateTravels` reads it red on the owner's desk. It
carries a handle nobody owns now, and assembles its home path at runtime.

The commit door refuses the first commit it reads, this sync, on six lines.
Trunk's contract fixtures for the lint rule and the Vale shapes carry a home
path and a phone number in the open. They assemble their shapes at runtime
now, the way this branch's own fixtures do. One of the six is a false reading,
`/Users/one.` at the end of a sentence, so the home path shape drops a
trailing dot.
