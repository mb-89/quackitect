---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-asm-a-host-keeps-a-backgrounded-lane-alive
type: "[[raid]]"
kind: assumption
statement: A cloud host keeps a backgrounded lane running after the command that started it returns, rather than reaping it with its session.
owner: the driving agent
trigger: the first unattended run on a host whose process supervision differs, and any change to how the entrypoint detaches the lane
status: open
impact: The entrypoint reports success and exits, the host reaps the lane with the session, and the walk stops with nothing having gone visibly wrong. It reads exactly like the server-is-not-there symptom this iteration exists to remove.
breaks_how_badly: fatal
how_likely: plausible
probe: "holds on this host. i35 on 2026-08-17: the detached lane kept answering after the shell that started it exited. ONE FAILURE MODE FOUND AND IT IS NOT A REAP: a stdio lane exits on stdin EOF, which is correct. The headless lane has no such input to lose."
probed: "2026-08-17"
source_refs:
  - req-the-lane-runs-without-a-console
  - nbr-cloud-host
  - uc-start-an-unattended-machine
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

START THE LANE THE WAY THE ENTRYPOINT WOULD, then end the starting session and
ask whether the lane still answers.

- Start it detached, exactly as the entrypoint will.
- Close the shell that started it.
- Ask the health endpoint whether it is there, from a new connection.

THREE ANSWERS, and they are not equally good.

- It answers. The assumption holds on that host.
- It is gone. The assumption is false, and the entrypoint needs the host's own
  supervision rather than a background job.
- It answers and then dies later. Worse than either, and it means the probe
  must wait long enough to see it.

WHAT WOULD FALSIFY IT: one target host where the lane does not survive the
session that started it.

## Why it is separate from the console assumption

req-the-lane-runs-without-a-console demands that the ENGINE not treat a closed
standard input as a shutdown. That is ours to fix and it is a decision.

THIS IS THE OTHER HALF AND IT IS NOT OURS. Even a well-behaved engine is
reaped if the host reaps its session's children. The first cloud run held
standard input open with `sleep infinity`, which worked and told us nothing
about which half was the problem.
