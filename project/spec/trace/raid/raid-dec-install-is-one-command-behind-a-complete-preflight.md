---
minted_in: i9
id: raid-dec-install-is-one-command-behind-a-complete-preflight
type: "[[raid]]"
kind: decision
statement: "The product installs with one command and no wizard, behind a preflight that runs every check, names each missing tool with where to get it, and changes nothing on disk until all of them pass."
owner: the driving agent
trigger: "before the installer is built, and at the first report of a half-installed machine"
status: decided
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-one-script-installs
  - req-setup-floor-editor-shell
  - req-setup-stops-before-partial
  - req-fresh-machine-runs
  - "the graft at i9 M5, 2026-08-19 — this cell was taken from the runner-up and broke the tie"
---

## How this one arrived

IT WAS GRAFTED RATHER THAN COMPOSED. The winner was built on a declared image,
and the runner-up's install cell was taken at graft-onto-the-winner. That graft
moved a fresh machine running from 2 to 3 and the setup floor from 1 to 2, and
turned a seat held by a tie into a margin of one.

## Rejected options

A DECLARED IMAGE OR DEVCONTAINER ARRIVES WITH EVERYTHING IN IT.
[[opt-the-environment-stands-the-product-up]]. This is what the winner was
composed on, and it is the option this decision replaces. It made the
half-installed machine unrepresentable, which is the winner's own argument. It
was given up because it needs a container runtime, and the floor is an editor and
a shell. Its own node says telling an engineer to run a container to get an editor
extension is worse than the script they have.

NO INSTALLER, CLONE THE TEMPLATE.
[[opt-no-installer-clone-the-template]]. Rejected because it deletes everything
around the stop-before-partial check and leaves the check standing with nowhere
to live.

ONE SELF-CONTAINED BINARY PUBLISHED THROUGH EVERY CHANNEL.
[[opt-one-binary-published-through-every-channel]]. It arrived from a scan after
every line had picked and nobody visits it. Not rejected on merit: it is the cell
a fourth line would be built on, and the scan found our runtime is the wrong one
for it today.

## Consequences

THE STOP-BEFORE-PARTIAL PROPERTY BECOMES A BUILD RATHER THAN A GUARANTEE. A
preflight can be incomplete in a way an image cannot, and this decision spends
that.

COMPLETE HAS A NAMED STANDARD RATHER THAN A WISH. Every check run rather than
stopping at the first, each tool named with its version, required split from
optional, the version constraint stated in words, the remediation carried in the
source, and nothing changed. Anything less is not this decision.

ONE TENSION IS OPEN AND WAS FOUND BY THE SECOND HAND. The preflight standard
carries the remediation command, which means the PERSON installs the missing
tool. The setup floor demands the script install every further dependency itself.
Those pull against each other and nothing reconciles them yet. It cost a point on
that axis and it is a design question rather than a wording one.

### The prior-art back-check

THE ORIGINAL IS `mason.nvim`'s HEALTH CHECK, and it is roughly two hundred lines.

WHAT IT DOES BETTER: it exists. It also runs its checks concurrently and reports
all of them, splits required from optional so an absent optional tool is a warning
rather than a failure, and carries platform-specific remediation text.

WHAT IT PAID THAT WE HAVE NOT: being wrong in front of users often enough to learn
which checks matter and how to word them.

WHAT WE ONLY LEARNED BY CHECKING: no INSTALLER does this. Homebrew's own script
aborts on architecture, operating system and permissions before touching
anything, then creates and chowns its whole tree, and only THEN aborts on missing
git. The good implementations are health checks rather than installers, and an
earlier sweep here recorded that nobody did it at all, which was wrong.
