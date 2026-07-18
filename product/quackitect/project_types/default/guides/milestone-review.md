---
id: milestone-review
scope: always
statement: How to review a milestone gate before bless. Increasing-scrutiny rounds over the milestone's own checks and all its input checks.
---
## Guide (load on demand)
A milestone is a gate. Review it before the user blesses it. Never bless on procedure alone.

Each review covers two sets of checks. The milestone's own checks. And every input check feeding it — the dependency cone since the last gate. Work in rounds of increasing scrutiny.

1. **Verify.** Did each input check deliver? Read the evidence or referent. Confirm the work exists and matches the claim. A bless is not proof. (Built it right.)
2. **Validate.** Does the milestone meet the original intent — the frame and vision? Not just its own plan. List what is missing, wrong, or out of scope. Watch for asks that no check covered. (Built the right thing.)
3. **Red-team.** Argue the opposing case before you endorse. Cite a rubric, not vibes. A significant decision carries a kill-criterion. Frame open questions to falsify. An override blesses past an unmet criterion. Log it WITH its dissent. Never record it as a clean pass.

**Risk-weighted.** Spend the deepest scrutiny first on the riskiest, most-central checks. Risk rises with graph centrality, reversal history, and user-judgment verifiers. Trust executed marks; they are deterministic. The agent never self-certifies a killer gate.

**Scale to size.** Match the review to the gate's risk. Do not red-team a trivial gate.

**The M4 gate is a DIAGRAM review (hard rule).** Architecture is decided as a MODEL, not just as text. The M4 gate cannot bless until the chosen views exist as model nodes with their elements ALLOCATED (the blocks the build will fill, ahead of any code), the structure drawn, and each architecture ADR marked `kind: architecture` and linked to the element(s) it shapes. The architect (owner) reviews the DIAGRAM here and approves the decomposition before anyone builds. M6 then adheres: the build fills the allocated elements and invents no element the diagram did not sanction (the conformance/sky-fall lint enforces adherence). A genuinely-needed new element found mid-build goes back through an architecture review, never in silently. This is the architect→developer handoff made structural; revert only if it proves to cost more than it protects.

**The M4 review asks the boilerplate question.** While reviewing the diagram, name each block that could classify as boilerplate: meaning-free utilities, stable plumbing, uniformly-coupled infrastructure. The owner stamps the confirmed ones. The model stays complete regardless. The stamp only governs the render's hide-boilerplate control, since the model is design input, never documentation.

**The stranger's read (final milestone of a reader-facing iteration).** When the
milestone ships an artifact meant for outside readers (the book, a guide, a README),
the red-team round includes a COLD READER: a fresh agent with zero project knowledge,
in the persona of the artifact's declared stranger audience (assume English as a
second language), whose only input is the rendered artifact. It answers: what is
this, who is it for, could I start, where did I get lost — plus a ranked fix list —
and must disclose every point where its understanding leaned on anything but the
artifact. The findings feed the gate evidence; unaddressed ones become notes.

**Verdict.** End with a clear verdict. Either pass, and proceed to bless. Or reopen the named checks with reasons. No silent pass.

**Persist it.** Write the rounds and the verdict into the milestone's evidence doc `spec/iterations/<iteration>/M<n>-<slug>.md` (one `## heading → check-id` section per subtask; canonical slugs `M1-frame` … `M8-handover`). This doc is the referent the report's `verdict ↗` link opens for every DONE check in the milestone — if it is missing, the verdict link is blank. Write it before you ask the user to bless the gate.
