# M7 - Validate & accept (i0019_strangers_book)

## Meets the need  -> i19-m7-meets-need  (KILLER - owner adjudicates)
Validated against the Ch1 success criteria AND every need across all iterations (the battery runs backward-cumulative; ZERO FAIL at the M6 hand-back). The M1 bar was behavioral:
- **The stranger's five-minute path EXISTS end-to-end**: README -> the onboarding section 2.2 -> the six-slide Pong deck (self-contained, the starter prompt verbatim) -> the RUNME orientation. The deck's timeline carries the real walk (measured 4:46, half-minute steps, 5 minutes total, the derivation stated where the numbers live).
- **A term-order violation is caught by lint, not a reader**: the terms lint's first live run flagged the red-team's exact seven terms; a planted violation is caught advisory with both locations (selftest).
- **A book rendered from a vehicle presents the VEHICLE**: live probe on the real iec-vehicle fixture - title "iec-vehicle - the spec book", engine as colophon credit; the planted-leak check fails naming the leak (selftest).
- A fresh COLD READ re-ran the original red-team persona over the final surface. VERDICT on the four original findings: stranger-cannot-start FIXED; terms-before-definitions IMPROVED; deck-as-unlabeled-prose FIXED (bounded, labeled slide regions in the raw markup); no-user-path FIXED. It found FOUR new defects, all fixed in this walk: the README's own comparison-table jargon rewritten plain (the lint cannot see the README - a recorded blind spot); ADR added to the glossary (the read PROVED the lint's structural hole: an unregistered term is invisible by construction); the leftover ex-guide delete-me row removed from the live guides table; the deck's 24-vs-25 check-count mismatch reconciled to the spike's real 25. The read also verified the timeline math honest and ./quack live on Windows.

## Killer use-cases demonstrated end-to-end  -> i19-m7-killer-ucs
- **uc-onboard-newcomer** (killer): the deck exists in the shipped book, deep-linkable (#man-deck-pong), all six slides per the owner's outline across four owner design rounds - the always-visible court with start/stop, the interactive onion on s4 fed pong's own model through the ONE generalized renderer, the chat figure with the rigor exchange, the measured timeline reading as a timeline. Every round screenshot-verified by two pairs of eyes (the builder's and the orchestrator's).
- **uc-deck-deep-link**: opening the deck reflects the URL; loading with the fragment opens present mode (screenshot-proven); the README's Pages URL reaches it; in-book links enter present mode (the owner's own click found the dead path - fixed and re-verified); in-book README self-links ride the rails.
- **uc-white-label-book**: the live vehicle probe above, on top of the hermetic selftest.

## Consistency swept  -> i19-m7-consistency
The FIRST run of the new sweep (added to the rigor checklist this iteration), over everything i19 changed - two real drifts found and fixed at their homes:
- The deck TEMPLATE taught none of the new mechanisms (Minutes timeline, columns, embed lanes + budget + stop protocol, the mermaid model fence, fig reuse, term toasts) - every future project would scaffold a dumb deck. The template's tailor comment now teaches all of them.
- The WHITE-LABEL seam was undiscoverable (product/brand/name.txt / the identity resolution order) - now documented in the integrate prompt's brand section, where a vehicle creator actually reads.
Already-current: AGENTS.md (the i18 verbs), compose-reference (connections mode, fixed at this iteration's start), the RUNME contract (method-runme-orientation), the role charter and the targeted-verify law (baked mid-iteration at owner rulings). The i18-found doc gaps (mcp/dependencies) were closed at i18 M8 and stayed closed.

## Acceptance obtained  -> i19-m7-acceptance
The owner drove FOUR design rounds on the deliverable itself during M6 - the slide outline, the round-2 nine bullets, rounds 3-4 corrections, and the final onion-renderer ruling - each implemented, screenshot-verified, and re-presented; the M6 gate bless closed that loop. The M7 gate bless below is the validation sign-off; both ride the ledger as the acceptance evidence.

## Validation gaps captured (RAID)  -> i19-m7-gaps
- **Deferred (noted):** the two book cleanups the owner named mid-round - the engine credit under every page, the informed-by lists under model figures (NOTE-20260712-171042).
- **Deferred (noted):** deck termrefs carry the FULL definition; chapter termrefs keep the short form - the depth-parity question is a recorded lead.
- **Backlog stands:** rigor-fit mechanical detection (the deck says so honestly), the drivers-table rework, the connection matrix, excalidraw-as-requirement, the render/structure leads.
- **Watch:** the five-minutes claim is agent-paced; a human's typing pace differs - the deck states what was measured and how.

## Milestone review  -> i19-m7-gate  (KILLER - owner adjudicates)
**Verify:** every killer use case demonstrated on the real artifact (the shipped book, a real vehicle), not merely green tests; the consistency sweep ran for real and FOUND drift (a sweep that finds nothing on a change-heavy iteration would have been suspect). **Validate:** the built surface answers the red-team's original findings - the cold-read verdict below is the referent. **Red-team:** the sharpest attack - "the deck was verified by its builders": the fresh cold-read is an independent persona over the final surface; its findings are recorded honestly, fixed or carried. **Verdict: PASS from the agent side - hand-off for the owner's M7 bless.**
