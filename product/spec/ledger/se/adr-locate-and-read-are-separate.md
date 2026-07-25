---
id: se.adr-locate-and-read-are-separate
kind: decision
statement: "SEARCH RETURNS LOCATIONS; THE READER RETURNS CONTEXT. ADDRESSES R1, R3 and criterion C4 structured output. A search call yields exact match positions with clean fields, and surrounding lines come from the range reader against those positions - rather than asking the search tool for context too. Forced by a real constraint found at i12: `git grep -z` gives unambiguous NUL-separated fields OR the match-versus-context marker, never both in one call. Rather than parse a convention that breaks on odd paths, the split follows the function structure already drawn at i12's partitioning, where LOCATE (F1) and DELIVER-IN-PORTIONS (F2) are separate functions. The constraint pushed the implementation onto a boundary the design already had, which is the sign of a good boundary rather than a lucky escape. REJECTED: parsing the ':' versus '-' convention from non-NUL output (breaks on paths containing those characters); calling search twice, once for positions and once for context (two round trips for one answer, and the second call can disagree with the first if the file changed between them)."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


