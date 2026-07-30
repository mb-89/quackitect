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
- A prefill is a suggestion, never content. Anything the AI prefills for a person stays inert (commented out) until that person confirms it — one confirmation per prefill, never in bulk.
- INPUT IS NOT EVIDENCE, and only evidence is guarded. Prefill hard at the ENTRY of work — a seed's goal, an iteration's vision, a kickoff brief. A wrong value there goes visibly wrong at once, with the person right beside it. The guard belongs at the EXIT, where a report CLAIMS work was done and checked, because that is where an agent would be signing its own homework.
- A PREFILL IS NOT A LAW. The secretary fills the form to the best of their knowledge and sends you on your way; whoever receives it still checks whether the prefilling was right. A prefilled value carries where it came from, and the state that receives it JUDGES it. It is never obeyed because it was already written down.
- Color carries meaning, never decoration: green = pass, red = failure or rejection, yellow = attention.
- TAKE THE COLOUR FROM THE HOST. Running inside another application, use that application's palette for anything it already names — a primary action, a passing check, a warning. Our own hex is the last resort, for a meaning the host has no colour for. A palette we maintain ourselves drifts, and drifts worst against a theme we do not control.
- AN OUTSIDE CONVENTION CAN BEAT THE HOST. The route line stays BLUE, because every map application has already taught that meaning and no editor theme outweighs it. Claiming an exception means naming the convention it rests on.

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

## When a rule here keeps breaking

A prose rule broken more than once wants a LINT or a TEST, not another
sentence. The place rules above were written four times before the reader's
place became a registry with a test refusing anything unregistered. Reach
for the mechanical guard earlier than that.
