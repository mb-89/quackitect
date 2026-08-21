---
id: i56-build-the-help-dictionary-and-the-previe
status: seeded
opened: 2026-08-21T13:16:52.792Z
goal: "Build the help dictionary and the preview surface, and prove both on one screen. The dictionary is a generated index keyed by id, carrying a title, an abstract and an href for every addressable thing. The preview is a hover-opened non-modal dialog that shows the abstract and always carries an open-details link. Both must run unchanged in the mirror and in a static HTML export, because the export carries the whole help system and has no server behind it. Also rename the statement frontmatter key to abstract across the corpus, and build whatever tooling that rename needs."
vision: "DONE LOOKS LIKE: one screen where every glossed term and every control opens a preview on hover, the preview can be entered with the mouse, a term inside a preview opens its own preview, and the open-details link reaches the full thing. The same screen exported to a single static HTML file behaves identically with no server.\n\nTHE MODEL IS WIKIPEDIA PLUS NESTING. Wikipedia's Page Previews is the largest hover-preview deployment on the web and published its result: distinct pages explored per session rose 21 percent against a 4 percent fall in pageviews. Nesting is the part Wikipedia does not have, and Paradox has shipped it in two games since 2020. We combine two shipped halves rather than inventing one.\n\nTHREE LAYERS.\n\nThe DICTIONARY is built from the corpus, keyed by id, deduplicated so a term mentioned forty times inlines once. One builder serves the mirror and the exporter, because a second builder is a second truth. The database reads the dictionary, not the frontmatter, so a paragraph never has to survive YAML.\n\nThe MARK is what a reader sees. In prose it is a real anchor with an href and a DOTTED underline, so it is already in the tab order and announced as a link. On a control it is an attribute, and the control keeps its own click. Same id either way.\n\nThe SURFACE is a non-modal dialog, never role=tooltip. The W3C Authoring Practices rule it: a hover that contains focusable elements is a non-modal dialog. aria-describedby would flatten the subtree and swallow the links.\n\nTHE LAW THAT SHAPES ALL OF IT: help never steals the click. A button's click belongs to the button. Where an element has no other job, clicking it may open the details, but the open-details link is present ALWAYS, because the system may not behave differently in different places.\n\nSETTLED VALUES, each with evidence behind it. Roughly 500ms to open, which is Wikipedia's shipped number. Roughly 300ms grace between nearby marks, which is Radix skipDelayDuration and exists so sweeping a paragraph does not re-pay the delay. No auto-hide timer at all. Entry by safe polygon with an intent gate, never a fat invisible border, because Floating UI names our case exactly: many triggers near each other. Nesting holds itself up by one rule, a parent stays open while any child is open. Escape peels one layer, outside press collapses the chain. The abstract is capped near ten lines, in the range JetBrains and Blender both settled on, and over-long ones CLIP with a gradient rather than being rejected.\n\nNO PIN. Persistence was its only job, and the capped abstract has nothing to scroll while the editor panel already persists and sits side by side. Dropping it also satisfies the WCAG Hoverable requirement by construction instead of by argument.\n\nTHE KEYBOARD PATH is a chord on the focused element that opens the surface and moves focus into it, trapped, with Escape restoring focus to the trigger. GitHub shipped exactly this as Alt+Up in July 2024. Keyboard reachability is a target for this work; WCAG AA as a whole is NOT declared.\n\nTHE ABSTRACT LADDER, which is Wikipedia's with our field on top. Use the abstract field where it exists. Otherwise the first non-empty paragraph, clipped. Otherwise a generic card carrying the title and the link, the way Wikipedia shows a card saying there is no preview for this topic. Nothing blocks; missing content degrades.\n\nTHE RENAME. statement becomes abstract on 1,650 files. The owner ruled that a bad name is not grandfathered in because changing it is hard, and that where the fear comes from a missing capability we build the capability. So this iteration owns whatever tooling makes the rename safe, and owns finding out whether rewriting frontmatter on signed trace nodes disturbs their signatures. Fold the 8 description fields into abstract. Rename the 11 voice_matrix brief fields to something that says what they hold, since brief means four characters there and is also the narration op's own field.\n\nTHE RISK TO CARRY INTO THE FIRST GATE. The details panel is overloaded because jsonTable prints every key of whatever object it is handed. If abstracts are DERIVED from those same objects, the dump has moved into ninety hover targets and got harder to see. An abstract must stand alone as a concise version of the thing, which is Wikipedia's own lead-section rule. That is a writing commitment, not a code one, and no ladder fixes a field written as a label.\n\nTWO SMALLER RISKS. Nesting depth has no research behind it anywhere; the only published number is one designer's guess of two or three. And a surface anchored at the cursor covers the word being read, which NN/g names — Wikipedia anchors below the link and Paradox flies the card to the side. Decide it rather than defaulting.\n\nMEASURED STARTING STATE. 90 native title attributes across 21 files, and zero custom tooltip components anywhere. 2,635 markdown files, 99.1 percent with frontmatter, 1,650 carrying statement at a median of 137 characters. spec/trace is 99 percent covered, spec/iterations is 4 percent. The VS Code extension is a shell: every panel is a webview holding one iframe onto our own server, so this is ordinary DOM work and VS Code's own hover API is not involved. The webview CSP forbids inline script and style, so the component ships as external files that the static export uses unchanged."
inputs:
  - "note-027b8e463fe8"
  - "scratchpad/tooltip-census.mjs"
  - "scratchpad/brief-coverage.mjs"
  - "scratchpad/fm-keys.mjs"
  - "deliverable/engine/renderclient-detail.ts"
  - "deliverable/engine/stateform-sheet.ts"
  - "deliverable/vscode/src/extension.ts"
  - "https://www.mediawiki.org/wiki/Page_Previews/Functionality"
  - "https://www.mediawiki.org/wiki/Page_Previews/2017-18_A/B_Tests"
  - "https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section"
  - "https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus"
  - "https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/"
  - "https://sarahmhigley.com/writing/tooltips-in-wcag-21/"
  - "https://github.blog/changelog/2024-07-29-keyboard-navigation-improvements-for-hovercards/"
  - "https://floating-ui.com/docs/usehover"
  - "https://jetbrains.design/intellij/controls/tooltip/"
  - "https://www.nngroup.com/articles/tooltip-guidelines/"
