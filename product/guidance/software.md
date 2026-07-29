---
id: software
statement: How to write code and record work. The universal rules; the project's own rulings live in method/engineering.md.
---

# software — how you write it

These rules bind every artifact you build.

How you TALK about it is voice.md. How you build an INTERFACE is ux.md.

This document carries what binds every piece of work. The project's own
engineering rulings live in `product/guidance/method/engineering.md`. Read
that one when you touch what it covers.

## Do not repeat (DRY)

- Single source of truth. Each fact lives in one place. Everything else points to it.
- Markdown is the truth. Anything whose truth lives in markdown keeps it Obsidian-compatible and human-editable IN THE REAL WORLD — a million-line file is not editable. Generated surfaces derive from the markdown, never the reverse. Log files are the one exception.
- Machines are drawn. A state machine's truth is its Obsidian canvas, and a person edits it in Obsidian, in the real world (owner law, 2026-07-28). The engine accepts what a person naturally draws. A mechanism that depends on metadata Obsidian does not surface to its editor is a defect — rework the mechanism, never the person.
- The truth is read LIVE (owner ruling, 2026-07-29). A running system holding a stale copy of a file it calls the single truth is enforcing a lie. Where re-reading is too expensive, cache it against the CONTENT of the files it was built from — never against size and modification time, which a same-length edit walks straight past.
- Do not repeat prose, data, or code. Not across files. Not across panels. Not within one screen.
- If two places show the same thing, delete one. A detail view should not echo what its parent already shows.
- A field that restates another field is NOISE. A statement that repeats the id, a title that repeats the name, a label that echoes the filename — strike it. Empty is better than an echo; a field is filled only when it ADDS something.
- Repeat only when strongly advised. Then say why.

## Comments and provenance

- Write comments the way people write them: only where a reader would be surprised.
- A comment states a constraint the artifact cannot show itself. Nothing else.
- Never comment that a rule was followed, who ruled it, or when. No dates. No step numbers. No law citations at application sites.
- The why lives ONCE, in its designated home: an ADR, a `decided_via`, an evidence doc, a note, the ledger. Everywhere else, the artifact just IS the consequence.
- A deliberate choice that must survive future edits gets a TEST or a LINT, not a comment. A comment is the weakest guard.

## Dated guidance

This applies to every citation, and to your own instincts.

- Do not ask how OLD a piece of guidance is. Ask which resource it was RATIONING.
- Rations human LABOUR: suspect it. That cost collapsed once a machine started doing the work.
- Rations human JUDGEMENT or ATTENTION: it still holds. There is still one owner, and they still have to look at the diff.
- Most guidance predates AI and was written for human teams. Split it along that seam instead of quoting or discarding it whole.
- This binds the assistant's own instincts too. The training assumes writing the code is the expensive part. Where a recommendation rests on that assumption, say so rather than asserting it.

## Sizing and records

- Size work by its CONTENT, never by an agent's time estimate. Those estimates overshoot wildly and have done so repeatedly — a day claimed, an hour spent. Do not parrot an inherited size claim either.
- Never say how long something will take unless you have a measurement. "Roughly a day" from feel is not an estimate; it is a guess wearing one's clothes.
- Size the vehicle before choosing it. An expedition and an iteration are each worth ROUGHLY A DAY of agent work. Anything smaller goes INSIDE one.
- Never spam the archives with many small records. Bundle related small work into ONE expedition or iteration. An archive reader does not care about ten-per-day granularity.
- A single small fix never earns its own record. It is a commit inside an expedition that is already open, or inside one opened to hold the day's work.
- Commits stay fine-grained. Records do not. The two answer different questions.
