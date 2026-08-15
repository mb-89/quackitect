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
priority: should
---

## Main scenario

1. The question is stated, and it is established that nothing in the repo answers it.
2. The search runs through the lane, so the query itself is logged alongside what came back.
3. The results are read and their sources kept.
4. What survives becomes a reference node, so the next person starts from the finding rather than searching again.
5. The answer is recorded against the question as two fields, in one place.
6. Anything the sources do not actually support is left out.

## Lane doors

- `se_web_search` and `se_web_fetch` reach outside the repository. Every query is logged like any other call.
- `se_answer` records the question and the answer as one entry, so the answer outlives the session that gave it.

## Extensions

- 2a. No search provider is configured. A specific URL can still be fetched, and the gap is named rather than worked around.
- 3a. A source is a vendor's own page. It is evidence that a feature is CLAIMED and nothing more; it never becomes a quality judgment.
- 6a. A COMPARATIVE claim is wanted — theirs against ours. It needs evidence on BOTH sides, and where our side does not exist yet the comparison is impossible rather than merely weak. Writing it anyway is fabrication, and a fabricated judgment routes real work.
- 6b. The comparison was not made. "Not compared, and here is why" is the honest form; a blank reads as done and is worth less than a named gap.
- 5a. The answer is only chatted, never recorded. Chat can be lost mid-turn, so the recorded copy is the durable one and the chat repeats it verbatim rather than restating it.
