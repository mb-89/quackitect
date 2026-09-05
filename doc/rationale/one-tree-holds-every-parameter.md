---
kind: [[rationale]]
title: one tree holds every parameter
explains:
  - util/parameters.json
  - src/engine/config.go
---

## decided

Everything that changes how the system runs is one tree, with one declaration and one store. The panel is a subtree of it, chosen by a flag on a group. A value is a parameter, and a parameter shown in the panel is shown. That is the whole vocabulary.

## why

A value belongs to the system rather than to the surface that happens to show it. Two stores would mean a value living in both and differing.

The panel was made a view over the tree. Making a new section is marking a group, so the panel and the configuration cannot drift, and a new control stops being a code change.

The view keeps no value of its own, because two copies of one number need a rule for which one wins. The engine validates every change, since a view that validates is a second rule set and a second answer to whether a value is allowed.

The word setting was dropped. v3 kept interface state in a file called settings, so it read as though the interface were configuring the editor. Both meanings lived in one word.

Two files, and each has one job. The declaration is authored and read only. The values are written by the engine and hold only what differs from a default. One file would put generated content where a person edits.

## costs

A declaration that cannot be read leaves one button, so a bad declaration costs the whole surface. Both directions are watched, which is a race that only a handshake covers. And the grid is the renderer's contract rather than a habit, so a control wanting a different layout has nowhere to go.

## revisit when

- a control needs a layout the grid cannot hold
- a value has to live somewhere the engine cannot validate
- the declaration grows past what one file holds readably
