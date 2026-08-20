---
form: fix-findings
by: agent
signed_off: 2026-08-19T17:56:23.205Z
reopened: "2026-08-19T17:53:31.497Z — Types and lint are not in the battery and no commit has run the pre-commit hook since the build edits, so round 0 cannot be answered from evidence."
authors: agent
files:
---

# Evidence form / fix-findings

## current_situation

The battery surfaced three failures in two causes. Both were introduced by this iteration, and both were collected before anything was fixed.

CAUSE ONE, one failure. files.test.ts holds a ceiling on direct file reads: the count may fall, never rise. It went from 106 to 107. The new read is stopping-layer.ts opening `.se/engine.log`.

CAUSE TWO, two failures, in editsafety.test.ts and reads.test.ts. Both report `spill read failed` with SE-C-110: "a tool legal in state [boot/prepare_idle]: (none)". A bounded answer was served, the test followed the cursor the answer handed it, and the state gate refused the read.

WHY CAUSE TWO SURFACED NOW. It was always there and was hidden behind a louder failure. Before the spill fix these same cases failed earlier, with the spill file simply not found. Repairing that let them reach the gate, which then refused them.

CAUSE THREE, one failure, found on the next battery run and older than this iteration. `mcp-http.test.ts` failed with `fetch failed`, carrying two connect errors at once: ETIMEDOUT on 127.0.0.1 and ECONNREFUSED on ::1, against a server that was listening. The same case had passed minutes earlier and passed again on a re-run.

WHY IT FIRES AT RANDOM. The mirror binds 127.0.0.1 only, which is its own design claim (`dsp-mirror-render.md#the-mirror-binds-loopback-and-says-so`). The tests dialled `localhost`. On Windows that name resolves to both ::1 and 127.0.0.1, so fetch tries both families and gives the second leg a short head start window. Under a loaded battery the IPv4 leg can miss that window, and the refusal on ::1 then carries the whole call down. Nothing is wrong with the server.

HOW WIDE IT WAS. Twelve dial sites across six test files, all pointing at a mirror that never answers on ::1.

## follow_up

THE FIXES, one per cause.

CAUSE ONE. The ceiling is raised to 107 with its reason written beside the six that came before it, in the same shape. The engine log is a plain append-only text file with no frontmatter, read once to answer one question. Routing it through the note door would share a parse with nobody, and the door would have to parse a log as a node to do it. Lowering was not an option and pretending it was would have meant deleting the read.

CAUSE TWO. `Session.gate` now takes the call's arguments and always permits an `se_file_read` whose path starts `.se/answers/`. Following the lane's own cursor is the engine's instruction being obeyed. A state that serves a bounded answer and then forbids the read makes its own answer unreadable, and boot/prepare_idle, which allows no tools at all, does exactly that.

THIS IS THE SECOND HALF OF ONE DEFECT. The narration toll was exempted for the same call earlier today, for the same reason. Two guards stood between a caller and the answer the lane had already withheld; the toll was the one that bit first, so the second stayed invisible until the first was cleared.

CAUSE THREE. All twelve dial sites now use `http://127.0.0.1:`, which is the address the mirror actually binds. That deletes the second family, so there is no race left to lose. The reason is written as a comment beside the helper in `mcp-http.test.ts`, because `localhost` is what anyone would type next time. The six touched suites were re-run together and came back exit 0, `mcp-http.test.ts` included.

WHY THIS WAS NOT LEFT AS A FLAKE. It sits in the battery, and the battery is verification's exit condition. A test that fails at random there stops the walk at random, and the cost lands on whoever is walking. It was also not this iteration's doing, which is the reason nobody had fixed it.

WHAT I WOULD WATCH. Both spill exemptions match on the path prefix `.se/answers/`. That string now appears in three places: where the spill writes it, where the toll exempts it, and where the gate exempts it. A rename would have to move all three, and nothing enforces that.

## anything_else

THE CHECKER AND THE LINTER ARE NOT IN THE BATTERY. The battery is the verification row's command, `npm --prefix project/deliverable test`, which is `node --test "tests/*.test.ts"`. Node strips types rather than checking them. The typecheck and the format check live only in `project/deliverable/hooks/pre-commit`, and no commit had run since the build edits.

SO THEY WERE RUN BY HAND, from here, and this is what they said.

- `npx tsc -p . --noEmit --pretty false` — exit 0, no output.
- `npx biome check --error-on-warnings .` — exit 0, 312 files checked, no fixes applied.
- A search for `biome-ignore`, `@ts-ignore` and `@ts-expect-error` across `project/deliverable/engine/*.ts` returns nothing, so the clean run bought no suppressions.

WHAT I WOULD WATCH. A battery that answers `green` while the typechecker has never run is a green with a hole in it. Verification's own row calls itself the one place the full battery runs, and two of the three gates named in `project/guidance/method/engineering.md` are outside it. That is a note, not a fix for this iteration.
