# M1 — Frame the problem & vision (i0025_clean_state)

## vision & scope stated -> i25-m1-vision-scope-stated

Vision (Moore): FOR the owner and the driving agent WHO carry a shipped engine but a noisy floor, THE clean-state iteration is a debt drain THAT takes every open advisory + defect lead + naming ruling to zero. UNLIKE feature iterations that add surface while the floor stays loud.

Goal, actual and delta:

- Goal: an empty inbox, a groomed backlog, zero lint advisories, a battery that reports everything once.
- Actual: eight open leads from the i24 run, 55 unrealized ADR adoptions, 19 glossary advisories, a first-fail-aborting battery, one misleading suite name.
- Delta: the eleven composed steps. The scope list lives in iteration.md.

Out of scope: every new feature. The parked backlog stays parked.

## problem agreed -> i25-m1-problem-agreed-the

The owner ordered this directly on 2026-07-16: reduce the backlog and todos to a halfway-clean state before any new feature. Every scope item traces to a recorded finding or an owner ruling from the i24 window. Nothing here is speculative.

## state of the art checked -> i25-m1-state-of-the

This iteration's subject is the repo's own recorded debt; the prior art is internal precedent:

- fail-at-end batteries are standard practice in every mature test runner (the external norm confirms the owner's law).
- The i17 pruning iteration is the in-repo precedent for b8's retirement and b9's triage.
- The i24 wave is the direct precedent for b6's mechanical rename.

No external scan adds information here; the sources are the notes each step cites.

## success is measurable -> i25-m1-success-is-measurable

1. The battery reports N failures in one run (proven by b1's own test).
2. `quack lint` ends with zero jargon/term/adoption advisories, or each remaining one carries an owner ruling.
3. The inbox is empty. Every archived note carries its pointer.
4. `suite: never-cached` is the only spelling in the repo.
5. The status-storm caller is named in evidence, with its fix or its recorded deferral.
6. Board fully green at ship. The battery green in two runs or fewer (the new law, self-demonstrated).

## top risks logged -> i25-m1-top-risks-logged

- `raid-triage-overreach`: the ADR triage retires something still load-bearing. Mitigation: retire-candidates ship as a bucket the owner rules; nothing retires on my judgment alone.
- `raid-rename-ripple`: the suite rename touches blessed history. Mitigation: mechanical byte-exact sweep, one wave under the grant, the i24 playbook.

## Review Verdict -> i25-m1-gate

Verify: every subcheck has its referent above or in the risk register. Validate: the frame is exactly the owner's clean-state order, nothing more. Red-team: the riskiest item is b9's judgment load; priced by the bucket hand-offs. Verdict: pass.
