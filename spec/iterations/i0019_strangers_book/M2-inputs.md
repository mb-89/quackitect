# M2 - Requirements (i0019_strangers_book)

## Inputs captured  -> i19-m2-inputs
**Context (system-in-focus + neighbours, IN/OUT):** the RENDERED BOOK is the system in focus; its neighbours are the guides table and glossary (inside the same HTML), the README (links IN to the book), the RUNME scripts (orient TOWARD the book's deck), a VEHICLE workspace (renders its OWN book through the same engine), and the reader - stranger, colleague, or machine. IN: spec nodes, manifests, brand layer, glossary. OUT: one self-contained HTML, the deck anchors, lint findings.
**Use cases:** uc-onboard-newcomer (killer), uc-deck-deep-link, uc-white-label-book. **Carried question:** q-trace-graph-scaling (rides to the M4 gate).
**Field probes (the real channel, not the datasheet):**
- The guides table ALREADY keeps view state in the URL hash with preset machinery - req-onboarding-chapter.3's filtered link rides an existing rail, no new mechanism.
- Decks ALREADY render stable per-slide ids (`man-deck-presentation-s1`, `data-deck` attributes) - req-deck-links.3's anchor substrate half-exists; what is missing is URL reflection on open, deck-level jump, and the ARIA naming: the probe shows bare `<section>` elements, which the verified research maps to `role=generic` "section soup" - the machine-illegibility the stranger hit, confirmed in our own markup.
- The book RENDERS from a vehicle (probe: the iec-vehicle fixture renders 56KB) but carries `<title>quack — the spec book</title>` and ZERO mentions of the vehicle's name - the white-label gap CONFIRMED at baseline, req-vehicle-white-label is fixing a real, observed defect.
- The RUNME scripts (read at i18 M8) create a demo workspace - the exact behavior req-runme-orientation.3 removes.

## Stakeholder coverage  -> i19-m2-stakeholders
By role, no one left out: the STRANGER (first contact, the red-team's persona - served by 2.2, the deck, the terms lint), the ORG COLLEAGUE (meets the VEHICLE's book - served by white-label), the OWNER/maintainer (keeps one book, no forked docs - served by everything being one artifact), the AGENT (machine reader - served by deck semantics and machine-legible markup), CI (runs RUNME.sh headless - served by the orientation-only slim-down), and the ADJUDICATOR (walks gates - untouched by this iteration). No new stakeholder type; the register's roles cover all six.

## Prior art checked  -> i19-m2-prior-art
The requirement SET checked against the verified research (M1 record):
- req-deck-semantics gains its implementation checklist from the W3C/MDN recipe (aria-labelledby on the deck boundary, navigation role on the navigator, unique labels among nav landmarks; slides named via their headings, landmarks used sparingly per W3C).
- req-deck-links matches the reveal.js/Quarto precedent (fragment anchors, slug-from-manifest); nothing in the set contradicts the established pattern.
- req-pong-deck.3 carries MDN's measured lesson (size budget + lazy-INIT inside the single file - one file always, the work deferred, not the bytes moved).
- req-terms-before-use is NOVEL (no tool found enforces definition-before-use) - the set adds a check the ecosystem lacks; statement 2's glossary-as-term-list follows Vale's vocabulary-scoping convention while fixing its ordering blindness.
- Best-practice misses ADDED by the scan: none forced a new requirement; the Diataxis separation validated the routing shape already in req-onboarding-chapter (the chapter routes, the deck teaches, the table serves work).

## Requirements verifiable  -> i19-m2-req-has-test  (derived: coverage:req-has-test)
Every i19 requirement carries a verifying test (6 clustered tests over 8 requirements). Computed live.

## Requirements traced  -> i19-m2-req-traced  (derived: coverage:req-traced)
Every i19 requirement refines a use case; every use case refines a need (need-docu, need-workspace-drive). Computed live.

## Milestone review  -> i19-m2-gate  (KILLER - owner adjudicates)
**Verify:** inputs, stakeholders, and prior-art each name their referent; both derived checks compute TRUE over the composed trace. **Validate:** the probes checked the REAL channel (the rendered book's markup, a live vehicle render) and two of them turned assumptions into observed defects (section soup, the quack-titled vehicle book) - the requirement set targets measured reality. **Red-team:** sharpest attack - "the glossary assumption" (req-terms-before-use leans on a glossary the red-team called too small); carried openly in the M1 RAID: the lint lands WITH the glossary growth, else it flags nothing. **Verdict: PASS from the agent side - hand-off for the owner's M2 bless.**
