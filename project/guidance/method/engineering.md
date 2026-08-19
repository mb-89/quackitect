---
id: engineering
statement: General software rules the project builds by - referenced, never pulled wholesale.
---

# Engineering rules

## The TypeScript toolchain (owner ruling 2026-08-03)

The universal law is software.md's "The toolchain is mechanical". These are
the concrete tools, chosen for speed and for installing with plain
`npm install` — no extra install step, ever.

- THE CHECKER is `tsc -p . --noEmit` from `project/deliverable` (the
  `--pretty false` form is grep-friendly). Incremental cache under
  `node_modules/.cache/se.tsbuildinfo`; a warm run is ~3s.
- THE LINTER-FORMATTER is Biome, one binary for both. Config:
  `project/deliverable/biome.json`. House choices there:
    - lineWidth 140.
    - noNonNullAssertion OFF — `x!` is house idiom.
    - noExcessiveCognitiveComplexity at 25, level ERROR.
- THE COMMIT HOOK (`project/deliverable/hooks/pre-commit`, wired by
  preflight via `core.hooksPath` every boot) runs the checker and
  `biome check --error-on-warnings` and BLOCKS. Boot runs no typecheck.
- THE LANE'S FIXER (`engine/lintfix.ts`) runs Biome's SAFE fixes after
  every lane write to a covered file and announces what changed. Its
  coverage is read live from biome.json — never mirrored.
- `--write --unsafe` IS BANNED. The unsafe tier rewrote ~70 non-null
  assertions into optional chains and broke the strict build (2026-08-03).
  Safe fixes only, everywhere, including by hand.
- THE SHELL BUNDLES: `vscode/src/extension.ts` → esbuild →
  `vscode/extension.js` (generated — edit the source, then
  `npm run build`). The manifest and install seam stay unchanged.
- THE VERIFY LOOP for any refactor: checker → `biome check --write` →
  scoped `se_test` → commit. The battery only where the test economics
  flip (software.md).

## Commit what is on disk (owner ruling 2026-07-29)

A dirty tree left behind is not caution. It is unfinished work.

Commit everything that stands, including files you did not write. The
owner's Obsidian layouts, canvases and installed plugins are part of the
project. Leaving them out because they are someone else's does nothing
but hand the next session a mess.

Say in the commit message whose work it was and that you took it. Never
silently, and never selectively without saying what you left.

This is not licence to commit SECRETS or generated junk. That is what
`.gitignore` is for, and it already carries them.

The close already works this way — it commits trunk's strays before it
merges, and names every file it took. The principle is the same one:
a walk's work never silently vanishes, and neither does anyone else's.

## Data is not code (owner ruling 2026-07-28)

Configuration lives in DATA the running system reads — never in
constants that demand a recompile. When a behavior will be tuned, give
it a config home from day one. The reference case: the voice lint's
thresholds live in `machines/lint/voice-lint.md`; edit the file and the
next `se_lint` call uses it, with no rebuild and no reload. The rules'
LOGIC stays code — only their parameters are data.

## Every switch appears in help (owner ruling 2026-07-28)

Every command-line switch a program parses is listed by that program's
`--help`. No exceptions, including internal ones — mark those as internal
rather than hiding them.

A switch nobody can discover is a switch nobody has. `--one-screen` sat
in the launcher for weeks, undocumented, because the launcher's help only
forwarded to the server's help and the server had never heard of it.

ONE HELP, NOT TWO (owner ruling 2026-07-28). A program that forwards
arguments to another does NOT print a list of its own. It declares its
flags in the same registry as the program it forwards to, and renders that
one text. Two half-lists leave the reader stitching them together.

The launcher's flags therefore live in `engine/bin/se-mcp.ts` beside the
engine's, under a LAUNCH heading. The launcher consumes them and the server
never sees them. Documenting them there costs nothing and it is the only
place anybody has to look.

HELP GOES TO THE OUTPUT STREAM. PowerShell's `Write-Host` writes to the
host, and a pipe or a redirect drops it. The launcher's own block was
written that way, so anyone capturing the help saw only the forwarded
half and read a documented flag as undocumented.

THE RULE IS A TEST, NOT A SENTENCE (the linter law, below). The guard
reads the switches each entry point parses out of its source, runs it with
`--help`, and demands every one of them in the output:
`project/deliverable/tests/help.test.ts`.

## An installed program answers what it is, before it answers anything else

`--version` PRINTS THE VERSION AND EXITS 0, and it does so BEFORE the program
resolves a root, reads a config or opens a port. Everything a program needs in
order to run is a thing that can be broken, and the question "which build is
this" is exactly the question a person asks WHEN it is broken. A version flag
that needs a working install answers only when nobody needed it.

