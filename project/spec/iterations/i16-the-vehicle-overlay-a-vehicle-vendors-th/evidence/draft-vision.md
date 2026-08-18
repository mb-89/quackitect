---
form: draft-vision
authors: agent
files:
---

# Evidence form / draft-vision

## current_situation


## goal_system

THE VISION IS INHERITED, NOT REDRAWN. This is a minor, and the resident value prop already says what this iteration builds, in its own outcome line: a vehicle vendors the engine and overlays its own guidance, methods and behaviour through one resolution chain, and never writes under the engine. vp-vendoring, graded MUST. Nothing here moves the big idea, so there is a pointer and a delta rather than a new axiom.

AND THE ESCALATION CHECK PASSES. This delta needs no NEW goal. Every goal below refines vp-vendoring, and a delta that needed a new one would be arguing for a new vision.

THE TWO SUCCESS CRITERIA ARE ALREADY MEASURABLE, which is unusual and worth using rather than restating.

- Writes under the engine during a vehicle run. Target: ZERO.
- The vehicle repository's dependencies on the quackitect working copy. Target: NONE.

Both are counts a test can take, and both become pass lines downstream rather than judgments.

### The goals, most important first

1. NOTHING OF THE HOST'S LIVES UNDER THE ENGINE, and the engine writes nothing there. This is first because it is what makes every other goal possible: the moment either side writes into the other's folder, an update stops being a replacement and becomes a merge.
2. THE HOST'S METHOD WINS WHERE IT EXISTS, and inherits where it does not. One chain, most-specific first, identity deciding.
3. IT WORKS WITH NO OVERLAY AT ALL. A builder can run the engine before deciding to overlay anything, with zero authored configuration.
4. AN UPDATE REPLACES THE FOLDER WHOLE, and whatever stops resolving is REPORTED rather than quietly defaulted.
5. ONE COMMAND MAKES A VEHICLE, with the engine vendored, an empty overlay ready, and no second install.

### The conflicts, named openly and ruled

THREE ARE ALREADY RECORDED IN THE CORPUS, in the requirements' own `weighs_against` lines. They are quoted rather than re-derived, and this state confirms them rather than inventing a new order.

THE SEAL AGAINST THE OVERLAY. req-engine-folder-is-sealed records `weighs_against: req-overlay-resolution >`, so the seal outranks.

RULED, AND IT AGREES. An overlay that cannot express something is a limitation somebody can work around. An overlay that writes under the engine destroys the update path for everyone, silently, and is only discovered at the next version. Goal 1 sits above goal 2 for that reason.

THE OVERLAY AGAINST SURVIVING AN UPDATE. req-overlay-resolution records `weighs_against: req-overlay-survives-update >`, so serving the overlay's card outranks surviving the update cleanly.

RULED, AND IT AGREES. A chain that quietly falls back to the engine's card because an update renamed something is the worst outcome available: the builder's method stops applying and nothing says so. Serving the overlay and REPORTING the drift is why goal 4 carries a report rather than a fallback.

TRYING IT AGAINST INSTALLING IT TWICE. req-setup-serves-shipped-method records `weighs_against: req-second-product-reuses-install > — not being able to try the engine blocks adoption; a repeated install only slows it`.

RULED, AND IT AGREES. Goal 3 sits above goal 5. A slow second product is an annoyance; a product you cannot try without authoring method first is one nobody adopts.

### Two conflicts this iteration adds, which the corpus does not carry

THE DOGFOOD REPOSITORY AGAINST A VEHICLE. One engine has to serve both, and they have different shapes: this repository IS the engine, a vehicle merely holds it.

RULED: PROBE, DO NOT MOVE. v1 settled this and its answer was read at ref main today. `EngineDir()` looks for `tools/vendor/quackitect` and falls back to `product/quackitect`, so one binary serves a vehicle and the dogfood repository without either changing its layout. The alternative — making this repository look like a vehicle — is a folder rework the owner has explicitly ruled may come later.

A WORKING VENDORING AGAINST A COMPLETE ONE. The owner's constraint is that the vehicle and a foreign project start tomorrow. The full story is larger: the scaffold family, the desk affordance around it, the module layout.

RULED: A WORKING VENDORING WINS, AND WHAT IS CUT IS NAMED. Everything dropped is listed in the kickoff's left_out with where it went, so the cut is visible rather than quiet. This is the one conflict where the ruling comes from outside the corpus, and it is recorded here so a later reader sees that a deadline shaped it.

## follow_up


## anything_else

