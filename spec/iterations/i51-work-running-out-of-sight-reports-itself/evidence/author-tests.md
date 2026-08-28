---
form: author-tests
by: agent
signed_off: 2026-08-21T10:55:43.182Z
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

Five requirements stand in this record's scope and every one of them is `verify_method: test`.

NONE WAS COVERED. A search of the standing test-specs found zero naming any of the five, so three new specs carry them.

TWO OTHER SPECS WERE READ BEFORE ANYTHING CLAIMED THEM. [[tsp-a-long-wait-is-never-a-guess]] and [[tsp-a-slow-signal-keeps-the-wait]] cover neighbouring demands about slow work, and neither covers a requirement of this record.

SIX RED CASES ARE WRITTEN, following i33's precedent in this state: author-tests writes the failing cases and observe-red records them.

EVERY CASE COMPILES AND FAILS FOR THE RIGHT REASON. Two drive a real function over a real fixture, two ask a real surface what it offers, and two read the source for a call shape no runtime value exposes.

## checks

- [[tsp-a-leaving-check-hands-the-call-back]]
- [[tsp-the-account-of-work-out-of-sight]]
- [[tsp-a-diff-nothing-answers-for-is-named]]

## follow_up

OBSERVE-RED IS NEXT and it records the six failures.

THREE MORE CASES ARE OWED and each is named in its spec's Steps rather than left implied.

- A timing case for the handback: the call returns inside a second while a long judgment runs. It waits for the mechanism.
- Boundary cases for the account: an empty list, a missing progress file, and an entry that finished unobserved.
- The middle scope partition: some parts map and some do not, so what maps runs while what does not is named.

THE TWO M5 FITNESS CANDIDATES ARE ALREADY CARRIED. [[req-work-past-its-bound-says-it-is-working]] belongs to `tsp-work-past-its-bound-signals` and its red cases stand in `tests/slow-work-signals.test.ts`. [[req-one-operation-reads-its-input-once]] is a standing row this record did not move.

## anything_else

ONE MAPPING WAS CHECKED AND REFUSED, which is the point of reading before claiming.

`deliverable/tests/slow-work-signals.test.ts` looked like a home for the account cases. Reading it showed both its cases assert on the PANEL for `req-work-past-its-bound-says-it-is-working`, which is a different surface and a different requirement.

SO NOTHING CLAIMED IT. A spec that named that file would have been fabricated coverage of exactly the kind the state's guidance warns about.

ONE FILE GAINED CASES RATHER THAN A NEW FILE. `tests/discipline.test.ts` already holds `decideScope`'s fixture and its sibling cases, and splitting one function's cases across two files would duplicate the fixture for no gain.
