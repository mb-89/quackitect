---
id: rigor-shared-implementation
statement: The implementation milestone, shared by lean and systematic. A test-first walk — author tests → observe RED → implement to GREEN. The SEQUENCE is fixed; RIGOR sets gate density; the iteration's ROLE BINDINGS set who performs each step. Never below this floor.
---

<!-- design: method-shared-implementation  implements: req-impl-fragment-tdd.1 :: ONE shared implementation fragment, imported by BOTH lean and systematic (single source, no duplication). It replaces the old lean L4 and systematic M6 build content. gather() bundles it with the rigor source; the composer inlines it at the importing milestone's gate density (lean = one review gate + derived checks; systematic = one sub-gate per acceptance item). -->
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

**Verify targeted while building; the battery belongs to the gate.** Mid-build,
run ONLY the selftest(s) the change in hand touches (plus the build for the hash re-baseline).
The FULL battery runs at ONE place: the verification gate, through `verify <check>` in its own
visible console — never between edits, never as a slot ritual. The engine enforces this on the
agent channel: a full battery outside a milestone review is refused (go-guard-selftest).
Re-running everything after every change is the over-checking failure mode the walk warns
against; the derived checks compute live and catch regressions at the gate where verification
belongs. This binds DELEGATED build agents the same as the driving agent — a subagent's brief
inherits it.

**Every build-step brief carries the ritual as one checklist line:** author the test →
`observe-red` RECORDS the failure → implement to green. A step that lands its implementation
before the red is recorded strands the test without an observable failure (i21 b13 slipped
exactly this way). Run `observe-red` LAST before the build, and BEFORE the code lands.

**Acceptance** (systematic seeds each as a sub-gate; lean collapses to ONE review gate + the derived checks):
- [ ] tests authored & executable — every requirement has a runnable test *(derived: coverage:req-has-test)*
- [ ] build planned — small resumable steps under the build task *(killer)*
- [ ] suite observed RED — every new test ran and failed before the build *(derived: coverage:tests-red)*
- [ ] designs realized — every requirement has a realized design *(derived: coverage:designs-realized)*
  - A requirement whose realization is a REMOVAL is satisfied by its veto decision, not a design.
  - The veto records the removal. Git history is the archive. No tombstone design is ever needed.
- [ ] verification GREEN — every test passes, across all iterations *(derived: coverage:tests-pass)*
- [ ] internal quality ok *(review)*
- [ ] implementation risks acceptable *(review — systematic only)*
<!-- enddesign -->

<!-- design: method-apply-default-lane  implements: req-apply-default-lane :: The mechanical-edit lane, named in the method: quack apply is the DEFAULT lane for a mechanical bulk edit (byte-exact old->new, dry-run first, all-or-nothing); editor tooling is the lane for a single edit; a byte-safe scripted edit is the recorded exception, never the default. -->
## Editing lane — how a change reaches the files

Every edit travels one lane. The apply lane is the agent's DEFAULT (adr-io-lane-default).

- Agent default: `quack apply <manifest.json>` — byte-exact replace, `op: create`, `op: write`. It dry-runs first. It is all-or-nothing. Touched files and the outcome land in the call log.
- Single interactive edit: editor tooling stays the lane for one change made in conversation.
- Scripted bulk edit: the recorded exception, never a default. It must be byte-safe. It never becomes a dependency.
- Named corrupter: a PowerShell content round-trip (`Get-Content | Set-Content`, any `-Encoding`). It re-encodes every line. It has mojibaked UTF-8 three times in this repo. A rename or rewrite goes through the apply lane or editor tooling, never through a shell round-trip.
<!-- enddesign -->
