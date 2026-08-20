---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: sty-answer-what-does-this-touch
type: "[[story]]"
statement: When an agent needs to answer what a decision touches, without already knowing which of the corpus's roughly 300 files holds it, I want a structured query over nodes and edges, so I can get back exactly the matching rows or a named refusal instead of a silent miss.
actor: stk-agent
refines:
  - vp-the-ledger
priority: must
---

## Deck

An agent needs to answer what a decision touches. The corpus holds roughly 300 trace files, and nothing but grep tells it where to look.
|||
STILL TRUE FOR THE AGENT, checked 2026-08-17 during i33. The evaluator that would answer it is already on disk: `engine/query.ts:45` exports `answerStructuredQuery`, with four cases over it in `tests/query.test.ts`. No lane verb reaches it — a search of the whole deliverable for `se_query` returns nothing. The gap is a door, not a build.

MEASURED 2026-08-17: `spec/trace` holds 820 markdown nodes, not 300 — the corpus has nearly tripled since this slide was written, so the pressure it describes has grown rather than eased.
---

The agent has se_file_search and se_file_glob only. Both find matching TEXT, never a typed row with named fields — this iteration's own frame-delta needed four such calls just to find one resident value-prop file.
|||
UNCHANGED, AND i33 PAID THE SAME TOLL AGAIN, in a way worth recording because it is exactly the failure mode named here. Looking for the demonstration specs that already existed, the first search asked for `method: demonstration` and returned nothing but a test fixture. Every real file writes it quoted, as `method: "demonstration"`, and thirteen of them were sitting there. A text search misses on a quoting choice. A typed query over a `method` field cannot.

STILL TRUE, AND CHECKABLE IN ONE CALL. The lane serves 34 tools today and the query-shaped ones are `se_file_search`, `se_web_search` and `se_log_query`. None returns a typed row from the trace graph. i35's own walk paid this: finding a resident value-prop file took a glob, a read and two searches.
---

The agent asks the query verb for every node of kind decision whose statement or edges touch the topic, naming exactly the fields it wants back: id, statement, decided_in.
|||
BUILT, AND UNREACHABLE. `answerStructuredQuery` takes a kind and a named field list, which is this slide's shape almost word for word. i15's own `build-query-evaluator` evidence, signed 2026-08-16, records it implemented with four of four cases green. What is missing is one hop — a verb — rather than any of the work this slide describes.

NOT YET AVAILABLE. i15 is still `status: open`, so the verb this slide describes does not exist in the lane. `engine/bases.ts` and `engine/basesclient.ts` stand as the reader beneath it, which is why the slide is a claim about work in flight rather than about a gap nobody has started.
---

The verb returns filtered rows — only the matching nodes, only the named fields — instead of a directory to search by hand.
|||
BUILT AND TEST-VERIFIED. `tests/query.test.ts` drives filtered rows and named fields directly. NOT DEMONSTRATED, because the actor this story names cannot call it: the demonstration is tsp-a-structured-query-answers-what-a-decision-touches, and its step 2 has nothing to call.

THE SHAPE IS ALREADY PROVEN ELSEWHERE, which is what makes this credible rather than hopeful. The evidence forms already serve exactly this: `probe-assumptions` renders a node-table over 42 raid nodes with `probe` and `probed` as named columns, and writing a cell writes that key on that node. Filtered rows with named fields exist — they are just not reachable as a verb.
---

The agent asks for a field that does not exist on that node type. The verb refuses by name and lists the fields that do exist, instead of returning an empty or wrong result.
|||
BUILT, at `engine/query.ts:51`. It names the unknown field and lists the legal ones for that kind. AND THE CONTRAST IS ON FILE: the log query an agent CAN reach does the opposite, dropping records that match its own filter and reporting `older: 0` while doing it — raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not. The correct behaviour sits behind the closed door and the silent miss is the one that ships.

THE REFUSAL HALF IS THE PROVEN HALF. The lane refuses an unknown ARGUMENT name today under SE-C-101, and the same discipline runs over evidence fields: i35 was refused SE-C-112 naming `sty-answer-what-does-this-touch` and two siblings, by id, rather than being handed a quiet pass.
---

The agent follows one returned id to its file and reads the decision's own rationale. What used to cost four search calls across 300 files now costs one structured query and one read.
|||
NOT DELIVERED, and one hop away. i15 stands `status: open` with the evaluator built and nothing exposing it. NOT DEMONSTRATED either, and the demonstration cannot run until that verb exists — which is said in the spec rather than left as a blank. THE COST IS STILL BEING PAID: i33's own walk ran text searches all evening to answer questions this evaluator was built for.

UNMEASURED, and it must stay that way until the verb ships. The four-calls-to-one claim is a target, not an observation. What IS measured is the numerator: i35 spent four lane calls locating one node this run.
