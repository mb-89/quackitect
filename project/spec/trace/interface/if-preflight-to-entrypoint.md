---
minted_in: i9
id: if-preflight-to-entrypoint
type: "[[interface]]"
statement: The preflight tells the bring-up path whether every precondition holds, and which do not, before the path changes anything.
source: el-preflight
destination: el-entrypoint
carries:
  - flow-toolchain
  - flow-scaffolded-product
form: call
source_refs:
  - decompose-structure at i9, the element matrix's owed cell
  - raid-dec-install-is-one-command-behind-a-complete-preflight
  - req-setup-stops-before-partial
---

The crossing that carries the property the graft had to rebuild. The declared
image made a half-done machine impossible; this crossing is how a command does
the same.

## What crosses

EVERY FAILED CHECK, NOT THE FIRST. That is the difference between this and what
most installers do, and it is the whole reason the preflight is its own element
rather than three lines at the top of a script.

EACH ONE NAMED, with its version constraint in words and where to get it.

## Why it is synchronous

THE ANSWER DECIDES WHETHER ANYTHING HAPPENS. Same shape as the write guard: the
caller waits because the result is permission rather than information.

## What it must never do

CHANGE ANYTHING. A preflight that installs while it checks is an installer, and
the requirement it serves says stop BEFORE changing anything. That constraint
belongs on this crossing because it is the only place both sides can see it.
