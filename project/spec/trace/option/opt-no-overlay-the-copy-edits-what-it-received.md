---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-no-overlay-the-copy-edits-what-it-received
type: "[[option]]"
cluster: the-bootstrap
question: where a copy's own layer lives
statement: there is no separate layer, because a copy owns every file it received and edits them where they sit
found_by: without
source: "trimming — what if the overlay does not exist, and who does its job then; the answer is THE COPY'S OWNER, with an ordinary editor. Homebrew ships the same choice as `inreplace` (docs.brew.sh/Formula-Cookbook)"
---

## Mechanism

NOTHING RESOLVES AND NOTHING LAYERS. A copy holds one set of files. Changing one
means opening it and changing it.

THE OWNER'S RULING MAKES THIS LEGAL RATHER THAN HERETICAL. Nothing in a copy is
sealed and a copy may modify its own content. An overlay exists to let somebody
change what they may not edit, and here there is nothing they may not edit.

SO THE QUESTION THIS CELL ANSWERS MAY NOT EXIST. Where a copy's own layer lives
is only a question if the copy has one.

HOMEBREW SHIPS EXACTLY THIS CHOICE and steers people toward it. Its
documentation names `inreplace` as the route for changes that will never go
upstream, in preference to carrying a patch. That edit leaves no authorship
record beyond the surrounding source.

## Who does its job instead

THE COPY'S OWNER, DIRECTLY. That is one of the four sanctioned answers, and it
is the one people dislike because it looks like moving work rather than removing
it.

THE ARGUMENT THAT IT IS REAL REMOVAL: every other cell on this question makes
the owner learn a resolution order before they can change a sentence. A copy
that edits its own files needs no such knowledge, and a person who has never
heard the word overlay can still make the product theirs.

## What it costs

THE COST LANDS ENTIRELY ON THE UPDATE, and it is the same cost the vendoring
sweep documented three times over. With no separate layer, an incoming change
and a local change occupy the same lines, so an update either clobbers or
conflicts, and nothing can tell an intentional edit from an untouched one.

`go mod vendor` IS THE WARNING, in its own reference: the go command does not
check whether vendored packages have been modified, and the directory is deleted
and rebuilt. `cargo vendor` does the same by default.

AND IT FORECLOSES NOTHING ELSE, WHICH IS ITS QUIETEST COST. Several options on
this chart need a pristine copy of what was received in order to work at all.
Editing in place destroys that baseline, so this choice removes not just the
overlay but every mechanism that would have compared against it.

## What it does not remove

THE ACCOUNTING QUESTION SURVIVES THIS TRIM. Even editing in place, somebody can
still ask what this copy changed — it just becomes a diff against a pristine
baseline that must be kept somewhere. This trim kills the layer; it does not
kill the ledger.

THAT IS WHY IT IS A DIFFERENT OPTION FROM
[[opt-no-record-because-the-copy-takes-no-updates]], which kills both. This one
is the cheaper trim and it is aimed at the smaller thing, which the method warns
about. It is on the chart because a candidate could take it while keeping the
channel, and somebody should have to say why not.