The flag comes first in the argument handling, ahead of `--help`, for the same
reason: it is the cheapest possible answer and nothing may stand in front of
it. It is listed in `--help` like every other switch.

A DEMONSTRATION IS ONE COMMAND. That is the point of the rule — anybody with
the checkout can run it, on a machine nobody is watching, and get back a fact
rather than a promise.

## The linter law (P5, field-proven twice)

Prose rules do not change agent behavior; refusals and tool-boundary
warnings do. An advisory nobody heeds is noise — measure whether lint
findings lead to edits, then promote the ignored ones to refusals or
delete them.

## Churn is acceptable (owner ruling 2026-07-04)

Backward churn — ripple, migrations, rewriting what already stands — is
acceptable. Churn-aversion is a human-team instinct. It must not decide
architecture.

"Smallest diff", "big ripple" and "schema stability" may break a tie.
They never trump correctness or the owner's ruling.

This is the dated-guidance test applied (software.md). Churn-aversion
rations human LABOUR, and that cost collapsed. Where a decision defers
churn anyway, record the sunset — deferred means scheduled, not avoided.

## The rule of cool (owner tiebreaker)

When options are close on cost and risk, "the owner finds it cooler" is
a real criterion. The choice is then not re-opened later with simplicity
arguments.

Motivation is the scarcest resource on a hobby project. A slightly
simpler option that stops getting worked on loses to a cool one that
keeps getting worked on.

It is a tiebreaker, never a trump. It cannot excuse a real cost or
correctness gap.

## Method tooling lives in the lane (owner ruling 2026-07-07, scoped 2026-07-10)

Any migration, converter or fix the PROCESS depends on becomes a real
tool in the lane, with a test and a registration. Never a sidecar script
beside it.

A script the method quietly depends on is invisible to the tool surface,
untested by the suite, and usually bound to one platform.

THE SCOPE MATTERS AS MUCH AS THE RULE. This was never a ban on one-off
scripts. A throwaway for one-time mechanical work is fine, and often the
efficient choice. It simply never becomes a dependency and never lives
in the repo.

The tell that the rule is being broken: a shell command doing what a
lane tool should do. Treat it as a missing tool, not a solved problem.

## Library capabilities are read, not guessed (owner correction 2026-07-31)

A claim about what a library can do comes from its documentation or its
source. Never from recall.

Recall answered wrong twice in one day. It said PlantUML needs Java; the
core package is pure JavaScript. A wrong capability claim steers a whole
design before anyone checks it.

Cite where the capability is documented when a decision rests on it.

## Adding a control to the bar (owner ruling 2026-08-04)

The bar's one truth is `project/deliverable/machines/panels/controls.md`.
The renderer is `engine/params.ts`. Every surface fetches the rendered bar
from the engine (`/widget/controls`) — the VS Code sidebar included.

- ONE ROW PER CONTROL. The row starts with its label; the controls follow.
  The Types section in controls.md lists what a row may declare.
- NEVER write bar markup in a surface. A surface that drew its own copy
  drifted silently, and it cost the owner corrections. The spec is the
  only place a control is born.
- A BUTTON POSTS A ROUTE. Give it `data-post` (the `action` and `actions`
  types do); the sidebar forwards any such press with no extension edit.
- THE LABEL EXPLAINS ITSELF ON CLICK. The renderer puts the row's help
  into `data-help` on the label; the surfaces' one generic hook shows it
  in the details. No per-row help wiring, ever.