depends_on: []
---

# i56-build-the-help-dictionary-and-the-previe

## Goal

Build the help dictionary and the preview surface, and prove both on one screen. The dictionary is a generated index keyed by id, carrying a title, an abstract and an href for every addressable thing. The preview is a hover-opened non-modal dialog that shows the abstract and always carries an open-details link. Both must run unchanged in the mirror and in a static HTML export, because the export carries the whole help system and has no server behind it. Also rename the statement frontmatter key to abstract across the corpus, and build whatever tooling that rename needs.

## Rough vision

DONE LOOKS LIKE: one screen where every glossed term and every control opens a preview on hover, the preview can be entered with the mouse, a term inside a preview opens its own preview, and the open-details link reaches the full thing. The same screen exported to a single static HTML file behaves identically with no server.

THE MODEL IS WIKIPEDIA PLUS NESTING. Wikipedia's Page Previews is the largest hover-preview deployment on the web and published its result: distinct pages explored per session rose 21 percent against a 4 percent fall in pageviews. Nesting is the part Wikipedia does not have, and Paradox has shipped it in two games since 2020. We combine two shipped halves rather than inventing one.

THREE LAYERS.

The DICTIONARY is built from the corpus, keyed by id, deduplicated so a term mentioned forty times inlines once. One builder serves the mirror and the exporter, because a second builder is a second truth. The database reads the dictionary, not the frontmatter, so a paragraph never has to survive YAML.

The MARK is what a reader sees. In prose it is a real anchor with an href and a DOTTED underline, so it is already in the tab order and announced as a link. On a control it is an attribute, and the control keeps its own click. Same id either way.

The SURFACE is a non-modal dialog, never role=tooltip. The W3C Authoring Practices rule it: a hover that contains focusable elements is a non-modal dialog. aria-describedby would flatten the subtree and swallow the links.

