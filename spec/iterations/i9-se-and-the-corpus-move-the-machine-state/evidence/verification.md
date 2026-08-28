---
form: verification
authors: agent
files: null
---

# Evidence form / verification

## current_situation

Verification does not stand, and the fresh eyes are why.

A tester with no part in the build read the four chunks against their design specs and returned eleven findings. Four break a claim the evidence makes. Two of those four are regressions this iteration introduced rather than inherited.

Four chunks were reopened on them: the move, the branch pin, the one corpus reader and the install preflight.

The battery also stands red on seven cases. Six belong to two requirements that are in this iteration's scope, had tests written for them at observe-red, and appear in no build chunk. That is a scope question and it is the owner's.

## claims

- [ ] tsp-a-slow-signal-keeps-the-wait — not observed; the build was reopened on eleven findings
- [ ] tsp-a-vehicle-is-made-and-then-drives-something-else — not observed; the build was reopened on eleven findings
- [ ] tsp-autonomy-tiers — not observed; the build was reopened on eleven findings
- [ ] tsp-bound-surface — not observed; the build was reopened on eleven findings
- [ ] tsp-coupling-disposition — not observed; the build was reopened on eleven findings
- [ ] tsp-derivation-analysis — not observed; the build was reopened on eleven findings
- [ ] tsp-desk-and-gates — not observed; the build was reopened on eleven findings
- [ ] tsp-first-run — not observed, and the install path it covers is one of the findings
- [ ] tsp-one-door-into-the-pool — not observed; the build was reopened on eleven findings
- [ ] tsp-opening-the-folder-is-the-whole-interaction — not observed, and the extension writing above the opened folder is one of the findings
- [ ] tsp-panel-walkthrough — not observed; the build was reopened on eleven findings
- [ ] tsp-prose-inspection — not observed; the build was reopened on eleven findings
- [ ] tsp-read-back-inspection — not observed; the build was reopened on eleven findings
- [ ] tsp-record-inspection — not observed, and its own reader carries the sixth private split that is one of the findings
- [ ] tsp-the-arrival-in-one-act — not observed, and the install path it covers is one of the findings
- [ ] tsp-the-cited-refs-resolve — not observed; the build was reopened on eleven findings
- [ ] tsp-the-engine-keeps-no-record-of-what-it-produced — not observed; the build was reopened on eleven findings
- [ ] tsp-tour-run — not observed; the build was reopened on eleven findings
- [ ] tsp-two-machines — not observed; the build was reopened on eleven findings
- [ ] tsp-unattended-start — not observed, and the install path it covers is one of the findings

## follow_up

### The four that break a claim

1. THE DEFAULT INSTALL PATH NEVER VERIFIES ITSELF. The editor branch ends in `exit 0`, and the verify call sits after it. The chunk's own statement says the entry point verifies itself and reports ready; on the path the script calls default, it does neither.
2. THE RUNTIME PIN CANNOT RUN ON THE RUNTIMES IT EXISTS TO CATCH. The installer now only checks that a runtime EXISTS, then spawns a TypeScript file to do the version check. On an old runtime that file is a syntax error, which is the exact failure the design says the pin prevents. The hand-written comparison that could run there was removed and nothing replaced it.
3. THE SHIPPED EXTENSION STILL WRITES ABOVE THE OPENED FOLDER. Its root is the repository root, not the opened folder, so activating it recreates the machine state at the old address. The drift check reads the source and not the bundle.
4. NO PRODUCTION CALLER WAS ROUTED THROUGH THE ONE READER. The split was unified; the ANSWER was not. Four readers still decide for themselves what a malformed node means, which is more than the chunk claimed.

### The three test holes

5. A SIXTH PRIVATE SPLIT SURVIVES, in the record inspector, and it has no byte-order-mark handling. That is the same divergence the chunk says it removed, in a reader that returns a verdict on corpus nodes.
6. FIVE OF THE TEN CORPUS CASES CANNOT FAIL. A set built from one reader always has one element, so the pairwise comparison is unfalsifiable, control included.
7. THE BRANCH PIN'S SECOND CASE NEVER ASSERTS THE CHECKOUT MOVED ANYTHING. Its exit status is unread and its assertion holds whether or not either checkout ran. That is the shape the first case was repaired for.

### Four the evidence overstates

8. Two branch-pin assertions compare a pure function with itself and read as proof that a path was recomputed after a checkout.
9. The declared-floor case goes red on divergence, not on a copy, which is not what the evidence says it does.
10. The nothing-changes case stamps one folder, not the tree. The property holds; the oracle is narrow.
11. The editor is declared optional and the installer exits on it 27 lines later.

### What the tester could not reach

It holds no test verb, so the pass counts in all four evidence forms are unre-run, and the sweep counts in the move's evidence are not reproducible from the tree. It said so rather than asserting them.

## anything_else

