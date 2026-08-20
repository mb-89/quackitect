---
template: item-work-token
artifact: node
id_prefix: wt-
folder: spec/trace/work-token
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an option nobody can state cleanly was never an option
  - field: ready_when
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: a parked item with no re-entry condition is never re-entered
sections:
  - Why it stands
  - When it comes back
---

# work token — one thing somebody may commit to, standing on trunk

Lives in `spec/trace/work-token/`.

Written at the retro's drain, by whoever is draining. A raw capture is a dump
in `.se/notes.jsonl` that never travels; a work token is AUTHORED from it and
lands here, where any clone that has trunk can read it.

## IT IS NOT AN [[option]], AND THE TWO WERE ONE WORD FOR ONE AFTERNOON

THE COLLISION IS WHY THIS KIND HAS THE NAME IT HAS. `option` is the
morphological chart's cell — one way of realising one function cluster, written
at M4 by the finders, carrying `cluster` and `found_by` and a `## Mechanism`.
There are ninety-five of them.

i17 built the pool into that same folder with that same prefix, and the survey
began offering all ninety-five design alternatives as work somebody could
commit to. The owner ruled it on 2026-08-18: "You can't have two notes that are
both named options and mean different things. You need to find a new name...
I used to call them work tokens, work items. Don't call them options if the
name is already taken."

WORK TOKEN IS THE OWNER'S OWN WORD for exactly this, recorded on the i17 record
on 2026-08-17: "the cloud agent can put stuff in work tokens", and then "Yes,
the work token is i17's options pool". A search of the whole tree for the
phrase returned zero hits that day, which is what makes it safe to take.

THE CONCEPT KEEPS ANDERSON'S NAME. The container is still the OPTIONS POOL —
a mature system has no backlog, it has a pool of options — and the thing IN it
is a work token. The pool is the collection; the token is the node.

## The fields

- `id` — `wt-` plus a slug of the statement, made unique. A pool of files wants
  readable names: somebody listing this directory IS reading the pool.
- `statement` — what the option is, written for a reader who never saw the
  note. AUTHORED, never pasted: a statement carrying the note's own words
  refuses SE-C-140.
- `ready_when` — what has to be true for it to come back.
- `source` — the ref of the note it was authored from. The note stays local.
- `minted_in` — the record the mint happened inside, where there was one.

## ONE DOOR

A work token is written by the mint and by nothing else. `se_note_drain` with
disposition `backlog` is the only path, and a write into this folder through
the file lane refuses.

THAT IS NOT A CONVENTION, IT IS A GUARD. The privacy line — a raw note never
enters version control — has exactly one mechanical defence, and a second
writer skips it. i17's own verification found `se_file_write` doing precisely
that before the guard existed.
