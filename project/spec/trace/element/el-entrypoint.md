---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: el-entrypoint
type: "[[element]]"
statement: Takes a repository address, an iteration id and one command, and produces a walking agent on that machine — or exits non-zero naming the single step that failed.
kind: new
realization: make
group: the-bootstrap
implements:
  - fn-run-a-governed-walk.stand-up-a-product
source_refs:
  - req-one-command-starts-an-unattended-machine
  - req-the-lane-runs-without-a-console
  - cand-the-host-is-declared
  - uc-start-an-unattended-machine
---

## What it does

SEVEN STEPS, IN ORDER, each able to fail loudly and name itself.

| step | what it does | how it fails |
| --- | --- | --- |
| verify | checks the runtime it needs is present | names the missing runtime |
| install | installs the project and nothing else | names the failing install |
| start | starts the lane with the panel suppressed | names the start failure |
| wait | waits for the health check rather than racing it | names the timeout |
| fetch | brings the iteration refs into the clone | names the refspec |
| adopt | claims the named iteration | names the holder, or warns unclaimed |
| launch | starts the caged walker with the cage on its command line | names the cage |

ONE SENTENCE, NAMING ONE STEP. Every failure of the first cloud run presented
as "the server is not there". That symptom points at the wrong step in six of
the seven cases above.

IT INSTALLS WHAT IS MISSING AND NOTHING ELSE. The first cloud run installed
python3, make and g++, none of which was needed.

## What it does not do

IT DOES NOT SERVE STEPS. It launches the agent and stops. The walk engine
serves every step after that.

THAT NARROWNESS IS DELIBERATE. A first draft had this element implementing
`serve-a-step`, and the engine computed owed boundaries into the method
compiler and the account from it. Starting a walker is not walking.

## Why it is its own element rather than part of bootstrap

BOOTSTRAP STANDS UP A PRODUCT. This drives a machine into WORK on a named
iteration, which is three steps further: fetch, adopt, launch.

BOTH IMPLEMENT THE SAME FUNCTION, and that is legal. The spread is the
information: standing a product up and putting an agent to work on it are one
question for a person and two mechanisms underneath.

## What crosses its boundary

- IN: a repository address, an iteration id, and the host it runs on.
- OUT, to the claim ledger: the adopt step's claim.
- OUT, to the walk engine: a launched agent with the cage on its command line.
- OUT, to whoever ran it: an exit code, and one sentence naming a step.

## Realization concept

A script the host runs. Whether the runtime arrives by a declared image or by
the verify-and-install steps is NOT decided yet, and this element is written so
either can fill it.

## What is not settled

THE IMAGE QUESTION. [[cand-the-host-is-declared]] would delete verify and
install by declaring the runtime, and it was not adopted. A bare host with a
shell and nothing else cannot use an image at all, which is exactly the host
[[nbr-cloud-host]] describes. The decision is owed before this element is
built.
