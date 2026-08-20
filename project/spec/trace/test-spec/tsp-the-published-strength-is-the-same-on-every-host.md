---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-the-published-strength-is-the-same-on-every-host
type: "[[test-spec]]"
statement: The statement of how strong a hand a step needs is the same on every supported host for the same inputs, and nothing about it is discovered at run time.
method: inspection
verifies:
  - req-one-model-list-is-read-live-from-the-repository
files:
  - project/spec/trace/element/el-sizing.md
---

## Scope

A PORTABILITY PROPERTY, WHICH IS WHY IT IS AN INSPECTION AND NOT A TEST. A test
proves the answer on the host that ran it. The requirement is about every
supported host, and the project registers three of which two are a different
vendor.

WHAT AN INSPECTION CAN ESTABLISH: that nothing in the path from inputs to
published statement consults anything host-specific. That is a static property of
the code and the files it reads, and it is checkable by reading.

OUT OF SCOPE: whether a model NAME resolves to the same model everywhere. It does
not — an alias already resolves differently across providers, which is
`raid-asm-one-model-list-serves-every-host-the-engine-supports`. The declared
architecture publishes a rung and no model name, so that hazard is outside this
requirement rather than answered by it.

## Approach

LEVEL: source inspection over the sizing block and everything it reads, on a
fresh checkout.

WHY NOT A CROSS-HOST TEST: it would be the better evidence and it needs three
machines the build does not have. The inspection is declared as the weaker
instrument rather than presented as equivalent.

## Checklist

EACH ITEM NAMES WHAT IS EXAMINED AND WHAT PASSES.

- NO ENVIRONMENT READ ON THE PATH. Examine every function between the compiled
  step and the published statement. PASSES when none reads an environment
  variable, a home directory, a platform flag or a hostname.
- NO NETWORK CALL ON THE PATH. PASSES when none of them opens a socket, fetches
  or shells out. A run-time discovery is the failure this row is about.
- NO CLOCK AND NO RANDOMNESS. PASSES when the same inputs cannot produce two
  answers on one host, which is the precondition for producing one answer on
  several.
- EVERY INPUT IS A REPOSITORY FILE. List what the path reads. PASSES when every
  entry is a file the repository carries and none is machine-local.
- PATH SEPARATORS DO NOT REACH THE ANSWER. PASSES when no published value is
  built from a filesystem path, since that is the one host difference that
  survives every other check on this list.
