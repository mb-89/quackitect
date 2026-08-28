---
minted_in: i36
id: tsp-native-project-tools-stay-outside-the-cage
type: "[[test-spec]]"
statement: A caged session exposes the se lane and the permitted web-search exception, and exposes zero native tools that can read, change, search or execute against the project.
method: test
verifies:
  - req-native-project-tools-stay-outside-the-cage
files:
  - tests/cage.test.ts
---

## Scope

The tool inventory a caged session actually presents. Two claims, and they
pull in opposite directions, which is why both are checked.

- NOTHING NATIVE REACHES THE PROJECT. No native read, write, search or
  execute tool survives the cage.
- ONE EXCEPTION SURVIVES. Native web search stays, where the harness offers
  it, because it runs on the provider's backend and cannot be self-hosted
  without a key.

WHAT IS DELIBERATELY OUT. Whether the lane's own replacements are as good as
the tools they displace. That is a comparison, not a containment check.

## Approach

DESIGN METHOD: a decision table over two axes — does the tool touch the
project, and is it the named exception. Four cells, and only one of them
permits the tool through.

The inventory is read from the cage file the host actually loads, never from a
list written beside it. A test that checks a second copy proves the copy.

LEVEL: integration, because the claim is about what the HOST ends up holding,
not about what the cage file says.

DEPTH: high. A hole here is silent and total: the agent keeps working, the
work simply stops being logged, and nothing in the session looks wrong.

## Steps

Every case in `tests/cage.test.ts` is one step. Six cases stand there today.

TWO ARE ALREADY GREEN and they carry part of this requirement.

- Native web search is preserved as the one research exception.
- The cage template is the file the installer places, and it parses.

THE THREE BELOW ARE RED TODAY. The existing cases check the cage FILE; none
enumerates the resulting inventory.

- The live inventory of a caged session contains zero native tools that can
  read the project.
- It contains zero native tools that can write, patch, search or execute
  against the project.
- It still contains the permitted native web-search tool when the harness
  provides one, and omits it silently when the harness does not.

## Why the inventory and not the file

The cage is a list of names handed to a host. Whether the host honours every
name is the host's behaviour, and hosts differ — one takes the list on its
command line, another reads it from a settings file.

Checking the file proves the list was written. Checking the inventory proves
the list took effect, and that is the claim the requirement makes.
