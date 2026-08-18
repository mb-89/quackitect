---
form: scope-non-goals
by: agent
signed_off: 2026-08-18T10:54:22.889Z
reopened: "2026-08-18T10:53:12.709Z — The owner asked for the extension affordance and v1's end-to-end chain, and this state excluded the affordance by name. Their words: a create-vehicle button, a start-a-project button, and the plugin runnable from projects a vehicle drives."
authors: agent
files:
---

# Evidence form / scope-non-goals

## current_situation

The walk stands at scope-non-goals, REOPENED a fourth time, because the owner asked for something this state excluded by name.

WHAT THEY ASKED FOR, 2026-08-18: a CREATE VEHICLE button in the extension that asks what the export asks, makes the vehicle and opens a new window in it; a START A PROJECT button doing the same for a project; and the plugin RUNNABLE FROM PROJECTS a vehicle drives, not only from vehicles.

WHAT THIS STATE HAD SAID: "This iteration makes ONE COMMAND produce a descendant; it does not build the desk affordance around beginning one." That was my own sentence and it is now wrong.

AND THEY NAMED PRIOR ART THAT TURNS OUT TO BE EXACT. Their correction: the extension is v3-only, but spawning a vehicle and running a subproject was already in earlier. CONFIRMED BY SEARCH — neither ancestor carries an extension, and v1 carries the chain as a passing test.

WHAT THAT TEST IS. product/engine-go/i18_red3.go at ref main, read whole: a vehicle is scaffolded, commits its own method into its overlay, creates a STUB, and the stub resolves the vehicle's method with the override beating the vendored copy. Captured as note-b966f8fd311e with the mechanism it settles.

## scope

WHAT THIS ITERATION TAKES ON, seven items, each traceable to a goal in the signed vision packet or to an owner instruction.

ONE — SPAWNING A DESCENDANT THAT RUNS ALONE. A complete, independent copy under its own name, on a machine that has never held the parent. Serves goal 1. HALF EXISTS ALREADY: `RUNME.ps1 --export` produces a real independent repository today, at lines 57-155. AND THE PROBE FOUND WHAT IT LACKS: it makes a fresh repository with ONE commit and no history, which is the only reason its copies cannot take an update.

TWO — DRIVING A PROJECT THAT IS NOT ITSELF. Serves goal 6, and it is the second of the two capabilities the owner named. The engine drives work that lives somewhere other than its own tree.

- WHAT IS ACTUALLY NEW: separating WHERE THE METHOD COMES FROM from WHERE THE WORK IS. Today they are the same place, and project/product.md declares this product self-hosting.
- AND v1 ALREADY SOLVED IT, in a way this iteration should port rather than invent. Its driven project records the VEHICLE as its engine home in a pointer file, and `--base <dir>` sets the root. note-b966f8fd311e carries the detail.
- THE OBSTACLE IS NAMED AND IS NOT TO BE WEAKENED: raid-iss-the-path-jail-has-one-write-target.

THREE — THE AFFORDANCE, IN THE EXTENSION. NEW AT THIS REOPEN, on the owner's instruction, and it is where both capabilities become reachable.

- A CREATE VEHICLE action that asks what the export asks, produces the vehicle, and opens a new window in it.
- A START A PROJECT action of the same shape, opening a new window in the project's folder.
- AND THE PLUGIN RUNS IN BOTH. Not only in a vehicle but in a project a vehicle drives, which is the load-bearing third of the three and is not a button at all.
- WHY IT IS IN SCOPE RATHER THAN AFTER IT: a capability nobody can reach from the surface is one nobody uses, and the owner's own framing is that this is the expected behaviour rather than a follow-on.

FOUR — ISOLATION, AND IT CONSTRAINS THE SPAWNING RATHER THAN THE RUNNING. Nothing a descendant does may reach the source it came from automatically, and no structure created while spawning may let a later operation follow a path outward. Serves goal 2. AND THE PROBE SHARPENED IT: on Windows a junction destroys a neighbour through `git worktree remove --force` at exit code 0, while a directory symlink cannot be created without elevation. The check is per platform or it is theatre.

