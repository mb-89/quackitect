---
kind: [[rationale]]
---

# Why

The owner decided this for the migration, and the decision is final. The Go
code stands in one module, and packages separate it. An agent reads this note
before it asks again.

## 1. A module is a release

A package draws a line through the code. A module is a unit a team versions and
releases on its own, and quackitect ships as one thing. So a second module
bought a boundary the tree already had, at the price of a release nobody cuts.

## 2. What seven modules cost

| what the split did | what followed |
|---|---|
| shared code became one more module | `src/pointer` stands as a module for one list of endings |
| a module to share cost more than a copy | agents copied code instead |
| each module named its own Go | `src/tui` asks for 1.27, and the rest ask for 1.24 |
| every program built apart | no single binary stands |

## 3. What guards the boundaries now

Import rules between packages, which the build checks. A package reaching past
its line fails the build, the way a module boundary failed it before.

## 4. What it gave up

A package can no longer pin a dependency apart from the rest. Every package
takes one version of each dependency and one Go.

## 5. What would make it wrong

A part shipping on its own, with a version and a release a user asks for apart
from quackitect. That part earns a module of its own, and nothing else does.

## 6. What still splits

Each Go folder under `src` holds its own `go.mod`, and
[[spec/design_output/config#the-go-reader]] describes a shared module riding
beside the window's build. The migration folds them into one module and
rewrites that chapter.
