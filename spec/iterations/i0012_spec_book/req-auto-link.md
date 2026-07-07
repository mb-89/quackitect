---
id: req-auto-link
type: requirement
depends_on: []
statement: When the book renders prose, the engine shall link plain-text occurrences of a note name or alias to that note - authored links win, the longest name wins, code and headings stay untouched - and shall refuse an alias claimed by two notes.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
Terms, notation, references, and fundamentals all carry Obsidian-native aliases; the auto-link pass is deterministic at emit. An alias collision is a hard error (fail loudly), never a guess. This upgrades the i12 plain-text-term advisory into linking.
