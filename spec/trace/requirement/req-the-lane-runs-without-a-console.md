---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-the-lane-runs-without-a-console
type: "[[requirement]]"
statement: While the lane is serving, the engine shall continue running after its standard input closes, and shall refuse to start when another instance of this engine holds its port, naming the holder.
kind: functional
characteristic: reliability
verify_method: test
breaks_if_removed: An unattended run dies the moment it is backgrounded, and a careless restart takes a live session's port and splits one walk into two.
breaks_how_badly: fatal
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine step 3
  - uc-start-an-unattended-machine ext 3a
  - uc-start-an-unattended-machine ext 3b
  - nbr-cloud-host
priority: must
weighs_with:
  - req-work-starts-without-a-reachable-remote ! — one is the process surviving stdin close and port conflict, the other is listing/entering work offline; different failure modes under the same use case
---

## Detail

ONE CONCERN, TWO FACETS. Both are the lane surviving with nobody watching it,
and both fail the same way: the process is gone or it is the wrong process.

| facet | today | after this row |
| --- | --- | --- |
| standard input closes | treated as shutdown, so backgrounding kills it | serving continues |
| the port is held by this engine on this root | the holder is killed and the port taken | the start refuses, naming the holder |
| the port is held by anything else | not distinguished | the next port is taken, per uc-install-quackitect ext 3a |

THE TWO PORT CASES ARE DIFFERENT AND BOTH ARE CORRECT. Moving aside from our
own engine would silently split one session into two. Moving aside from an
unrelated process is ordinary courtesy.

THE WORKAROUND THIS RETIRES: the first cloud run held standard input open with
`sleep infinity`, because backgrounding was the only unattended shape and it
killed the server.

## Behaviour

    (nothing) -> serving:  the entrypoint starts the lane
    serving   -> serving:  standard input closes, nothing happens
    serving   -> refused:  a second start finds this engine on the port
    serving   -> stopped:  the host stops, which is the expected cloud ending

## Why a model earns its place here

The port case is a MISSING TRANSITION rather than a condition and a response.
Prose about killing and taking never showed that the two port cases are
different situations, which is the whole content of this row.
