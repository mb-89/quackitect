---
minted_in: i5-engine-hygiene-one-version-source-every-
id: sty-ask-the-package-what-it-is
type: "[[story]]"
statement: When a builder has just run the installer out of a release package, they want to ask the entrypoint which version it is, so they know the install worked before they trust anything it tells them.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

A builder has unpacked a release and run its installer. Nothing tells them whether it worked. The only way to find out today is to start the whole machine, which takes over the terminal and proves nothing about the version they actually got.
|||
TRUE AT THE START OF THIS RECORD, and it is why the record exists. i16's release gate wrote the finding after asking its own package what it was and getting a running server instead: "a house ruling says a package proves itself with a VERSION FLAG". There was no `--version` branch anywhere in `engine/bin/`.

---

They have the unpacked archive on disk and the install has just finished without printing an error. The lane is not running. No server is listening. They have never used this product before.
|||
DEMONSTRATED IN THE HARSHEST FORM OF THIS STATE, which is stronger than the slide asks for. The flag was run with `--root /no/such/place` — a root that does not exist at all — and still answered exit 0 with `5.0.0`. A builder whose install is merely incomplete is a milder case than one whose root is absent.

---

They run the entrypoint with `--version`.
|||
OBSERVED, 2026-08-19, at the build step `the-version-flag`: `node deliverable/engine/bin/se-mcp.ts --version`. One command, no arguments to get right, and it is listed in `--help` beside every other switch, so it is discoverable without being known.

---

It prints one line, the version out of the package's own manifest, and exits. No port is opened and no lane comes up.
|||
OBSERVED: exit 0, stdout `5.0.0`, stderr empty. The branch sits BEFORE the `--help` branch and before the root resolves, so nothing that could be broken is touched first. `SE_VERSION` reads `package.json` and was already the only place a version is resolved, so no second stamp exists to drift. Four cases in `tests/version-flag.test.ts` spawn the real entrypoint and assert exactly this; they are green in the validation battery, 1461 of 1461.

---

They compare that line with the version on the release they downloaded. The two agree.
|||
OBSERVED FROM THE REAL ARTICLE, and it came out stronger than the slide asks. The gap this slide carried at the validation gate was closed at M9: `dist/quackitect-5.0.0.zip` was unzipped into an empty directory and asked its version straight away — `node deliverable/engine/bin/se-mcp.ts --version` returned exit 0, stdout `5.0.0`, stderr empty, in 196 ms. THE DEPENDENCIES WERE NOT INSTALLED YET. There was no `node_modules` in that tree at all, and the flag still answered, which is a harder version of the story than the one written: the builder does not even have to finish installing before the copy can say what it is. `5.0.0` is the version the archive is named for and the version in its own manifest.

---

Four things are now proved by one command that took no time and left nothing running: the installer put files where the entrypoint expects them, the entrypoint resolves, its code loads, and the version is the one they meant to install.
|||
ALL FOUR HELD. The command returned in well under a second and left no process behind — no port opened, no lane started, nothing to shut down. The four are proved by the exit code alone: a missing file, an unresolvable entrypoint or a load failure all exit non-zero and print to stderr, and stderr was empty.

---

What is NOT proved, and the builder is told so rather than left to assume it: nothing started. A defect that only appears when the lane comes up passes this check. That trade is deliberate — running what the package built would destroy the lane the check runs in.
|||
THE WEAKNESS IS REAL AND WAS EXERCISED. This very record's engine repairs were invisible to a `--version` run and only appeared once the lane was up — twice they needed a full engine reload to take effect. So the slide's own caveat has a worked example from the record that authored it: the flag says the install is THERE, never that it is CORRECT.

Note: The owner ruled this shape on 2026-08-13. A package proves itself with a version flag, and the weakness above is accepted knowingly rather than argued away. The demonstration spec is [[tsp-the-package-answers-what-it-is]].
