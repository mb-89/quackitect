---
minted_in: i8
id: raid-issue-trace-design-checks-existence-not-content
type: "[[raid]]"
kind: issue
statement: trace-design's sweep confirms a design-spec's listed files exist, but never checks that a file's content actually carries what the design-spec claims for it.
owner: the owner
trigger: a future trace-design sweep signs a design-spec whose files exist but do not implement what the spec's own Interface/Responsibility sections claim
status: open
impact: A design-spec can list a file that is present but unwired, and the gate that is supposed to catch it (gate-implementation's "designs realized" check) reads trace-design's own sweep as already having proven that — so the gap reaches the delivery gate undetected, found only if the battery is actually run there.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - dsp-help-search.md
  - spec/iterations/i8-se-help-a-logged-keyword-search-over-the/gate-implementation (this iteration's own round_2_red_team)
---

Found while fixing i8's own gate-implementation: dsp-help-search.md names
both engine/help.ts and engine/tools.ts as files. help.ts existed and was
correct; tools.ts was never actually touched — se_help had zero wiring
into the dispatch table. trace-design's own sweep (already signed for i8
by the time this was found) passed anyway, which means it checks file
EXISTENCE, not that the file's content matches what the design-spec's
Interface section actually claims for it.

The fix is bigger than one line: content-matching a design-spec's prose
claim against a file's actual exports/wiring is not fully mechanical.
A cheap partial check IS mechanical, though — for a file a design-spec
names alongside a specific exported symbol or call site (as
dsp-help-search.md's Interface section does: "Both are dispatched from
engine/tools.ts's se_help handler"), grep the named file for the named
symbol and refuse when it is absent. That would have caught this exact
gap. Closes when trace-design's sweep gains some form of this check, or
when the owner decides file-existence is the intended bar and the gap
stays a documented risk instead.
