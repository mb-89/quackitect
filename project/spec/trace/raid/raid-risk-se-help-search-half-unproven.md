---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: raid-risk-se-help-search-half-unproven
type: "[[raid]]"
kind: risk
statement: se.help's keyword-search half may add no measured value over the harness's existing on-demand tool-schema loading, leaving only the demand log as the half worth keeping.
owner: the driving agent
trigger: usage data from se.help shows search rarely changes which tool an agent picks, or the miss log stays empty while agents keep finding tools some other way
status: open
impact: Build effort goes into a search UI nobody needed; agents keep routing around it by reading schemas directly, and only the demand-log half was ever load-bearing.
breaks_how_badly: corrosive
how_likely: plausible
---

Named in i8's own kickoff brief (record.md): "The SEARCH half is weaker here
than it was in v2, because this harness already loads tool schemas on demand
... Nobody has counted how often an agent fails to find a verb that already
exists — say so rather than claiming a benefit."

The kickoff's own vision already instructs: "BUILD BOTH HALVES, and if one
must be cut, keep the DEMAND LOG. That is the half with evidence behind it."

The trigger is exactly that measurement, once se.help exists and gets used.
