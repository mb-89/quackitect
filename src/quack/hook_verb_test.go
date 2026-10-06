// The hook verb, over a real repository and its bare origin: each refusal the
// pre-commit and pre-push scripts gave, and the roads each lets through.
// [[spec/tickets/git-hooks-run-in-go]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

const (
	hookZeros   = "0000000000000000000000000000000000000000"
	hookHolder  = "box 0ther1d · session s1 · claude-code-remote"
	hookAddress = "duck" + "@" + "quacks.org"
)

// The doors over a repository: no cloud, the environment the map holds, the text git pipes in, and a clock at the time given. [[spec/tickets/git-hooks-run-in-go]]
func hookDoorsOver(root string, cloud bool, env map[string]string, stdin string, now time.Time) hookDoors {
	return hookDoors{
		root: root, cloud: cloud,
		env:   func(name string) string { return env[name] },
		stdin: strings.NewReader(stdin),
		now:   func() time.Time { return now },
	}
}

// The agent's environment: the engine runs. [[spec/tickets/git-hooks-run-in-go]]
var hookAgent = map[string]string{"SE_ENGINE": "1"}

// Stages a file and runs the pre-commit event. [[spec/tickets/git-hooks-run-in-go]]
func preCommits(t *testing.T, path, text string) (int, string) {
	t.Helper()
	root, _ := landingRepo(t)
	lays(t, root, path, text)
	gitDoes(t, root, "add", "-A")
	code, _, errs := runsTwin(hookVerb(hookDoorsOver(root, false, nil, "", time.Now())), "hook", "pre-commit")
	return code, errs
}

// The line git pipes to pre-push for a ref the push carries. [[spec/tickets/git-hooks-run-in-go]]
func pushLine(branch, sha string) string {
	return "refs/heads/" + branch + " " + sha + " refs/heads/" + branch + " " + hookZeros + "\n"
}

// Runs the pre-push event over the lines. [[spec/tickets/git-hooks-run-in-go]]
func prePushes(root string, cloud bool, env map[string]string, lines string, now time.Time) (int, string) {
	code, _, errs := runsTwin(hookVerb(hookDoorsOver(root, cloud, env, lines, now)), "hook", "pre-push")
	return code, errs
}

