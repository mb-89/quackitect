---
id: rigor-shared-implementation
statement: The implementation milestone, shared by lean and systematic. A test-first walk — author tests → observe RED → implement to GREEN. The SEQUENCE is fixed; RIGOR sets gate density; the iteration's ROLE BINDINGS set who performs each step. Never below this floor.
---

<!-- design: method-shared-implementation  implements: req-shared-impl-fragment :: ONE shared implementation fragment, imported by BOTH lean and systematic (single source, no duplication). It replaces the old lean L4 and systematic M6 build content. gather() bundles it with the rigor source; the composer inlines it at the importing milestone's gate density (lean = one review gate + derived checks; systematic = one sub-gate per acceptance item). -->
# Implementation — shared fragment (test-first)

Imported by lean (as its build milestone) and systematic (as M6). Roles in «angle brackets» are
resolved at seed from the project type + iteration overrides; the default binding is **inline**
(today's behaviour). The engine never runs a role — it only gates their output.

**Sequence (fixed):**
1. **Author tests** — «testdesigner» writes an executable test for every requirement. Push each toward
   `class: executed` where mechanizable; the irreducible residue stays `class: review`.
2. **Plan the build** — decompose into small resumable steps, children of the build task (unchanged).
3. **RED** — «tester» runs the suite; every new test is *observed failing* before implementation
   (`quack observe-red <test>` records it). A test green with no realized design is **SUSPECT**.
4. **GREEN** — «implementer» builds to the tests + requirements, emitting inline `# design:` markers,
   until the suite passes. Tidy-while-green here; a design-level refactor → `engage refine`.

**Acceptance** (systematic seeds each as a sub-gate; lean collapses to ONE review gate + the derived checks):
- [ ] tests authored & executable — every requirement has a runnable test *(derived: coverage:req-has-test)*
- [ ] build planned — small resumable steps under the build task *(killer)*
- [ ] suite observed RED — every new test ran and failed before the build *(derived: coverage:tests-red)*
- [ ] designs realized — every requirement has a realized design *(derived: coverage:designs-realized)*
- [ ] verification GREEN — every test passes, across all iterations *(derived: coverage:tests-pass)*
- [ ] internal quality ok *(review)*
- [ ] implementation risks acceptable *(review — systematic only)*
<!-- enddesign -->
