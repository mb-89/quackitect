---
form: rules-bind-to-nodes
by: agent
signed_off: 2026-08-16T17:21:26.236Z
authors: agent
files: null
---

# Evidence form / rules-bind-to-nodes

## current_situation

THE BINDING IS BUILT AND ITS RUN IS OWED. `rules.ts` loads rules declared on corpus nodes, and the guard fires them. The cases exist in `boundrules.test.ts` and have not been run.

WHY THE RUN IS OWED RATHER THAN SKIPPED. The test verb was rebuilt inside this chunk, on the owner's ruling, and the running engine still holds the old code. `se_reload` is legal only at idle, so the new decision cannot take effect this session.

THE BATTERY BELONGS AT VERIFICATION ANYWAY, and that is where this iteration's verdict comes from. The owed run is named here rather than claimed.

## built

### The code

- `project/deliverable/engine/rules.ts` — NEW. `rulesOf(frontmatter)` reads a node's `rules:` list and returns what ARMED and what did not. `brokenHere(frontmatter)` returns the first self-governing rule the node breaks.
- `project/deliverable/engine/guard.ts` — two more questions after the vocabulary check: does every rule declare a way forward, and does this node break one of its own.

### The shape a rule takes, and where it lives

    rules:
      - key: realization
        allows: [make, buy, reuse]
        on_break: refuse

IT LIVES IN THE NODE'S OWN FRONTMATTER. Adding one touches no file under `project/deliverable/engine/`, which is what `req-a-check-binds-without-engine-code` demands and what the case measures with a `git status` before and after.

`on_break` IS REQUIRED AND THAT IS THE POINT. A rule that does not say how a walk gets past it can refuse the very write that repairs the rule it enforces. That has happened once already, at i11's observe-red, and the fix was reasoned out from inside the block. This moves the cost to authoring time.

### What fires at the write and what does not

A SELF-GOVERNING RULE FIRES HERE — no `binds`, so the node it governs is the node in hand and the check costs nothing extra.

A RULE THAT NAMES ANOTHER NODE DOES NOT. Reading the whole corpus per write is the cost `raid-asm-a-bound-check-runs-inside-the-write-budget` warns about, so `binds:` is the sweep's business — chunk seven.

THE REFUSAL NAMES THE NODE THE RULE CAME FROM, so a reader argues with the rule rather than with the engine: "the rule lives on el-x, not in the engine — change the value, or change the rule".

### What else this chunk built, on the owner's ruling

THE TEST VERB NOW DECIDES ITS OWN SCOPE. That was not in the chunk plan; it came from the two refusals closing on each other while this chunk tried to run its cases.

- `engine/discipline.ts` — `decideScope` replaces `batteryGate` and `scopedGate`.
- `engine/tools.ts` — `se_test` takes a `question` and nothing else; `scopedFiles` is deleted.
- `tests/discipline.test.ts` — seven cases drive the decision.
- `guidance/refusals.md`, `AGENTS.md`, `CLAUDE.md` — SE-C-130 and SE-C-131 retired, the new rule taught.
- `raid-dec-the-engine-decides-what-gets-tested` — the i11 decision gains its implementation and four rejected options.

## follow_up

TWO DOORS STAND OPEN: `an-unbound-rule-is-named` and `a-check-names-its-escape`.

ONE RUN IS OWED and it is named rather than assumed. `boundrules.test.ts`'s four cases have never executed. They will run when the engine reloads, and at the latest at verification, where the battery is the engine's own.

WHAT THE OWED RUN COULD STILL FIND. The `rules:` shape is the fixture's guess — `tsp-bound-rules` says so in its own What-the-cases-assume section. If the cases disagree with the implementation on key names, they change and the claims do not.

NOTHING IS BLOCKED. The build continues; only the verdict waits.

## anything_else

### Why this chunk claims built and not green

THE HONEST DISTINCTION. The code is written, wired and typechecked. It has not been executed.

CLAIMING GREEN WOULD BE FABRICATION, and the gate that would catch it is four milestones away. Saying so here is cheaper than being caught there.

### The detour was not scope creep

THE OWNER RULED IT IN, mid-chunk, after the two test refusals closed on each other and left no legal call. The ruling was explicit: the engine decides what gets tested, everywhere, not just at these two gates.

IT ALSO BELONGS TO THIS ITERATION BY SUBJECT. `raid-dec-the-walk-never-reaches-a-state-it-cannot-leave` names the shape — a demand written from the demander's side without checking the other side can answer. Two refusals grading one decision from opposite sides is that shape with two demanders.

CHUNK THIRTEEN WOULD NOT HAVE CAUGHT IT. `no-state-demands-what-it-cannot-supply` checks a STATE's form against its legal tools. This collision was between two refusals inside one verb, which no check over the machine's shape can see. That is worth carrying into that chunk's design.
