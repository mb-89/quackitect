---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-removing-the-folder-makes-the-engine-the-only-door
type: "[[raid]]"
kind: risk
statement: With no folder on disk, an engine that will not start leaves a person with no way to read the work except raw git commands.
owner: the maintainer
trigger: the first time the engine fails to start while an iteration is in flight, and at any design change that adds a second reason to open a record outside the lane
status: open
impact: Today a person can open a record's folder in any editor and read everything without the machine mediating. After this change the folder exists only while a walk is running, so a broken engine means the work is reachable only by somebody who knows git plumbing.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - vp-the-engine
---

## Where it comes from

THE SECOND NAMED CONFLICT IN THIS ITERATION'S GOAL SYSTEM, written at
draft-vision: a disposable workspace against staying legible to a person.

It is logged rather than resolved away, because the resolution is partial and
the cost is real.

## The resolution taken, and what it does not cover

THE BRANCH IS THE RECORD. `git show it/<id>:<path>` reads any file with no
engine at all, so nothing becomes unreadable. The property survives.

WHAT IT COSTS is that a person now needs one command instead of a file
browser, and needs to know the branch name. That is a genuine loss and it is
accepted rather than denied.

WHAT IT DOES NOT COVER is somebody who does not know git. The contract already
says the lane is the only door, so this risk is the standing tension between
that rule and the owner's law that a person must be able to do this.

## What would make it bite

An engine that will not start while work is in flight. That is not
hypothetical here: the packager has already made the lane unresponsive
(note-86eeb72578bc), and the shim's proxy has no timeout, so a wedged engine
holds the port and every new client queues behind it.

## The mitigation, if the trigger fires

Not a design change. A documented one-line recipe for reading a record from
its branch, in the entry documents, in plain language and with no method
jargon.
