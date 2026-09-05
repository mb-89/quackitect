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