- WHAT SHOWS UP IN VS CODE: engine-served surfaces (the bar, the machine
  page, the widgets) change live with the engine. The EXTENSION does not
  — VS Code runs the COPY under `~/.vscode/extensions`. After an
  extension edit: `npm run build` in project/deliverable, robocopy
  `vscode/` over the copy (RUNME's own step), reload the VS Code window.
- Adding a control therefore means: a row in controls.md, at most a new
  type in params.ts — and NO extension edit in the normal case.

## A UI change is not done until the engine restarts on it (owner ruling 2026-08-06)

THE OWNER MUST SEE A UI CHANGE ON THE NEXT LOOK. Anything less costs them a
round of "I still do not see it", and it cost several in one morning.

The failure has a TELL, and it is worth knowing by sight. The surface shows
NEW DATA drawn by OLD CODE — a template's raw `{token}` on screen, a
description that updated while the control beside it did not. Data is read
live from markdown; code only changes when the engine restarts.

So, for any change a person will LOOK at:

- Commit it.
- Reload (`se_reload`), so the engine restarts on the new sources.
- Say which surface to look at, and that a webview may want re-opening.

Never report a UI change as done from a green test alone. A test proves the
function; only the reload proves the owner can see it.

ONE TREE IS WHY THE RULE IS THIS SHORT. There is no second tree for an edit to
land in and disappear, so the reload is the whole of it — and the reload was
always the part that made a change visible.

## The engine checks a written file, and the agent never asks

OWNER RULING 2026-08-15. "We are going to have a register of checking tools
in the engine. The engine says: I am editing a TypeScript file, I am applying
all the checks for TypeScript on it, and then I continue. Auto-formatting,
like ruff for Python — the engine would just do that. It would not even ask.
But if it detects a problem it cannot auto-format, it will reject with a
decent remedy."

A REGISTER, KEYED BY FILE KIND. Not a list of TypeScript rules. Each kind
names the tools that apply to it, and a tool declares its own output format
so the engine can read a verdict from it. TypeScript is one entry. Python
with ruff is another. Markdown is another.

THREE OUTCOMES ON A WRITE, and only the third reaches the agent.

- CLEAN. The write lands and nothing is said.
- FIXABLE. The engine applies the fix and says so on the result. It does not
  ask. The linter already behaves this way on se_file_patch, which is the
  proof the shape works: "the linter's safe fixes ran on <path> — the
  returned hashes are the fixed content".
- NOT FIXABLE. The write is REFUSED, with the tool's own message and an
  executable remedy, like every other refusal in the lane.

WHY THE AGENT IS OUT OF THE LOOP. A check the agent has to remember to run is
a check that gets skipped under pressure. i12 spent four shell calls on
`npx tsc --noEmit` because no verb existed, and the honest reading is not
that a verb was missing — it is that the agent was doing the engine's job.

WHAT THIS REPLACES: the standing verify loop in this file names a scoped test
run after a checker pass. The checker half becomes automatic; the test half
stays the agent's, because only the agent knows which question a run answers.

## se_package builds the artifact

OWNER RULING 2026-08-15, agreed at i12's retro. The M9 package state requires
a versioned archive and the lane has no verb that builds one, so the agent
reaches for the shell. It happened twice in i12, once refused for a bad
argument.

The verb wraps engine/bin/package.ts, answers with the artifact path, and the
package state's file-ref field resolves it against disk as it already does.

## A merge into trunk re-checks every open iteration

OWNER RULING 2026-08-15, at i12's retro: "rechecking every open iteration, I
think makes sense. We can do that."

WHEN AN ITERATION'S BRANCH MERGES INTO TRUNK, the files it changed are files
other open iterations have already signed claims against. Nothing re-checks
them, so a claim can go on standing over a corpus that has moved beneath it.

THE RULE: after the merge, re-run each open iteration's claim checks against
trunk, and mark what no longer holds. It is the ripple the engine already
computes, pointed at a different trigger.

WHAT IT COST WHEN IT WAS MISSING. i12's milestone walk found SIX separate
steps that cost something for this one cause. write-requirements was amended
twice because a merge renamed one requirement and added fourteen. observe-red
had to adjudicate two specs that arrived mid-walk. trace-design went red
because the merged iteration's design layer had never reached trunk at all,
leaving eleven engine files with no spec claiming them.

THE MIRROR IMAGE IS THE SAME FIX. An iteration can also ship its CODE and
leave its TRACE behind, because nothing checks the trace after the merge
either. One check answers both directions: run the trace-design laws against
trunk, and re-check every open iteration's register and claims against the
corpus as it now stands.

IT IS CHEAP. The corpus load measures 4.3 ms warm against 312.9 ms cold, and
the comparison is set operations over the realizes and files edges. The one
constraint that matters: the graph must be built from TRUNK, never from the
merging iteration's own tree.

## A failed gate returns the walk to idle

OWNER RULING 2026-08-15: "A fail of a gate, in my opinion, lands you back at
idle, and then you need to decide how you go about it. Sometimes you can go
back maybe only one gate, sometimes we need to go back two gates. A dismissed
gate goes back to idle."

TODAY A FAILED GATE HAS NOWHERE TO GO. gate-implementation's only successor
is the next state, so a verdict of `fail` stamps nothing and moves nothing.
When the owner failed i12's implementation gate the walk did not move, and
the agent had to route around it by hand.

WHY IDLE AND NOT A NAMED PREDECESSOR. How far back a fail should send the
walk is a judgment that depends on what failed, and the machine cannot know
it. Idle is the one position from which every route can be drawn, so it is
the honest destination.

THE VERDICT STILL STANDS ON THE FORM. The fail is recorded with its
rationale; only the POSITION moves. Nothing about the ruling is lost by
returning to idle.
