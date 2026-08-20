---
template: item-interface
artifact: node
id_prefix: if-
folder: spec/trace/interface
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: source
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an interface names its source element, or it is a wish about a boundary
  - field: destination
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an interface names its destination element — both ends, always
  - field: carries
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an interface that carries no flow answers to nothing — name the flows, or ask why the cell exists
  - field: form
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: the concrete form is what makes it an interface rather than an intention
  - field: bound
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: every interface owes a bound - one second, or an argued reason it cannot be. "none" is legal only where nothing is served across it
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
---

# interface — one contract between two elements

Lives in `spec/trace/interface/`. A STANDING ARTIFACT, one node per
element pair that exchanges anything.

AN INTERFACE IS NOT A FLOW. A flow says what a FUNCTION consumes and
produces — solution-neutral, no elements in sight. An interface is the
contract between two ELEMENTS: both ends named, what crosses, in what
concrete form. The two layers connect: an interface exists exactly where
flows cross an element boundary, and `carries` keeps that trace.

## Every interface owes a bound (i33, 2026-08-17)

AN INTERFACE THAT NAMES BOTH ENDS AND WHAT CROSSES STILL SAYS NOTHING ABOUT
WHETHER USING IT IS BEARABLE. The bound is what makes the contract complete.

THREE ANSWERS ARE LEGAL, and each is argued rather than defaulted:

- ONE SECOND, the standing rule for anything a person or an agent touches.
- NOT ONE SECOND, with the reason. A battery run, a worktree raise and a first
  install are all honestly slower, and pretending otherwise produces a rule
  nobody keeps and everybody stops reading.
- NONE, only where nothing is served across the edge at all. Files written to
  disk for a vault to open have no answer to be fast or slow.

A NOT-ONE-SECOND BOUND IS NOT AN EXEMPTION. It moves the demand to the other
half: the crossing must say it is working, inside the second, and never leave
anybody guessing whether it is alive.

WHY IT IS A CHECK AND NOT ADVICE. The rule shipped as guidance in i12 and two
days later 1834 of 8424 calls were over it. A demand nothing enumerates is a
demand nothing enforces, and the boundary set is the enumeration.

## The coverage law, both directions

- Every flow whose producer and consumer sit in different elements is
  carried by exactly one interface.
- Every interface carries at least one flow — a contract no flow demands
  is a question in the other direction.

Review-class now, engine-computed later, exactly like the allocation's
exactly-once.

## Fields

- `id` — `if-<slug>`.
- `type` — `"[[interface]]"`.
- `statement` — what this contract is, in one sentence.
- `source` — the element id the exchange comes from.
- `destination` — the element id it goes to. Both ends, always — an
  interface only one side knows about is a future integration failure. A
  genuinely two-way contract is two interfaces, one per direction, and
  that is information rather than overhead.
- `carries` — the flow ids this interface transports. Requirements reach
  an interface through this chain: the flows belong to functions, and the
  functions serve requirements.
- `form` — the concrete mechanism: a call, a file, a protocol, a shared
  store. Clarify the type of exchange and the properties of both ends.
- `bound` — how long a crossing may take, and what it owes when it cannot be
  fast. It DEFAULTS to `inherited`, which is honest for an in-process crossing
  between two elements: it has no clock of its own and is paid for by the
  outside call that reached it. An OUTSIDE boundary — element to neighbour —
  always states its own, because that is where a person or an agent waits.
- `satisfies` — requirement ids this interface answers DIRECTLY, used only
  where no flow chain carries the requirement — interface-kind
  requirements about the boundary itself land here.
- `source_refs` — what it derives from.

## Skeleton

```
---
id: if-{{slug}}
type: "[[interface]]"
statement: {{the contract, in one sentence}}
source: {{el-where-it-comes-from}}
destination: {{el-where-it-goes}}
carries:
  - {{flow-...}}
form: {{call | file | protocol | shared store — concretely}}
bound: inherited — an in-process crossing has no clock of its own and is paid for by the outside call it serves
satisfies:
  - {{req-... — only what no flow chain carries; remove the key otherwise}}
source_refs:
  - {{what it derives from}}
---

{{the contract's detail: direction, cadence, failure behavior — what an
integrator needs and nothing the build should decide later}}
```