FIVE — THE OVERRIDE LAYER. A descendant's own content sits over what it carries, and where identities collide the descendant's wins. Serves goal 3. The owner's words: "SE has to have all the files, and it has to have an override layer." It is the only thing no existing alternative offers, because every alternative merges FILES and this resolves IDENTITIES.

SIX — TAKING A STANDARD MECHANISM FOR RECEIVING, NOT DESIGNING ONE. Serves goal 5. PROBED AND SETTLED: `git clone` then a pull, zero files silently lost, one honest conflict a person resolves. A vehicle re-homed to an internal version control with no link back still takes an update later by address. What remains ours is the drift report.

SEVEN — CHOOSING WHERE THE OVERRIDING CONTENT SITS. Held as raid-risk-the-overlay-location-is-unchosen, and it is the reason this iteration is a major.

### The demonstration, which is now designed rather than owed

THE END-TO-END TEST IS v1's AND IT IS PORTABLE. Spawn a vehicle, have the vehicle create a project, and check the project runs. v1's version also asserts the override beats the vendored copy and that the machine-global pointer is never captured.

THAT IS BOTH CAPABILITIES IN ONE PASS, and it is what the three MUST stories get demonstrated by. tests/overlay.test.ts is the planned home tsp-overlay-seam already names.

## non_goals

WHAT THIS ITERATION DELIBERATELY LEAVES, each with where it went.

BUILDING OUR OWN MERGE OR UPDATE MECHANISM. Out on the owner's ruling: "We are just doing what everybody already does. Don't reinvent anything." PROBED AND CLOSED: clone-and-pull does it, measured on 2026-08-18.

PLAYING CHANGES BACK UP TO THE PARENT. Out on the owner's ruling — "that's not that important right now". WHAT THIS ITERATION STILL OWES IT: not foreclosing it. When it comes it is a process that ANALYSES changes and offers them as notes, which is a proposal somebody reads rather than a write.

THE FOLDER REWORK. Removing the wrapper repository root is not done here. Where it went: its own iteration, later, on the owner's ruling. A descendant carries whatever layout the parent had, so the layout question is the parent's alone.

MODULE-QUALIFIED IDS, and the whole of i10. The owner ruled them later and accepted more total work. The `depends_on` edge is cut and the argument is on the kickoff.

THE 121 BROKEN CITATIONS. Where it went: i10, and nowhere else is possible — their sources are `.se/req-mine-v1.md` and `.se/req-mine-v2.md`, and `.gitignore` line 2 means they travel to no clone.

RE-GRADING THE VENDORING NODES. vp-vendoring is a MUST served only by shoulds and coulds — raid-iss-a-must-value-prop-is-served-only-by-coulds. Where it went: the owner's ruling. Doing it from inside the iteration that benefits would be marking my own work.

BRAND SUBSTITUTION AT RENDER TIME. Explicitly out and already ruled: v1 rejected rewriting text the ledger hashes, because it hides content from the trust chain.

THE PARALLEL-COORDINATES WORK the record pulled from the pool on 2026-08-13. Where it went: whichever record next touches the front card, which the owner has separately ruled has not earned its keep.

AND THE WALK DEFECTS FOUND WHILE GETTING HERE. note-8a5e4959bbba records two states crossed unsigned at a recompile, a router that draws only forward, and `completeState` throwing a raw error with no clause. Where it went: the build phase, on the owner's ruling after they read the illegal shape off the panel.

### Two exclusions were REMOVED rather than added

THE FIRST WENT THIS MORNING. "Patching the vendored engine in place" was forbidden here, and the owner ruled the opposite: a descendant owns everything it carries. The fear behind it was real and has MOVED rather than evaporated — an edit can still meet an update, which git answers in one line: resolve it in the usual ways.

