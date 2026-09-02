---
id: wk-ad1e2f2aed
seq: 1000082
type: work
title: the tools lose words
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-66a28ca311
minted_by: main
evidence:
  - outcome
---

## detail

The toolbar spends its width on words beside icons that already say the same thing. The owner's words: the filter and the sort are clear, remove the text from the button. src/extension/editor.ts:158 and :159 draw the filter and sort buttons as an icon followed by the word, and the word goes while the icon stays. Each button gets a title attribute, as the query toggle at :161 already has. Properties at :160 keeps its word. The check goes in the render check: the two buttons carry their icon, no text node beside it, and a title.

## evidence: outcome

The filter and sort buttons in .bs-bar of src/extension/editor.ts carry their icon from util/icons.json, no word, and a title each, and Properties keeps its word. util/checks/render-check.mjs, say2 section, reads every button carrying data-pop and asserts icon, no word and title for filter and sort. It was red before the change on four lines and all ok after, and drive-editor still answers 0 failed.
