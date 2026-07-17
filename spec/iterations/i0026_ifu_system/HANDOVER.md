# i26 IFU system - session handover

Read this first when resuming i26 from another machine.

## Where we are

i26 (`i0026_ifu_system`) is active.

The walk has reached M8. M1 through M7 are blessed under the scoped grant. In M8, these are already blessed:

- `i26-m8-configuration-baselined`
- `i26-m8-packaged-versioned`
- `i26-m8-docs-complete-match`

The current ready check is expected to be:

- `i26-m8-handover-accepted`

Do not ship until M8 is fully accepted. After `i26-m8-gate` is blessed, run `quack ship` immediately.

## Built in this pass

- `kind: ifu` marks IFU deck manifests and guide rows.
- `man-deck-pong` is now the Pong IFU.
- `man-deck-ifu-map` is the first IFU map deck.
- `guide-pong-walkthrough-deck` and `guide-ifu-map` keep IFUs findable in the guide table.
- `coverage:ifu-usecases` checks that every loaded use case id appears in at least one IFU deck source.
- `req-ifu-*`, `test-ifu-system`, and `adr-ifu-kind` record the IFU design input.
- Bless preflight now refuses direct review blesses with unfinished prerequisites or missing first-time evidence.
- `verify` now prints the verdict before and after verbose details.
- Cold-start budget measurement takes the best of two positive runs.
- MCP attestation wording now tells the caller to re-attest after build swaps.
- `IFU` has a glossary entry.
- Weak-model delegation and terminal-reset guidance landed in prompts.

## Validation already run

- `go test .` passed in `product/engine-go`.
- `quack build` passed after retry.
- `quack selftest budget-best-positive` passed.
- `quack verify test-ifu-system` passed.
- `quack verify i26-m6-verification-green-every` passed.
- Temporary book render no longer reports IFU as jargon.

## Important critique

The current IFU map is mechanically correct but not yet good enough as user documentation.

It covers all use cases by listing IDs on a final slide. The owner called this out as coverage theater. Before final acceptance, either:

- rework IFUs into real user-story decks, or
- explicitly accept this as the first mechanism pass and plan a content pass next.

## Book review findings to carry forward

These were captured as local notes on the first machine. They are repeated here because the local notes directory does not travel through git.

### README and details

- README `LLM` link is marked and linked, but clicking it does not open the expected glossary/detail target.
- Details pane should show the full referenced entry where possible.
- Glossary entries such as milestone should show the full entry in the side pane.
- The reader should not need to jump elsewhere just to understand a referenced entry.

### Chapter 2

- Rename the chapter/section to `Introduction and IFUs`.
- Keep `IFU` visible in the heading despite acronym awkwardness.
- Chapter 2.1 is `Document overview`.
- Chapter 2.2 is `IFUs`.
- Before derived documents, add prose that explains:
  - IFUs are for users who want to learn how to use the system.
  - The full document is for readers who want the whole development process.
- Move the current onboarding/IFU material into the new chapter 2.2.
- Do not duplicate onboarding later.

### Chapter 3

- Needs are too technical as the first thing.
- Add prose above the needs list.
- Link to IFUs.
- Say IFUs show what users can do with the tool.
- Say every IFU tells a user story.
- Then say the idea composes into needs.
- Then show the needs list.

### Chapter 5

- Trace views are getting too large.
- Revisit collapsible trace rendering.
- This is a larger design item because the previous collapsible version looked awkward.

### Chapter 6

- Neighbor graph is fine, but graphs should be horizontally centered when they do not fill available width.
- General table filter rule:
  - one pill dimension stays horizontal above the table.
  - multiple pill dimensions render as vertical filter columns.
  - empty filters show zero.
  - empty filters may remain clickable.
  - multiple filters can be selected.
- Design input should become one big register.
- Fold use cases and functions into the design input register.
- Remove the separate use-cases/functions section.
- First vertical filter column: need.
- Second vertical filter column: type.
- Type should distinguish function, use case, functional requirement, and quality requirement.

### Chapter 7

- Onion pocket needs a larger redesign.
- Rendered models are not useful enough.
- Review models one by one.
- Design elements table has a responsibility column that is always empty.
- Populate responsibility or hide/drop the column when empty.
- Interfaces should be meaningful and visible.
- Expected interfaces include git, CLI, agent, and similar system boundaries.
- Discuss interfaces together with the onion/model redesign.

### V&V chapter

- There are two no-test or unverified items. Decide policy:
  - add tests,
  - remove items,
  - defer explicitly,
  - or explain why no test is owed.
- Milestones should not pass with unexplained no-test items.
- Verification rationales still contain TODOs.
- Replace TODO with real rationale or `N/A`.
- Every verification test row should link to its latest result.
- Validation rows should also show latest result.
- Use a small result pill/link that opens details for the latest valid result.

### Project chapter

- Rework project timeline across report, handover HTML, and book.
- Bake decisions into the timeline.
- RAID should include a filterable risk matrix.
- Risk matrix axes:
  - X: probability.
  - Y: impact.
  - risks as dots.

### Chapter 10

- Rationales feel underfilled despite lots of discussion.
- Review rationale notes and fill useful rationale bodies.
- If no rationale is needed, mark `N/A`.
- Models need one-by-one review for usefulness and rendering.

### Search UI

- Search navigation must only land on visible results.
- If a hit is inside a collapsed table row, expand the row.
- If a hit is inside a graph, pan or zoom to the item.
- All hits should be light yellow.
- The current hit should be full yellow.
- Add previous/next shortcuts, likely `Q` and `E`.
- Mention shortcuts in the details/help pane.

## Retro and process notes

- Weak models can check boxes without doing the work. Keep broad grants away from weak models unless deterministic guards refuse invalid state transitions.
- The bless-preflight guard was added because direct bless bypassed `next` discipline.
- Notes in the data home do not travel by git. For multi-machine work, write an iteration `HANDOVER.md` before switching machines.
- Cold-start budget can spike on the first fresh-binary run. The engine now measures twice and uses the best positive value.
- MCP can require re-attestation after a build swap. The message now says so.
- The agent overextended the CLI fallback after MCP went stale. The intended lane is MCP. CLI with a session key worked because the engine still accepts that deterministic lane. This is a guard gap. Add a rule that CLI fallback after MCP staleness is one command only, or require an explicit fallback flag before further CLI ledger commands.
- Terminal sessions can get stuck returning bare `^C` markers. Treat that terminal as contaminated and start a fresh command surface.

## Suggested resume order

1. Read this file.
2. Render the book from the new machine.
3. Decide whether to accept the current IFU map as a mechanism pass or rework it before M8.
4. If accepting the current mechanism pass, bless `i26-m8-handover-accepted`.
5. Bless `i26-m8-gate`.
6. Run `quack ship` immediately.
7. If not accepting, turn the book review findings above into the next work slice before final M8.

## Git notes

Commit the current WIP plus this handover before moving machines.

Do not rely on the data-home note inbox to survive the move.
