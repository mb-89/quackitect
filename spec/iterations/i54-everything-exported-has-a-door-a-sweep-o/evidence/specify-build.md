---
form: specify-build
by: agent
signed_off: 2026-08-26T13:50:35.053Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

Two design specs stand and the build drawing is seeded with seven chunks in two strands.

### What the specs carry

- `dsp-the-door-rule` details the module that states each conversation's rule once and answers three questions about it. It refuses nothing.
- `dsp-the-door-refusals` details the two write-time refusals, which sit beside the rule module rather than inside it.

That split is not decoration. `el-door-rule` states in as many words that the rule module refuses nothing, and the worked example this design generalises does not have the split. `deliverable/engine/widgets.ts` holds its guard beside the rule it reads.

The split was caught by reading the element card against the test file I had just written, which imported both guards from the rule module. The test file now imports them from `engine/doorguard.ts`.

### Two improvements on the worked example

Both are recorded on the specs with the line of `widgets.ts` they correct.

- The refusals move out of the rule module, so the sweep can import the rule without importing a refusal it never uses.
- A departure with no reason is REFUSED rather than ignored. `widgets.ts:108` ignores one, which makes the list unreadable as an answer: a reader cannot tell a rejected line from one nobody wrote.

### The root is a parameter on every call

`widgets.ts:118-125` records what happens without one. A linked engine resolved its own directory, read the wrong list, and reported every declared exemption as a violation. That failed a check rather than skipping one, and held boot short of the front desk in every fixture that walks.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-the-door-refusals]] | el-door-write-guard | deliverable/engine/doorguard.ts · deliverable/engine/files.ts |
| [[dsp-the-door-rule]] | el-door-rule | deliverable/engine/doors.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

- The build walks the seven chunks. The first proves the shape, the second is the differentiator, and four more fan out from the first.
- The outward door is NOT seeded, and the drawing says why. The prototype gate logged it as a dissent: that goal is served by a count of 17 modules and no probe. Seeding chunks for it would build on the same kind of premise this record has already corrected four times.
- The ratchet is not seeded either. 81 modules reach the disk conversation and nothing here moves them in stages. Registered, with the trap named.
- `observe-red` comes next and will see the test file fail on two missing modules. That is the test-first red rather than a defect.

## anything_else

Nothing promotes into the build, and the promotions table is empty for that reason rather than by omission.

All eight experiments answer `promote: none`. That is the throwaway law working as written: the spike's code is not a head start on the build, and the finding is the product.

The scripts that produced those findings live in `scratchpad/` and die with the container. What survives is the eight experiment nodes and the four figures they corrected.
