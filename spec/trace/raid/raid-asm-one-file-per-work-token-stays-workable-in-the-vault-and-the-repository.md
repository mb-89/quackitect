---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-one-file-per-work-token-stays-workable-in-the-vault-and-the-repository
type: "[[raid]]"
status: closed
kind: assumption
statement: "Every work token becomes its own file on trunk, and the design assumes the two neighbours that hold those files stay workable at the volume that produces."
owner: the maintainer
trigger: "the first record walked end to end under work tokens, and any report that opening the vault or listing the tree got slow"
probe: "PROBED 2026-08-26 for version control, still unprobed for the vault. At 20,000 work-token files every read stays under 200 ms and reading out of git objects is FASTER than reading the worktree, 114 ms against 161 ms. Writing is where it hurts: git add 26,073 ms and git commit 6,646 ms. Disc allocates 7.5x the content at 4K clusters. Folding the same bytes into one JSONL beats the files on every axis measured, including at 400 files, and packs 2.0x smaller in git once the content is realistically varied, corrected down from a 12x figure that came from identical test bodies. The vault half was NOT run. Earlier note, still true: the first half now has a number. Counted 2026-08-26: 136 evidence fields across 21 positions of one real record, four milestones in. A full major carries roughly twice that many positions, so a record is in the low hundreds of files before reading work tokens and method steps are added. The second half was NOT run: nobody opened a folder of that many files in the vault or in version control, and that is the half this entry is actually about."
probed: 2026-08-26
impact: "The cost does not land on this system. It lands on the two tools a person actually uses to read the work, and a vault that takes seconds to open is a vault nobody opens."
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-every-piece-of-work-is-one-addressable-item
  - req-every-artifact-is-readable-text
  - nbr-obsidian
  - nbr-git
---

## PROBED AND CLOSED, 2026-08-26 — the repository half is answered and the vault half was never a question

OWNER RULING: the main interface is VS Code. The vault is a compatibility
target and it opens tens of thousands of files, so 424 is not a number it
notices.

THE ENTRY NAMED TWO NEIGHBOURS AS THOUGH BOTH WERE LOAD-BEARING. Only one is,
and that one is measured.

What was written before the ruling:

### The volume, counted

| figure | value |
| --- | --- |
| work tokens if every card were walked | 424 |
| median per position | 2 |
| largest single position | 23 |
| the heaviest record on disc today | 95 files |

### The repository half

ANSWERED, by a figure already taken. 1,292 files put `git add` at 1,535 ms and
`git commit` at 151 ms. A record's work tokens are a small fraction of that, and
the heaviest record standing today holds 95 files in total.

SO THE REPOSITORY IS NOT THE CONSTRAINT at this volume, and the fold already
handles the growth case.

### The vault half

NOT MEASURED, and saying so is the honest answer rather than a blank. Nothing
here opened the vault, counted what it indexes, or timed it.

WHY IT IS PROBABLY FINE AND WHY THAT IS NOT EVIDENCE. 424 more markdown files
is small beside what the vault already holds. That is an argument, not a
measurement, and this entry is about the difference.

WHAT WOULD SETTLE IT: open the vault with the files present and time the index.
One run, and it needs the vault rather than a script.

SCRIPT: `scratchpad/spike-mint-cost-and-volume.mjs`.

## Probe

COUNT FIRST, THEN OPEN. One script over an archived record counts its
evidence fields and the documents each position demands. That sum is roughly
what the record would carry as work tokens.

MULTIPLY BY THE RECORDS A YEAR PRODUCES, then create a folder holding that
many files and open it in the vault and in version control.

IT IS THE SAME SCRIPT THE LEGIBILITY ASSUMPTION ALREADY ASKS FOR, so the two
probes share their first half and only the second half is new.

## What the volume actually is

ONE FIGURE EXISTS AND IT IS FOR A SINGLE POSITION. This round's kickoff gate
became fourteen work tokens.

A RECORD HAS MANY POSITIONS with several fields each, and nobody has
multiplied it out against a real one. That multiplication is the probe.

THE POOL IS THE OTHER END OF THE SAME COUNT. 154 items stand there today, and
those are only the work with no home.

## Why this is not the storage-shape entry

THE STORAGE ENTRY IS ABOUT MERGING. Five surveyed systems moved away from one
file per item because concurrent writes collide.

THIS ONE IS ABOUT VOLUME, and it bites even with one writer. A folder is slow
to open before any two people touch it.

## Why it is graded corrosive rather than crippling

NOTHING STOPS WORKING. The system reads what it needs and version control
handles the count. What degrades is the property the whole storage choice was
made for: a person opening the work directly.

## What falsifies it

A VAULT OR A TREE THAT A PERSON GIVES UP ON at the counts the probe produces.

## Bounded by the owner's ruling, 2026-08-26 — the measurement stands, its scenario does not

