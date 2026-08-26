---
id: i54-everything-exported-has-a-door-a-sweep-o
status: open
started: 2026-08-26T10:40:37.828Z
opened: 2026-08-20T19:35:31.935Z
goal: "Everything exported has a door: a sweep over every entry point replaces the hand-written list of two, and the working code nobody can reach gets a surface."
vision: "THE PROBLEM. The guard that checks entry points can be got at walks a hand-written list holding two of them. Everything else exported goes unchecked.\n\nWHAT THAT ALREADY HID. Two working pieces of code sit behind no door at all. One reports which of three conditions a given folder is in. The other lists what a built system has altered by itself since it was made. Tests exercise both, so they work. No surface exposes either, so nobody can ask them anything.\n\nWHAT DONE LOOKS LIKE.\n\n- The guard sweeps every exported entry point rather than a list somebody maintains by hand.\n- Anything exported and reachable from no surface is named, and the answer is either a door or a deletion.\n- The two found so far get their door, so the capability the tests prove is a capability somebody can use.\n\nWHY THESE TWO ARE ONE PIECE. The second is what the first failed to catch. Building the sweep without giving the found code a door leaves the report true and useless; giving these two a door without the sweep fixes the instances and not the hole.\n\nWHY IT SUITS AN UNATTENDED RUN. The sweep is mechanical: the export list is in the source, and the surfaces are enumerable. Only the door design for the two found pieces needs judgment, and that is small."
inputs:
  - "wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-"
  - "wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep"
depends_on: []
---

# i54-everything-exported-has-a-door-a-sweep-o

## Goal

Everything exported has a door: a sweep over every entry point replaces the hand-written list of two, and the working code nobody can reach gets a surface.

## Rough vision

THE PROBLEM. The guard that checks entry points can be got at walks a hand-written list holding two of them. Everything else exported goes unchecked.

WHAT THAT ALREADY HID. Two working pieces of code sit behind no door at all. One reports which of three conditions a given folder is in. The other lists what a built system has altered by itself since it was made. Tests exercise both, so they work. No surface exposes either, so nobody can ask them anything.

WHAT DONE LOOKS LIKE.

- The guard sweeps every exported entry point rather than a list somebody maintains by hand.
- Anything exported and reachable from no surface is named, and the answer is either a door or a deletion.
- The two found so far get their door, so the capability the tests prove is a capability somebody can use.

WHY THESE TWO ARE ONE PIECE. The second is what the first failed to catch. Building the sweep without giving the found code a door leaves the report true and useless; giving these two a door without the sweep fixes the instances and not the hole.

WHY IT SUITS AN UNATTENDED RUN. The sweep is mechanical: the export list is in the source, and the surfaces are enumerable. Only the door design for the two found pieces needs judgment, and that is small.

## Inputs

- wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-
- wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep
