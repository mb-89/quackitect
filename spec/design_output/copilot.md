---
kind: [[design_output]]
refines:
  - [[spec/design_input/copilot]]
---

# Scope

One level zero holds both surfaces. This note covers the Copilot hooks the
Go engine answers, and the decisions they hand each surface.
`hookVerb` in `src/quack/hook_verb.go` answers each event, and
`src/modules/hooks/copilot.go` owns the events, the calls and the replies.

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
Apply normal content checks. A handover claim coordinates consumption at startup.
it grants no special file access and imposes no write restriction.

# State between processes

Store records under `.se/.runtime/copilot`, keyed by a hash of the session ID.
A directory lock serializes updates. An atomic rename publishes each record.
Save a claimed handover before deleting its original. A claim outlives a crash.

Release claims after successful completion, not after an error or timeout.
For a killed process, inspect the lock owner before removing its stale lock.
Recover unfinished handovers from the record or claim before cleanup.

# One runtime

The runtime takes filesystem, process and hooks doors. It imports existing
guidance and linter helpers. Claude neither imports nor calls this runtime.

Startup counts the applicable numbered guidance and requests its first reply
receipt. Judged rule messages reach context without a classification call.
Completion formats code the session touches and checks results in bounded batches.
Cloud completion also checks the assigned branch, clean tree and remote head.

Check a fixed number of files in each completion batch. Spend failure retries on actual issues.
request another batch without spending that budget when valid files remain.
Keep handover claims until every batch passes. Host continuation limits still
apply. The local retry counter cannot override them.

# Candidate reports

Biome returns source text for stdin linting. Check a temporary candidate file
with its JSON reporter instead. Copy the current rule settings and open
file discovery only within that temporary tree. Remove it after each check.
Keep Claude's existing checker caller unchanged.

# Setup and discovery

The setup verb writes the registrations where Copilot runs here.
The ephemeral cloud setup job runs `setup --cloud`.
`src/quack/copilotsetup.go` owns the registrations and the hook command.
The generator owns only its marked registrations. It preserves user files.

Commit the hook and setup workflow to the default branch before cloud work.
The cloud setup marker selects cloud response envelopes. A local session use
VS Code envelopes. No Claude callback reaches this entry point.

# Check the installation

The optional plugin validator catches an absent Claude executable inside
level zero. Installed Claude keeps its existing validation command and result.

Open a new Copilot chat and submit a prompt after setup. `SessionStart` supplies
the guidance and receipt request. Check agent hook logs for actual activation.
The model's acknowledgement alone is not an enforcement test.

# Verification record

Run `./RUNME.sh check` for the current test and lint results.
Claude's executable is absent here, so native plugin validation remains open.
Claude's hooks and judge stay unchanged.

The real stdin integration test checks startup guidance and its numeric receipt.
It confirms a Biome debugger refusal and a clean candidate's acceptance,
with no target file write. Hook outcomes use the existing log door.
Stop retries have a bound. Unfinished work keeps its recovery record.

Complete these host checks before claiming live compatibility:

1. Open this checkout in VS Code and start a new Copilot chat.
	Confirm hook discovery, the first receipt and a real edit refusal.
2. Publish the registrations to the default branch after review.
3. Confirm the cloud job pushes its result and retro,
	and leaves the merge to a desk.

# Tests above the doors

Test each outside boundary in its door contract. Test behavior above that
boundary with the existing fakes.

Run `go test ./src/modules/hooks/ ./src/quack/` for the hook's decisions.
`src/quack/hook_verb_test.go` fakes the hooks door and the log.
Keep live host activation as an explicit acceptance exercise outside these suites.

# Proposed acceptance gate

Keep `VoiceVale` for mechanical conventions and `VoiceJudged` for judgment.
Treat the following as workflow guarantees, with named owners and tests.
This proposal adds no rule category and changes no harness behavior yet.

| Guarantee | Current owner | Recommendation |
| --- | --- | --- |
| Keep the worker on its work branch | Level-zero guards and host credentials | Retain branch-specific credentials, and use repository rules to reserve merging for a person. |
| Accept only a commit whose checks pass | Human review, and hooks check selected writes | Add a required CI status for the exact candidate commit. |

# Proposed implementation

1. Add `.github/workflows/check.yml` with a `project-check` job.
	Run the existing installer and `./RUNME.sh check` on the pull request head commit.
2. Record the checkout SHA, command, exit code and checker versions in the job summary.
	A later push must trigger another check for its own SHA.
3. Require `project-check` and a person's approval in the repository ruleset.
	Keep Claude's hooks, the shared work commands and the mechanical/judgment split unchanged.
4. Test a shell-written defect and a push after a passing check.
	The first must fail CI; the second must await its own check before merge.

Keep hook feedback fast. Let CI check the complete candidate, including files
outside the edit-tool list. Let the reviewer judge whether it solves the task.
Confirm this proposal before adding the workflow or changing repository permissions.