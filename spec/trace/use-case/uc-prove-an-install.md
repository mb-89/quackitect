---
minted_in: i5-engine-hygiene-one-version-source-every-
id: uc-prove-an-install
type: "[[use-case]]"
statement: Confirm that an installed copy is the one that was intended, without starting it.
actor: stk-vehicle-owner
trigger: an installer has finished on a machine, and nothing has yet said whether it worked
precondition: the product's files are on disk and its dependencies are installed
guarantee: the version the entrypoint reports is known, and nothing was started to learn it
refines:
  - sty-ask-the-package-what-it-is
priority: must
---

## Main scenario

1. The actor asks the entrypoint for its version.
2. The entrypoint reads the version from the product's own manifest.
3. The entrypoint prints that version and exits, opening no port and starting no lane.
4. The actor compares the printed version with the one they meant to install.
5. The two agree, so the install is proved as far as this check reaches.

## Extensions

- 1a. The entrypoint does not resolve, because the installer put files somewhere else. The shell's own error names the missing path, which is the finding.
- 2a. The manifest cannot be read. The entrypoint reports the version as unknown rather than refusing to run, because a version stamp must never be the reason a lane fails to start.
- 3a. Something else on the machine already holds the port a lane would want. It makes no difference here, because this path opens none.
- 4a. The printed version disagrees with the intended one. The install is wrong, and it is wrong in the one way that is otherwise invisible — files that load, from a build nobody meant to ship.
- 5a. The product starts and then fails. This check never claimed otherwise: it proves the code loads and which build it is, never that a running lane stays up.
