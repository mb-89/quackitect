---
id: wt-ask-the-lane-to-list-a-folder-it-deliberately-hides-and-it-h
type: "[[work-token]]"
statement: |-
  Ask the lane to list a folder it deliberately hides, and it hands back an empty result rather than saying the folder is hidden.

  MEASURED. A listing and a pattern match were both run against the engine's own working directory. Each answered with nothing. That directory holds two dozen entries.

  THE HIDING ITSELF IS CORRECT. A shared filter drops any path whose segments appear on an exclusion list, and this folder belongs on it. Nothing about that needs changing.

  THE ANSWER IS WHAT IS WRONG. From outside, "no entries here" and "I will not show you these entries" look identical. That is the same failure our own corpus walk forbids in as many words: a thing a checker cannot examine reports itself unexamined, and never passes.

  IT COST A CALL. This look-back needed to know whether a particular configuration file existed. Both verbs said the folder held nothing, so the question went to a raw shell command with a written reason attached, which is precisely the shape this look-back exists to catch.

  AND THE VERBS DISAGREE WITH EACH OTHER. Reading a file inside that folder works fine, and the machinery hands out such paths on its own. So one verb serves the folder while two deny it exists.

  THE REPAIR. Say it out loud, either as a marker on the reply or as a typed refusal naming the hidden segment.
place: i39-the-lane-tells-the-truth-about-itself-de
ready_when: ready when the file lane's listing verbs are next opened
source: note-d694a6ffc870
---

## Why it stands

Ask the lane to list a folder it deliberately hides, and it hands back an empty result rather than saying the folder is hidden.

MEASURED. A listing and a pattern match were both run against the engine's own working directory. Each answered with nothing. That directory holds two dozen entries.

THE HIDING ITSELF IS CORRECT. A shared filter drops any path whose segments appear on an exclusion list, and this folder belongs on it. Nothing about that needs changing.

THE ANSWER IS WHAT IS WRONG. From outside, "no entries here" and "I will not show you these entries" look identical. That is the same failure our own corpus walk forbids in as many words: a thing a checker cannot examine reports itself unexamined, and never passes.

IT COST A CALL. This look-back needed to know whether a particular configuration file existed. Both verbs said the folder held nothing, so the question went to a raw shell command with a written reason attached, which is precisely the shape this look-back exists to catch.

AND THE VERBS DISAGREE WITH EACH OTHER. Reading a file inside that folder works fine, and the machinery hands out such paths on its own. So one verb serves the folder while two deny it exists.

THE REPAIR. Say it out loud, either as a marker on the reply or as a typed refusal naming the hidden segment.

## When it comes back

ready when the file lane's listing verbs are next opened
