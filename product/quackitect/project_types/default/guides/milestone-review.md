---
id: milestone-review
scope: always
statement: How to review a milestone gate before bless. Increasing-scrutiny rounds over the milestone's own checks and all its input checks.
---
## Guide (load on demand)
A milestone is a gate. Review it before the human blesses it. Never bless on procedure alone.

Each review covers two sets of checks. The milestone's own checks. And every input check feeding it — the dependency cone since the last gate. Work in rounds of increasing scrutiny.

1. **Verify.** Did each input check deliver? Read the evidence or referent. Confirm the work exists and matches the claim. A bless is not proof. (Built it right.)
2. **Validate.** Does the milestone meet the original intent — the frame and vision? Not just its own plan. List what is missing, wrong, or out of scope. Watch for asks that no check covered. (Built the right thing.)
3. **Red-team.** Argue the opposing case before you endorse. Cite a rubric, not vibes. A significant decision carries a kill-criterion. Frame open questions to falsify. An override blesses past an unmet criterion. Log it WITH its dissent. Never record it as a clean pass.

**Risk-weighted.** Spend the deepest scrutiny first on the riskiest, most-central checks. Risk rises with graph centrality, reversal history, and human-judgment verifiers. Trust executed marks; they are deterministic. The agent never self-certifies a killer gate.

**Scale to size.** Match the review to the gate's risk. Do not red-team a trivial gate.

**Verdict.** End with a clear verdict. Either pass, and proceed to bless. Or reopen the named checks with reasons. No silent pass.

**Persist it.** Write the rounds and the verdict into the milestone's evidence doc `spec/iterations/<iteration>/M<n>-<slug>.md` (one `## heading → check-id` section per subtask; canonical slugs `M1-frame` … `M8-handover`). This doc is the referent the report's `verdict ↗` link opens for every DONE check in the milestone — if it is missing, the verdict link is blank. Write it before you ask the human to bless the gate.
