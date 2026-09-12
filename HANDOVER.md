---
kind: [[handover]]
status: held
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
| the allow list | `lib/private.js` | the four nobody users pass, and a fifth name refuses |
| the added lines alone | `lib/private.js` | the fixture diff removes the same line it adds, and the reader answers one |
| the escape | `lib/bash.js` | `test/level0/bash.test.js`, every form `-n` takes |
| the note | `spec/design_output/private.md` | `./RUNME.sh lint` passes, and every marker in the new code points at a chapter |

The suite runs 582, up 25. `./RUNME.sh lint` passes over everything this branch
writes. This commit itself lands through `.githooks/pre-commit`, so the door
holds the hand that builds it.

# What waits

| the thing | who | what it costs |
|---|---|---|
| the `turn.step` hook migrates to an async generator | the owner, with a probe | `./RUNME.sh check` stands red, so `work done` refuses and this note stands at `held` |
| the paragraph schema finds its folder | the owner | two contract cases stand red, and `the-answer-gate-bites` carries the fix already |
| the write door and the sweep | `the-private-half-stays-home` | `lib/private.js` holds the three checks, and that branch calls them where prose lands |
| a note under `.se/notes` | a later level | the run check answers on an empty list today |

`./RUNME.sh check` answers red on the first two rows, and both stand on
`origin/main` ahead of the first line this branch writes.
`the-answer-gate-bites` measures the same two, names the owner on both, and
holds for the same reason. So this branch leaves them where that one leaves
them, and adds no second copy of either fix.

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
