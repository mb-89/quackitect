---
minted_in: i62-background-work-reports-its-own-end-the-
id: flow-workspace-hold
type: "[[flow]]"
statement: the exclusive claim one instance has on a workspace, held only while that instance is alive
kind: signal
crosses: in
source_refs:
  - req-one-instance-holds-a-folder-and-its-port
  - fn-run-a-governed-walk.hold-a-workspace-alone
---

## What it holds

Whether this workspace is being served, and by what.

## It cannot outlive its holder

That is the whole demand on this flow. A claim that survives the instance that
made it turns a recoverable crash into a workspace nobody can start in, and on
an unattended machine nobody is there to clear it.

So the flow is held by something that dies with the process, never written
down.

## What it is not

It is not a record of who is working where. Two people on two copies of a
project are outside this entirely, and one instance per copy is an assumption
in the register rather than a mechanism.
