# M2 — Requirements (i0015_mobile_adapter, systematic)

## Inputs captured  → i15-m2-inputs

The system-in-focus is the ASK LOOP inside the engine. Its context, IN/OUT:

```
                 ┌──────────────────────────┐
 [adjudicator]──▸│ phone (paired device)    │
                 └───────────▴──────────────┘
                    ask ▴    │ answer
                 ┌──────┴────▾──────────────┐
                 │ relay (ntfy topic /      │   third-party transit —
                 │ Slack workspace)         │   disclaimer at pairing
                 └──────▴────┬──────────────┘
                  send  │    │ poll
                 ┌──────┴────▾──────────────┐
                 │ engine ask loop (seam)   │──▸ ledger (bless, actor=user)
                 └──────────────────────────┘
```

Figure: the ask travels engine → relay → phone. The answer returns the same way. The ledger records it. The engine only ever polls outward — no inbound endpoint (NAT law).

Use cases: [uc-mobile-adjudicate](../../usecases/uc-mobile-adjudicate.md) (the loop). The reverse channel (phone-initiated queries, `quack listen`) stays OUT of this iteration by the red-team ruling (demoted).

## Stakeholder coverage  → i15-m2-stakeholders

- [stk-project-owner](../../stakeholders/stk-project-owner.md) — the adjudicator away from the desk; the ask reaches them, their answer binds.
- [stk-agent](../../stakeholders/stk-agent.md) — the driving agent; keeps walking other ready checks while asks pend.
- [stk-operator-sysadmin](../../stakeholders/stk-operator-sysadmin.md) — pairs devices, owns the relay choice (hosted vs self-hosted), reads the disclaimer.
- [stk-developer-maintainer](../../stakeholders/stk-developer-maintainer.md) — extends the seam with the corporate adapters later.
- No new role needed: the relay operator duty folds into operator-sysadmin; the adjudicator duty is the project owner's existing role.

## Prior art checked against the set  → i15-m2-prior-art

The standard checklist for human-in-the-loop approval (from the verified prior-art notes) demands:

- options as id-label pairs (req-ask-format ✓)
- suspend-until-answered with independent pending asks (req-multi-ask ✓)
- timeout + notification cleanup (req-ask-timeout ✓)
- idempotent correlation-bound answers (req-answer-idempotent ✓)
- reject-with-comment flowing back as the answer (req-answer-apply ✓)
- authenticity stated honestly (raid-answer-forgery → the M4 ADR ✓)
- a channel seam (req-channel-seam ✓)

Misses found against best practice: NONE outstanding; the four-verb vocabulary (approve/edit/reject/respond) maps onto gate asks (approve/reject+comment) and decision asks (option ids) and is recorded here as the wire vocabulary for M3.

## The requirement set

Thirteen requirements, all EARS-shaped. Each refines the use-case and carries a test:

- loop core:
  - [req-ask-dispatch](req-ask-dispatch.md)
  - [req-ask-format](req-ask-format.md)
  - [req-answer-apply](req-answer-apply.md)
  - [req-mobile-actor](req-mobile-actor.md)
- robustness:
  - [req-answer-idempotent](req-answer-idempotent.md)
  - [req-ask-timeout](req-ask-timeout.md)
  - [req-multi-ask](req-multi-ask.md)
- trust:
  - [req-pairing](req-pairing.md)
  - [req-gate-distinct](req-gate-distinct.md)
- channels:
  - [req-channel-seam](req-channel-seam.md)
  - [req-ntfy-channel](req-ntfy-channel.md)
  - [req-slack-channel](req-slack-channel.md)
  - [req-adapter-zero-dep](req-adapter-zero-dep.md)

`coverage:req-traced` and `coverage:req-has-test` compute green (13/13 each). The 13 design holes are the honest pre-build state.

## Milestone review

**Verify.** Every requirement is EARS-shaped (lint: clean), traced and tested. Three environment assumptions matter:

- ntfy caching
- Slack endpoint hostility
- Android's 3-button cap

They come from the adversarially verified notes, not datasheets — the remaining live-channel probes belong to M3 feasibility by design.
**Validate.** The set covers the owner's rulings one-to-one. Nothing exceeds the ask-loop scope. The reverse channel is explicitly out.
**Red-team.** Opposing case: "thirteen requirements over-specify a ~200-line feature." Held: each maps to a ruled behavior or a documented prior-art failure mode; dropping any one reopens a known accident class. Kill-criterion: a requirement no candidate architecture can satisfy zero-dep steps back to M1 scope.
**Verdict: PASS** — proceed to the gate bless.
