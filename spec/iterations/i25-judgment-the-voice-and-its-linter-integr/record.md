---
id: i25-judgment-the-voice-and-its-linter-integr
status: seeded
opened: 2026-08-12T19:48:20.196Z
goal: "JUDGMENT — the voice and its linter: integrate Vale, teach it ASD-STE100, arm it at zero debt, and bring back the glossary discipline and the link graph."
vision: |-
  NEEDS THE OWNER for the standard and the wording rules. The mechanical half is large and clear.

  INTEGRATE VALE. The owner's ruling: it is single-click installable and it is a good thing. v1's pattern is the one to copy — Vale AUTO-PULLED once per OS into the data home and run as a SUBPROCESS, never linked, never hand-rolled, with a LOUD WARNING when the pull fails saying the prose linter is absent and quality is likely to suffer. Maintaining our own prose linter was explicitly rejected.

  TEACH IT ASD-STE100. The owner wants us to ADHERE to Simplified Technical English. The standard sits at project/scratchpad/ASD-STE100_ISSUE9.pdf. THE LANE CANNOT READ IT — 3.3MB of binary, refused under SE-C-126 — so extracting its text with a tool that understands PDFs is the FIRST task of this iteration, not an afterthought.

  ARM IT AT ZERO DEBT, which is v1's rule and the important one. Historical findings are CORRECTED, NEVER EXEMPTED, and only after the drain does a finding fail the lint. The alternative — exempt markers on history — was rejected because EXEMPTIONS FREEZE DEBT AND TEACH NOTHING. We carry 26 measured prose findings, half of them in state guidance every agent reads on every visit. Fix all 26 first.

  WHAT THE LINT MUST CATCH THAT IT DOES NOT. Today SE-C-125 checks line breaks only. Teasers pass, undefined terms pass, and jargon still reaches chat and the feed. The voice's own closing rule says a rule that keeps breaking wants a LINT rather than another sentence.

  THE GLOSSARY DISCIPLINE, v1's and adopted whole from the LaTeX glossaries pattern. ONE NOTE PER TERM. Usage is a MARKED LINK, never a bare word. The glossary chapter is generated USED-TERMS-ONLY, with back-references and first-use long-form expansion. A LINK TO A MISSING TERM ERRORS. AN UNLINKED SCANNED USAGE ADVISES. That two-level split — error versus advise — is what makes it usable rather than tyrannical.

  AND THE TERM SOURCE RULE: the terms lint reads THE GLOSSARY as its ONLY term list. No second curated list, because two places for one fact drift apart, and the verified prior art shows curated lists solve spelling and never ordering. THE GLOSSARY'S THINNESS IS FIXED BY GROWING THE GLOSSARY.

  THE LINK GRAPH, which the backlog has wanted back for a while. v1's autolink is 99 lines. Plain-text occurrences of a note name or alias become links deterministically at emit time. Authored links and inline code are PROTECTED SPANS. Code fences, headings, comment lines and raw-HTML lines are exempt WHOLE, because inline SVG carries real text a link would corrupt. THE LONGEST NAME WINS at a position, applied longest-first, and each inserted link becomes a protected span itself. Matching is case-insensitive on word boundaries. Glossary names link through the term machinery so usage tracking and first-use expansion ride along free.

  ITS AMBIGUITY RULE IS THE PART MOST IMPLEMENTATIONS GET WRONG: AN ALIAS CLAIMED BY TWO NOTES IS A HARD ERROR AT INDEX BUILD. The book surfaces it as a finding and NEVER GUESSES.

  ONE WARNING FROM V1'S OWN RECORD: a wrong lint becomes the new workaround pressure. Prefer fact-computing lints over intent-judging ones.

  FULL CONTEXT: project/spec/version-planning.md, section J7.

  FROM THE POOL, 2026-08-13. Three more, and each names what the lint must actually catch.

  THE VOICE HAS NO LINT FOR TEASERS OR UNDEFINED TERMS (note-432f7d3b6a6b). A gate's prose passed the lint while breaking the voice - undefined terms, an argument named and never stated, headline style - because the only mechanical check refuses breakless walls. The voice guidance marks the no-teaser rule as the most-broken on its own page and says plainly that it wants a LINT rather than another sentence, and the owner re-ruled it in chat on 2026-08-10: no clickbait openers, terse technical English. THE WORK IS TO NAME THE CHECKABLE SUBSET. Three candidates are already listed: an opener that announces instead of stating, a term list per evidence form, and a sentence-length ceiling.

  THE JARGON REACHES THE PERSON-FACING SURFACES (owner, note-274a31a3c47a). Chat and the feed still carry method jargon that reads as nonsense to the person, and one quoted feed line was not decodable by the owner at all. The narration briefs surface on the shared feed carrying the same jargon. THE DEMAND IS SIMPLE TECHNICAL ENGLISH ON EVERY PERSON-FACING LINE - chat, feed briefs and answer cards alike.

  SPEC PROSE INVENTS PLAUSIBLE HISTORY, AND ONLY A SOURCE CHECK CATCHES IT (note-f0f294b68d09). Three claims in one requirement's prose had the right shape and were false: a date wrong by years where the subject was four days old and one git command settles it, two invented misses added to make a sentence balance, and a wrong quantifier that understated the guard it described. The tester caught all three by checking git and reading the code, neither of which the writer did. THE PATTERN IS THE FINDING: prose about WHY a rule exists reaches for history, and history is exactly what is not in front of the writer, so the claim comes out fluent and unsourced. The voice rule already says no claim without evidence, AND IT IS NOT ENFORCED ANYWHERE ON SPEC BODIES. What wants deciding is whether a spec claim about dates, counts or past runs must carry its source inline, the way an evidence form does.
