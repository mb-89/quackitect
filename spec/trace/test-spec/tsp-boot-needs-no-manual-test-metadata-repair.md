---
minted_in: i36
id: tsp-boot-needs-no-manual-test-metadata-repair
type: "[[test-spec]]"
statement: Boot reaches the front desk over a stale or malformed historical test record, without an agent minting a replacement record by hand, and with every boot check still running.
method: test
verifies:
  - req-boot-needs-no-manual-test-metadata-repair
files:
  - tests/record-inspect.test.ts
---

## Scope

The boot record inspector, and only it. The claim is about what boot does when
the latest test record does not carry the metadata boot expects.

Two halves, and both belong here.

- Boot completes. The walk reaches the front desk.
- Boot does not go quiet to get there. Every check it would run still runs.

WHAT IS DELIBERATELY OUT. The shape of the test record itself. Whether the
newer metadata is the right metadata is a question for the state that writes
it, not for boot's tolerance of an older one.

## Approach

DESIGN METHOD: equivalence partitioning over the record's condition. The
inspector sees one of three classes, and the class is the whole variable.

- A current record, carrying question and scope.
- A stale record, well-formed but missing the newer keys.
- A malformed record, which does not parse as a record at all.

LEVEL: component. The inspector is reachable without a live host.

DEPTH: high. The requirement is graded `crippling` because the failure lands
before any work can start, and a session that stalls at boot has no way
forward that does not involve a person.

## Steps

Every case in `tests/record-inspect.test.ts` is one step. The file is new
with this chunk, and it drives the inspector directly rather than through a
whole boot.

WHY NOT boot.test.ts, which this spec first named. The claim is about the
record inspector's judgment, and that inspector is a script reading a log. A
case in the boot file would have to stand up a whole boot to observe one
branch, which is a slower test of a smaller thing.

- A log of only pre-fix records leaves boot green, and the output says why.
- A pre-fix record arriving after a modern one does not unseat it. The newest
  JUDGEABLE record is the one that counts.
- The check is not silenced. A modern record that could carry a question and
  does not is still a finding.

## Why the measure is a hundred runs and the spec is three cases

The requirement's measure counts a hundred boots because it is stating a rate:
zero manual repairs, not few. A test cannot run a hundred boots cheaply, and
running it a hundred times would prove nothing a single deterministic case
does not.

So the spec checks the BRANCH, and the rate follows from the branch being
unconditional. What would falsify the rate is a record class that still needs
a hand, and the three classes above are the whole partition.
