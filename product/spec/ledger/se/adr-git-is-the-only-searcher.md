---
id: se.adr-git-is-the-only-searcher
kind: decision
statement: "GIT IS THE ONE SEARCH PROVIDER, for the working tree AND for the record. No ripgrep, no second engine, no fallback. ADDRESSES R3, R4, R5, R6 and criteria C1 freshness, C2 reach, C3 one-click install, C5 one-implementation-per-job. Decided at i12 after a Pugh convergence in which ripgrep-plus-git led on paper and lost once its only real advantage was probed: `git grep -z` returns three NUL-separated fields (ref:path, line, text) with no separator ambiguity, which was the whole of ripgrep's structured-output edge (run-477ac3e1031a). The remaining rg-only capabilities - multiline matching, submatch spans, searching ignored files - are asked for by nothing in the register. REVERSES an owner expectation ('if we switch to RG, which I think we're gonna do') under the same owner's instruction to research the choice and use whatever is better; the better answer turned out to be no new dependency at all. The deciding argument is not the five-point margin: it is that answering ONE question through TWO tools with two output shapes is itself the duplication the no-duplicate-code ruling was aimed at, and that every claim about git was exercised on this machine while every claim about ripgrep was documentation. REJECTED, with reasons: ripgrep via @vscode/ripgrep (better ceiling, unexercised here, adds a dependency and a second output shape - revisit trigger in se.raid-a-requirement-may-yet-demand-ripgrep); system ripgrep (probed ABSENT on the owner's own machine); ast-grep (answers a structural question nothing asks); zoekt / Sourcegraph / OpenGrok and embedding retrieval (fail the freshness veto - an index tolerates staleness and this agent reads back what it just wrote); keeping the hand-rolled searcher beside anything (fails the no-duplicate-code ruling)."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


