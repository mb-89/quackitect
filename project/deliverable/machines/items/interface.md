---
template: item-interface
artifact: node
id_prefix: if-
folder: project/spec/trace/interface
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: between
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an interface names BOTH element ends, or it is a wish about a boundary
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
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
---

# interface — one contract between two elements

Lives in `project/spec/trace/interface/`. A STANDING ARTIFACT, one node per
element pair that exchanges anything.

AN INTERFACE IS NOT A FLOW. A flow says what a FUNCTION consumes and
produces — solution-neutral, no elements in sight. An interface is the
contract between two ELEMENTS: both ends named, what crosses, in what
concrete form. The two layers connect: an interface exists exactly where
flows cross an element boundary, and `carries` keeps that trace.

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
- `between` — the two element ids, one per line. Both ends, always — an
  interface only one side knows about is a future integration failure.
- `carries` — the flow ids this interface transports.
- `form` — the concrete mechanism: a call, a file, a protocol, a shared
  store. Clarify the type of exchange and the properties of both ends.
- `satisfies` — requirement ids this interface answers to, where a
  requirement lands on the boundary itself (interface-kind requirements
  land here naturally).
- `source_refs` — what it derives from.

## Skeleton

```
---
id: if-{{slug}}
type: "[[interface]]"
statement: {{the contract, in one sentence}}
between:
  - {{el-one-end}}
  - {{el-other-end}}
carries:
  - {{flow-...}}
form: {{call | file | protocol | shared store — concretely}}
satisfies:
  - {{req-... — or remove the key where none lands here}}
source_refs:
  - {{what it derives from}}
---

{{the contract's detail: direction, cadence, failure behavior — what an
integrator needs and nothing the build should decide later}}
```