THE ARITHMETIC IS UNCHANGED. 320 to 402 work token files per record, times the
69 records on trunk, is 22,080 to 27,738.

WHAT THE RULING REMOVES IS THE MULTIPLICATION. An archived iteration leaves
trunk, a finished work token is deleted, and one iteration is open at a time.
So trunk never holds more than one record's worth.

THE CEILING IS THEREFORE 320 TO 402, against 1,821 trace nodes standing today.
This entry was read as falsified on the larger figure; on the smaller one it is
unfalsified and still unprobed.

THE SECOND HALF IS STILL OWED, and it is now a cheaper probe. Open a folder of
four hundred files in the vault and in version control, not one of twenty-eight
thousand.

THE RULING IS NOT YET BUILDABLE. It reverses a standing must requirement, and
that clash is raid-iss-the-archive-ruling-reverses-a-blessed-must-requirement.

## Probed 2026-08-26 — the version-control half is measured, the vault half is not

THE PROBE THIS ENTRY ASKED FOR WAS RUN. A throwaway repository outside the
project, filled with work-token shaped files at 400 and at 20,000, then the
same content folded into one JSONL and measured again on identical bytes.
`scratchpad/probe-many-files.mjs`.

### Reading is not the problem

At 20,000 files, every read operation stays under a fifth of a second.

- listing the folder: 10 ms
- `git status`, clean: 124 ms
- `git grep` over the worktree: 161 ms
- `git grep` over HEAD objects: 114 ms

READING OUT OF GIT IS NOT SLOWER THAN READING THE WORKTREE. At 20,000 files it
was faster, 114 ms against 161 ms. The searchability argument for keeping the
archive on disc does not survive this measurement.

### Writing is the problem

`git add` over 20,000 files took 26,073 ms. `git commit` took 6,646 ms.

THAT COST LANDS ON EVERY WRITE, not on a rare one. A system that mints work
tokens on entry pays it whenever the tree is staged.

### Disc costs 7.5 times the content

10.4 MB of work tokens allocated 78.1 MB at 4 KB clusters. The ratio is the
same at 400 files, because it is the minimum-cluster tax on small files rather
than anything about the count.

### The fold wins on every axis measured

Same bytes, one JSONL instead of many files.

| | 20,000 files | one JSONL |
| --- | --- | --- |
| `git add` | 26,073 ms | 97 ms |
| `git commit` | 6,646 ms | 50 ms |
| `git status`, dirty | 132 ms | 72 ms |
| `git grep` | 161 ms | 40 ms |
| packed into git | 5.74 MB | 2.87 MB |

THE STORAGE ROW CARRIES THE RE-PROBED FIGURES, not the first run's. The first
probe gave every token a byte-identical body, which flattered the folded file
enormously and produced 3.6 MB against 0.3 MB. Those two numbers are withdrawn.
The TIMINGS above are unaffected, because staging cost does not depend on what
the bytes say.

### Re-probed with different prose in every token, 2026-08-26

`scratchpad/probe-why-smaller.mjs`, 20,000 tokens, generated prose that differs
in every one. Raw content 15.41 MB.

| | one file each | one JSONL |
| --- | --- | --- |
| pack, the content itself | 3.42 MB | 2.84 MB |
| index, one entry per object | 0.54 MB | 0.00 MB |
| everything else in `.git` | 1.78 MB | 0.03 MB |
| TOTAL | 5.74 MB | 2.87 MB |
| objects in the pack | 20,004 | 4 |

THE HONEST RATIO IS 2.00x, not twelve. On the pack alone it is 1.20x.

WHERE THE DIFFERENCE ACTUALLY COMES FROM, largest first.

- THE TREE AND THE LOOSE OBJECTS, 1.78 MB against 0.03 MB. A tree object has
  to list all 20,000 filenames.
- THE PACK INDEX, 0.54 MB against nothing. It carries one entry per object,
  and there are 20,004 of them against 4.
- THE COMPRESSION WINDOW, worth only 0.58 MB inside git. Alone it looks much
  bigger: zlib compressing each file separately gives 8.26 MB, and compressing
  the concatenation once gives 2.73 MB, a 3.03x gap. Git recovers almost all of
  that by deltaing similar blobs against each other, which is why the pack is
  only 1.20x apart.

SO THE ANSWER TO "IS IT BECAUSE IT IS ZIPPED" IS PARTLY. Compression explains
the 3x seen outside git and only a fifth of the gap inside it. Per-object
bookkeeping explains the rest.

THE FOLD ALSO WINS AT 400. `git add` was 28 ms against 516 ms, so this is not
an effect that only appears at archive scale.

### What is still not measured

THE VAULT. Nobody has opened a folder of 20,000 files in Obsidian, and that is
the half this entry was originally about. The version-control half is answered
and the reading half is answered; the vault half is still owed.
