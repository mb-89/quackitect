---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-asm-the-launched-agent-can-authenticate-itself
type: "[[raid]]"
kind: assumption
statement: The agent the launch step spawns can reach its provider without a person, so being installed is the same as being able to work.
owner: the driving agent
impact: The seven steps all report success, an agent process starts, and it does nothing. Nobody is beside it to see the login prompt, so the machine looks busy and is idle.
breaks_how_badly: crippling
how_likely: plausible
status: open
probe: "unprobed. The launch step runs `<agent> --version` and treats exit 0 as proof the agent can be started. A version check answers whether the binary is there. It does not answer whether the binary can reach its provider."
source_refs:
  - req-one-command-starts-an-unattended-machine
  - nbr-cloud-host
  - tsp-unattended-start
---

The launch step spawns the agent named by `--agent`, defaulting to `claude`.
Before it does, it runs `<agent> --version` and dies by name if that fails.

THAT CHECK ANSWERS THE WRONG QUESTION. It proves the binary exists on the
host. Whether the binary holds a credential it can use is a different fact,
and nothing in the seven steps looks at it.

WHY IT MATTERS MORE ON AN UNATTENDED HOST THAN ANYWHERE ELSE. On a laptop an
unauthenticated agent prints a login prompt and a person deals with it. On a
cloud machine nobody sees the prompt. Every step has reported success, a
process is running, and no walk happens.

IT IS THE SHAPE THE ENTRYPOINT EXISTS TO REMOVE. The first cloud run failed
as "the server is not there", which pointed at the wrong step in six of seven
cases. An agent that starts and cannot authenticate is the same failure
wearing a newer costume: a green run and no work.

## Probe

RUN THE LAUNCH STEP ON A HOST WHERE THE AGENT IS INSTALLED AND NOT LOGGED IN.
Watch whether anything distinguishes it from a working run.

THE OBSERVATION IS CHEAP AND THE HOST IS NOT. It rides the same machine the
end-to-end demonstration needs, under
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]], so it
costs nothing extra once that host exists.

IF IT FALLS, the fix is a step that asks the agent to do one trivial thing and
checks the answer, rather than asking it for its version. A launch that cannot
tell a working agent from a mute one is not a launch.
