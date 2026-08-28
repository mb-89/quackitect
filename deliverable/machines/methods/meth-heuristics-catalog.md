---
kind: method
catalog: heuristics
catalog_sections: THE CATALOG
statement: "The heuristics catalog: hold every old engineering rule against every cluster, and record where each one suggested nothing."
---

# Heuristics catalog — the old rules, applied on purpose

**What.** A short list of engineering heuristics, each held against the
problem to see what it suggests. Deduction dressed as creativity — and none
the worse for it.

**When.** Structuring and partitioning questions: architecture, module cuts,
process shapes. M4 `find_by_heuristic` runs it.

## THE CATALOG

Hold each against every cluster.

- Group what changes together; separate what changes apart.
- Make the common case cheap; make the rare case possible.
- One source of truth; everything else derives.
- Push decisions to the last responsible moment.
- Make the illegal unrepresentable, not merely checked.
- Small interfaces between big parts beat the reverse.
- If it must be remembered, it must be recorded.
- The default should be the safe thing.

## RUN IT WHOLE, AND WRITE THE MISSES #work

Eight rules times however many clusters is a small number, and the pass is
mechanical. A partial sweep is a choice nobody made on purpose.

A rule that does not bite gets a row saying `nothing`. A blank row and a
question nobody asked look identical afterwards.

## WHY THIS IS A FINDER AND NOT A REVIEW

[[meth-frame-tactics]] names its References group, and says that group FEEDS
ENUMERATION. The group is:

- heuristics
- patterns
- catalogs
- standards
- benchmarking
- reference architectures
- TRIZ

Every other item on that list has a finder.

The SyA corpus opens its "using available knowledge" list with heuristics,
quoting one: "group strongly-related elements, separate unrelated". That rule
alone changes a partition, which is what M4 is deciding.

## THE CATALOG IS SHORT ON PURPOSE, AND IT GROWS BY EVIDENCE #work

A rule joins this list when it has bitten on a real decision here, not
because it is famous. A catalogue nobody can run whole in minutes stops being
run at all.

## Output #work

One [[option]] node per heuristic that bit, its `source` being the rule
itself — so an option from this finder traces to one line above.

## Sources

- Rechtin's architecting heuristics, as the tradition this compresses.
- The SyA corpus at @ai/sya_kb chapter 01, "using available knowledge".
- [[meth-frame-tactics]], R group: References feed enumeration.
- AutoTRIZ (2025) names Design Heuristics as one of three knowledge-based
  ideation methods worth automating, beside SCAMPER and Design-by-Analogy
  ([[ref-autotriz]]).
