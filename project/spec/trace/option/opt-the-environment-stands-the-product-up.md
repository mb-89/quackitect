---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: opt-the-environment-stands-the-product-up
type: "[[option]]"
statement: The product never installs itself. A declared image or devcontainer arrives with the runtime and the product already in it, so the bootstrap cluster has nothing left to do.
cluster: the-bootstrap
found_by: without
source: "trimming the-bootstrap: what if standing the product up does not exist, and who does its job"
---

## Mechanism

THE ENVIRONMENT IS DECLARED, NOT SCRIPTED. A container definition names the
runtime version and the product, and whatever creates the host builds from it.
The machine that boots is already able to run.

- No verify step, because the runtime is in the image.
- No install step, because the product is in the image.
- The entrypoint shrinks to two acts: fetch the iteration, start walking.

## Who takes over the job

THE ENVIRONMENT. Somebody else's control plane already solves reproducible
machine setup, and this is the finder's own third answer: we were
reimplementing something outside the system already does.

## What it sheds

FOUR OF THE ENTRYPOINT'S SEVEN STEPS, and with them the runtime-version
assumption entirely. raid-asm-the-installed-runtime-is-one-the-engine-runs-on
stops being a risk, because the version is a line in a file rather than
whatever a host's package source offers today.

IT ALSO SHEDS THE HALF-INSTALLED STATE. An image either built or it did not,
so there is no partial machine to detect.

## What it costs

IT MOVES THE PROBLEM RATHER THAN REMOVING IT, and that is the honest
objection. Building and publishing the image is work somebody does, and
keeping it current with the product is a second thing that can drift.

IT NEEDS A CONTAINER RUNTIME, which the bare shell this iteration targets may
not have. A host with a shell and nothing else cannot use an image, so this
option changes the precondition rather than meeting it.

AND IT DOES NOT SERVE THE LOCAL CASE. An engineer installing on their own
laptop is uc-install-quackitect, and telling them to run a container to get an
editor extension is worse than the script they have.

## Where it sits against the others

IT IS NOT EXCLUSIVE. An image can exist AND the script can exist, serving the
cloud host and the laptop respectively. The chart should carry that
combination rather than treating this as a replacement.

THE PRIOR ART SUPPORTS IT. Devcontainers are exactly this mechanism, and the
M1 comparison already recorded that they give a declared environment a fresh
machine reproduces, which is the half of our bootstrap that is prose today.