inputs:
  - project/spec/version-planning.md
  - project/scratchpad/ASD-STE100_ISSUE9.pdf
  - spec/decisions/adr-glossary-discipline.md at ref main
  - product/engine-go/autolink.go at ref main
  - project/guidance/voice.md
---

# i25-judgment-the-voice-and-its-linter-integr

## Goal

JUDGMENT — the voice and its linter: integrate Vale, teach it ASD-STE100, arm it at zero debt, and bring back the glossary discipline and the link graph.

## Rough vision

NEEDS THE OWNER for the standard and the wording rules. The mechanical half is large and clear.

INTEGRATE VALE. The owner's ruling: it is single-click installable and it is a good thing. v1's pattern is the one to copy — Vale AUTO-PULLED once per OS into the data home and run as a SUBPROCESS, never linked, never hand-rolled, with a LOUD WARNING when the pull fails saying the prose linter is absent and quality is likely to suffer. Maintaining our own prose linter was explicitly rejected.

TEACH IT ASD-STE100. The owner wants us to ADHERE to Simplified Technical English. The standard sits at project/scratchpad/ASD-STE100_ISSUE9.pdf. THE LANE CANNOT READ IT — 3.3MB of binary, refused under SE-C-126 — so extracting its text with a tool that understands PDFs is the FIRST task of this iteration, not an afterthought.

ARM IT AT ZERO DEBT, which is v1's rule and the important one. Historical findings are CORRECTED, NEVER EXEMPTED, and only after the drain does a finding fail the lint. The alternative — exempt markers on history — was rejected because EXEMPTIONS FREEZE DEBT AND TEACH NOTHING. We carry 26 measured prose findings, half of them in state guidance every agent reads on every visit. Fix all 26 first.

WHAT THE LINT MUST CATCH THAT IT DOES NOT. Today SE-C-125 checks line breaks only. Teasers pass, undefined terms pass, and jargon still reaches chat and the feed. The voice's own closing rule says a rule that keeps breaking wants a LINT rather than another sentence.

THE GLOSSARY DISCIPLINE, v1's and adopted whole from the LaTeX glossaries pattern. ONE NOTE PER TERM. Usage is a MARKED LINK, never a bare word. The glossary chapter is generated USED-TERMS-ONLY, with back-references and first-use long-form expansion. A LINK TO A MISSING TERM ERRORS. AN UNLINKED SCANNED USAGE ADVISES. That two-level split — error versus advise — is what makes it usable rather than tyrannical.

AND THE TERM SOURCE RULE: the terms lint reads THE GLOSSARY as its ONLY term list. No second curated list, because two places for one fact drift apart, and the verified prior art shows curated lists solve spelling and never ordering. THE GLOSSARY'S THINNESS IS FIXED BY GROWING THE GLOSSARY.

