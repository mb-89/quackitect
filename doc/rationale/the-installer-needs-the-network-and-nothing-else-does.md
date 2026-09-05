---
kind: [[rationale]]
title: the installer needs the network and nothing else does
explains:
  - util/setup/main.go
  - RUNME.sh
---

## decided

Installation may use the network. Nothing at runtime may require it, and nothing may require a language model. A fully offline install is not supported.

## why

The installer fetches a pinned toolchain and the packages the profile names. Making it work with no network would mean shipping those inside the method, which fixes the versions that travel and makes the copy large. So the install was allowed to assume a connection, and it says so rather than failing obscurely.

Everything after the install was held to the opposite rule. The engine is a program, and a program that needs the network to answer a guard fails at the moment the network does. The same holds for a language model. The engine decides what it decides on its own, so the agents above it can be absent and the tree still answers.

That split is what makes the system usable on a box with no connection and no model, which is the case the owner asked for.

## costs

A machine with no network cannot be installed, and an air-gapped case would need a route that does not exist. Holding the runtime to no network and no model rules out anything that would want either. A guard that needs a model to judge cannot be built at this layer.

## revisit when

- an air-gapped install is asked for
- a guard is proposed that needs a model to decide
- a runtime feature is proposed that cannot work without the network
