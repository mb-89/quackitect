---
id: cand-read-lister
type: candidate
axis: read-back-surface
ratings:
  agent-readability: 1
  separation-of-concerns: 1
  buildability: 0.9
statement: A pure lister subcommand - quack comments <file> prints every comment (anchor, thread, marks, status) deterministically; triage stays with the agent and owner.
class: review
killer: false
---
Pro: extraction stays mechanical and byte-stable; triage stays opinionated where it belongs (owner stance: comments are an unreliable source). Con: one more manual step from listing to notes.
