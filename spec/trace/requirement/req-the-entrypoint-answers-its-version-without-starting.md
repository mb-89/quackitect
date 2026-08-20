---
minted_in: i5-engine-hygiene-one-version-source-every-
id: req-the-entrypoint-answers-its-version-without-starting
type: "[[requirement]]"
statement: When the entrypoint is invoked with --version, the engine shall print the version from its own manifest and exit, opening no port and starting no lane.
kind: functional
verify_method: test
breaks_if_removed: An installed copy cannot be asked what it is, so the only way to check a release is to start it — which is exactly what a release check must not do.
breaks_how_badly: corrosive
measure: 1 line printed, exit code 0, and 0 listening sockets opened by the process.
refines:
  - uc-prove-an-install
source_refs:
  - "engine/version.ts: SE_VERSION reads ../package.json and answers unknown when it cannot"
  - "engine/bin/se-mcp.ts: --help exists and --version does not"
  - sty-ask-the-package-what-it-is
priority: must
---

## Detail

ONE FLAG, AND THE VERSION COMES FROM THE SAME PLACE EVERYTHING ELSE READS IT
FROM. `SE_VERSION` already resolves the manifest at module load, so the flag
prints that constant rather than reading the file a second time.

THE EXIT IS PART OF THE DEMAND, not an implementation detail. A flag that
prints the version and then falls through into the server start proves nothing
about a release, because the terminal is gone before anybody reads the line.

WHAT IT PROVES, and this is the whole reason the owner ruled it into the
release step.

| proved | how |
| --- | --- |
| the installer put files where the entrypoint expects them | the entrypoint resolves at all |
| the code loads | the module graph reaches the constant |
| the version is the one intended | the printed line is compared with the release |

WHAT IT DOES NOT PROVE. Anything that only fails once a lane is up. That is
accepted knowingly: running what the package built destroys the lane the check
runs in.

## Behaviour

None wanted. The demand is one condition and one response, and a model of that
would restate the statement in a second notation.
