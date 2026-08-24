---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-design-spec
artifact: node
type: "[[design-spec]]"
id: dsp-session-guidance-delivery
statement: Session guidance delivery is filtered by the active session mode before a pull is served.
realizes:
  - el-walk-engine
files:
  - deliverable/engine/session.ts
  - deliverable/tests/pull-offer.test.ts
---

# Session guidance delivery

## Responsibility

Serve only guidance whose session applicability includes the active session.

This design does not change guidance text. It chooses which existing guidance reaches a pull.

## Interface

The session mode and each guidance document's applicability are inputs.

The delivered pull contains only the filtered guidance list.

## Behavior and constraints

An attended session excludes unattended-only and cloud-only guidance.

Guidance without a session restriction remains available to every session.

## Rationale

Filtering at the session response boundary makes the host-reported mode explicit where it controls observable output.
