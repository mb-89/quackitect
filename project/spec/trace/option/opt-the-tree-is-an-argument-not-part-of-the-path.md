---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-the-tree-is-an-argument-not-part-of-the-path
type: "[[option]]"
statement: split the one path string into two arguments, the tree and the path within it, so the tree stops being encoded in text that has to be parsed to be understood
cluster: cluster-the-walk
question: how a path names its tree
found_by: transform
source: "SIT Division, applied to the incumbent — split a component and rearrange the parts"
---

## Mechanism

`{tree: <record id or root>, path: "spec/trace/..."}` instead of one string
whose meaning depends on a prefix.

WHY IT IS NOT THE SAME AS NAMING THE TREE IN THE PATH. opt-the-caller-names-
the-tree and opt-the-common-path-needs-no-tree both keep one string and give
it grammar. A grammar has to be parsed, and every parser is a place the
meaning can be recovered wrongly. This removes the parse.

IT ALSO MAKES THE OMISSION VISIBLE. A missing argument is a schema question
the engine already answers with SE-C-046. A missing prefix is indistinguishable
from a deliberate relative path, which is exactly today's ambiguity.

THE PRECEDENT IS IN THE LANE ALREADY. se_file_read takes `ref` as its own
argument rather than as a `ref:path` string, and reading at a committed ref
has never misrouted. The same shape, applied to the tree.

WHAT IT COSTS. Every call site changes, and it is a wider change than a
prefix because there is no form that keeps working. Against that, the
migration is mechanical and a missed site refuses rather than guessing.

WHAT IT DOES NOT DO. It says nothing about which tree is CORRECT. It removes
one class of error - the misread path - and leaves the choice where it was.
