---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: uc-put-a-finding-where-it-outlives-the-machine
type: "[[use-case]]"
statement: Turn a captured stray into an option that stands on trunk, stated cleanly and carrying nothing private.
actor: stk-agent
trigger: a pending note is judged worth keeping rather than done, obsolete or already built
precondition: the note is in the inbox and the judging state allows draining
guarantee: an option node stands on trunk carrying a statement, a re-entry condition and its source; the raw note is marked drained and has not moved, been copied or been deleted
refines:
  - sty-a-finding-outlives-the-box-that-found-it
priority: must
---

## Why this is its own use case

THE NEAREST NEIGHBOUR WAS CHECKED AND DOES NOT FIT.

uc-drain-the-inbox covers walking every pending note once and giving each
exactly ONE HOME. Its guarantee is that the inbox stands at zero. It is about
the SET being emptied, and it says nothing about what one disposition produces.

THIS ONE IS ABOUT ONE NOTE CROSSING A BOUNDARY. Its actor is the agent doing
the authoring, its goal is a durable artifact, and its extensions are all about
what happens when the crossing cannot be made honestly. A note dispositioned
`done` crosses nothing and is entirely uc-drain-the-inbox's business.

SO THE GOAL IS DIFFERENT, which is the Cockburn test.

## Main scenario

1. The author reads the raw note and decides it is an option rather than
   something already handled.
2. The author WRITES what the option is, in their own words, for a reader who
   has never seen the note.
3. The author names the condition that brings it back.
4. The system mints an option node on trunk carrying the statement, the
   condition and a reference to the note it came from.
5. The system marks the raw note drained, leaving it where it is.
6. Any clone of the repository can read the option; nothing reads the note.

## Extensions

- 2a. The option cannot be stated cleanly yet. The author says so, and that IS
  the statement — the pool carries it as an open question rather than as a
  guess. It is never a reason to skip the crossing or to fall back on the raw
  text.
- 2b. The author offers the note's own sentence as the statement. That is a
  move, not a rewrite, and it is the one path by which private data reaches
  trunk. The system refuses it and says which text it recognised.
- 3a. The condition is a date rather than an event. Accepted, and it is the
  weaker form: nothing wakes an option by itself today, so a person still has
  to re-read it.
- 4a. The option restates one that already stands. There is no way to say so
  today, so a second node is minted and the pool carries both. Named rather
  than solved.
- 5a. The note is edited after the mint. Nothing notices, and the option is the
  truth from the mint onward.
- 6a. The author is a PERSON rather than an agent. Every step is identical.
  The crossing is the same act whoever makes it, and a lighter path for a
  person would be the same hole as a lighter path for an agent.

## What this use case deliberately does not cover

THE OPTION BEING CHOSEN. Committing to an option is seeding it into an
iteration, and that is uc-open-an-iteration's business. The pool is upstream of
the commitment point and holds things nobody has promised.
