---
id: se.raid-rg-is-a-hard-dependency-with-no-fallback
kind: raid
statement: "ripgrep becomes a FIRST-CLASS, LOAD-BEARING dependency and the hand-rolled searcher is deleted rather than kept as a fallback. Owner ruling 2026-07-25: 'I don't want the fallback. We don't ship on that many exotic machines, rg is gonna be available on all of them, and I don't want duplicate code which we never test and never run.' The reasoning is sound - an untested fallback is a liability, not a safety net - but it means that on any platform where @vscode/ripgrep resolves no binary (musl/Alpine, FreeBSD, unusual ARM), product search does not degrade, it CEASES. This also reverses the standing zero-runtime-dependency posture, deliberately: 'we overvalued zero dependency; there is no point in re-engineering rg.'"
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
  adjudicated_by: owner
raid_kind: assumption
raid_owner: owner
trigger: "A platform where the binary does not resolve, or a supply-chain event in the package. The assumption to re-check at that moment is the one the owner actually made - that we do not ship to exotic machines - which is true today and is a statement about the user base, not about the code. Fallback if it breaks: a documented manual rg install path (rg is packaged everywhere) rather than resurrecting a second searcher, since resurrecting it recreates exactly the untested duplicate the ruling removed. Verify the install story on each target platform at M5 rather than assuming it."
---


