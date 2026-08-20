---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: el-entrypoint
type: "[[element]]"
statement: Takes a repository address, an iteration id and one command, and produces a walking agent on that machine — or exits non-zero naming the single step that failed.
kind: new
realization: make
group: the-bootstrap
satisfies:
  - req-the-editor-is-the-only-entry-point
  - req-a-folder-is-driven-only-with-consent
  - req-the-desk-is-usable-soon-after-the-folder-opens
  - req-fresh-machine-runs
implements:
  - fn-run-a-governed-walk.bring-the-product-up
  - fn-arrive-on-a-machine.resolve-the-cited-refs
  - fn-arrive-on-a-machine.judge-the-runtime
  - fn-arrive-on-a-machine.supply-the-dependencies
  - fn-arrive-on-a-machine.place-the-cage
  - fn-arrive-on-a-machine.raise-the-lane
  - fn-arrive-on-a-machine.hand-over-the-means-to-call
  - fn-arrive-on-a-machine.account-for-the-arrival
  - fn-arrive-on-a-machine.state-which-build-this-is
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
| verify-ready | waits for the health check, then asserts the installed system answers, then says ready | names the timeout, or the check that did not answer |
| fetch | brings the iteration refs into the clone | names the refspec |
| adopt | claims the named iteration | names the holder, or warns unclaimed |
| launch | starts the caged walker with the cage on its command line | names the cage |

ONE SENTENCE, NAMING ONE STEP. Every failure of the first cloud run presented
as "the server is not there". That symptom points at the wrong step in six of
the seven cases above.

IT INSTALLS WHAT IS MISSING AND NOTHING ELSE. The first cloud run installed
python3, make and g++, none of which was needed.

## Verifying itself after the install

THE STEP ABOVE CARRIES THE HALF NOBODY OWNED. `req-fresh-machine-runs` asks for
three things in sequence: the system installs, verifies itself, and reports
ready. Its scenario names the installed system AND its self-verification as the
artifact. Until 2026-08-19 no element claimed that, and the architecture gate
found the hole rather than the build.

IT IS NOT THE PREFLIGHT, and the distinction is load-bearing.

- [[el-preflight]] runs BEFORE the install and changes nothing on disk. That is
  a property `req-setup-stops-before-partial` depends on.
- This step runs AFTER, against a machine that has been written to. It asks
  whether what was installed actually answers.

WHY IT LIVES HERE RATHER THAN IN A NEW ELEMENT. The winner merges the
unattended arrival into the bring-up path, so one path serves the person at a
fresh machine and the machine with nobody at it. This element IS that merged
path. A separate verification element would give the merged path a second
place to be right, which is the thing the merge exists to prevent.

WHAT IT DOES NOT SETTLE. How much the check covers. Answering the health
endpoint is the floor, not the bar, and the requirement's demonstration measure
is that the demo runs on the first attempt. Where that line falls is M7's.

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
