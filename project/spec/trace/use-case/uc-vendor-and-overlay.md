---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-vendor-and-overlay
type: "[[use-case]]"
statement: Run the engine inside another product and replace parts of its method without forking it.
actor: stk-vehicle-owner
trigger: a builder wants the machine but not all of the method that ships with it
precondition: the builder has their own repository
guarantee: their method is loaded above the engine's, nothing of theirs sits under the engine, and an upstream version can be replaced whole
refines:
  - sty-vendor-it-into-my-product
priority: could
---

## Main scenario

1. The builder places the engine inside their repository, in a folder of its own.
2. They run the setup, and the product comes up on the engine's own method.
3. They write their guidance, method cards and rigor rows in their own folder, above the engine's.
4. The resolution chain prefers theirs where they exist and serves the engine's where they do not.
5. They walk a record, and their cards arrive at the states they wrote them for.
6. A new engine version arrives. They replace the folder whole, with nothing to merge.

## Extensions

- 1a. Something of theirs is written under the engine's folder. That is the one rule this use case rests on, and breaking it turns the next update into a merge.
- 3a. They replace a rigor row outright rather than adding one. The compiled machine carries theirs, not the original.
- 4a. Two overlays claim the same card. The chain has an order, and the order decides — it is never ambiguous.
- 6a. The new version renamed something their overlay pointed at. The pull says what no longer resolves, rather than silently serving the engine's default.
