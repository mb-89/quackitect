---
form: derive-functions
by: agent
signed_off: 2026-08-17T11:46:36.414Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

Seven functions and six flows are derived from the five requirements, all in one cluster: the-arrival.

The decomposition follows what has to be TRUE at the end, not what se-arrive.ts happens to do in what order. Two of the seven do not correspond to a single function in the script.

## functions

- fn-arrive-on-a-machine.resolve-the-cited-refs
- fn-arrive-on-a-machine.judge-the-runtime
- fn-arrive-on-a-machine.supply-the-dependencies
- fn-arrive-on-a-machine.place-the-cage
- fn-arrive-on-a-machine.raise-the-lane
- fn-arrive-on-a-machine.hand-over-the-means-to-call
- fn-arrive-on-a-machine.account-for-the-arrival

## flows

- flow-arrival-request
- flow-repository-refs
- flow-runtime-verdict
- flow-placed-cage
- flow-live-lane
- flow-arrival-account

## neutrality

THE CHECK IS WHETHER A DIFFERENT SOLUTION COULD SATISFY THESE FUNCTIONS, and it can. Here is the pass, function by function, against the implementation that exists.

NEUTRAL, and each names a real alternative.

- resolve-the-cited-refs says make the cited branches resolvable. It does not say git fetch, and a host that cloned unshallowed with all branches satisfies it by doing nothing.
- judge-the-runtime says judge the running runtime against the declared floor. A container image pinned to a satisfying runtime meets it without a check running at all.
- supply-the-dependencies says bring them to what the project declares. npm is one way; a prebuilt image or a vendored tree is another.
- place-the-cage says put the deny list where the host reads them. The VS Code extension already does this differently, and the RUNME does it a third way.
- raise-the-lane says bring up a lane an already-running agent can attach to. HTTP is how it is done; a unix socket or a named pipe would satisfy the same function.
- hand-over-the-means-to-call says give the agent a way to call that needs nothing it lacks. A written client is one answer. A harness that could register the MCP server live would be a better one, and would satisfy this function while deleting the implementation.
- account-for-the-arrival says report each step and never end the session. Nothing about it names stdout or a hook.

WHERE NEUTRALITY IS THINNEST, said plainly rather than claimed away: raise-the-lane and hand-over-the-means-to-call are two functions only because a running agent cannot attach an MCP server to itself. If raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server is falsified, the pair collapses into one function and the second implementation disappears. So the SHAPE of this decomposition is contingent on an assumption, and the assumption is in the register with a trigger rather than buried here.

THE ONE THING NO CHECK CATCHES: nothing mechanical can tell that these seven were derived from the requirements rather than read off the script. The evidence that they were is that two of them — account-for-the-arrival and hand-over-the-means-to-call — cut across the script's own function boundaries, and one of them, judge-the-runtime, is satisfied by a host doing nothing at all.

## follow_up

- Fold the shared four (refs, runtime, dependencies, cage) into one module against se-start, which is where these functions already say the two entrypoints agree.
- Revisit raise-the-lane and hand-over-the-means-to-call if the MCP-attach assumption is ever falsified; they collapse into one.

## anything_else

THE CLUSTER IS NEW: the-arrival. Every existing cluster in the corpus assumes a lane already up, so none of them could hold these.

flow-arrival-account IS BOTH AN INPUT AND AN OUTPUT of account-for-the-arrival, and that is deliberate rather than a mistake in the wiring. Each step produces its own line, and the accounting function is what turns those lines into the one report the agent reads. Modelling it as two flows would have invented a distinction nothing downstream uses.

## register

- req-one-command-takes-a-fresh-clone-to-a-live-lane
- req-the-arrival-never-costs-the-session
- req-arriving-twice-changes-nothing
- req-every-ref-the-corpus-cites-resolves-on-arrival
- req-the-declared-runtime-floor-is-read-never-edited

## set_criteria

- complete: The set covers every step of the use case's main scenario and every extension that can lose work. Steps 1 to 8 are covered by req-one-command; extensions 2a and 2b by req-every-ref; 3a by req-the-declared-runtime-floor; 1a and 1b by req-arriving-twice; and every failure branch by req-the-arrival-never-costs-the-session. WHAT IS DELIBERATELY NOT COVERED: extension 8a, the pull answering wait on the dial. That is not the arrival's behaviour, it is the walk's, and it belongs to vp-autonomy-range.
- consistent: No two requirements can both be satisfied only by contradicting each other. The one pair worth checking is req-the-arrival-never-costs-the-session against req-the-declared-runtime-floor-is-read-never-edited, because one says never end the session and the other says stop. They are consistent because they bind different subjects: the RUNTIME CHECK stops the arrival, and the HOOK reports that and leaves the session running. The arrival stopping is not the session ending.
- affordable: The whole set is satisfied by one script and one hook, both written and running. The cost is measured rather than estimated: se-arrive.ts and se-hook-arrive.ts, against roughly an hour of hand-work per cloud run that they replace.
- bounded: Every requirement names its trigger — a session starting, a step failing, an arrival repeating, the arrival completing, a runtime below the floor. None is phrased as a standing obligation over unspecified conditions, so each one has a moment where it is either met or not.
- comprehensible: Each states one obligation in one sentence, in EARS shape, with the detail below the frontmatter rather than inside the statement. A reader who knows nothing of this project can tell what would violate each one.
- no_tbd: No requirement carries a placeholder, a to-be-decided or an unnamed quantity. The one number that is genuinely unknown — the after-measurement of the arrival on a fresh box — lives in the value prop's success criteria as a target with a stated gap, not in a requirement.
- behaviour_modelled: The behaviour is modelled in uc-arrive-on-an-unattended-machine, whose main scenario is the ordered eight steps and whose extensions are the branches. The requirements refine that use case rather than restating it, and each names the step or extension it binds to in its source_refs.
