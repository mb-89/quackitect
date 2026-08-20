---
minted_in: i1
id: uc-vendor-and-overlay
type: "[[use-case]]"
statement: Take the whole system as a copy that is entirely yours, lay your own method over what it carries, and keep taking what the source changes later.
actor: stk-vehicle-owner
trigger: a builder wants the machine but not all of the method that ships with it
precondition: the source is reachable once, and the target machine holds nothing of it
guarantee: they hold a complete independent copy they may change entirely, their own cards are served where their identities collide with the source's, an update reaches them without taking away changes they did not decide to give up, and nothing the copy does reaches the source
refines:
  - sty-vendor-it-into-my-product
  - sty-nothing-i-do-reaches-what-it-came-from
  - sty-press-create-vehicle-and-land-in-it
priority: could
---

<!-- REVISED at i16, 2026-08-18. The previous version ran the engine INSIDE
another product, in a folder of its own, with nothing of the builder's under it
and an update replacing that folder whole. The owner withdrew that model - "at
no point is there any sealing" - and this state's guidance says a use case the
architectural move invalidates is revised in the same pass.

THE PRIORITY IS UNCHANGED AT could, deliberately. Re-grading the vendoring
nodes is out of this iteration's scope on its own ruling, because doing it from
inside the iteration that benefits would be marking its own work. The gap is
raid-iss-a-must-value-prop-is-served-only-by-coulds and it is the owner's. -->

## Main scenario

1. The builder produces a complete named copy of the system from the source.
2. They open the copy on a machine that holds nothing of the source, and it comes up on the method the source shipped.
3. They write their own version of any method artifact the system serves, inside the copy.
4. The copy resolves each identity to their card where they wrote one, and to the source's where they did not.
5. They walk a record, and their cards arrive at the states they wrote them for.
6. Later they take an update from the source. What the source changed arrives, and what they changed stays.
7. Where the update and one of their own changes meet the same place, they decide it once.
8. The copy reports every identity their content claims that the update moved.

## Lane doors

- `se_produce_vehicle` is step 1. It takes an empty folder, a name and an abbreviation, and produces the whole copy in one act. It refuses before writing anything if the folder is occupied or an argument is missing, because a forgotten argument would ship this product to somebody else under our name.
- `se_prompt_place` re-projects the prompt layer from the guidance into the tree the lane is working in. It resolves that tree itself, so the projection cannot land in the wrong one.

## Extensions

- 1z. THE ACT IS OFFERED WHERE THE BUILDER ALREADY IS, rather than only where somebody who has read the tree would look. It asks for the same things the command asks for, produces the same tree, and the builder ends up working IN that tree rather than being told where it went. NO SCREEN IS NAMED HERE on purpose - what binds is that the act is reachable without prior knowledge of the repository, and that it ends with the builder inside the result.
- 1y. THE ACT WRITES THE PRODUCED TREE AND NOTHING ELSE. It does not modify the tree it was launched from beyond what a normal run would, and it does not disturb the place the builder was working. An act that writes a whole folder is the most dangerous thing this use case carries, and this is the extension that bounds it.
- 1a. The copy would be produced by reference rather than by value. Refused: no symlink, junction, hardlink, mount or install step that writes to the source. The spawn fails rather than producing a copy that can reach back.
- 2a. The builder has written nothing of their own. The copy serves the source's method whole and asks for no configuration.
- 3a. They edit one of the source's own files in place rather than writing a card of their own. Legal, and the ordinary consequence follows at step 6: the edit meets the update and step 7 decides it.
- 3b. They replace a rigor row outright rather than adding one. The compiled machine carries theirs, not the original.
- 3c. The artifact they replace is one of the less obvious classes - an item template, a form template, the refusals document. Served the same way. req-overlay-resolution's second clause is absolute: the system serves ZERO method artifacts that an overlay file cannot replace, and step 3 is written to match it rather than to the three classes an earlier draft named.
- 4a. Two of their own cards claim the same identity. The chain has an order, and the order decides - it is never ambiguous.
- 6a. They never take an update. The copy keeps working, unchanged, indefinitely. This is the fork case and it is legal; what it costs is everything the source learned since.
- 7a. They decide against their own change. That is a decision rather than a loss, which is the distinction vp-vendoring's third success criterion measures.
- 8a. An identity their content claims no longer exists upstream at all. Reported, never silently defaulted to the source's own card.
- ANY STEP. An operation started in the copy would resolve outside the copy's own tree, toward the source. Refused, by construction rather than by policy: no path exists for it to follow.
