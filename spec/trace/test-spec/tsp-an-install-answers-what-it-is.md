---
minted_in: i5-engine-hygiene-one-version-source-every-
id: tsp-an-install-answers-what-it-is
type: "[[test-spec]]"
statement: The entrypoint answers which build it is, in one line, without opening a port.
method: test
verifies:
  - req-the-entrypoint-answers-its-version-without-starting
files:
  - deliverable/tests/version-flag.test.ts
---

## Scope

The entrypoint as a command, run the way a release check runs it: a spawn, an
answer, an exit.

WHY THIS LEVEL. The demand is about a PROCESS — what it prints and that it
comes back. A unit test around the version constant would prove the constant
and nothing about the flag, which is the half that does not exist.

## Approach

TEST-FIRST. Every case is RED at authoring time, because the flag does not
exist: `se-mcp.ts` carries `--help` and no `--version`, and i16 found that by
asking for it and starting a server instead.

THE EXIT IS THE PROOF THAT NOTHING STARTED. A spawn that answers and returns
cannot have opened a port and waited on it, so no case needs to inspect
sockets. The timeout is the backstop for the failure where it does.

## Steps

Each case in the named file is one step.

1. `--version prints the manifest's version and exits` — the printed line IS
   the manifest's version, compared against the manifest read in the test.
2. `--version answers with ONE line` — a release check compares a line, so a
   second line is a failure even when the first one is right.
3. `--version starts no lane: it needs no root and takes none` — run against a
   root that does not exist. The answer must come anyway, which pins the flag
   ahead of the root resolution rather than merely beside it.
4. `--help still answers, and it is not the version` — the guard on the fix. A
   new early-exit branch is exactly the shape that swallows the branch beside
   it, and the case also demands the flag appears in the help so it is
   discoverable.
