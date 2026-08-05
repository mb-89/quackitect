---
id: ux
statement: How to build an interface. The owner owns visual design; these are the rules a build must not break.
---

# ux — how you build an interface

These rules bind every surface a person looks at. How you WRITE the words
on it is voice.md. How you write the CODE behind it is software.md.

## Nothing ever hangs

This is the first rule because it is the one that keeps being broken, and
it has two halves. Building one without the other is worthless.

- Show feedback within a second. Any interaction that can take longer than a second shows loading feedback at once. A progress bar with real progress where progress exists; an indeterminate bar otherwise. Silence reads as breakage.
- NEVER BLOCK THE PROCESS THAT DRAWS THE INTERFACE. Anything that can take longer than a second goes to the background. A rule about showing a spinner is worth nothing if the loop that would render it is frozen.

The second half is the one that bites. A blocking call in the server that
serves the page takes down every surface at once, and the symptom lands
wherever the reader happened to click — so it always reads as a rendering
bug somewhere else.

## The owner owns visual design

- A sketch is a contract: render exactly what it shows.
- Never add a visual element the sketch does not show. A missing affordance becomes a question to the owner, never a silent addition.
- A SKETCH ALSO SAYS WHAT IS NOT THERE. An element missing from it is STRUCK, not kept because it happened to exist first. Redrawing a screen without a control the old screen had is the sketch doing its job, and "it was already there" is not a reason to leave it.
- STAY VERY CLOSE TO THE DRAWING. This is not a style preference, it is a known weakness: the assistant's visual judgment under this harness is not good enough to improvise with, and every departure from the sketch has been a step backwards. When the drawing and your taste disagree, the drawing wins.
- NO SLIDERS UNLESS THE SKETCH DRAWS ONE (owner, 2026-08-01). A slider implies a continuum and a total order. Most of what has been built with one was really a set of named CATEGORIES, and it wanted buttons and line edits instead. The autonomy, shutdown and narration controls were all this mistake.
- A prefill is a suggestion, never content. Anything the AI prefills for a person stays inert (commented out) until that person confirms it — one confirmation per prefill, never in bulk.
- INPUT IS NOT EVIDENCE, and only evidence is guarded. Prefill hard at the ENTRY of work — a seed's goal, an iteration's vision, a kickoff brief. A wrong value there goes visibly wrong at once, with the person right beside it. The guard belongs at the EXIT, where a report CLAIMS work was done and checked, because that is where an agent would be signing its own homework.
- A PREFILL IS NOT A LAW. The secretary fills the form to the best of their knowledge and sends you on your way; whoever receives it still checks whether the prefilling was right. A prefilled value carries where it came from, and the state that receives it JUDGES it. It is never obeyed because it was already written down.
- Color carries meaning, never decoration: green = pass, red = failure or rejection, yellow = attention.
- TAKE THE COLOUR FROM THE HOST. Running inside another application, use that application's palette for anything it already names — a primary action, a passing check, a warning. Our own hex is the last resort, for a meaning the host has no colour for. A palette we maintain ourselves drifts, and drifts worst against a theme we do not control.
- AN OUTSIDE CONVENTION CAN BEAT THE HOST. The route line stays BLUE, because every map application has already taught that meaning and no editor theme outweighs it. Claiming an exception means naming the convention it rests on.
- COLOUR IS CONFIGURATION, NEVER CODE (owner ruling 2026-07-30).
  - One palette file holds every colour the product chooses.
  - A person edits that file. Changing a colour never means changing code.
  - The surfaces read it LIVE. An edit shows without reloading the machinery.
  - A colour written at the place it is used is a defect.

## The reader keeps their place

- ONE SURFACE NEVER RESETS ANOTHER. Acting in one pane says nothing about what the reader has open beside it. Changing which machine is on screen does not clear the details pane; checking a box does not scroll the feed.
- Never change anything the last change did not touch.
- Panes hold their size. Content never resizes the layout.
- Interacting with a field never collapses its surface. No fold closes, no scroll resets, no pane re-opens — the reader keeps their place through every click.
- Carry the reader's place through a navigation. A link that rebuilds the page takes the open selection with it, or it is the same reset wearing a different hat.
- A surface that MOVES carries its subject with it. Popping a pane into its own window shows what the pane was showing, never a fresh default.
- A popped-out copy holds still. It keeps what it was opened on and does not follow the walk, so several can stand side by side. It says so on itself, quietly — a snapshot that looks live is a trap.
- Only content that is GENUINELY GONE may clear. If what they had open no longer exists, say so in its place. Never silently swap in something else, and never quietly close it.

## Every element answers for itself

- Every widget gets a maximize control. It opens the widget full-screen as a modal over the grayed page. Close returns to the layout.
- Click for detail. Clicking an element shows its details: a dedicated surface if one exists, the details pane as the fallback.
- Help is a detail, never a button. Clicking a control surfaces its context-sensitive help in the details pane. No dedicated help buttons or icons exist anywhere.

## Figures

- Prefer a diagram over prose when it transports the information better. Use figures generously.
- Author every figure in a text-based form: inline SVG with real text, Mermaid, or ASCII. A machine must be able to read it.
- Give each figure one line saying what to see in it.

## Fix the whole wire

A surface behavior is never one change. It spans the engine's state, the payload that carries it, every host's wake channel, and the DOM that draws it. Fixing one leg and shipping is the failure this project repeats most.

Four times in one day (2026-08-04) a change landed with one leg missing:

- Colours: the data was right. The CSS rule never existed.
- The route line: the route was right. The projection matched the wrong prefix.
- The submit: the instruction advertised it. The pull never routed it.
- The set-target redraw: engine and page were fixed. The extension's relay was not.

So before shipping a surface behavior, NAME EVERY LEG:

- The engine state that holds the new fact.
- The payload that carries it outward.
- Each host's wake channel. The browser event stream and the extension relay are SEPARATE builds.
- The DOM update that draws it.

Then verify the new datum travels each leg. The extension does not recompile with the engine. It is the leg people forget.

TWO GREEN HALVES ARE NOT A GREEN WIRE. The guard is a SEAM test per wire. Assert that the payload carries the field. Assert that the surface acts on it.

## Reuse the surface, never rebuild it

Before drawing anything, find what already draws it. A second surface for a job one surface already does is the most expensive mistake on this page, because both halves keep working and only their disagreement is visible.

Three came out of one afternoon on the trace graph (2026-08-05):

- A second details panel was built beside the real one. The page already routes every click through `clickable` and `data-detail`.
- The nodes were styled from scratch and came out black on black. The machine view's `state` and `label` classes already carry the host's palette.
- A per-control help popover was invented. Help is a detail and belongs in the details panel, which this document already said.

So, before writing a line of a new surface:

- Name the element that does this job today, and read how it does it.
- Take its CLASSES, not its colours. A class inherits the host's theme; a colour you pick does not.
- Take its EVENT PATH. If a click already reaches the details panel, join that path rather than opening a second one.
- Only what genuinely has no precedent is new code. On the trace graph that was three things: the rings, the edges and the filter pills.

A NEW SURFACE IS A CLAIM THAT NOTHING FITS. Make the claim out loud, in one line, or do not make it.

## When a rule here keeps breaking

A prose rule broken more than once wants a LINT or a TEST, not another
sentence. The place rules above were written four times before the reader's
place became a registry with a test refusing anything unregistered. Reach
for the mechanical guard earlier than that.
