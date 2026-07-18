---
id: req-ifu-user-stories
type: requirement
depends_on: []
statement: The book shall render each IFU deck as a fixed arc: a problem slide, a starting-state slide, up to six step slides, a result slide, and a coverage slide.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The IFU arc (owner, 2026-07-17)

The deck follows one fixed narrative arc. Prior art confirms the shape (see rationale).

1. **Problem.** What problem do we solve.
2. **Starting state.** The idle state we start from. Defined once (see [req-ifu-base-state](req-ifu-base-state.md)).
3. **Steps.** How we get there. No more than five or six slides.
4. **Result.** The second-to-last slide. "This is how we solved it", mirroring the problem.
5. **Coverage.** The last slide. It links every use case this IFU covers. It is also the machine-readable reference home the `coverage:ifu-usecases` check reads. Concentrating the references here keeps the story slides free of reference clutter.

Each slide uses the split layout in [req-ifu-split-slide](req-ifu-split-slide.md).

## Clustering method (owner-confirmed, 2026-07-17)

The hard requirement is only that every use case appears in at least one IFU (the `coverage:ifu-usecases` check, from i0026). The concrete grouping stays a later design detail.

The METHOD is decided: group use cases by USER JOURNEY. One IFU tells one coherent story, so its use cases are exactly the ones a user exercises in that single workflow. Coverage falls out of telling every journey, not listing every id. This replaces the ID-list "coverage theater".

The mechanical check still needs machine-findable references. Rather than clutter every slide, the references live only on the coverage slide (item 5). So the check stays mechanical and the story slides stay clean.

## Rationale (not load-bearing)
The arc is Before-After-Bridge demo storytelling: the problem is the "before", the result is the "after", the steps are the "bridge". A demo is a setup, a conflict, and a resolution. Sources in the M2 evidence doc.
