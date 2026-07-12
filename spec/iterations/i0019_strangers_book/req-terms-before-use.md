---
id: req-terms-before-use
type: requirement
statement: When the rendered book uses a load-bearing term ahead of its definition, quack lint shall flag the use as a finding naming the term and both locations - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When the rendered book's reading order uses a glossary term before the section that defines it, quack lint shall flag the term with the using and the defining location.
2. The lint shall treat the glossary as the set of load-bearing terms, so the check follows the glossary's growth without a second term list.
3. The lint shall report these findings in the advisory class, so a term-order finding informs the author and never blocks a build.

## Rationale (not load-bearing)
The red-team's finding #1 (owner idea, NOTE-20260711-185516): the stranger met gate, adjudicate,
ledger, SUSPECT before any definition existed. Advisory by design - reading order is judgment;
the lint points, the author decides. Statement 2 keeps DRY: one glossary, no shadow list.
