---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-one-command-starts-an-unattended-machine
type: "[[requirement]]"
statement: When a machine is given the repository address, an iteration id and the entrypoint command, the entrypoint shall produce a walking agent on that machine, or exit non-zero naming the one step that failed.
kind: functional
characteristic: functional-suitability
verify_method: demonstration
breaks_if_removed: Starting a second machine needs a person who already knows the procedure, so the fleet cannot grow beyond the people who built it.
breaks_how_badly: fatal
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine step 1
  - uc-start-an-unattended-machine step 2
  - uc-start-an-unattended-machine step 3
  - uc-start-an-unattended-machine ext 2a
  - sty-work-on-two-machines
  - vp-the-engine
  - raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
priority: must
---

## Detail

THE STEPS THE ENTRYPOINT OWNS, in order, each one able to fail loudly.

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
as "the server is not there", which is the least informative symptom available
and points at the wrong step in six of the seven cases above.

IT INSTALLS WHAT IS MISSING AND NOTHING ELSE. The first cloud run installed
python3, make and g++, none of which was needed.

## The measure this row carries, and where it comes from

[[vp-the-engine]] already states it: acts from clone to first claimed
iteration, target two. This row is that target made into a demand.

## Why the method is demonstration rather than test

It is observed working end to end without instrumented capture, and the
observation needs a machine this one cannot make. That is
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]], owned by
the owner, with its Repayment written.
