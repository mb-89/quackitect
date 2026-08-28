---
minted_in: i51-work-running-out-of-sight-reports-itself
id: opt-one-operation-object-serves-every-kind-of-long-work
type: "[[option]]"
statement: every method that may run long returns the same operation object, and one shared service answers about all of them, so no caller ever learns a second door
cluster: cluster-the-telling
found_by: prior-art
source: Google AIP-151, Long-running operations, state Approved, read at https://google.aip.dev/151 on 2026-08-21
---

## Mechanism

A method that may take significant time returns an OPERATION object rather
than its own result. The operation carries a name, a `done` flag, a `response`
when it succeeds and an `error` when it fails.

A SEPARATE METADATA TYPE RIDES BESIDE IT, and the standard says what it is
for in as many words: to provide information such as progress, partial
failures and similar information on each fetch of the operation.

THE UNIFORMITY IS A RULE RATHER THAN A HABIT. The standard's own words: APIs
with messages that return Operation must implement the Operations service, and
individual APIs must not define their own interfaces for long-running
operations, to avoid non-uniformity.

## What it says about our defect

The two-table split this iteration exists to end is exactly the
non-uniformity that rule forbids. Somebody else met the same problem, wrote
down the rule, and gave the reason.

## What adopting it would look like here

One shape for a piece of work out of sight, whatever started it. A test run and
a shell command return the same thing, and one verb answers about either.

The progress lives in a metadata part rather than in the verdict, which keeps
the answer's shape stable between running and finished.

## What our context breaks

WE HAVE NO WIRE FORMAT AND NO CLIENT LIBRARIES. The standard's cost is the
protobuf machinery around it, and most of its rules are about generated code we
do not generate.

OUR CALLER IS ONE PROCESS AWAY, not across a network. So the operation does not
need a name that survives a restart, which is most of what the resource shape
buys.

## What it would cost

Changing the shape of an answer two verbs already give. Both currently answer
in their own vocabulary, and callers read them.

## The number that does not transfer

The standard's rule of thumb for "a significant amount of time" is ten
seconds. Ours is one second, from `req-call-answers-in-one-second`. The
mechanism transfers and the threshold does not.
