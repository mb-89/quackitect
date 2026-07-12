# M5 - Prove the riskiest unknowns (i0019_strangers_book)

## Riskiest assumptions validated by evidence  -> i19-m5-assumptions  (KILLER - owner adjudicates)
Two assumptions carried the iteration; the spike measured both. **Verdict: both CONFIRMED, one with a finding.**
- **The playable embed fits the budget - emphatically.** A complete, playable, single-file canvas Pong measures **3,877 bytes total (game-only 3,656)**: **0.10% of the real book**, 7.3% of even a conservative 50KB game-only budget. req-pong-deck.3's guard stays (the budget decides), but the risk is retired. Lazy-init proven: no canvas work, listeners, or loop until `startPong()` - the book embed lifts the function body as-is. Run-proof by screenshot, verified by the orchestrator's own read: start screen (button, no canvas) and mid-game (court, centerline, both paddles, 0-0, ball in flight).
- **The five-minutes claim survives measurement - after the friction fixes.** The full walk, scaffold to shipped zip, wall-clock: **10:24 total, of which the walk itself (compose -> ship) took 4:46**. The ~4-minute gap is measured newcomer FRICTION, itemized below - with the in-scope fixes built at M6, "five minutes" is honest; the deck's timeline uses these measured numbers (timings.tsv, captured into spike/).

## Design is buildable  -> i19-m5-buildable
The deck's material exists (spike/slides-material.md: per-milestone one-liners + the timeline), the game artifact is the keeper (spike/pong.html - captured backward as design input for the M6 embed), and the anchor/semantics work rides markup that already half-exists (M2 probes). Nothing in the spike moved the architecture: the M4 decisions stand unrevised.

## Spike results recorded  -> i19-m5-spike-recorded
The toy project reached 25/25 checks green, all 8 gates, and a shipped zip. **Newcomer-friction findings, ranked by bite (the honest 4 minutes):**
1. **Attest wall right after scaffold** (~3:02 measured): `start <version>` blocks; the grant is console-only BY DESIGN (the adjudicator's act) - an agent-driven newcomer has no sanctioned path. Ruled a DECK-HONESTY item + open note: the walkthrough shows the human granting once; whether an agent lane should exist is the owner's design call (NOTE-20260712-132005).
2. **The scaffold starts in legacy edge mode** - composing edges the documented way (connections jsonl) gets a STRICT refusal until `migrate-edges` runs. M6 bugfix: stubs scaffold in connections mode from birth.
3. **The scaffold's example content is not strict-clean** (a dangling example edge refused the graph). M6 bugfix: the stub set ships lint-clean.
4. **HTML is invisible to the design scan** (.go/.py/.md only) - a web-game project cannot carry design markers in its actual code. M6 scope call at build-planning: extend the scan to .html/.js, or the deck honestly shows the companion-md pattern.
5-7. Empty-region delta message unclear; unknown `type: note` silently becomes a blessable check; ship prints "NOT packaged" then "shipped" in one breath (M6 bugfix: honest copy). Items 1, 5, 6 noted for triage; 2, 3, 7 ride M6 as bugfixes (they violate existing shipped requirements - the bugfix lane, no new trace).

## Milestone review  -> i19-m5-gate  (KILLER - owner adjudicates)
**Verify:** both riskiest assumptions carry MEASURED evidence (bytes, wall-clock, screenshots read by a second pair of eyes), not assertion; the keeper artifacts are captured backward into spike/. **Validate:** the spike answers exactly what M4 decided to build - the embed pattern, the timeline's honesty, the deck's material. **Red-team:** did the spike test the easy path? No - it walked the FULL ledger discipline in the toy (attest ritual included), which is precisely where the friction lives; the 4:46/10:24 split keeps both truths. The one softness: the walk was agent-driven - a human newcomer's typing pace differs; the deck says what was measured and how. **Verdict: PASS from the agent side - hand-off for the owner's M5 bless.**
