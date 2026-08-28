---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-the-departure-is-declared-where-it-happens-not-in-a-central-list
type: "[[option]]"
statement: A departure is written in the module that departs, beside the line it excuses, and no central list exists at all.
cluster: cluster-the-door-regime
found_by: transform
source: SCAMPER Substitute, applied to the incumbent — swap where the departure lives
---

## Mechanism

The exemption list disappears. The module carries its own departure, next to
the reach it covers, and the sweep collects them by reading the tree.

WHAT IT BUYS. The reason sits where the reader already is. Somebody looking at
a suspicious line finds the justification on the next line rather than in a
file they must know exists.

IT ALSO CANNOT GO STALE BY MOVING. A central list keyed by path breaks on a
rename and grants nothing afterwards, which is the platform assumption this
record could not probe. A departure that travels inside the file cannot be
orphaned by moving the file.

WHAT IT COSTS, AND IT IS SEVERE. Nobody can read the departures as a set. The
maintainer's question — where has this codebase departed from its own design,
and why — is answered by a sweep rather than by opening one file, and that
question is the record's whole value proposition.

IT ALSO LOSES THE HATCH BEING FINDABLE. The existing list says in its own words
that a hatch nobody can find is the same as no hatch, and that is why it lives
where a person reads rather than inside the engine as a constant. Scattering it
back into the modules undoes that ruling.

THE SYNTHESIS IS OBVIOUS AND WORTH NAMING. Declare it inline and DERIVE the
list. The sweep already walks the tree, so the central view can be computed
rather than maintained, and neither the locality nor the readability is given
up.

That derived form is what makes this cell worth scoring rather than dismissing.
