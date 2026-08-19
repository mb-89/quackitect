---
form: identify-assumptions
by: agent
signed_off: 2026-08-19T11:18:22.107Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

Three assumptions are new. Nine register entries now stand for this record.

The sweep ran over the five requirements this delta wrote, one named source at a time. Three sources turned up nothing, and each says why.

None of the three is probed. Each carries the check that would settle it, written now rather than when somebody gets round to it.

## assumptions

- raid-asm-nothing-outside-the-engine-parses-a-call-log-record
- raid-asm-the-test-runner-gives-each-file-its-own-process
- raid-asm-a-host-shows-the-output-of-a-command-that-exits-at-once

## sweep

- environment: ONE FOUND. The actor row adds a key to every call-log record written from now on, and nothing has established that no reader outside this engine parses one. Recorded as raid-asm-nothing-outside-the-engine-parses-a-call-log-record. The candidate falsifier is the editor extension, which is a separate build.
- toolchain: ONE FOUND. The test-split item rests on the runner giving each file its own process. The house guidance states it; nobody has measured it here. Recorded as raid-asm-the-test-runner-gives-each-file-its-own-process.
- host: ONE FOUND. The version flag prints one line and exits at once, and nothing has established that a host hands that output back. Recorded as raid-asm-a-host-shows-the-output-of-a-command-that-exits-at-once, with the cheap defence written into it — assert the LINE, never the exit code.
- platform: NONE, and the reason is that these five rows add no new platform surface. The version flag runs through the same unflagged TypeScript execution every other script already uses, and the standing entry raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from already covers what a fresh box can do. The POSIX branches remain unexercised, which is a standing finding of its own and not a new assumption of this delta.
- neighbours: NONE. Not one of the five rows touches a system outside this repository. No datasheet was taken on trust, because none was consulted.
- people: NONE, deliberately, and this is the one worth defending. The paint row and the empty-source row both change what a reader is told, so they look like people-assumptions. They are not: neither leans on the reader's skill or patience. They lean on the reader being able to TELL TWO THINGS APART, which the rows state as measurable demands rather than assume — three distinguishable paints, one line naming the source.

## follow_up

probe-assumptions is next and it owes an answer on every standing assumption, not only these three.

TWO OF THE THREE CAN BE PROBED HERE. The log-reader search costs one call. The test-runner premise costs one measurement, and that measurement is the same one the split item needs — so probing it and deciding the split are the same act.

THE THIRD CANNOT BE PROBED ON THIS MACHINE. It needs a host this container is not, and the honest probe result is a scheduled one with the cheap defence already built into the requirement.

## anything_else

WHAT WAS CONSIDERED AND IS NOT AN ASSUMPTION, so the next reader does not re-raise it.

THE CIRCULAR IMPORT. The preflight row demands that a check ask the reader where it looked, and that could mean preflight importing the renderer while the renderer imports nothing back. That is a design question we OWN and control, which makes it a decision to be taken at decompose-structure, not a condition to be assumed.

THE THREE SMELLS were run over the five rows.

- A NUMBER WITH NO SOURCE: none. Every measure on the five rows is a count a test produces — one line, zero readers, one occurrence, three paints.
- A "JUST" OR AN "OBVIOUSLY": none in any row's statement or Detail.
- A CAPABILITY NAMED WITHOUT A VERSION: one, and it became the toolchain entry. "The test runner" is a promise somebody else made, and no version pins the behaviour the split leans on.

THE KIND WAS CHECKED BEFORE EACH TITLE. None of the three has already happened, so none is an issue. The one thing in this area that HAS happened — the acting role not being recorded at all — was written as an issue at derive-functions, not as an assumption.
