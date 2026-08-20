---
minted_in: i5-engine-hygiene-one-version-source-every-
id: tsp-the-package-answers-what-it-is
type: "[[test-spec]]"
statement: A builder asks an installed copy which version it is and gets an answer without starting anything, demonstrated end to end against a checkout, against a root that does not exist, and against the entrypoint spawned as its own process.
method: demonstration
demonstrates:
  - sty-ask-the-package-what-it-is
verifies:
  - "none — demonstrates: sty-ask-the-package-what-it-is carries the edge; the mechanics are test-verified by tsp-an-install-answers-what-it-is"
files:
  - tests/version-flag.test.ts
---

## Scope

THE STORY END TO END, and nothing smaller. The mechanics — the flag's
placement before the root resolves, its presence in `--help`, the single
version source — are test-verified by [[tsp-an-install-answers-what-it-is]]
against `req-the-entrypoint-answers-its-version-without-starting`. THIS spec
is the story's upward edge and answers one question: does a person who has
just installed a copy get told what they installed.

THE EXTRACTED-ARCHIVE RUN IS IN, and it was added at M9 once the package
existed. It was out at the validation gate for ordering reasons only, and the
story's fifth slide carried the gap in the meantime rather than assuming it.

## Approach

AUTOMATED, NOT A STAGED SESSION, and the automation is the honest form here:
the four cases in `tests/version-flag.test.ts` SPAWN the real entrypoint as a
child process and read its exit code and its streams. There is no stub and no
harness standing in for the program, so what the cases observe is what a
person at a terminal observes.

ACCEPTANCE LEVEL. The observation is the exit code, stdout and stderr of a
real process — the same three facts a builder has.

THE HARSH CASE CARRIES THE RISK. The story's actor is on a machine where
nothing is configured yet, so the load-bearing observation is not the happy
run but the run against a root that does not exist. A flag that needs a
working install answers only when nobody needs it.

## Procedure

- Run `node project/deliverable/engine/bin/se-mcp.ts --version` in a checkout.
  OBSERVED 2026-08-19: exit 0, stdout `5.0.0`, stderr empty. Nothing listens
  afterwards and no lane is left running.
- Run the same command with `--root /no/such/place`. OBSERVED: exit 0, stdout
  `5.0.0`. The root is never reached, which is the claim the placement makes.
- Compare the printed line against the manifest the copy carries. OBSERVED:
  `5.0.0` in `package.json`, and `SE_VERSION` is the only code path that reads
  a version, so there is no second stamp to disagree.
- Run the entrypoint with `--help`. OBSERVED: `--version` is listed beside
  every other switch, so the command is discoverable by somebody who does not
  already know it.
- Run the full battery. OBSERVED: job test-mt05fmc1-1, 1461 of 1461 across 138
  suites, zero failures, with the four spawning cases among them — the flag is
  wired into the shipped entrypoint, not only green in isolation.
- Unzip the release archive into an empty directory and ask it, before doing
  anything else. OBSERVED 2026-08-19 on `dist/quackitect-5.0.0.zip`: exit 0,
  stdout `5.0.0`, stderr empty, 196 ms — with NO `node_modules` in that tree,
  because the dependencies had not been installed yet. This is the story's own
  situation and it is the load-bearing observation of this spec.
- Then install the extracted copy from its own manifest and boot it. OBSERVED:
  32 packages in 5 s, `preflight green` exit 0 in 269 ms, `smoke green` in
  0.4 s. The version answer was not a lucky read of a broken tree.
