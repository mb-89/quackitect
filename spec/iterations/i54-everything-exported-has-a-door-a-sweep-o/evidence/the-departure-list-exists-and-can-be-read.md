---
form: the-departure-list-exists-and-can-be-read
by: agent
signed_off: 2026-08-26T13:56:42.616Z
authors: agent
files: null
---

# Evidence form / the-departure-list-exists-and-can-be-read

## current_situation

The departure list stands at `deliverable/machines/doors.md`, with its shape, its rules and one section for the one door.

### The shape

Path, then any dash, then the reason. One section per door, and a bullet outside a section belongs to no door.

That last rule is not decoration. Without it two doors read each other's departures, and a module allowed past one would be silently allowed past all of them.

### Two departures are declared, not eighty-two

82 modules reach the disk conversation today. Two are declared below the marker.

- `deliverable/engine/doors.ts` is the door itself. A rule that decides who may read and write has to read the tree to answer.
- `deliverable/engine/run.ts` was measured at 0 of 10 sites a door would improve. Every write is an append to a log it owns, jailed under `.se/jobs` by three module-local helpers.

The other 80 are reported by the sweep. That is the true state rather than a list padded with one sentence repeated eighty times, and a padded list is precisely what `raid-asm-a-demanded-reason-is-a-considered-reason` warns about.

### The file carries its own limits

The door's section states what the rule cannot see: a module reaching disk through a spawned process, which 38 of 178 modules can do.

And the file says plainly that it has no off-switch, naming the three products that ship one.

## built

`deliverable/machines/doors.md`, 2597 bytes.

It carries what the file is for, what a departure means, how to add one, what it cannot do, and one section for `keeping-a-record-on-disk` with two declared departures below the marker.

The machine commits.

## follow_up

- The two refusals come next. They read this file through the rule module and hold no parser of their own.
- The 80 undeclared reachers are the sweep's findings on day one. Moving them is the ratchet gap, registered as `raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets` and explicitly not answered by folding a frozen set into this file.
- The other three conversations have no section here. Adding one is a data change in the rule table plus a section here, and neither is in this record's scope.

## anything_else

Building the rule module found two defects in it, both caught by running it rather than by reading it.

The first: the mention scan read only `.ts` files, so a state naming its exit script in markdown was invisible. Three entry points read as unreached when they are invoked every boot.

The second was the interesting one. The scan counted any MENTION, so a page of guidance naming a script made it count as reached. Sharpened to require an actual `bin/<name>` invocation, and the host config files added because nothing in this tree invokes a hook.

The unreached count went 15, then 12, then 4. That is the same collapse the widget list showed when its predicate was sharpened, and it is the second time this record has watched a list shrink because the rule got better rather than because somebody wrote reasons.
