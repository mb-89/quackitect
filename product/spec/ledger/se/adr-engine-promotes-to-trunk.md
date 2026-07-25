---
id: se.adr-engine-promotes-to-trunk
kind: decision
statement: "ENGINE CHANGES LAND ON TRUNK FROM AN OPEN ITERATION, UNDER THEIR OWN DISCIPLINE, RATHER THAN WAITING FOR THE CLOSE. ADDRESSES R33, R34, and tension T2 (the walking agent versus the parallel agent).\n\nTHE RULES, enforced rather than remembered: trunk current with its upstream and clean in the promoted files; engine, binary, test and manifest files ONLY; the WHOLE suite green IN TRUNK after the copy and before the commit; and trunk restored exactly on any failure.\n\nWHY IT EXISTS: the shim spawns its engine child from trunk, so an iteration can never run the engine it is building - a cost measured at six declared workarounds in one day. The obvious alternative, sourcing the child from the open worktree, dies on parallel agents: two iterations would be judged by DIFFERENT machines, one collecting the review rounds and one not, and a gate would stop meaning one thing. The engine is a SHARED JUDGE and cannot be per-iteration.\n\nTHE HONEST COST: engine code reaches trunk before its own iteration's gates have reviewed it. The suite is the guard, and the guard must therefore be trustworthy - which is why an empty verification run counts as FAILED. A suite spawned from inside a test inherits a context variable, runs nothing, and reports zero passed and zero failed; zero failures reads as green, and a promotion that runs nothing and calls it proof is the worst state this mechanism can reach.\n\nKNOWN LIMIT: the promotion runs trunk's copy of its own code, so a fix TO the promotion cannot be delivered BY the promotion. Bootstrapped by hand twice; logged as work for the next iteration together with the five distinct diagnosis failures it produced."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


