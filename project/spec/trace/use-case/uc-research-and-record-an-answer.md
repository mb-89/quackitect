---
minted_in: i1
id: uc-research-and-record-an-answer
type: "[[use-case]]"
statement: Settle a question the repo cannot answer from inside itself, and leave both the search and the answer on the record.
actor: stk-engineer-driving-agents
trigger: a question arises that nothing in the project can settle
precondition: none
guarantee: the answer is recorded against its question, its sources are in the reference corpus, and no claim stands without evidence
refines:
  - sty-ask-and-record-the-answer
  - sty-run-deep-research-across-harnesses
priority: should
---

## Main scenario

1. The question is stated, and it is established that nothing in the repo answers it.
2. A coverage matrix names standards, harnesses, failures, limits and local measurements.
3. `se_web_search` selects an available provider and logs the query.
4. Focused search rounds discover primary sources for each coverage row.
5. The sources are fetched and kept with what each one actually proves.
6. Search continues until two consecutive focused rounds add no capability, contradiction or source class.
7. What survives becomes a reference node with its query and source ledger.
8. The answer is recorded against the question, and unsupported claims stay out.

## Lane doors

- `se_web_search` owns provider selection behind one lane verb.
- `se_web_fetch` reads known primary URLs.
- `se_answer` records the question and answer together.

## Extensions

- 3a. No server-side provider answers: use native web search when exposed, or name discovery as incomplete.
- 4a. A source is a vendor page: treat it as evidence of a vendor claim, not quality.
- 6a. A comparative claim is wanted: require evidence on both sides.
- 6b. One side does not exist: state that comparison is impossible.
- 7a. A source is unreachable: keep the gap and a follow-up probe in the ledger.
- 8a. The answer exists only in chat: record it before the turn ends.
