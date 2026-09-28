---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. `files/`
mirrored the whole tree, and every structured file was a projection of it by
the module owning it. Two IO modules touched the disk: `watch` brought changes
in, and `disk` wrote on request. An agent reads this note before it asks again.

## 1. What it bought

| what the ruling gave | why |
|---|---|
| one road in and one road out | every file came in through `watch`, and every write went out through `disk` |
| the one code knowing a format | a codec parsed and serialized, and its suite round-tripped every committed file |
| a write every reader saw alike | a write reached readers once it landed on disk and came back |
| no lost edit | a write named the revision it read, so a file changed since refused it |

A generic load into any name stood nowhere, because it gave a name a second
writer.

## 2. Why the kinds

The kinds named the direction. A loaded file was the truth, and a person edited
it. A saved file followed memory, and read back once at start. A dump went out
for diagnosis alone. The saved restore took the rule TwinCAT keeps for its
persistent variables. A removed name, a changed type and a new name each had
one answer.

## 3. What it gave up

A write waited for the round trip through the disk before a reader saw it. A
large file stood as a hash, and its content loaded on a read, so the first read
cost more.

## 4. What would make it wrong

A file changing faster than the watch reported it, so readers saw values the
disk had left behind. The mirror then needed a write to answer its value at
once, and the ruling bent there.
