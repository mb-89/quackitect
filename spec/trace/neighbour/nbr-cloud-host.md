---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: nbr-cloud-host
type: "[[neighbour]]"
statement: A cloud host - a machine nobody has configured, reached over a network, which exists to run a walk and then stops existing.
direction: both
---

## Why it is a neighbour and not a setting

THE SYSTEM DOES NOT OWN IT. A cloud host is provisioned outside the product,
by somebody else's control plane, and the product is a guest on it. That is
the test for a neighbour: the box talks to it and does not contain it.

Treating it as a setting is what produced a committed handover document
telling a future agent which packages to install. A setting is configured. A
neighbour is talked to.

## What makes it different from [[nbr-peer-machine]]

A PEER IS AN INSTALL. A CLOUD HOST IS A MACHINE. The peer relationship is
about two engines sharing a remote and respecting each other's claims. This
one is about a bare machine becoming an install at all.

Every cloud host becomes a peer the moment it works. What this node carries is
everything before that moment.

## Interface

WHAT CROSSES INTO THE HOST, and each piece is one command's worth:

- The repository, by clone.
- One iteration id.
- One entrypoint invocation.

WHAT CROSSES BACK:

- Pushed branches, which is how its work returns.
- Claims, which is how it stops two machines colliding.
- Its own retro, packed into backlog rows and register entries, because a
  cloud session ends and everything it learned must travel without it.

WHAT MUST NEVER CROSS: a prose handover. Procedure is run, not interpreted,
and a committed handover was already found false in three places that mattered.

## The properties that make it hard

- IT IS UNCONFIGURED. Node may be absent, the toolchain may be absent, and
  nothing may be assumed present.
- IT IS UNATTENDED. Nobody is at the keyboard, so a step that asks a question
  parks the run forever.
- IT IS EPHEMERAL. It stops without closing anything, so an ending that
  depends on a clean shutdown is an ending that does not happen.
- IT HAS NO SESSION TO WAKE. A finished background job cannot reach the agent,
  because the agent holds no connection to be reached on.

## Where the demands land

The one-command entry, the health answer, the port lifecycle, and the
authorised-in-advance gate all exist because of the four properties above.
Each is scope in the iteration that minted this node.
