---
id: test-terms-before-use
type: test
statement: On a fixture book with a term used ahead of its glossary definition, the lint flags the term with both locations in the advisory class; a book with definitions ahead of every use passes; the term set follows the glossary with no second list.
class: executed
verify: selftest:terms-before-use
killer: false
---
## Rationale (not load-bearing)
Both directions on fixtures plus the DRY guard (the glossary IS the term list). Advisory class
asserted so the finding can never block a build (req-terms-before-use.3).
