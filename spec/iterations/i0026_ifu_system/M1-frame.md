# M1 - Frame (i0026_ifu_system, systematic)

TL;DR: IFUs become discoverable slideshow guides. The source stays markdown. The rendered deck stays derived. The late coverage check prevents missing use-case documentation without disturbing earlier design work.

## Vision and scope stated -> i26-m1-vision-scope-stated

Vision: For readers who need to use quackitect, the IFU system is a set of short slideshow guides that explains real workflows, unlike appendix-only guide rows that are easy to miss.

Scope in:
- `kind: ifu` on deck manifests.
- Guide rows that visibly say IFU.
- Document overview discovery.
- A final-slide use-case link index.
- An M8 coverage check.
- The bless-preflight guard from this session.

Scope out:
- A new document type.
- Government submission formatting.
- One IFU per use case.

## Problem agreed -> i26-m1-problem-agreed-the

The delta is real. IFU is a known term in the field. The current book can render slides, but it does not make IFUs a named, first-class finding path. The Pong deck exists, but its IFU identity and use-case coverage are implicit.

## State of the art checked -> i26-m1-state-of-the

Public medical-device practice uses IFU as a normal document label. Electronic IFU practice adds discoverability, versioning, access, and risk concerns. Plain-language guidance points the same way: write for the audience, make the route visible, and test understanding. This project does not need regulatory ceremony. It does need the familiar IFU label.

## Success is measurable -> i26-m1-success-is-measurable

1. IFU decks carry `kind: ifu`.
2. IFU titles visibly include IFU.
3. Chapter 2's document overview lists derived IFU decks.
4. Chapter 10.3's guide table links IFUs.
5. M8 has an executed `coverage:ifu-usecases` check.
6. Direct bless cannot bypass unfinished prerequisites or missing evidence.

## Top risks logged -> i26-m1-top-risks-logged

- **Risk - acronym clutter**: IFU can confuse non-domain readers. Mitigation: use IFU in titles, with plain supporting text.
- **Risk - link-heavy final slides**: coverage slides can become ugly. Mitigation: keep teaching slides short, and use the last slide as the coverage index.
- **Risk - weak-model shortcut**: broad grants can turn into check-marking. Mitigation: prompt preflight plus engine refusal.

## Milestone review -> i26-m1-gate

Verify: each frame item has concrete evidence above. Validate: the frame matches the owner's field-language goal and the late M8 coverage placement. Red-team: a new document type would be cleaner in a taxonomy, but it would split the existing deck machinery. Verdict: PASS.
