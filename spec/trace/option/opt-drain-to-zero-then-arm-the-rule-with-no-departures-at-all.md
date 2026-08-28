---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-drain-to-zero-then-arm-the-rule-with-no-departures-at-all
type: "[[option]]"
statement: The rule arms only once every standing violation is corrected, and after that there is no departure list because nothing may depart.
cluster: cluster-the-door-regime
found_by: prior-art
source: v2 at ref v2, product/spec/ledger/se/adr-voice-ratchet.md — the voice lane arms only at zero debt, the historical findings are corrected rather than exempted, and the grandfather pattern is the named loser
---

## Mechanism

Nothing is granted an exception. The existing violations are fixed first, and
the rule turns on afterwards. From then on a violation is a red, full stop.

WHY IT IS ON THE CHART AT ALL, given that this record's requirements assume a
departure list. Because the predecessor ruled BOTH WAYS, on two rules, on
stated grounds, and that is the finding rather than either ruling.

- For historical statement wording it kept the exemptions, because
  retrofitting shipped statements would be a wording avalanche over history
  with zero behaviour value.
- For the voice lane it refused them, because exemptions freeze debt and
  teach nothing.

WHAT DECIDES BETWEEN THEM is whether correcting the existing violations
teaches anybody anything. Where it does, drain and arm. Where it is a rename
across history nobody will read, exempt and cite.

WHAT IT COSTS HERE. 79 modules import the filesystem directly. Draining that
to zero before arming anything is the whole build, in one step, with no green
in between.
