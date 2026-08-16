---
id: i15-the-database-our-own-reader-over-obsidia
status: seeded
opened: 2026-08-12T19:42:58.849Z
goal: "The database: our own reader over Obsidian Bases compatible files, extending the format where we need to, harvesting the 26 working query files v1 already wrote."
vision: "DONE LOOKS LIKE: a query verb reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list. Obsidian can still open the files it understands.\n\nTHE RULING. We write our own databases. They read files that are Obsidian Bases compatible. We MAY EXTEND the format — Obsidian falls back gracefully on what it does not understand, and that is accepted. So compatibility is one-way: our reader understands everything, Obsidian understands the part it knows.\n\nHARVEST, DO NOT INVENT. v1's spec/queries/ at ref main holds 26 working .base files. requirements.base is the whole shape in twelve lines: filters with an and-list of expressions, then views, each a table type with a name, an order of fields, a sort by property and direction, and a groupBy. The others cover assumptions, constraints, criteria, decisions by kind, interfaces, methods, needs, neighbours, qualities, raid, rationales, references, requirements, rules, a stakeholder matrix, tensions, use cases, and two V and V views.\n\nAND V1 BUILT THE READER. spec/decisions/adr-query-in-engine.md at ref main: a PINNED IN-ENGINE BASES SUBSET reading nodes, edges, states and notes, returning filtered rows with chosen fields, REFUSING AN UNKNOWN FIELD WITH THE FIELD LIST, and served read-only over the tool surface. It chose that over shelling out to the Obsidian CLI, which lost on the trust chain.\n\nTWO DISCIPLINES FROM THAT DECISION WORTH KEEPING. CONFORMANCE FIXTURES GUARD SUBSET DRIFT — the subset is pinned by tests, not by intent. And THE SUBSET EXTENDS TEST-FIRST. Its recorded reverse-sensitivity: a needed query beyond the subset RE-OPENS the decision rather than being smuggled in.\n\nWHY THIS MATTERS BEYOND QUERIES. v1's book rendered its tables from this same substrate, and its table interactivity extended it in plain inline script rather than pulling in a library, because a library would break the self-contained single file. So the query layer is also the book's table layer. Build it knowing that.\n\nWHAT THE OWNER WANTS OUT OF IT EVENTUALLY: a dashboard. Humans cannot read the data in the database without visualisations. The coverage checks already exist in engine/trace.ts; what is missing is the live view. v1's trick is worth copying — the register's filter columns carry the facet coverage, so A ZERO-COUNT VALUE IS THE COMPLETENESS CHECK, LIVE. The dashboard itself is the owner's UI sitting, not this iteration, but build the query layer so it can serve one.\n\nFULL CONTEXT: project/spec/version-planning.md, section D1 and i15.\n\nA RETRIEVAL SIBLING FOR THE READER (owner ruling 2026-08-13). BM25 over the same corpus.\n\nWHAT IT IS FOR, and it is not speed. Given a change, propose the nodes it may couple to that NO EDGE RECORDS. The graph answers structural coupling exactly and this answers the rest.\n\nWHY IT IS WORTH BUILDING, against the usual rejection that the corpus is small enough to grep. That is true and irrelevant. THE PROBLEM IS NOT THAT SEARCHING IS HARD - IT IS THAT DID YOU LOOK IS UNVERIFIABLE. Two proofs from 2026-08-13: an agent missed a DECIDED decision in this repository that one search would have found, caught only by a red team; and the same agent listed 35 requirements, left 170 unexamined, and passed every mechanical check.\n\nSO THE VALUE IS THE FORCED DISPOSITION, not the retrieval. The machine proposes N candidates and the agent must answer each one. That converts I SEARCHED into HERE ARE THE TWELVE IT FOUND AND WHAT I SAID ABOUT EACH - the same shape as the notes drain.\n\nBM25 FIRST, AND DETERMINISM IS WHY. About 150 lines, zero dependencies, single-digit milliseconds over a few hundred documents. A check that returns different candidates on different runs cannot be a gate, and that rules out anything sampled or hosted before quality even enters.\n\nTHIS CORPUS SUITS LEXICAL MATCHING UNUSUALLY WELL. The method vocabulary is enforced and consistent - bound, tree, claim, record, gate mean one thing everywhere. Where everyone uses the same words, lexical overlap IS semantic overlap.\n\nEMBEDDINGS LATER AND ONLY MEASURED. A small local model runs in RAM with no network, which the privacy line requires anyway. It catches paraphrase BM25 misses. Add it AFTER measuring what BM25 actually misses, or the dependency buys an unmeasured gain.\n\nDO NOT RETRIEVE WHAT THE GRAPH ALREADY ENCODES. Where an edge exists, the edge wins.\n\nIT IS A LANE VERB, so it owes an interface entry when it lands.\n\nWHO CONSUMES IT: i18 for the impact set's semantic half, i6 for the gate check that demands each candidate be dispositioned."
inputs:
  - "project/spec/version-planning.md"
  - "spec/queries/ at ref main"
  - "spec/decisions/adr-query-in-engine.md at ref main"
