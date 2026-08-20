---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: dsp-the-install-preflight
type: "[[design-spec]]"
statement: One read-only check runs every precondition before the install writes anything, names each missing tool with its version and where to get it, and changes nothing on disk whether it passes or fails.
realizes:
  - el-preflight
files:
  - project/deliverable/engine/bin/preflight.ts
---

## NOT BUILT YET as an INSTALL-time command — what exists is the boot check

THIS SPEC CLAIMED `engine/bin/install-preflight.ts` FROM i9 AND NOTHING EVER
LANDED THERE. `trace-design` caught it in i38, and only because that iteration
added interface crossings elsewhere and pulled this spec into the check's scope.

WHAT STANDS IS `engine/bin/preflight.ts`, THE BOOT CHECK. It runs precondition
checks and refuses on a missing hard dependency, which is the same SHAPE at a
different moment: boot rather than install. The claim now names it.

THE DIFFERENCE IS THE MOMENT AND IT IS THE WHOLE POINT OF THIS DESIGN. A boot
check keeps a broken machine from WALKING. An install check keeps a
half-installed machine from EXISTING, which is the property the graft lost when
it removed the declared image.

WHAT TO DO INSTEAD, TODAY: `engine/bin/se-arrive.ts` performs the arrival's own
runtime check, and `bin/preflight.ts` runs at boot. Neither runs before an
install's first write, so `req-setup-stops-before-partial` is met by nothing.

WHEN IT IS BUILT, one command will run before the installer's first write and be
available afterwards on its own, answering with a list rather than a verdict.

## Responsibility

KEEP THE HALF-INSTALLED MACHINE FROM EXISTING, without a container runtime.
The design this iteration chose was built on a declared image, where a
half-install is unrepresentable because an image either built or it did not.
The graft replaced the image with one command, and this is how that property is
kept.

WHAT IT DOES NOT DO. It does not install anything and it does not verify that
an install succeeded. Running before, and changing nothing, is a property the
stop-before-partial requirement depends on. Verifying afterwards belongs to the
entry point.

## Interface

ONE COMMAND, run by the installer before its first write and available
afterwards on its own. It answers with a list rather than a verdict: every
check, its result, and for a failure the remediation.

COMPLETE HAS A NAMED STANDARD RATHER THAN A WISH, taken from a health check
that is roughly two hundred lines.

- Every check runs. It never stops at the first miss.
- Each tool is named with its version, and the constraint is stated in words.
- Required is split from optional, so an absent optional tool is a warning.
- The remediation command is carried in the source.
- Nothing on disk changes.

## Behavior and constraints

ONE TENSION IS OPEN AND THIS SPEC DOES NOT CLOSE IT. Carrying the remediation
means the PERSON installs the missing tool. The setup floor demands the command
install every further dependency itself. Those pull against each other, a
second hand found it while scoring, and it cost a point on that axis.

WHERE THE LINE FALLS IS A BUILD DECISION and it is named here rather than
assumed: which tools the command installs, and which it reports.

THE RUNTIME CHECK IS A PIN AND NOT A FLOOR. A separate experiment found the
declared floor is the version where stripping types became possible behind a
flag, and the engine passes no flag. So the check compares against a pinned
version rather than a floor, or it passes a runtime that then fails as a syntax
error deep in a spawned script.

## Rationale

NO INSTALLER IN THE SCAN DOES THIS, and that was learned by checking rather
than assumed. The most-used installer on the platform aborts on architecture,
operating system and permissions before touching anything, then creates and
chowns its whole tree, and only THEN aborts on a missing tool. That is failing
halfway.

THE WORKING EXAMPLES ARE HEALTH CHECKS RATHER THAN INSTALLERS, which is where
this element takes its shape from.

WHAT THAT EXAMPLE PAID THAT WE HAVE NOT: being wrong in front of users often
enough to learn which checks matter and how to word them.

THE DECISION IS raid-dec-install-is-one-command-behind-a-complete-preflight,
and it records that the stop-before-partial property becomes a build rather
than a guarantee. A preflight can be incomplete in a way an image cannot, and
that is what the graft spent.