THE LAW THAT SHAPES ALL OF IT: help never steals the click. A button's click belongs to the button. Where an element has no other job, clicking it may open the details, but the open-details link is present ALWAYS, because the system may not behave differently in different places.

SETTLED VALUES, each with evidence behind it. Roughly 500ms to open, which is Wikipedia's shipped number. Roughly 300ms grace between nearby marks, which is Radix skipDelayDuration and exists so sweeping a paragraph does not re-pay the delay. No auto-hide timer at all. Entry by safe polygon with an intent gate, never a fat invisible border, because Floating UI names our case exactly: many triggers near each other. Nesting holds itself up by one rule, a parent stays open while any child is open. Escape peels one layer, outside press collapses the chain. The abstract is capped near ten lines, in the range JetBrains and Blender both settled on, and over-long ones CLIP with a gradient rather than being rejected.

NO PIN. Persistence was its only job, and the capped abstract has nothing to scroll while the editor panel already persists and sits side by side. Dropping it also satisfies the WCAG Hoverable requirement by construction instead of by argument.

THE KEYBOARD PATH is a chord on the focused element that opens the surface and moves focus into it, trapped, with Escape restoring focus to the trigger. GitHub shipped exactly this as Alt+Up in July 2024. Keyboard reachability is a target for this work; WCAG AA as a whole is NOT declared.

THE ABSTRACT LADDER, which is Wikipedia's with our field on top. Use the abstract field where it exists. Otherwise the first non-empty paragraph, clipped. Otherwise a generic card carrying the title and the link, the way Wikipedia shows a card saying there is no preview for this topic. Nothing blocks; missing content degrades.

THE RENAME. statement becomes abstract on 1,650 files. The owner ruled that a bad name is not grandfathered in because changing it is hard, and that where the fear comes from a missing capability we build the capability. So this iteration owns whatever tooling makes the rename safe, and owns finding out whether rewriting frontmatter on signed trace nodes disturbs their signatures. Fold the 8 description fields into abstract. Rename the 11 voice_matrix brief fields to something that says what they hold, since brief means four characters there and is also the narration op's own field.

THE RISK TO CARRY INTO THE FIRST GATE. The details panel is overloaded because jsonTable prints every key of whatever object it is handed. If abstracts are DERIVED from those same objects, the dump has moved into ninety hover targets and got harder to see. An abstract must stand alone as a concise version of the thing, which is Wikipedia's own lead-section rule. That is a writing commitment, not a code one, and no ladder fixes a field written as a label.

TWO SMALLER RISKS. Nesting depth has no research behind it anywhere; the only published number is one designer's guess of two or three. And a surface anchored at the cursor covers the word being read, which NN/g names — Wikipedia anchors below the link and Paradox flies the card to the side. Decide it rather than defaulting.

MEASURED STARTING STATE. 90 native title attributes across 21 files, and zero custom tooltip components anywhere. 2,635 markdown files, 99.1 percent with frontmatter, 1,650 carrying statement at a median of 137 characters. spec/trace is 99 percent covered, spec/iterations is 4 percent. The VS Code extension is a shell: every panel is a webview holding one iframe onto our own server, so this is ordinary DOM work and VS Code's own hover API is not involved. The webview CSP forbids inline script and style, so the component ships as external files that the static export uses unchanged.

## Inputs

- note-027b8e463fe8
- scratchpad/tooltip-census.mjs
- scratchpad/brief-coverage.mjs
- scratchpad/fm-keys.mjs
- deliverable/engine/renderclient-detail.ts
- deliverable/engine/stateform-sheet.ts
- deliverable/vscode/src/extension.ts
- https://www.mediawiki.org/wiki/Page_Previews/Functionality
- https://www.mediawiki.org/wiki/Page_Previews/2017-18_A/B_Tests
- https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section
- https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus
- https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- https://sarahmhigley.com/writing/tooltips-in-wcag-21/
- https://github.blog/changelog/2024-07-29-keyboard-navigation-improvements-for-hovercards/
- https://floating-ui.com/docs/usehover
- https://jetbrains.design/intellij/controls/tooltip/
- https://www.nngroup.com/articles/tooltip-guidelines/
