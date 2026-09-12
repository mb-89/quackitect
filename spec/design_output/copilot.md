---
kind: [[design_output]]
refines:
  - [[spec/design_input/copilot]]
---

# Scope

One level zero holds two surfaces. This note covers the runtime under
`src/scripts/copilot.js` and the decisions it hands each surface.

# Events and feedback

Keep Claude's function hooks intact. Copilot command hooks translate events
into level-zero decisions. The surface chooses the response envelope.
Return denial and diagnostics together, without an approval request.
Read [[spec/design_input/copilot]] for the required behavior and limits.

# The write door

Decode explicit creates, replacements and context patches. Check the proposed
result before the tool writes. Refuse ambiguous context and unknown edit shapes.
Reject paths outside the tree and writes to the adapter source or rule configuration.
Shell commands remain outside full filesystem mediation.

Allow reads, creates, edits and deletions under `.se` through the ordinary tools.
Apply normal content checks. A handover claim coordinates consumption at startup;
it grants no special file access and imposes no write restriction.

# State between processes

Store records under `.se/copilot`, keyed by a hash of the session ID.
A directory lock serializes updates; an atomic rename publishes each record.
Save a claimed handover before deleting its original. A claim outlives a crash.

Release claims after successful completion, not after an error or timeout.
For a killed process, inspect the lock owner before removing its stale lock.
Recover unfinished handovers from the record or claim before cleanup.

# One runtime

The runtime takes filesystem, process and session doors. It imports existing
guidance and linter helpers. Claude neither imports nor calls this runtime.

Startup counts the applicable numbered guidance and requests its first reply
receipt. Judged rule messages reach context without a classification call.
Completion formats code the session touches and checks results in bounded batches.
Cloud completion also checks the assigned branch, clean tree and remote head.

Check four files per completion batch. Spend failure retries on actual issues;
request another batch without spending that budget when valid files remain.
Keep handover claims until every batch passes. Host continuation limits still
apply; the local retry counter cannot override them.

# Candidate reports

Biome returns source text for stdin linting. Check a temporary candidate file
with its JSON reporter instead. Copy the current rule settings and broaden
file discovery only within that temporary tree. Remove it after each check.
Keep Claude's existing checker caller unchanged.

# Setup and discovery

Run `node src/scripts/copilot.js setup vscode` for local use.
Use `setup cloud` in the ephemeral cloud setup job.
Both installers run `setup auto`, including when every binary exists.
The generator owns only its marked registrations. It preserves user files.

Commit the hook and setup workflow to the default branch before cloud work.
The cloud setup marker selects cloud response envelopes; local sessions use
VS Code envelopes. No Claude callback reaches this entry point.

# Validate the installation

The optional plugin validator catches an absent Claude executable inside
level zero. Installed Claude keeps its existing validation command and result.

Open a new Copilot chat and submit a prompt after setup. SessionStart supplies
the guidance and receipt request. Check agent hook logs for actual activation.
The model's acknowledgement alone is not an enforcement test.

# Dispatch and recovery

Run `node src/scripts/copilot.js dispatch` from a clean main checkout.
Authenticate `gh` as the person dispatching work, outside the worker sandbox.
The dispatcher calls the unchanged `work take` command. It pushes the synced
claim, creates or reuses a draft pull request, and posts an `@copilot` request.
It checks existing comments before retrying an ambiguous network failure.

Save the claim commit as the attempt identity before contacting GitHub.
Include both branch and attempt in the comment marker. A checkpoint before
a retry keeps that identity; release and a new claim produce another one.

Inspect the GitHub job to confirm acceptance and its assigned head branch.
Repository policy or bot credentials can prevent a comment from starting work.
Never pass the dispatcher's credentials to the worker to bypass that policy.

# Recover a dispatch

Keep the claimed branch after a failure. Resolve sync conflicts and rerun
dispatch there. Inspect `.se/copilot` if a process exits before recording the
claim. Do not release a branch while its worker can still push to it.

After a successful request, switch this checkout to main to dispatch another.
A timeout leaves the remote brief held. Inspect its commits and stop the job.
Then use the existing work release command before assigning it again.
Only a person calls work merge after reviewing the durable result and retro.

# Verification record

Run `./RUNME.sh check` for the current test and lint results.
Claude's executable is absent here, so native plugin validation remains open.
Claude's hooks and judge stay unchanged.

The real stdin integration test checks startup guidance and its numeric receipt.
It confirms a Biome debugger refusal and a clean candidate's acceptance,
with no target file write. Hook outcomes use the existing log door.
Stop retries have a bound; unfinished work keeps its recovery record.

Complete these host checks before claiming live compatibility:

1. Open this checkout in VS Code and start a new Copilot chat.
	Confirm hook discovery, the first receipt and a real edit refusal.
2. Publish the registrations to the default branch after review.
	Dispatch a draft work pull request with a person's GitHub credentials.
3. Confirm the cloud job uses that head, pushes its result and retro,
	and leaves the merge to a person. Test job interruption and work recovery.

# Tests above the doors

Test each outside boundary in its door contract. Test behavior above that
boundary with the existing fakes. Keep real Git and real checker workflows
out of the runtime and dispatch unit suites.

Run `node --test test/level0/copilot-runtime.test.js` for runtime decisions.
Run `node --test test/level0/copilot-dispatch.test.js` for dispatch attempts.
Use `fakeProc`, `fakeDisk` and `fakeSession`; reject unexpected process commands.

Model branch, claim SHA, checkpoint SHA and comments as in-memory state.
Test a lost response with the same attempt and a new claim with another one.
These tests check orchestration against door contracts, not Git or Biome again.
Keep live host activation as an explicit acceptance exercise outside these suites.

# Proposed acceptance gate

Keep `VoiceVale` for mechanical conventions and `VoiceJudged` for judgment.
Treat the following as workflow guarantees, with named owners and tests.
This proposal adds no rule category and changes no harness behavior yet.

| Guarantee | Current owner | Recommendation |
| --- | --- | --- |
| Preserve the brief until a result exists | `session.withState` and `handle` | Keep the session door contract and mock-based handover tests. |
| Request each work attempt once | `dispatch` | Keep mock-based retry tests; verify live job acceptance separately. |
| Keep the worker on its work branch | Level-zero guards and host credentials | Retain branch-specific credentials; use repository rules to reserve merging for a person. |
| Accept only a commit whose checks pass | Human review; hooks check selected writes | Add a required CI status for the exact candidate commit. |

# Proposed implementation

1. Add `.github/workflows/check.yml` with a `project-check` job.
	Run the existing installer and `./RUNME.sh check` on the pull request head commit.
2. Record the checkout SHA, command, exit code and checker versions in the job summary.
	A later push must trigger another check for its own SHA.
3. Require `project-check` and a person's approval in the repository ruleset.
	Keep Claude's hooks, the shared work commands and the mechanical/judgment split unchanged.
4. Test a shell-written defect and a push after a passing check.
	The first must fail CI; the second must await its own check before merge.

Keep hook feedback fast. Let CI verify the complete candidate, including files
outside the edit-tool list. Let the reviewer judge whether it solves the task.
Confirm this proposal before adding the workflow or changing repository permissions.