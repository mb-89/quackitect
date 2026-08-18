---
steps:
  - id: rescue-at-risk
    statement: every file that exists only inside a worktree is copied onto trunk, and the count is re-measured at the moment it runs
    depends_on: []
    realization: code
  - id: level-records
    statement: every open record's folder stands on trunk, so no path has to reach into .worktrees to find one
    depends_on:
      - rescue-at-risk
    realization: code
  - id: status-is-the-open-flag
    statement: the six sites that ask the filesystem whether a record is open read the record's own status instead
    depends_on:
      - level-records
    realization: code
  - id: selection-state
    statement: a pull carrying no choice enters no iteration — the container answers with the offer and binds nothing
    depends_on: []
    realization: code
  - id: collapse-record-read
    statement: a record is read from one path, and the git retrieval half of readItRecord goes
    depends_on:
      - status-is-the-open-flag
    realization: code
  - id: close-leaves-the-folder
    statement: a close merges and stops there — the record's folder stays in the working tree and no worktree is removed
    depends_on:
      - collapse-record-read
    realization: code
  - id: delete-the-seam
    statement: "no call selects between trees: Roots.bound, machineRootOf, fansOut, methodFilesIn, setMethodMirror and fanOutMethod are gone"
    depends_on:
      - collapse-record-read
    realization: code
  - id: cut-worktrees-from-seed
    statement: a seed mints a record folder and nothing else, and minted_in takes a source that does not name a branch
    depends_on:
      - close-leaves-the-folder
      - delete-the-seam
    realization: code
  - id: remove-artefacts
    statement: the it/* branches and the claims branch go, main and v2 stay, and the count is re-measured at the moment it runs
    depends_on:
      - cut-worktrees-from-seed
    realization: code
---

# The build plan

Nine chunks. One tree at the end of them, and no code anywhere that picks
between trees.

## RISK FIRST, which decides what goes at the front and what goes at the back

THE ONLY IRREVERSIBLE ACT IN THIS ITERATION IS A DELETION. Everything else can
be written again from the sources; a file that existed only inside a worktree
and was removed with it cannot.

So the order is bracketed by that one risk.

- `rescue-at-risk` runs FIRST, before anything else touches a tree.
- `remove-artefacts` runs LAST, after every other chunk has proved itself.

BOTH RE-MEASURE THEIR COUNT AT THE MOMENT THEY RUN, rather than trusting a
number taken earlier in the walk. The count moved twice during specification
already, and a rescue working from a stale list is a rescue that misses files.

[[raid-risk-the-deletion-takes-work-the-rescue-step-missed]] is the entry this
bracketing answers.

## PARALLEL FLOW, and the honest answer is that there is almost none

Eight of the nine chunks form ONE DEEP CHAIN. The reason is real rather than
accidental: each chunk removes the thing the next one would otherwise trip on.

- The open flag cannot stop reading directories until the records are on trunk.
- The record read cannot collapse to one path until the flag stops deciding
  which tree to look in.
- The seam cannot go until nothing left is asking it which tree to use.
- The seed cannot stop making worktrees until nothing left reads one.
- The branches cannot go until the seed stops making them.

ONE CHUNK IS GENUINELY INDEPENDENT: `selection-state`. It touches the
container's own wiring and nothing about trees, so it can be built at any point
and is placed early to get a real fix in front of a real defect sooner.

FORCING WIDTH ONTO A CHAIN ONLY ADDS SEAMS. Two builders on this plan would
spend their time waiting on each other and merging.

## What each chunk turns green

Three reds were authored at observe-red and watched failing, run
`test-msvh8sho-12`, 0 of 3 passing.

- `selection-state` turns green: a bare pull at the container enters no
  iteration. It fails today by entering `iterations/i1/onboard-retro`.
- `status-is-the-open-flag` turns green: a record stamped shipped leaves the
  container. It fails today with both records still on the offer.
- `close-leaves-the-folder` turns green: a closed record's folder stays in the
  working tree. It fails today because `mergeAndRetire` runs `git rm -r` on it.

THE FOURTH DEMAND HAS NO TEST AND CANNOT HAVE ONE.
`req-every-record-path-resolves-in-one-tree` is verified by inspection, because
it asks for the ABSENCE of a chooser. `delete-the-seam` is the chunk that
answers it, and the proof is a reading that finds none of the six named
functions still standing.

FIVE CHUNKS TURN NO AUTHORED RED GREEN, and each says why above:
`rescue-at-risk` and `remove-artefacts` are the risk bracket,
`level-records` and `collapse-record-read` are what the flag and the read need
under them, and `cut-worktrees-from-seed` is what stops the whole mechanism
coming back on the next seed.

## The tests move with the chunk that breaks them

NO SEPARATE TEST-REWRITING CHUNK, on purpose. A chunk that leaves the suite red
for a later chunk to fix cannot be judged on its own, and the plan would then
have one step whose whole job is repairing the other eight.

So each chunk rewrites the cases its own change invalidates, and each chunk
ends with the suite green.

## What is deliberately not here

NO MANIFEST OF CLOSED RECORD TO COMMIT HASH. It was designed in full earlier
the same day and is not needed at all once the archive stays on disk. That is
recorded rather than dropped silently, because the design existed and somebody
will otherwise wonder where it went.

NO HISTORY MIGRATION. The owner ruled the closed iterations and every
expedition are dropped rather than carried across: "We can switch the system
and lose the history. I'm actually fine with that." The twenty-six seeded stubs
are kept.
