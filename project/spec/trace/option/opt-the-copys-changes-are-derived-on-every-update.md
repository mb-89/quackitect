---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-copys-changes-are-derived-on-every-update
type: "[[option]]"
statement: the copy edits whatever it likes, and each update three-way merges then writes out the copy-only delta as a fresh inventory nobody maintained by hand
cluster: the-bootstrap
question: how a copy's own changes are represented
found_by: prior-art
source: Google Copybara core.workflow merge_import and autopatch_config (github.com/google/copybara/blob/master/docs/reference.md)
---

## Mechanism

THE UPDATE IS A THREE-WAY MERGE, taking the incoming version, the last
received version as the baseline, and the copy's current file. Copybara's own
words for what this is for: to "perpetuate destination-only changes in non
source of truth repositories."

THEN THE DELTA IS WRITTEN OUT. Its `autopatch_config` emits the destination-only
difference as patch files into a folder, regenerated on every import.

THE INVENTORY IS AN OUTPUT, NOT AN INPUT. That is the whole difference from
every other system found. Nobody declares anything and nobody keeps a list
truthful, because the list is recomputed from the merge each time.

WHAT IT BUYS. The copy's owner works normally. They edit their own product,
and the machinery works out afterwards what they made theirs.

WHAT IT COSTS, AND IT IS LARGE. Copybara is a Java and Bazel binary configured
in a scripting language, its README says plainly that it is a tool used
internally at Google, and its authors describe their own documentation as
unfinished. The consistency-file support that underpins the merge baseline is
marked as still under development. Adopting it is a project.

AND ONE SIDE MUST BE NOMINATED AUTHORITATIVE, which is a modelling commitment
rather than a setting.

WHAT IT CANNOT DO, AND THIS IS THE SEAM WORTH SEEING. It computes the delta and
attaches NO MEANING to it. A derived patch says a difference exists. It cannot
say the copy's owner meant it, or why.

SO THE TWO OPTIONS ON THIS CELL ARE COMPLEMENTARY RATHER THAN RIVALS.
[[opt-the-copys-changes-are-a-declared-patch-series]] carries reasons and
needs a person to stay honest. This carries no reasons and needs nobody. The
sweep's own conclusion is that nothing in the field does both, and that is the
gap [[req-overlay-drift-reported]] is asking to be filled.
