---
unreachable_refs:
  - cand-nothing-can-be-forgotten
minted_in: i9
id: el-preflight
type: "[[element]]"
statement: Runs every precondition check before the install touches anything, names each missing tool with its version constraint and where to get it, and changes nothing on disk whether it passes or fails.
kind: new
realization: make
group: the-bootstrap
implements:
  - fn-run-a-governed-walk.stand-up-a-product
satisfies:
  - req-setup-stops-before-partial
  - req-setup-floor-editor-shell
source_refs:
  - cand-nothing-can-be-forgotten
  - raid-dec-install-is-one-command-behind-a-complete-preflight
---

It exists because the graft removed the declared image, and the image was what
made a half-installed machine impossible. A preflight is how that property is
kept without a container runtime.

COMPLETE HAS A NAMED STANDARD RATHER THAN A WISH, taken from `mason.nvim`'s health
check, which is roughly two hundred lines.

- Every check runs. It never stops at the first miss.
- Each tool is named with its version, and the constraint is stated in words.
- Required is split from optional, so an absent optional tool is a warning.
- The remediation command is carried in the source.
- Nothing on disk changes.

NO INSTALLER IN THE SCAN DOES THIS. Homebrew's own script aborts on architecture,
operating system and permissions before touching anything, then creates and
chowns its tree, and only then aborts on missing git. The working examples are
health checks rather than installers, which is where this element takes its shape
from.

ONE TENSION IS OPEN AND IS NOT THIS ELEMENT'S TO SETTLE ALONE. Carrying the
remediation means the PERSON installs the missing tool, and the setup floor
demands the script install every further dependency itself. Where the line falls
between what is installed and what is reported is a design question this element
raises rather than answers.

Boundary: the interfaces the element matrix mints for its flows.

Realization: one read-only check command, run by the installer before its first
write and available afterwards on its own.