THE SECOND GOES NOW, AND IT WAS MINE. "This iteration makes ONE COMMAND produce a descendant; it does not build the desk affordance around beginning one." The owner asked for exactly that affordance and called it the expected behaviour. IT IS RECORDED HERE RATHER THAN QUIETLY DELETED because the reasoning behind it was not silly — an affordance over a capability that does not work yet is decoration. What was wrong was the assumption that the capability lands first and the surface later, when the surface is how anybody finds out whether the capability works at all.

WHAT STAYS OUT OF THE AFFORDANCE, so item three does not sprawl: the rest of tsp-product-scaffold's family — req-scaffold-from-template, req-begin-touches-nothing-existing, req-fresh-product-starts-empty. Two actions and the ability to run in a driven project is the scope. A full begin-a-product experience is not.

## follow_up

IMMEDIATELY: gate-motivation falls with this change and is re-signed against seven scope items rather than six.

THEN EVERY M2 AND M3 STATE, and three of them need ADDITIONS rather than a re-sign.

- write-stories owes a story for the affordance: somebody presses create-vehicle, answers what the export asks, and lands in a new window in their own vehicle. It is stk-vehicle-owner's, and it is the RAMP-UP for every other story in this iteration, because it is how a vehicle comes to exist at all.
- generalize-use-cases owes extensions on both use cases: uc-vendor-and-overlay step 1 gains the extension offering the act in the surface, and uc-drive-a-foreign-product step 1 gains the same.
- write-requirements owes at least one row, and it is not a button. THE PLUGIN MUST RUN IN A TREE THAT IS NOT ITS OWN, finding its method through a recorded pointer to the vehicle that made it. That is v1's engine-home mechanism and it is the third part of the owner's ask.

AND derive-criteria WILL NEED REDOING, because the pool grows with whatever rows M3 adds. That is the standing artifact working as designed: a new requirement turns the state grey because a pair went unjudged.

WHAT enumerate-space INHERITS THAT IT DID NOT HAVE. note-b966f8fd311e carries v1's whole chain as a candidate that has already been RUN, including the shape of the hazard it guards against — a bare engine method directory inside a vehicle, which stole the pointer live before somebody wrote a test for it.

## anything_else

THREE SCOPE DECISIONS STAND HERE, and all three are the owner's rather than mine. They are named so any of them can be overturned in one line.

### One — the foreign project, added this morning

The owner named two capabilities and routed this iteration to deliver both. The list had one. Leaving it out would have been the scope decision.

### Two — the affordance, added now

Their words are that this is the expected behaviour: a create-vehicle button, a start-a-project button, and a plugin that runs in projects. WHAT IT COSTS is that scope grew twice in one afternoon, and everything signed below this state falls each time.

WHAT WOULD CHANGE IF I HAVE READ IT WRONG: item three comes out and goes to its own iteration. Nothing else moves, because the buttons serve goals that already exist rather than adding one.

### Three — staging the receiving mechanism

The CHOICE is in scope and the STAGING is specify-build's. That reading is now stronger than when it was made, because the probe showed the mechanism is `git clone` and a pull rather than anything to build.

### What this state has learned about its own reopening

FOUR REOPENINGS IN ONE DAY, and the pattern is worth naming for the retro. Every one came from the owner rather than from a check, and every one added something the agent had excluded or never considered.

- The sealed model, which the vision was built on and nobody had asked for.
- Vendoring being ordinary, which turned a crippling risk into a mechanism choice.
- The foreign project, which was half of what they asked for.
- The affordance, which this state had excluded by name.

WHAT THEY SHARE: none was catchable by reading the corpus, because in each case the corpus AGREED with the wrong answer. The seal was a standing requirement. The scope exclusion was signed evidence. THE ONLY INSTRUMENT THAT FOUND THEM WAS THE OWNER READING WHAT THE AGENT WROTE, which is an argument for showing work early rather than for checking harder.
