---
id: req-spec-content-lint
ears: exempt - historical pre-EARS statement, retire-or-retrofit recorded (adr-grandfathers-historical)
type: requirement
statement: quack lint shall flag spec-content violations - dangling anchors, orphans, external links, unfilled slots, bad ids, and meta-term leaks - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. If a note refers to a heading anchor that does not exist, then quack lint shall flag the dangling referent. *(was req-anchor-refers)*
2. If a content node is reachable from no manifest and carries no exclusion record, then quack lint shall flag it. *(was req-book-orphans)*
3. If an external link appears in spec content outside a reference note, then quack lint shall flag it as a violation. *(was req-external-links)*
4. If an unfilled slot placeholder remains in spec content, then quack lint shall flag it as a violation. *(was req-residue-lint)*
5. The lint shall refuse a node id containing a character outside lowercase letters, digits, and hyphens, or containing consecutive hyphens outside a connection id's separators. *(was req-id-charset)*
6. If a meta-classified glossary term appears in the content of chapters one to six, then quack lint shall flag it. *(was req-meta-quarantine)*
7. If a glossary term of the meta class appears in any chapter except guidance and the agent guide, then quack lint shall flag it. *(was req-quarantine-scope)*
