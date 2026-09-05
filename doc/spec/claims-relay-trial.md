# Trial: can a cloud box publish a claim through a workflow?

A brief for a fresh cloud session. It is a trial, not a design to build.
Three probes decide it. Run them in order and stop at the first that fails.

## Why this exists

Every box must be able to publish a claim. A box that cannot is a box whose
work is invisible, so two boxes take the same token. That is the one thing
claims exist to prevent, so "the cloud cannot publish" is not an answer.

A claim is a commit under `refs/se/claims`, and this box cannot push that ref.
That is measured and settled. What is not settled is whether there is a way
round it that keeps the ref.

## What is already measured. Do not repeat it.

From this repository, on a cloud box, in September 2026:

- `git push` to `refs/se/*`, `refs/tags/*` and `refs/notes/*` answers `HTTP 403`
  from the session's git proxy.
- `git push` to `refs/heads/*` is accepted.
- `git push --delete` of any ref answers `403`, a branch included.
- The GitHub API is authenticated as the owner through the proxy.
- `POST` and `PATCH` on `git/refs` answer `403` with
  "Write access to this GitHub API path is not permitted through this proxy".
- `git credential fill` holds nothing on the box.

So the proxy filters by path, and it filters both git and the API.

## The idea being tried

A GitHub Actions workflow runs on GitHub's own infrastructure, not in this
sandbox, and it authenticates with the repository's `GITHUB_TOKEN` rather than
with the proxy's scoped credential. A workflow can therefore push refs this box
cannot.

So the box would not push the claim. It would ask a workflow to push it, and
wait for the ref to move.

The race is still settled by git. The workflow fetches, builds the claim on the
remote's head, and pushes. Two workflows running at once resolve the same way a
push does today: the loser is refused and reads again. What the box gives up is
knowing at once whether it won.

## Probe one: may this box dispatch a workflow at all?

The proxy refused `git/refs`. Whether it refuses `actions/.../dispatches` is a
different question about a different path.

This costs nothing and needs no workflow file. Ask for a workflow that does not
exist and read which error comes back.

    gh api -X POST repos/mb-89/quackitect/actions/workflows/nothing-here.yml/dispatches -f ref=v4

- **404** means the path is permitted and only the workflow is missing. Go on.
- **403** with the proxy's wording means the path is refused. **Stop here.**
  The relay is dead and the branch is the answer.

Report the exact status and body either way.

## Probe two: can a workflow push the ref?

Only if probe one answered 404.

Add `.github/workflows/claim-relay-probe.yml` on this branch. It needs
`permissions: contents: write`, and it pushes one throwaway ref and deletes it.

    name: claim relay probe
    on:
      workflow_dispatch:
        inputs:
          stamp: { required: true, type: string }
    permissions:
      contents: write
    jobs:
      probe:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - run: |
              C=$(git commit-tree $(git hash-object -t tree /dev/null) -m probe)
              git push origin $C:refs/se/probe-${{ inputs.stamp }}
              git push origin --delete refs/se/probe-${{ inputs.stamp }}

**A gotcha to check before blaming the token.** `workflow_dispatch` generally
requires the workflow to exist on the repository's default branch, which is
`main` here, not `v4`. If the dispatch answers 422 or the workflow does not
appear, that is why, and it means landing the file on `main` first. Say which
happened rather than reporting a bare failure.

Report whether the push inside the workflow succeeded, and the run's log line
for it.

## Probe three: how long does it take?

Only if probe two succeeded.

Dispatch it and time how long until `git ls-remote origin refs/se/probe-<stamp>`
answers, then how long until the delete lands.

Report both numbers. A claim is taken in a block, so tens of seconds once per
block is affordable and minutes are not.

## What decides it

The relay is worth building if all three hold: the dispatch is permitted, the
workflow can push the ref, and the round trip is tens of seconds.

If any fails, the branch is the answer and `wk-4759d90994` is decided by that.
Say which probe failed and with what.

## What not to do

Do not build the relay. Do not change how claims are published. Do not touch
`refs/se/claims`.

Do not leave probe refs behind that you cannot delete. If the workflow can
delete them it should; if it cannot, name every ref you created so a desk can
sweep it, because this box cannot delete a ref of any kind.

## What to report

- The three probes, with exact status codes and bodies.
- Which of the two designs the result chooses.
- Every ref you created and whether it is gone.

## What the trial measured

Run on a cloud box on 2026-09-05, against commit 45caaa06 of v4. All three
probes hold, so the relay is worth building and wk-4759d90994 takes it.

### Probe one: the box may dispatch, on one of its two credentials

The brief expected two answers and there is a third. This box holds two
credentials, and they answer the same request differently.

| credential | status | body | who refused |
|---|---|---|---|
| the proxy's, through `curl` | 403 | `Resource not accessible by integration` | GitHub. `Server: github.com`, `X-Accepted-Github-Permissions: actions=write` |
| the GitHub MCP server's | 404 | `404 Not Found` | nobody. The workflow file is what is missing |

The control says the difference is real. `POST git/refs` on the same curl
answers `Write access to this GitHub API path is not permitted through this
proxy`, with a `docs.anthropic.com` link and no GitHub headers at all. The
proxy answered that one, and the request never left the box. The dispatch
reached GitHub.

So the proxy permits `actions/.../dispatches`. The proxy's own credential lacks
`actions: write`. The GitHub MCP server's credential holds it. Dispatching the
real `ci` workflow on that credential answers `Workflow does not have
'workflow_dispatch' trigger`, which is past the permission check and settles it.

**The relay runs on the GitHub MCP server's credential, not on `curl`.**

### Probe two: a workflow pushes the ref

Run 33971164027 pushed `refs/se/probe-33971164027` and deleted it again:

    + git push origin d5498a88...:refs/se/probe-33971164027
    PROBE_PUSH_OK 1788617611
    + git ls-remote origin refs/se/probe-33971164027
    d5498a884d39c9878ec209d59252b0eef0e27139	refs/se/probe-33971164027
    + git push origin --delete refs/se/probe-33971164027
     - [deleted]         refs/se/probe-33971164027

A workflow with `permissions: contents: write` pushes and deletes a ref under
`refs/se/`, which the box cannot do either way.

**The default-branch gotcha did not bite.** A `workflow_dispatch` naming
`ref: v4` for a workflow that exists only on `v4`, never on `main`, answered
`204 No Content` and ran. Landing the relay on `main` first is not needed.

### Probe three: tens of seconds

| trigger | box's push or dispatch, to the ref being visible | to the ref going |
|---|---|---|
| `push` on `v4` | between 9s and 11s | 13s after the delete was issued |
| `workflow_dispatch` | 30s | 13s after the delete was issued |

The workflow's own clock: the job was created at 14:13:25Z and the push step
ran between 14:13:30Z and 14:13:31Z. The runner spends about a second on the
push. Everything else is Actions queueing.

A claim is taken once per block, so 30 seconds is affordable. The box gives up
knowing at once whether it won, as the brief said it would.

### The refs this trial created

| ref | gone |
|---|---|
| `refs/se/probe-33971164027` | yes, the workflow deleted it |
| `refs/se/probe-dispatch1` | yes, the workflow deleted it |

`git ls-remote origin 'refs/se/*'` now answers `refs/se/claims` alone, which
the trial did not touch.

The probe workflow was landed on `v4` in 45caaa06 and removed again. A session
building the relay recovers it with
`git show 45caaa06:.github/workflows/claim-relay-probe.yml`.
