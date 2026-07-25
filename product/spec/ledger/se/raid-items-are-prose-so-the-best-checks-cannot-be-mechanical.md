---
id: se.raid-items-are-prose-so-the-best-checks-cannot-be-mechanical
kind: raid
statement: "THE STRUCTURAL PREREQUISITE, found by measurement at i12's M5 and bigger than i12. The checks worth mechanizing most - does the build conform to the architecture's allocation, does every requirement carry a verify_method, does every requirement trace - all compare against facts that DO NOT EXIST IN MACHINE-READABLE FORM. Measured: ZERO element or design nodes in the ledger; the element allocation lives only inside evidence JSON as prose; exactly ONE engine file carries a design: marker, so v1's code-side markers are effectively absent from v2; and a 29-requirement register is one prose string in one evidence field. So the process produces PROSE where a lint needs DATA. This is the same disease the i12 retro found in guidance, one level down: there, a check was written and never collected; here, a claim is written and never structured. Consequence for i12: the lint sweep ships the checks that read run records, git facts, evidence-field presence and log facts - real, and several of them are checks the agent asserted by hand in i8d - while conformance-to-allocation, requirement-field coverage and trace completeness DO NOT SHIP."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: owner
trigger: "Open now; found at i12 M5 and deliberately NOT taken into i12, because ITEMS-BECOME-NODES is a spec-structure iteration and inventing it mid-tooling-iteration would double the scope. OWNER-OWNED because it is a planning decision, not an engineering one: it changes how requirements, elements and allocations are authored for every future iteration. What it would unlock, stated so the value is weighable against its cost: the models-adhered conformance lint (the check that would have caught i8d's escaped defects), requirement-coverage lints, and trace-completeness lints - i.e. most of the mechanical judgement that makes a self-blessed killer trustworthy. Until then, every gate keeps asking the agent to vouch for those in prose. Note the pattern this belongs to: v1 linted models-adhered because v1 HAD the structure; v2 asks for it in words because v2 does not."
---


