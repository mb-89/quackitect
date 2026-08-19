---
form: draft-vision
reopened: "2026-08-19T17:14:03.340Z — forcing this session's claims tracking to register draft-vision as done - route() treats it as an unmet upstream feeder of define-actual/log-risks despite the file being signed, blocking all forward progress"
amended: 2026-08-16T16:31:22.497Z by agent — ref "main" resolves — verified 2026-08-16; one of the two carried-forward raid entries is now closed
by: agent
signed_off: 2026-08-19T17:14:18.612Z
authors: agent
files: null
---

# Evidence form / draft-vision

## current_situation

i15's kickoff gate is blessed pass-with-overrides at major, and the machine below has grown to match. The walk stands at draft-vision, M0's second state.

GATE-KICKOFF found substantial prior art (tables.ts, bases.ts, baseui.ts, basesclient.ts) already parsing the Bases format as a mirror widget, but no MCP-callable query verb. Two raid entries stand open: whether the v1 spec/queries/ ref is reachable, and that no live prior-art scan ran.

THE VISION PACKET IS RESIDENT. No standalone vision.md exists for this product; the resident vision lives as seven value-prop notes under project/spec/trace/value-prop/, established at i1 and i2 and inherited by every iteration since (confirmed by reading i11's and i27's own draft-vision forms as precedent).

## big_idea

INHERITED, not rewritten. The resident vision this iteration serves is vp-the-ledger (project/spec/trace/value-prop/vp-the-ledger.md): "every decision recorded, attributed and refusable", with the outcome that the record "still answers it years later, and carries across sessions what the agent forgets."

A SECOND FACET RIDES ALONG: vp-rigor-without-toil (project/spec/trace/value-prop/vp-rigor-without-toil.md), whose own success criterion already names the shape of this gap — "an agent finds the lane tool or guidance page it needs without already knowing its name, and a capability gap it hits leaves a trace instead of vanishing."

THE DELTA THIS ITERATION ADDS, in one breath: the record's "one click from record to rationale" promise currently means a person, or an agent, hand-scanning hundreds of files with grep. This walk needed four search calls and a full-tree glob just to locate ONE resident document (vp-the-engine.md) among roughly 300 trace files. A query verb makes that click literal instead of a search.

WHY THAT IS the same idea rather than a new one. vp-the-ledger already promises the record answers its why in one click; it does not yet say HOW. A structured, refusing query over the same corpus is the mechanism that makes the existing promise true, not a new promise.

## to_be_world

POINTER PLUS DELTA. The to-be world of vp-the-ledger is alive already — decisions recorded, attributed, refusable — and this changes how they are FOUND inside it.

WHAT IT LOOKS LIKE FROM THE OUTSIDE. An agent asking "what does this decision touch" or "why was this chosen" gets rows back: filtered, with only the fields it asked for, and a named refusal if it asks for a field that does not exist. It does not open a directory listing of 300 files and grep its way down, the way this very state just had to.

A SECOND SCENE, for the BM25 sibling. An agent about to couple a change to another part of the system gets a ranked list of candidate nodes the graph's edges do not yet record. It disposes of each candidate — real coupling, or not — rather than discovering the missed edge later, in a red-team round or an incident.

WHAT THE PERSON SEES. The board and the query verb agree, because both read the same corpus through the same reader. A person asking the agent a corpus-wide question gets a structured answer instead of a promise to go look.

## goal_system

INHERITED from vp-the-ledger's and vp-rigor-without-toil's success criteria, with one conflict this iteration makes visible.

THE GOALS IT SERVES, both already stated in the resident notes.

- Any decision answers its why in one click from the record (vp-the-ledger). A query verb is the mechanism; today the click is a hand search.
- An agent finds what it needs without already knowing its name, and a capability gap leaves a trace instead of vanishing (vp-rigor-without-toil). The BM25 sibling is built for exactly the coupling case a name-based search cannot find.

THE CONFLICT, NAMED OPENLY. Building the query layer costs toil now, against a vision whose whole point is removing toil. Two new lane verbs, a subset extension, and a corpus-wide resolver default change are real build weight, charged to the same iteration that promises less paperwork.

HOW IT IS RESOLVED. The toil is structural, once, and amortized: every future walk that would otherwise hand-grep the corpus (as this state just did) pays a query instead. gate-kickoff already priced this as major rather than pretending it is free.

A SECOND, SMALLER TENSION, from the rescheduled debt. The $-item resolvers moving to a per-record default (opt-in widens to the corpus) trades always-see-everything convenience for a safer default. The coverage laws staying corpus-wide is the half of vp-qualities' audit criterion this tension does not touch.

## moore_pitch

FOR the engineer driving agents across a growing trace corpus,
WHO today great hundreds of files by hand to answer "what does this decision touch" or "why was this chosen",
THE bound query verb
IS a read-only lane capability
THAT turns a corpus-wide search into a structured query, returning exactly the requested fields and refusing an unknown one by name.

UNLIKE the current path — se_file_search and se_file_glob, which find TEXT but not STRUCTURE, so a coupling nobody named as an edge is only ever found by scanning strings, the way this very state just found its own resident vision —
OURS adds a BM25 sibling that proposes candidate coupled nodes for forced disposition, surfacing what a hand sweep would otherwise miss or find only by luck.

WHAT IT SHEDS. Nothing beyond what gate-kickoff already named as left_out: the dashboard, embeddings (deferred until BM25's misses are measured), and the book table-interactivity port.

## follow_up

NOTHING NEW IS PULLED IN HERE. This state inherits the resident vision and names the delta; the argument for inheriting is the whole output.

WHAT THE NEXT STATES INHERIT AS SETTLED.

- The vision facets this iteration serves are vp-the-ledger (the one-click-to-rationale promise) and vp-rigor-without-toil (the capability-gap criterion), both unbent.
- The conflict is named, not resolved by argument: build toil now against toil removed later. gate-kickoff already priced the now-cost as major.
- The delta-default resolver change trades convenience for a safer default; the coverage laws stay corpus-wide, per the swept debt (raid-debt-delta-default-views).

ONE OPEN RAID ENTRY FROM GATE-KICKOFF CARRIES FORWARD: raid-risk-i15-ships-without-a-live-prior-art-scan. Not this state's tool to resolve. raid-asm-v1-ref-for-spec-queries-is-reachable closed 2026-08-16 — ref "main" resolves and holds the harvest source (25 .base files, not 26, plus the ADR).

## anything_else

