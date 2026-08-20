---
minted_in: i1
id: opt-no-installer-clone-the-template
type: "[[option]]"
statement: delete the installer and make the product a repository template, so standing one up is a clone and a dependency install
cluster: cluster-the-bootstrap
question: how the product reaches a machine that has nothing on it
found_by: without
source: trimming per meth-trimming — the environment already does it
---

## Mechanism

THE TRIM. What if standing a product up does not exist as a function?

WHO DOES ITS JOB. The environment. A repository template plus the language's
own package manager is a clone and one install command, and both are things
the person already has.

WHAT SURVIVES THE TRIM. Nothing in this cluster is unique to this product
except the check that stops before a partial install.

THIS NODE SAID NOBODY ELSE DOES THAT, AND THAT WAS WRONG. Corrected 2026-08-19
by a live scan at i9's candidates gate. Several tools do it, and one does it
well enough to copy.

- `mason.nvim`'s health check runs every check, reports each tool by name with
  its version, separates required from optional, states each version
  constraint in words, and carries the remediation command in its own source.
  It changes nothing. Two hundred lines of Lua.
  https://raw.githubusercontent.com/mason-org/mason.nvim/main/lua/mason/health.lua
- `flutter doctor` is the canonical shape: a category header carrying a tick,
  a warning or a cross, and under it a line naming the specific missing piece.
- Replicated's preflight checks are the commercial form, where `strict: true`
  blocks the install outright.

WHAT THE SWEEP PROBABLY MEANT, and it still stands: nobody in the INSTALLER
family does it. Homebrew's own script aborts on architecture, operating system
and permissions before it touches anything, then creates and chowns its whole
tree, and only THEN aborts on missing git. The good implementations are health
checks rather than installers, which is a real finding about where to look.

WHAT IS LOST. The scaffold currently writes a product tree from a template
and records the purpose at begin. A clone gives the tree and loses the
purpose, so a candidate taking this cell has to say where the purpose is
recorded — probably the first commit.

THE HONEST WEAKNESS. This is trimming something cheap, which the method warns
against. The cluster holds one function and couples to nothing, so removing
it saves the least of any trim on the chart. It is recorded because the
question was asked of every cluster, not because it is the promising one.