---

# i15-the-database-our-own-reader-over-obsidia

## Goal

The database: our own reader over Obsidian Bases compatible files, extending the format where we need to, harvesting the 26 working query files v1 already wrote.

## Rough vision

DONE LOOKS LIKE: a query verb reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list. Obsidian can still open the files it understands.

THE RULING. We write our own databases. They read files that are Obsidian Bases compatible. We MAY EXTEND the format — Obsidian falls back gracefully on what it does not understand, and that is accepted. So compatibility is one-way: our reader understands everything, Obsidian understands the part it knows.

HARVEST, DO NOT INVENT. v1's spec/queries/ at ref main holds 26 working .base files. requirements.base is the whole shape in twelve lines: filters with an and-list of expressions, then views, each a table type with a name, an order of fields, a sort by property and direction, and a groupBy. The others cover assumptions, constraints, criteria, decisions by kind, interfaces, methods, needs, neighbours, qualities, raid, rationales, references, requirements, rules, a stakeholder matrix, tensions, use cases, and two V and V views.

AND V1 BUILT THE READER. spec/decisions/adr-query-in-engine.md at ref main: a PINNED IN-ENGINE BASES SUBSET reading nodes, edges, states and notes, returning filtered rows with chosen fields, REFUSING AN UNKNOWN FIELD WITH THE FIELD LIST, and served read-only over the tool surface. It chose that over shelling out to the Obsidian CLI, which lost on the trust chain.

TWO DISCIPLINES FROM THAT DECISION WORTH KEEPING. CONFORMANCE FIXTURES GUARD SUBSET DRIFT — the subset is pinned by tests, not by intent. And THE SUBSET EXTENDS TEST-FIRST. Its recorded reverse-sensitivity: a needed query beyond the subset RE-OPENS the decision rather than being smuggled in.

WHY THIS MATTERS BEYOND QUERIES. v1's book rendered its tables from this same substrate, and its table interactivity extended it in plain inline script rather than pulling in a library, because a library would break the self-contained single file. So the query layer is also the book's table layer. Build it knowing that.

WHAT THE OWNER WANTS OUT OF IT EVENTUALLY: a dashboard. Humans cannot read the data in the database without visualisations. The coverage checks already exist in engine/trace.ts; what is missing is the live view. v1's trick is worth copying — the register's filter columns carry the facet coverage, so A ZERO-COUNT VALUE IS THE COMPLETENESS CHECK, LIVE. The dashboard itself is the owner's UI sitting, not this iteration, but build the query layer so it can serve one.

FULL CONTEXT: project/spec/version-planning.md, section D1 and i15.

A RETRIEVAL SIBLING FOR THE READER (owner ruling 2026-08-13). BM25 over the same corpus.

WHAT IT IS FOR, and it is not speed. Given a change, propose the nodes it may couple to that NO EDGE RECORDS. The graph answers structural coupling exactly and this answers the rest.

WHY IT IS WORTH BUILDING, against the usual rejection that the corpus is small enough to grep. That is true and irrelevant. THE PROBLEM IS NOT THAT SEARCHING IS HARD - IT IS THAT DID YOU LOOK IS UNVERIFIABLE. Two proofs from 2026-08-13: an agent missed a DECIDED decision in this repository that one search would have found, caught only by a red team; and the same agent listed 35 requirements, left 170 unexamined, and passed every mechanical check.

SO THE VALUE IS THE FORCED DISPOSITION, not the retrieval. The machine proposes N candidates and the agent must answer each one. That converts I SEARCHED into HERE ARE THE TWELVE IT FOUND AND WHAT I SAID ABOUT EACH - the same shape as the notes drain.

BM25 FIRST, AND DETERMINISM IS WHY. About 150 lines, zero dependencies, single-digit milliseconds over a few hundred documents. A check that returns different candidates on different runs cannot be a gate, and that rules out anything sampled or hosted before quality even enters.

THIS CORPUS SUITS LEXICAL MATCHING UNUSUALLY WELL. The method vocabulary is enforced and consistent - bound, tree, claim, record, gate mean one thing everywhere. Where everyone uses the same words, lexical overlap IS semantic overlap.

EMBEDDINGS LATER AND ONLY MEASURED. A small local model runs in RAM with no network, which the privacy line requires anyway. It catches paraphrase BM25 misses. Add it AFTER measuring what BM25 actually misses, or the dependency buys an unmeasured gain.

DO NOT RETRIEVE WHAT THE GRAPH ALREADY ENCODES. Where an edge exists, the edge wins.

IT IS A LANE VERB, so it owes an interface entry when it lands.

WHO CONSUMES IT: i18 for the impact set's semantic half, i6 for the gate check that demands each candidate be dispositioned.

## Inputs

- project/spec/version-planning.md
- spec/queries/ at ref main
- spec/decisions/adr-query-in-engine.md at ref main
