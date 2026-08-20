---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: el-arrival
type: "[[element]]"
statement: "SUPERSEDED at i9, 2026-08-19, and folded into el-entrypoint: takes a clone that has no lane and produces a lane an ALREADY-RUNNING agent can attach to, with the means to call it, or reports which step failed and leaves the session standing."
kind: new
realization: make
group: the-bootstrap
superseded_by: el-entrypoint
implements: []
source_refs:
  - uc-arrive-on-an-unattended-machine
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
  - req-the-arrival-never-costs-the-session
  - req-arriving-twice-changes-nothing
  - raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
---

## Black box

IN: a session starting on a clone that has no lane.

OUT: a lane answering with the dial it was started on, a client the agent can
call it with, and an account of every step. Or the account alone, naming the
step that failed, with the session still running.

## Why it is not [[el-entrypoint]]

THE TWO SHARE FOUR FUNCTIONS AND DIFFER AT THE END, and the difference is what
makes them two elements rather than one with a flag.

el-entrypoint ends by LAUNCHING an agent process and exiting non-zero on
failure. This one ends by HANDING BACK a lane to an agent that already exists
and must exit zero whatever happens, because it runs as a session-start hook
and a hook that ends a session is worse than the hand-work it replaces.

A step that exits the process is the wrong shape for one that has to report.

## The debt this element carries

FOUR FUNCTIONS ARE IMPLEMENTED TWICE, here and in el-entrypoint: the refs, the
runtime judgment, the dependencies and the cage. Nothing compares the two, and
the cage is the one where a drift is silent.

[[raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them]] holds it,
with the repayment written: one shared module, and a test asserting both place
the same bytes.
