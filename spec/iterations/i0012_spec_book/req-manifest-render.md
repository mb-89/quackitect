---
id: req-manifest-render
type: requirement
statement: The engine shall render every document from manifest nodes - transcluded units at derived depth, deck mode, auto-linked prose, emitted entry files - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The engine shall render chapters, presets, and decks from one manifest node type - each unit a node reference transcluded at its declared depth, or inline markdown, interpreted by the manifest mode. *(was req-book-manifests)*
2. The engine shall derive a node's rendering depth from its anatomy - statement, rationale, children, evidence - never from an authored tag. *(was req-book-depth)*
3. Where a base view declares render refs with a depth, the book shall render each result row through the node renderer at that depth. *(was req-render-refs)*
4. Where a manifest declares deck mode, the engine shall render one unit per slide with a present mode in the same HTML file. *(was req-deck-mode)*
5. When the book renders prose, the engine shall link plain-text occurrences of a note name or alias to that note - authored links win, the longest name wins, code and headings stay untouched - and shall refuse an alias claimed by two notes. *(was req-auto-link)*
6. The engine shall render the book's agent-guide chapter from its manifest source and embed the hand-authored repo-root AGENTS.md into that chapter verbatim - the entry file is never generated (adr-agents-hand-authored). *(was req-agents-emit)*
