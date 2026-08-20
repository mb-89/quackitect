---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: tsp-unattended-start
type: "[[test-spec]]"
statement: One command takes a bare machine to a walking agent on a named iteration, or exits non-zero naming the single step that failed, observed end to end on a host nobody prepared.
method: demonstration
verifies:
  - req-one-command-starts-an-unattended-machine
files: none — a demonstration is observed on a host, not run from a file in this repository
---

## Scope

THE SIX STEPS OF [[el-entrypoint]], observed as one run rather than as six
checks.

WHY A DEMONSTRATION AND NOT A TEST. The claim is that a machine NOBODY
PREPARED reaches a walking agent. A test on a prepared machine cannot make
that claim, because the preparation is the thing under test.

## Procedure

WHAT IS DONE, in order, by a person with a fresh host and nothing else.

- Take a host with a shell and no product on it.
- Run the published entrypoint with two arguments: the repository address and
  an iteration id.
- Watch, and touch nothing.

WHAT IS WATCHED FOR, at each step.

| step | pass | fail |
| --- | --- | --- |
| verify | the runtime is present, or the pinned version is named as missing | any message that does not name the runtime |
| install | the project installs and nothing else does | python3, make or g++ appearing |
| start | the lane answers AND the command returns | the command not returning |
| wait | the health check is waited for | a race, or a fixed sleep |
| fetch | trunk arrives, and the named record's folder is on it | a refspec error not naming the refspec |
| launch | a caged walker is running | an agent with no cage on its command line |

THERE WAS A SEVENTH STEP AND i34 DELETED IT. `adopt` claimed the iteration for
the machine, and its watch line read "the named iteration is claimed, or the
holder is named". The claim system is retired whole, so there is nothing to
claim and no holder to name.

## The pass line

TWO THINGS, BOTH OBSERVED.

- A walking agent exists on that machine, on that iteration, with nobody
  having typed anything after the one command.
- OR the run exited non-zero and its last line names exactly one of the six
  steps.

ANYTHING ELSE IS A FAIL, and the most important anything-else is a run that
hangs. That is not a third outcome; it is the first one failing quietly.

## What this spec already knows will be watched hardest

THE `launch` STEP, because it is the only one whose success cannot be seen
from the outside. Every other step prints and exits. This one must leave an
agent walking, and a machine that prints `launch: ... walking` while nothing
walks looks exactly like a success.

THE `start` STEP, for a different reason than this spec first recorded. It
carried a measurement of 45,600 ms and a conclusion that the command never
returned. That measurement is RETRACTED:
[[exp-does-a-backgrounded-lane-release-its-caller]] re-timed the parent process
itself at 74 ms and carries both numbers.

WHAT STILL MAKES `start` WORTH WATCHING is the POSIX detach, which is a
different question. [[exp-the-posix-branches-have-never-run]] found that the
engine asks for detaching only when the platform is not win32, so the target
platform takes a branch that has never executed.

SO THIS DEMONSTRATION IS ALSO THE FIRST RUN of that branch, and its failure is
an expected finding rather than a surprise.

## What blocks it today

THE HOST. This spec cannot be observed on the machine that wrote it, and it is
carried by
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]], owned by
the owner.
