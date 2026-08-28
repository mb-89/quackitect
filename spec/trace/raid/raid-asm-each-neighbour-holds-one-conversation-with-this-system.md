---
id: raid-asm-each-neighbour-holds-one-conversation-with-this-system
type: "[[raid]]"
kind: issue
statement: The seven neighbours do not map one-to-one onto doors. Two of them share one conversation and two hold none, so a door per neighbour would carve four doors wrongly.
owner: the maintainer
trigger: any design state that proposes a door set drawn from the neighbour list
status: open
impact: A door named after a neighbour is a door named after a technology, which is the exact failure the record set out to avoid. Carving seven would have split one conversation across two doors and invented two doors for parties this system never speaks to.
breaks_how_badly: crippling
how_likely: expected
probe: false. Walked all seven neighbours and wrote what this system says to each and what it says back. Two pairs collapsed and two neighbours hold no conversation at all. Four doors result, one primary and three secondary. The entry is now an issue and carries the table.
probed: 2026-08-26
source_refs:
  - req-a-door-is-named-for-the-conversation-it-governs
  - fn-govern-a-conversation-under-a-stated-rule
weighs_with: none
weighs_against: none
place: backlog
---

## It was written as an assumption and the check falsified it

The entry opened as an assumption on this same date. The probe ran in the same
state, and the method's rule applies: a falsified assumption becomes an issue,
because it has already happened. The id is kept.

Nothing falls with it. The two things that named it — the door-naming
requirement and the root function — are strengthened rather than broken. Both
say the unit is a conversation, and this walk is what shows that a conversation
is not the same object as a neighbour.

## Probe

The check was to walk the seven neighbours drawn at draw-context and write, for
each, one sentence naming what this system says to it and what it says back.
Two neighbours whose sentences read the same share one door. A neighbour with
no sentence holds no door.

## What the walk found

Seven neighbours produced four conversations, one party that speaks to us
through the tree rather than through a call, and one that is a condition rather
than a party.

| neighbour | the conversation | side |
| --- | --- | --- |
| toolchain | store and retrieve bytes at an address | secondary |
| driven-project | store and retrieve bytes at an address | secondary |
| git | record and retrieve versions of the tree | secondary |
| web | ask the outside world a question | secondary |
| agent-harness | serve one lane call | primary |
| obsidian | none — it changes the tree without speaking | neither |
| cloud-host | none — it is a condition, not a party | neither |

### The two that collapsed

The toolchain and the driven project hold the SAME conversation. Both are
addressed with a path and answer with bytes. What differs is the root the path
resolves under, and a root is an argument rather than a conversation.

That is the sharpest finding of the walk, because those two look like obviously
different neighbours. One is a runtime API and the other is somebody else's
repository. Carving by technology would have given them two doors.

### The two that hold none

OBSIDIAN never speaks to this system. A person edits a corpus file and the tree
is different afterwards. There is no call to govern, which is precisely why the
sweep exists beside the write-time refusal, and why the sweep is not a
convenience.

CLOUD-HOST is an environment. It hands over a container and later reclaims it.
Nothing is said in either direction, so there is nothing for a door to hold.

### Git is genuinely its own

Git was the close call. It writes into the same tree as the byte door, so a
technology-shaped reading would fold it in.

It stays separate because its vocabulary is its own — commits, refs and
branches rather than paths and bytes — and because it fails differently. A byte
write fails with a missing file. A git call fails with a conflict, which is a
statement about two histories and has no counterpart on the other side.

## Four doors, and the number is not a coincidence

Cockburn's hexagonal architecture paper says of port count: "My selection tends
to favor a small number, two, three or four ports." Four is the top of that
range.

The walk was not aimed at that number. It asked what each neighbour says, and
the count fell out. Two independent routes reaching the same small number is
the reason this is recorded rather than merely noted.

## The primary and secondary split comes free

One door is PRIMARY, meaning something outside drives us through it: the agent
harness calls, and we answer. Three are SECONDARY, meaning we drive something
outside: bytes, versions and the outside world.

Cockburn's own instruction is to take the use-case context drawing and put the
primary ports on the left of the hexagon and the secondary ports on the right.
That drawing is `draw-context.md`, and this table is its left and right sides.