// A work branch whose group ticket holds an open take by the holder, pushed to origin, with one more local commit on it. [[spec/tickets/git-hooks-run-in-go]]
func heldBranch(t *testing.T) (string, string) {
	t.Helper()
	root, _ := landingRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/x")
	lays(t, root, "spec/tickets/x.md", "---\nkind: [[ticket]]\nstate: open\nrecord:\n  - step: design/draft\n    hand: "+hookHolder+"\n    hash_before: abc123\n---\n\n# Ask\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "x: the hold")
	gitDoes(t, root, "push", "-q", "origin", "work/x")
	gitDoes(t, root, "commit", "-q", "--allow-empty", "-m", "x: a plain commit")
	lays(t, root, ".se/.runtime/box.json", `{"id":"myb0x"}`)
	return root, gitDoes(t, root, "rev-parse", "HEAD")
}

func TestHookPreCommitRefusesAMarker(t *testing.T) {
	t.Parallel()
	code, errs := preCommits(t, "spec/tickets/b.md", "---\nstate: open\n---\n\n<<<<<<< ours\none\n=======\ntwo\n>>>>>>> theirs\n")
	if code != exitFailed || !strings.Contains(errs, "spec/tickets/b.md:5") || !strings.Contains(errs, "a conflict marker") {
		t.Fatalf("pre-commit answers %d, %q, and wants the marker's file and line refused", code, errs)
	}
}

func TestHookPreCommitRefusesAPrivateDelta(t *testing.T) {
	t.Parallel()
	code, errs := preCommits(t, "spec/guidance/voice.md", "Write to "+hookAddress+" where the door refuses.\n")
	if code != exitFailed || !strings.Contains(errs, "spec/guidance/voice.md:1:1") || !strings.Contains(errs, "ShapeStaysHome") {
		t.Fatalf("pre-commit answers %d, %q, and wants the address refused by line and rule", code, errs)
	}
}

func TestHookPreCommitRefusesAnUntestedChange(t *testing.T) {
	t.Parallel()
	code, errs := preCommits(t, "src/bridge/one.js", "export const one = 1;\n")
	if code != exitFailed || !strings.Contains(errs, "no test beside it") {
		t.Fatalf("pre-commit answers %d, %q, and wants the change without a test refused", code, errs)
	}
}

func TestHookPreCommitPassesACleanDelta(t *testing.T) {
	t.Parallel()
	code, errs := preCommits(t, "spec/guidance/voice.md", "The door reads the delta a commit carries.\n")
	if code != 0 || errs != "" {
		t.Fatalf("pre-commit answers %d, %q, and wants a clean delta through in silence", code, errs)
	}
}

func TestHookPrePushRefusesAVersionDelete(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	code, errs := prePushes(root, false, nil, "(delete) "+hookZeros+" refs/heads/v1 "+gitDoes(t, root, "rev-parse", "HEAD")+"\n", time.Now())
	if code != exitFailed || !strings.Contains(errs, "v1") || !strings.Contains(errs, "delete") {
		t.Fatalf("pre-push answers %d, %q, and wants the delete of a version branch refused", code, errs)
	}
}

func TestHookPrePushRefusesACloudPushToTrunk(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	stampsGreen(t, root, gitDoes(t, root, "rev-parse", "HEAD"))
	code, errs := prePushes(root, true, nil, pushLine("main", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed || !strings.HasPrefix(errs, "A cloud box pushes its own work branch alone, and main stands for the desk.") {
		t.Fatalf("pre-push answers %d, %q, and wants a cloud push to main refused on a green stamp", code, errs)
	}
}

func TestHookPrePushRefusesARedBatteryOnTrunk(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	code, errs := prePushes(root, false, hookAgent, pushLine("main", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed || !strings.HasPrefix(errs, "main takes a green battery, and ") || !strings.Contains(errs, "Run `./RUNME.sh check` last") {
		t.Fatalf("pre-push answers %d, %q, and wants an agent's push to main refused without a stamp", code, errs)
	}
}

func TestHookPrePushRefusesAnUncheckedTip(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/y")
	stampsGreen(t, root, gitDoes(t, root, "rev-parse", "HEAD"))
	lays(t, root, "src/bridge/two.js", "export const two = 2;\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "--no-verify", "-m", "y: code past the check")
	code, errs := prePushes(root, false, hookAgent, pushLine("work/y", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed || !strings.HasPrefix(errs, "work/y takes a push the check has passed, and ") {
		t.Fatalf("pre-push answers %d, %q, and wants a tip past the checked commit refused", code, errs)
	}
}

func TestHookPrePushRefusesABranchAnotherBoxHolds(t *testing.T) {
	t.Parallel()
	root, sha := heldBranch(t)
	code, errs := prePushes(root, true, nil, pushLine("work/x", sha), time.Now())
	if code != exitFailed || !strings.Contains(errs, "work/x stands in the hand of "+hookHolder) || !strings.Contains(errs, "branch sync") {
		t.Fatalf("pre-push answers %d, %q, and wants a branch another box holds refused, naming the holder and main", code, errs)
	}
}

func TestHookPrePushRefusesAPlainPushOntoAStaleHold(t *testing.T) {
	t.Parallel()
	root, sha := heldBranch(t)
	code, errs := prePushes(root, true, nil, pushLine("work/x", sha), time.Now().Add(24*time.Hour))
	if code != exitFailed || !strings.Contains(errs, "stale hold of "+hookHolder) || !strings.Contains(errs, "./RUNME.sh branch take x") {
		t.Fatalf("pre-push answers %d, %q, and wants a plain push onto a stale hold refused, naming the take", code, errs)
	}
}

func TestHookPrePushRefusesATodoTag(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/z")
	lays(t, root, "spec/tickets/z.md", "---\nkind: [[ticket]]\nstate: open\nurgency: whenever\ntodo: true\n---\n\n# Ask\n\nLook at the lint.\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "z: a tagged note")
	code, errs := prePushes(root, false, nil, pushLine("work/z", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed || !strings.Contains(errs, "spec/tickets/z.md") {
		t.Fatalf("pre-push answers %d, %q, and wants a push carrying a tagged note refused by name", code, errs)
	}
}

func TestHookPrePushLetsTheOwnersTerminalThrough(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	gitDoes(t, root, "commit", "-q", "--allow-empty", "-m", "a-ticket: no check")
	code, errs := prePushes(root, false, nil, pushLine("main", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != 0 || errs != "" {
		t.Fatalf("pre-push answers %d, %q, and wants the owner's push to main through with no stamp", code, errs)
	}
}

func TestHookPrePushLetsARedWorkBranchThroughUnderCI(t *testing.T) {
	t.Parallel()
	root, _ := landingRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/y")
	lays(t, root, ".github/workflows/check.yml", "name: check\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "y: the workflow")
	code, errs := prePushes(root, false, hookAgent, pushLine("work/y", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != 0 || errs != "" {
		t.Fatalf("pre-push answers %d, %q, and wants an agent's red work branch through where CI guards the tree", code, errs)
	}
	code, _ = prePushes(root, false, hookAgent, pushLine("main", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed {
		t.Fatalf("pre-push answers %d, and wants the red push to main refused under CI still", code)
	}
}

func TestHookScriptsLeave(t *testing.T) {
	t.Parallel()
	cmd := exec.Command("git", "ls-files", "src/scripts/precommit.js", "src/scripts/prepush.js")
	cmd.Dir = treeRoot
	said, err := cmd.Output()
	if err != nil || strings.TrimSpace(string(said)) != "" {
		t.Fatalf("git ls-files answers %q, %v, and wants both scripts gone", said, err)
	}
}

func TestGitHooksNameNoNode(t *testing.T) {
	t.Parallel()
	for _, name := range []string{"pre-commit", "pre-push"} {
		text, err := os.ReadFile(filepath.Join(treeRoot, ".githooks", name))
		if err != nil || strings.Contains(string(text), "node") {
			t.Fatalf(".githooks/%s reads %q, %v, and wants no node named", name, text, err)
		}
	}
}
