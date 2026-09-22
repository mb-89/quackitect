---
kind: [[guidance]]
scope: ["every session that works, parks or hands over a piece of work"]
rationale: [[spec/rationales/tickets]]
---

# Actionables

1. Work one ticket at a time, the one the pull hands you. A ticket is a note under `spec/schemas/ticket.schema.yaml`, and its file name is its id. [[spec/schemas]]
2. Pull with `./RUNME.sh ticket pull` and take no branch. The engine takes one for a cloud box, and a desk gets the free tickets. Hand a branch back with `./RUNME.sh branch done` or `./RUNME.sh branch release`. *
3. Leave `state`, `step` and `steps` to the verbs. The door refuses your edit to the three. *
4. Write the evidence of the leaf you stand on, under its chapter, and nothing under another leaf. A field under another leaf reads as that leaf's answer before its hand writes it. *
5. Write anything at any time under `Discussion`, and nowhere else on a ticket you hold no step of.
6. Mint a ticket with `./RUNME.sh mint ticket <path> --process=<name>`, so the route copies in and the ask carries its fields. [[spec/processes]]
7. Fill every field of the ask before you open a ticket. A thin ask stops at the mint.
8. Park a thought, a bug or a doubt as a private note: `./RUNME.sh ticket note <name> "<line>"`. Add `--talk` where the owner asks for a discussion, and the retro decides the rest. *
9. Keep a note under `.se/tickets` until the mint moves it. A private ticket stays off git, and one moved by hand lands on git unread. *
10. Put a thing for later on a ticket, and in no memory folder. A memory folder stands on one box, and the retro drains it into the tree. *
11. Name the group a ticket lands in under `group`, and read a group as one branch with children. [[spec/design_output/work]]
12. Run `./RUNME.sh ticket update <ticket>` after a process file changes, so the leaves ahead take the new route.
13. Mark a ticket `urgent` where a break stops work until somebody fixes it, and mark no other. A defect that waits stands unmarked, and so does every finding a retro mints. *

# Examples

| the rule | do | do not |
|---|---|---|
| 10 | a ticket carrying the thing for later | a line in a memory file on one box |
| 13 | urgent on a break that stops every hand | urgent on a finding a retro mints |
