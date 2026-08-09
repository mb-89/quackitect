---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-09T10:55:01.754Z
amended: "2026-08-07T19:58:46.913Z by agent — the export finding stood open; the owner ruled it deferred scope with v1's book as the known solution, and an open finding invites re-litigation"
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

The register and the function structure both stand. 146 requirements, 17 function nodes, 12 RAID entries. Coverage is closed both ways, enforced by the engine at each submit rather than asserted here.

This is the end of design input. Everything after it is solution space.

What reached this gate was walked today after two false starts. The fan handed out one leg and the walk could not come back for the other. That is fixed, and the fix is what let this gate be reached at all.

## round_0_verify

- evidence vs claims: every count below was re-measured at this gate against the corpus as the qualities restructure left it, and none is carried over. 150 requirements, all naming a verify method. 56 must, which is 37 per cent. Zero TBD, TBC, TBR or ??? across the whole trace corpus. 19 qualities across nine characteristics, none empty. 17 function nodes. 12 RAID entries. PASS.
- types: ran conformance over all 250 trace nodes directly, and every one answers its own template. It caught a real failure first: the nine characteristic use cases were written with kind: characteristic where the template allows interaction or quality-area, and all nine refused until corrected. PASS.
- lint: coverage closes both ways on all three edges, measured rather than asserted — story to value-prop, use-case to story, requirement to use-case, with no orphan on either side of any of them and zero dangling refines anywhere. The feeder cone is signed, which a gate refuses without. PASS.
- tests: the functions cover the register, proven by derive-functions re-signing itself on this walk without asking for a form, which is the covers check passing against the four new requirements. The engine battery stood at 891 of 891 with preflight green before the gate fill. PASS, and the coverage half is the engine's verdict rather than mine.

## round_1_validate

- exercised against the goal: design input closes with the register and the function structure both standing, which is what this milestone is for. The 2026-08-07 qualities ruling that blocked the previous run is now applied rather than overridden — vp-qualities keeps one explainer story, the nine ISO/IEC 25010:2023 characteristics are the use cases, and the qualities hang beneath them. PASS.
- missing: nothing this review found. Asking all nine characteristics in full is what closed the last gap: four demands nobody had written, one of them a live defect.
- wrong: one placement was corrected by the owner mid-work. Auditability was first put under Security on the strength of accountability. The standard has no understandability; it has analysability under Maintainability — assess the impact of a change, diagnose causes of failures — which is what an audit trail is for here. It moved to Maintainability.
- out of scope: nothing. The four rows added were each grounded in existing code, an existing test, or a measured failure rather than invented to fill a characteristic.
- prior art: scanned live, four searches across this gate's two runs. WHAT THEY DO BETTER FIRST. StrictDoc exports to formats auditors accept and we export nothing (https://www.pistack.xyz/posts/2026-06-15-self-hosted-requirements-management-rmtoo-doorstop-strictdoc/). Jama and Polarion carry test management and a regulated-industry record (https://g2.com/compare/jama-connect-for-requirements-management-vs-polarion). Statewright ships our lane's idea for five hosts against our one (https://app.daily.dev/posts/state-machine-guardrails-for-ai-agents-msydtbukk). LaneKeep sells the tool-call sidecar as a product (https://galileo.ai/blog/best-ai-agent-guardrails-solutions). WHAT OURS SHEDS: the requirements tools have no walk and the guardrail tools have no requirements; ours is one system where the process machine and the register are the same artifact. I have run none of the five, so this is evidence a feature is claimed and never that it is good. The standard itself was verified rather than recalled (https://quality.arc42.org/articles/iso-25010-update-2023 and https://www.iso.org/obp/ui/en/#!iso:std:78176:en).

## round_2_red_team

- four requirements were written DURING this gate's own review, so the reviewer is no longer only reviewing => correct as stated, and the defence is narrow. Each was grounded in existing code, an existing test or a measured failure. But they were authored by the hand that now judges them and no other hand has read them. If you read only four rows in this register, read those four.
- req-mirror-stays-on-the-machine records a demand that was NOT met when written, and a register of aspirations is a wish list => it is met now, and the row says plainly in its Detail that it was not at authoring. The row came first and the fix followed, which is the right order and looks like the wrong one.
- the characteristic field is dead: 8 of 19 qualities carry it, nothing in the engine reads it, and it duplicates the refines edge => accepted, and it is my own doing from re-pointing rows unevenly. The owner agreed on 2026-08-07 that it is obsolete; it is noted for removal at the retro as note-69d710297f3c. Not done here: striking a template field is a method change and editing the rules while judging against them is the wrong moment.
- nine of twelve RAID entries are about the machinery being young rather than about this artifact => unchanged from the last run and still open. The entries are honest and carry triggers; they are just not about the design input.
- THE REQUIREMENT REGISTER CANNOT BE HANDED TO ANYBODY WITHOUT THE REPOSITORY => RULED AND CLOSED by the owner on 2026-08-07, and recorded here so it is not re-derived at every gate. THE FACTS FIRST, stated carefully because the loose version of this finding was wrong: the 150 rows are markdown with YAML frontmatter and any tool opens them, which req-every-artifact-is-readable-text demands. What is missing is PACKAGING — no single document, no ReqIF, no PDF, no HTML bundle — so reading the register means cloning the repo. StrictDoc exports to formats auditors accept and we do not, which is the one axis where it plainly beats us today. THE RULING: the solution exists and is not lost. v1 built it as THE BOOK across spec/iterations/i0012_spec_book, i0019_strangers_book and i0027_book_feedback at ref main, with a reader's own instructions at spec/ifus/ifu0005-reader.md. It is out of i1 because i1 exists to prove the iteration machinery works end to end; the v1 and v2 features return afterwards, each in its own iteration. So this is DEFERRED SCOPE WITH A KNOWN DESIGN rather than a gap: the absence is a choice, the reason is stated, and the re-entry condition is that i1 closes and the feature iterations begin. Carried as note-93ddc77bf9ae for the retro to park as backlog.
- the gate carries no fields of its own, so nothing forces these rounds to hold counts rather than confident prose => half right. The mechanical claims are checked elsewhere and re-asking them teaches skimming. The only answer is that the rounds carry measured numbers, and every one was re-taken today.
- THE KILL CRITERION, named and looked for: a requirement no function serves, or a function no requirement asked for => looked for by the coverage check at the derive-functions submit, both directions, and it passed without asking for a form. NOT KILLED.

## raid_additions

- none

## verdict

pass — design input closes with the register and the function structure both standing, and the nine-characteristic sweep that found four unwritten demands is what closed the last gap.

## follow_up

- the trace stops at the functions. The next radius down is the architecture and the design elements, and the owner reviews the whole trace once it reaches them.
- the record lifecycle function is the first split to reconsider, and landing is the piece with the strongest case for standing alone
- raid-lane-works-on-posix stays open on purpose. One battery run on a second platform settles it.
- raid-strip-types-flag-holds can be closed, and the lane can drop the now-dead --experimental-strip-types flag
- seven notes stand for the retro, including the branching-point design and three instances of the escaping class

## anything_else