THE LINK GRAPH, which the backlog has wanted back for a while. v1's autolink is 99 lines. Plain-text occurrences of a note name or alias become links deterministically at emit time. Authored links and inline code are PROTECTED SPANS. Code fences, headings, comment lines and raw-HTML lines are exempt WHOLE, because inline SVG carries real text a link would corrupt. THE LONGEST NAME WINS at a position, applied longest-first, and each inserted link becomes a protected span itself. Matching is case-insensitive on word boundaries. Glossary names link through the term machinery so usage tracking and first-use expansion ride along free.

ITS AMBIGUITY RULE IS THE PART MOST IMPLEMENTATIONS GET WRONG: AN ALIAS CLAIMED BY TWO NOTES IS A HARD ERROR AT INDEX BUILD. The book surfaces it as a finding and NEVER GUESSES.

ONE WARNING FROM V1'S OWN RECORD: a wrong lint becomes the new workaround pressure. Prefer fact-computing lints over intent-judging ones.

FULL CONTEXT: project/spec/version-planning.md, section J7.

FROM THE POOL, 2026-08-13. Three more, and each names what the lint must actually catch.

THE VOICE HAS NO LINT FOR TEASERS OR UNDEFINED TERMS (note-432f7d3b6a6b). A gate's prose passed the lint while breaking the voice - undefined terms, an argument named and never stated, headline style - because the only mechanical check refuses breakless walls. The voice guidance marks the no-teaser rule as the most-broken on its own page and says plainly that it wants a LINT rather than another sentence, and the owner re-ruled it in chat on 2026-08-10: no clickbait openers, terse technical English. THE WORK IS TO NAME THE CHECKABLE SUBSET. Three candidates are already listed: an opener that announces instead of stating, a term list per evidence form, and a sentence-length ceiling.

THE JARGON REACHES THE PERSON-FACING SURFACES (owner, note-274a31a3c47a). Chat and the feed still carry method jargon that reads as nonsense to the person, and one quoted feed line was not decodable by the owner at all. The narration briefs surface on the shared feed carrying the same jargon. THE DEMAND IS SIMPLE TECHNICAL ENGLISH ON EVERY PERSON-FACING LINE - chat, feed briefs and answer cards alike.

SPEC PROSE INVENTS PLAUSIBLE HISTORY, AND ONLY A SOURCE CHECK CATCHES IT (note-f0f294b68d09). Three claims in one requirement's prose had the right shape and were false: a date wrong by years where the subject was four days old and one git command settles it, two invented misses added to make a sentence balance, and a wrong quantifier that understated the guard it described. The tester caught all three by checking git and reading the code, neither of which the writer did. THE PATTERN IS THE FINDING: prose about WHY a rule exists reaches for history, and history is exactly what is not in front of the writer, so the claim comes out fluent and unsourced. The voice rule already says no claim without evidence, AND IT IS NOT ENFORCED ANYWHERE ON SPEC BODIES. What wants deciding is whether a spec claim about dates, counts or past runs must carry its source inline, the way an evidence form does.

## Inputs

- project/spec/version-planning.md
- project/scratchpad/ASD-STE100_ISSUE9.pdf
- spec/decisions/adr-glossary-discipline.md at ref main
- product/engine-go/autolink.go at ref main
- project/guidance/voice.md

## Overhaul input (2026-08-20)

The overhaul researched prose-lint prior art with sources; the analysis is
in spec/overhauls/2026-08-20/findings.md, prior-art-maintenance section.

- A TENSION TO RESOLVE AT DESIGN, stated plainly: this record's vision
  rules for Vale and rejects maintaining our own prose linter. The
  research found Vale's code support lints comments only — it cannot
  reach served strings in engine TS, and it lints files, so lane-passing
  form and brief prose is invisible to it. Both halves are evidence; the
  design step decides how they compose (Vale for the markdown corpus,
  something else for the served-string surface, or a ruling that one
  surface goes unlinted).
- The mechanically-checkable voice rules and their parameter split
  (rules' logic vs voice-lint.md data) are inventoried there too, with
  the forbidden-word collision measurement (972 'record' hits including
  the TypeScript type).
