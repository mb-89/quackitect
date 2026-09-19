---
kind: [[ticket]]
state: open
urgent: true
depends_on:
  - the-runtime-folder-holds-state
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
group: the-bridge-keeps-transport
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
---

# Ask

A cloud session opens with no cage. Level zero loads and the bridgehead posts
its first event. The server behind it stays down, so no rule, no brief and no
canary reaches the session.

The bridgehead says why in one `warn` line and carries on.
[[spec/design_output/level0#the-bridgehead-starts-it-too]]

Measured on a cloud box, on a session opening at 14:33:

| the step the start road takes | what it answered |
|---|---|
| a cloud variable stands | yes |
| the method root stands | yes |
| node stands | yes |
| `test -d node_modules` | no |

So the road ends at code 6, and the server runs nowhere.

The install stands ready. `npm install` answers in under a second there, and
`src/scripts/install.sh` answers `0` in about eight seconds under the skip list
the design names. It leaves the modules, Vale, Biome, vale-ls and the git hooks
where the cage wants them.

The order is what breaks:

| what the setup writes | where it lands | what the clone does |
|---|---|---|
| the trust flag | the home of the box | leaves it standing |
| the modules, and the installed binaries | the tree | replaces the tree, and git ignores both |

A cloud box clones the repository fresh when the container starts. So the half
of the setup writing outside the tree stands. The half writing inside it goes.

The gain is a cloud session holding its rules. The doors, the brief, the stop
hook and the canary all ride on the server. The server rides on the modules. An
install running after the clone puts them there.

A session lacking one runs uncaged:

| the door | what it reads with the server down |
|---|---|
| the write door | nothing |
| the voice rules | nothing |
| the stop hook | nothing |

Such a session reads exactly like one that works. A routine fires into that box
and works a whole turn outside every rule this tree holds.

- a fresh cloud clone answers `test -d node_modules` with yes before the first tool call
- `.se/log/serve.log` names the server on a session that ran no verb
- the first answer of a fresh cloud session carries the canary
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

Two roads stand, and the owner picks:

| the road | what changes | what it reaches |
|---|---|---|
| the bridgehead installs | code 6 runs the install, and the server starts behind it | every box, because it asks the environment for nothing |
| the setup runs after the clone | the cloud environment runs its script once the tree stands | the boxes carrying that script |

The first road moves a ruling the design states by name: *the bridgehead
installs nothing, the setup installs*.
[[spec/design_output/level0#the-bridgehead-starts-it-too]]

That ruling reads as one about ordering. The bridgehead imports nothing and
runs one shell line, and an install is more than a line. What the first road
costs, measured:

| the session | what the install costs it |
|---|---|
| the first on a fresh clone | the eight seconds measured above |
| every one after it | nothing, and the modules stand in a tree the clone leaves alone |

The second road touches this repository nowhere, so this repository checks it
nowhere. An environment somebody rebuilds arrives uncaged again, and says so in
a log alone.

The two stand together. A box carrying both installs once, and finds the
modules standing the next time.

Either road leaves two things open:

- The setup script stands in the design note as prose. The copy an environment
  carries is a paste nobody diffs, and a tracked file of its own closes that
  drift.
- `the-session-says-its-cage` carries the other half. A session missing the
  cage says so where a person reads it, and the log line stays for the record.
