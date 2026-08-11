---
id: uc-quality-compatibility
type: "[[use-case]]"
statement: Share the tree with the tools already on it
actor: stk-engineer-driving-agents
kind: quality-area
trigger: Another tool opens the same folder, or another harness drives the same lane.
precondition: The project is a plain folder of files on disk.
guarantee: The other tool keeps working, and the lane serves the same rules whichever harness calls it.
refines:
  - sty-what-a-quality-is
priority: should
---

## What this characteristic covers

COMPATIBILITY, from ISO/IEC 25010:2023. The degree to which a system can
exchange information with other systems, or perform its functions while
sharing the same environment.

Its sub-characteristics, so nobody has to open the standard to use this:

- CO-EXISTENCE. It performs its functions efficiently while sharing an
  environment and resources with other products, without harming them.
- INTEROPERABILITY. It can exchange information with other products and use
  the information that has been exchanged.

## Main scenario

1. The person opens the project folder in an editor that knows nothing about this system.
2. Every artifact is a plain file it can read — markdown, front matter, JSON.
3. A note-taking tool indexes the same folder and follows the links between nodes.
4. A different agent harness drives the same lane, and the lane arms with the same rules.
5. Both keep working, neither having been told about the other.

## Extensions

- 2a. An artifact is a binary an editor cannot read: the no-binary rule is broken, and the artifact is the defect.
- 3a. The other tool writes into the tree: its writes are ordinary file changes, and the machine reads them on the next pull rather than holding a stale copy.
- 4a. A harness cannot arm the cage: it is reported unsupported rather than served unguarded.
