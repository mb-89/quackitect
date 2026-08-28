---
form: write-requirements
by: agent
signed_off: 2026-08-19T11:16:06.800Z
reopened: 2026-08-19T11:15:42.876Z — a row I wrote in this state duplicated a standing one; splitting it into the reader half changed its kind to quality, and the six-part scenario was owed
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

Five requirement rows are new. None of the standing register is changed.

One row derives from the new use case's steps. Four are cross-cutting rows that name the passes they protect, because their items have no journey of their own.

The sixth scope item — the test split — deliberately gets no row. Its demand already stands.

## register

- req-the-entrypoint-answers-its-version-without-starting
- req-the-actor-is-recorded-where-the-call-is-served
- req-a-preflight-check-asks-the-reader-where-it-looked
- req-an-empty-live-source-names-itself
- req-the-panel-s-paint-says-which-kind-of-green-it-is

## set_criteria

- complete: Every step and extension of uc-prove-an-install is covered by the version row, including extension 2a — an unreadable manifest answering `unknown` — which the row's Detail carries. WHAT HAS NO ROW, named rather than hidden: the test split. It is a measurement whose outcome may be that nothing is built, and a requirement demanding a split before the measurement exists would be the design-frozen-as-obligation the method forbids. The battery's cost is already governed by req-test-scope-discipline.
- consistent: No two rows conflict, and the one place they could was checked. The preflight row demands ONE occurrence of a configuration path; it does not demand that the silent fallback go, and it says so in its own Detail. Those two would contradict each other if the row were written loosely, and they do not. Every term used across the five — actor, source, paint, manifest — means one thing in all of them.
- affordable: Five rows, each verifiable by a test that exists in one file. Four of the five are asserted by reading one rendering or one exit code. The most expensive is the paint row, and its cost is three assertions rather than a harness.
- bounded: Every row answers to a source that is named in it — an owner ruling, a pool note with its id, or a line of code quoted with its file. None of them widens past what scope-non-goals took on. The wider families two of them belong to are named in their Detail and explicitly left out.
- comprehensible: A reader from any discipline can say what the system must do from these five alone: it can be asked its version without being started, it records who called rather than guessing, it holds a path once, it says when an offer is empty, and it paints three kinds of proof differently. None of them needs the code to be understood.
- no_tbd: Zero. None of the five rows carries TBD, TBC, TBR or a question mark, and none carries a number that was inferred rather than counted. Every measure on them is something a test produces: a line count, an exit code, a socket count, an occurrence count.
- behaviour_modelled: LOOKED AT ON EVERY ROW, and none wanted one. Each of the five is one condition and one response, which the method names as the case where a model restates the statement in a second notation that can then drift. The three candidate shapes were checked against: no row has two parties exchanging in a fixed order, none has a thing moving between states, and none has something created, used and retired. Each row says this in one line under its own Behaviour heading rather than leaving the absence unexplained.

## follow_up

M4 derives functions from these rows, and the must row is the one that gates candidates.

FOUR ROWS ARE `should` AND ONE IS `must`. That split is deliberate: only the version flag carries an owner ruling that makes it obligatory, and priority inflation would leave M4 unable to tell any candidate from another.

identify-assumptions is where the register gains what these rows lean on. One is already visible: the preflight row assumes a reader can be asked where it looked without a circular import, and nobody has checked that.

## anything_else

WHY THE PAINT ROW IS ONE ROW AND NOT THREE. The method's split rule is that detail verifying DIFFERENTLY becomes a sibling row. All three paint rules verify by inspecting one rendering and they fail together the moment two paints collide. The Detail table carries each rule as a binding line, which is the fold the method describes.

WHY NO ROW HAS A BEHAVIOUR MODEL. Each row is one condition and one response. The method's own test is whether a model says something the statement and the Detail cannot, and for these it does not — a diagram would restate each row in a second notation that can then drift. Each row says so in one line rather than leaving the reader to wonder.

NO TBD, TBC, TBR OR QUESTION MARK survives in any of the five. Every number in them is a count that a test can produce, not an inferred tolerance.

ONE ROW WAS REWRITTEN AFTER THIS STATE FIRST SIGNED, and that is why the claim was reopened rather than amended. The actor row as first written restated a standing demand — req-acts-carry-role-and-channel already says the engine shall stamp every recorded act with the acting role. Two rows for one concern is the fork the method forbids.

WHAT IT BECAME. The row now carries only the READER's half: nothing may derive a role for a record that has one. The two verify differently — the standing row is checked by inspecting a written record, this one by inspecting every reader — which is exactly the method's sibling test, and `weighs_with` names the shared axis so a later reader finds both.

WHERE THE FINDING WENT. That the standing row is not met today is recorded as raid-iss-a-recorded-act-carries-no-acting-role, not in any requirement's body. Verification status belongs in evidence.
