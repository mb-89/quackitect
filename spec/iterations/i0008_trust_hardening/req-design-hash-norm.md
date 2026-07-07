---
id: req-design-hash-norm
type: requirement
statement: When the engine hashes a design region, it shall compute one hash over the whitespace-collapsed region content — the same normalization statements use — retaining comments, so that pure reformatting never changes the hash and any content edit does.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
