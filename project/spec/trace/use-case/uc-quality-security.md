---
id: uc-quality-security
type: "[[use-case]]"
statement: Keep an act attributable and a boundary closed
actor: stk-engineer-driving-agents
kind: quality-area
trigger: An agent acts on the person's behalf, or something reaches outside the project root.
precondition: The lane is armed and every call passes through it.
guarantee: Every act carries the role and channel that made it, and nothing crosses a boundary the person did not open.
refines:
  - sty-what-a-quality-is
priority: should
---

## What this characteristic covers

SECURITY, from ISO/IEC 25010:2023. The degree to which a system protects
information and data so that people or other products have the degree of
data access appropriate to their types and levels of authorisation.

Its sub-characteristics, so nobody has to open the standard to use this:

- CONFIDENTIALITY. Data is accessible only to those authorised to have it.
- INTEGRITY. Unauthorised access to, or modification of, the system or its
  data is prevented.
- NON-REPUDIATION. Actions or events can be proven to have taken place, so
  they cannot later be denied.
- ACCOUNTABILITY. The actions of an entity can be traced uniquely to that
  entity.
- AUTHENTICITY. The identity of a subject or resource can be proven to be the
  one claimed.
- RESISTANCE. It sustains operations while under attack from a malicious
  actor. Added in the 2023 revision.

WHAT IS NOT HERE. Answering "why did this happen" from the record is
ANALYSABILITY and lives under Maintainability, not under `accountability`.
The distinction is who is asking: a maintainer diagnosing a cause, or an
auditor establishing that somebody cannot deny an act.

## Main scenario

1. An agent acts, and the act is stamped with the role and the channel that made it.
2. A path is named that lies outside the project root, and the lane refuses it.
3. A capability that could reach outside is offered only where the owner declared it.
4. A push to a remote is attempted, and the lane refuses because pushing is the person's act.
5. The record shows who did what, and no entry can be attributed to somebody who did not do it.

## Extensions

- 1a. An act carries no role: it is unattributable, and an unattributable act in a record that claims attribution is a defect.
- 2a. The path escapes through a declared root: it is allowed, read-only, and the declaration is on the record where the owner put it.
- 3a. A provider is missing: the lane says which one and stops, rather than routing around it.
- 5a. A record carries a personal identifier instead of a role: the privacy rule is broken, and the defect is counted rather than shipped.
