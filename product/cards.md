---
id: cards
statement: Which cards the mirror shows, and the order that numbers them.
needs_plugin: nested-properties
cards:
  - card: chat
    shows: terminal
  - card: state machine
    shows: machine
  - card: trace graph
  - card: the book
  - card: log
    shows: log
  - card: details
    shows: details
---

# Cards

The mirror shows one BIG card beside a two-wide grid of the rest. A number
key promotes a card into the big slot. Pressing that same number again
returns to the card you came from.

THE FRONTMATTER IS THE ORDER. The first entry is card one. Move an entry,
and its number moves with it.

`shows` names the widget that fills the card. LEAVE IT OUT for a card that
is not built yet. The slot still appears, still holds its number, and says
plainly that there is nothing in it.

## It lives in the product, not the engine

v3 is meant to work on OTHER products, and another product wants other
cards. A pure software project might add a card showing its compiled
deliverable.

So this file travels with the product. Edit it in Obsidian. Nothing in the
engine needs to change.

## Reading it in Obsidian

The card list is NESTED, and Obsidian's own Properties panel does not
render nested YAML — it collapses it into a JSON blob.

Install the **Nested Properties** community plugin. It renders nested
objects and arrays as a collapsible tree inside the normal Properties
editor.

This vault already requires a community plugin, Advanced Canvas, to draw
machines at all. A second one costs nothing new.

## Why an empty slot beats a missing one

A card that is absent renumbers every card after it. The numbers are
muscle memory, and an agent connecting mid-session must never shift them
under your hand.

So a card with nothing to show keeps its slot and says so.
