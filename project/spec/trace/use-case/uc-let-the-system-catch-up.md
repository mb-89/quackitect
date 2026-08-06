---
id: uc-let-the-system-catch-up
type: "[[use-case]]"
statement: Bring the method back into agreement with itself, in one pass, with no feature to hang it on.
actor: stk-engineer-driving-agents
trigger: the method has drifted from itself and no record owns the drift
precondition: none
guarantee: what drifted is fixed where it lives, what needed a decision is a note, and the battery proves the sweep broke nothing
refines:
  - sty-let-the-system-catch-up
killer: false
---

## Main scenario

1. The person enters the overhaul, which produces no deliverable and is not a project.
2. The sweep runs over what can drift: guidance against its own rules, prose against the voice, artifacts against the templates that minted them.
3. Each finding is fixed where it lives rather than worked around.
4. A finding that needs a decision becomes a note instead of a guess.
5. The full battery runs, because a sweep that touched everything has to prove it broke nothing.

## Extensions

- 1a. The drift belongs to an open record. It is that record's work, not the overhaul's — the overhaul exists for what nothing owns.
- 2a. The sweep finds nothing. That is a result worth recording, because it dates the last time the method agreed with itself.
- 3a. A fix would change behaviour rather than restore consistency. That is a change, not a sweep, and it wants a vehicle.
- 5a. The battery goes red. The sweep does not finish; a sweep that leaves the system worse is the failure it exists to prevent.
