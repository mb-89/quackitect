// The hook verb, over a real repository and its bare origin: each refusal the
// pre-commit and pre-push scripts gave, and the roads each lets through.
// [[spec/tickets/git-hooks-run-in-go]]
package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/hooks"
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

// A fake hooks door: the posts it takes, and the effects it answers, or an error where it stands down. [[spec/tickets/copilot-hooks-run-in-go]]
type copilotDoor struct {
	posts   []hooks.Post
	effects []hooks.Effect
	down    bool
}

// Takes one post. [[spec/tickets/copilot-hooks-run-in-go]]
func (c *copilotDoor) ask(post hooks.Post) (hooks.Answer, error) {
	c.posts = append(c.posts, post)
	if c.down {
		return hooks.Answer{}, errors.New("Unable to connect")
	}
	return hooks.Answer{Effects: c.effects}, nil
}

// One row the fake log takes. [[spec/tickets/copilot-hooks-run-in-go]]
type copilotRow struct {
	level, kind, line string
	fields            map[string]any
}

// What one Copilot event answers: the exit, the reply as printed and as JSON, the error stream, and the log's rows. [[spec/tickets/copilot-hooks-run-in-go]]
type copilotSaid struct {
	code  int
	out   string
	reply map[string]any
	errs  string
	rows  []copilotRow
}

// Runs one Copilot event over the root, the surface, the ask and a log failing with fails where it is set. [[spec/tickets/copilot-hooks-run-in-go]]
func copilotHooks(root, surface string, ask func(hooks.Post) (hooks.Answer, error), fails error, event, input string) copilotSaid {
	var said copilotSaid
	d := hookDoorsOver(root, surface == "cloud", nil, input, time.Now())
	d.copilot = surface
	d.ask = ask
	d.log = func(level, kind, line string, fields map[string]any) error {
		said.rows = append(said.rows, copilotRow{level, kind, line, fields})
		return fails
	}
	said.code, said.out, said.errs = runsTwin(hookVerb(d), "hook", event)
	_ = json.Unmarshal([]byte(strings.TrimSpace(said.out)), &said.reply)
	return said
}

func TestHookSessionStartAnswersTheDoorsAftersAsContext(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	door := &copilotDoor{effects: []hooks.Effect{{Kind: "after", Text: "one note"}, {Kind: "after", Text: "two note"}}}
	said := copilotHooks(root, "vscode", door.ask, nil, "SessionStart", `{"session_id":"s1"}`)
	want := map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "SessionStart", "additionalContext": "one note\n\ntwo note"}}
	if said.code != 0 || !reflect.DeepEqual(said.reply, want) {
		t.Fatalf("a session start answers %d, %q, and wants the afters joined as context", said.code, said.out)
	}
	if len(door.posts) != 1 || door.posts[0].Event != "session.start" || door.posts[0].Root != root || door.posts[0].E["session_id"] != "s1" {
		t.Errorf("the door takes %+v, and wants one session.start for s1 under the root", door.posts)
	}
	if len(said.rows) != 1 || said.rows[0].kind != "copilot" || said.rows[0].level != "info" || said.rows[0].line != "SessionStart: complete" {
		t.Errorf("the log takes %+v, and wants one copilot row saying the start completes", said.rows)
	}
}

func TestHookPreToolUsePostsAShellCallAsBashAndAnswersTheDeny(t *testing.T) {
	t.Parallel()
	door := &copilotDoor{effects: []hooks.Effect{{Kind: "result", Text: "the door refuses this call"}}}
	said := copilotHooks(t.TempDir(), "vscode", door.ask, nil, "PreToolUse", `{"session_id":"s1","tool_name":"functions.run_in_terminal","tool_input":{"command":"ls"}}`)
	want := map[string]any{"hookSpecificOutput": map[string]any{
		"hookEventName": "PreToolUse", "permissionDecision": "deny",
		"permissionDecisionReason": "the door refuses this call", "additionalContext": "the door refuses this call",
	}}
	if said.code != 0 || !reflect.DeepEqual(said.reply, want) {
		t.Fatalf("a shell call answers %d, %q, and wants the door's deny", said.code, said.out)
	}
	wantE := map[string]any{"tool": "Bash", "command": "ls", "session_id": "s1"}
	if len(door.posts) != 1 || door.posts[0].Event != "tool.call" || !reflect.DeepEqual(door.posts[0].E, wantE) {
		t.Errorf("the door takes %+v, and wants one tool.call carrying %v", door.posts, wantE)
	}
	if len(said.rows) != 1 || said.rows[0].level != "warn" || said.rows[0].line != "PreToolUse: the door refuses this call" || said.rows[0].fields["tool"] != "run_in_terminal" {
		t.Errorf("the log takes %+v, and wants one warn row naming the deny and the tool", said.rows)
	}
}

func TestHookPreToolUsePostsAnEditAsOneWrite(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	lays(t, root, "spec/a.md", "The door reads.\n")
	door := &copilotDoor{}
	said := copilotHooks(root, "vscode", door.ask, nil, "PreToolUse",
		`{"session_id":"s1","tool_name":"replace_string_in_file","tool_input":{"filePath":"spec/a.md","oldString":"reads","newString":"writes"}}`)
	if said.code != 0 || said.reply == nil || len(said.reply) != 0 {
		t.Fatalf("an edit the door passes answers %d, %q, and wants an empty reply", said.code, said.out)
	}
	wantE := map[string]any{"tool": "Write", "file_path": "spec/a.md", "content": "The door writes.\n", "session_id": "s1"}
	if len(door.posts) != 1 || door.posts[0].Event != "tool.call" || !reflect.DeepEqual(door.posts[0].E, wantE) {
		t.Errorf("the door takes %+v, and wants one Write carrying the whole new text", door.posts)
	}
	if text, _ := os.ReadFile(filepath.Join(root, "spec", "a.md")); string(text) != "The door reads.\n" {
		t.Errorf("the hook wrote %q to disk, and wants the file left to the tool", text)
	}
}

func TestHookPreToolUseRefusesAGuardedCallWhileTheDoorStandsDown(t *testing.T) {
	t.Parallel()
	said := copilotHooks(t.TempDir(), "vscode", (&copilotDoor{down: true}).ask, nil, "PreToolUse",
		`{"session_id":"s1","tool_name":"create_file","tool_input":{"filePath":"spec/b.md","content":"New.\n"}}`)
	out, _ := said.reply["hookSpecificOutput"].(map[string]any)
	reason, _ := out["permissionDecisionReason"].(string)
	if said.code != 0 || out["permissionDecision"] != "deny" || !strings.HasPrefix(reason, "Level zero refuses Write: the index answers nothing,") {
		t.Fatalf("a write while the door stands down answers %d, %q, and wants the refusal naming Write", said.code, said.out)
	}
	for _, one := range []struct{ event, input string }{
		{"SessionStart", `{"session_id":"s1"}`},
		{"PreToolUse", `{"session_id":"s1","tool_name":"run_in_terminal","tool_input":{"command":"git status"}}`},
	} {
		passed := copilotHooks(t.TempDir(), "vscode", (&copilotDoor{down: true}).ask, nil, one.event, one.input)
		if passed.code != 0 || passed.reply == nil || len(passed.reply) != 0 {
			t.Errorf("%s %s while the door stands down answers %d, %q, and wants it through", one.event, one.input, passed.code, passed.out)
		}
	}
}

func TestHookPostToolUsePostsClassicAndAnswersNothing(t *testing.T) {
	t.Parallel()
	door := &copilotDoor{}
	said := copilotHooks(t.TempDir(), "vscode", door.ask, nil, "PostToolUse", `{"session_id":"s1","tool_name":"read_file","tool_input":{"filePath":"a.md"}}`)
	if said.code != 0 || said.reply == nil || len(said.reply) != 0 {
		t.Fatalf("a post tool use answers %d, %q, and wants an empty reply", said.code, said.out)
	}
	if len(door.posts) != 1 || door.posts[0].Event != "classic.PostToolUse" || !reflect.DeepEqual(door.posts[0].E, map[string]any{"session_id": "s1"}) {
		t.Errorf("the door takes %+v, and wants one classic.PostToolUse for s1", door.posts)
	}
}

func TestHookStopAnswersTheDoorsBlock(t *testing.T) {
	t.Parallel()
	door := &copilotDoor{effects: []hooks.Effect{{Kind: "block", Text: "Write the result."}}}
	said := copilotHooks(t.TempDir(), "vscode", door.ask, nil, "Stop", `{"session_id":"s1"}`)
	want := map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "Stop", "decision": "block", "reason": "Write the result."}}
	if said.code != 0 || !reflect.DeepEqual(said.reply, want) {
		t.Fatalf("a Stop answers %d, %q, and wants the door's block", said.code, said.out)
	}
	if len(door.posts) != 1 || door.posts[0].Event != "classic.Stop" {
		t.Errorf("the door takes %+v, and wants one classic.Stop", door.posts)
	}
}

func TestHookStopRetryEndsWithoutClaimingDone(t *testing.T) {
	t.Parallel()
	full := errors.New("the log is full")
	first := copilotHooks(t.TempDir(), "vscode", (&copilotDoor{}).ask, full, "Stop", `{"session_id":"s1"}`)
	wantFirst := map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "Stop", "decision": "block", "reason": "Level zero: the log is full"}}
	if first.code != 0 || !reflect.DeepEqual(first.reply, wantFirst) || !strings.Contains(first.errs, "Level zero: the log is full") {
		t.Fatalf("a broken Stop answers %d, %q, %q, and wants the fault as a block and a stderr line", first.code, first.out, first.errs)
	}
	retry := copilotHooks(t.TempDir(), "vscode", (&copilotDoor{}).ask, full, "Stop", `{"session_id":"s1","stop_hook_active":true}`)
	wantRetry := map[string]any{"continue": false, "stopReason": "Level zero: the log is full", "systemMessage": "Level zero: the log is full"}
	if retry.code != 0 || !reflect.DeepEqual(retry.reply, wantRetry) {
		t.Errorf("a broken Stop retry answers %d, %q, and wants the turn ended with the fault", retry.code, retry.out)
	}
	cloud := copilotHooks(t.TempDir(), "cloud", (&copilotDoor{}).ask, full, "Stop", `{"sessionId":"s1","stop_hook_active":true}`)
	if cloud.reply == nil || cloud.reply["decision"] != nil || cloud.reply["additionalContext"] != "Level zero: the log is full" {
		t.Errorf("a broken cloud retry answers %q, and wants the fault as context with no block", cloud.out)
	}
}

func TestHookCloudTakesJSONStringArgumentsAndItsOwnEnvelope(t *testing.T) {
	t.Parallel()
	door := &copilotDoor{effects: []hooks.Effect{{Kind: "result", Text: "Fix line two."}}}
	said := copilotHooks(t.TempDir(), "cloud", door.ask, nil, "PreToolUse", `{"sessionId":"one","toolName":"bash","toolArgs":"{\"command\":\"ls\"}"}`)
	want := map[string]any{"permissionDecision": "deny", "permissionDecisionReason": "Fix line two."}
	if said.code != 0 || !reflect.DeepEqual(said.reply, want) {
		t.Fatalf("a cloud call answers %d, %q, and wants the cloud deny", said.code, said.out)
	}
	wantE := map[string]any{"tool": "Bash", "command": "ls", "session_id": "one"}
	if len(door.posts) != 1 || !reflect.DeepEqual(door.posts[0].E, wantE) {
		t.Errorf("the door takes %+v, and wants the string arguments decoded", door.posts)
	}
}

func TestHookAsksTheDoorTheStandingFileNames(t *testing.T) {
	t.Parallel()
	var bearer string
	var posted hooks.Post
	door := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bearer = r.Header.Get("Authorization")
		body, _ := io.ReadAll(r.Body)
		_ = json.Unmarshal(body, &posted)
		_, _ = w.Write([]byte(`{"effects":[{"kind":"after","text":"from the door"}]}`))
	}))
	defer door.Close()
	at, _ := url.Parse(door.URL)
	root := t.TempDir()
	lays(t, root, hooks.StandingFile, `{"port":`+at.Port()+`,"token":"t0k"}`)
	said := copilotHooks(root, "vscode", hookAsk(root, time.Second), nil, "SessionStart", `{"session_id":"s1"}`)
	want := map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "SessionStart", "additionalContext": "from the door"}}
	if !reflect.DeepEqual(said.reply, want) {
		t.Fatalf("the real ask answers %q, and wants the door's after as context", said.out)
	}
	if bearer != "Bearer t0k" || posted.Event != "session.start" || posted.Root != root {
		t.Errorf("the door took %q, %+v, and wants the standing token and a session.start under the root", bearer, posted)
	}
}

func TestCopilotScriptsLeave(t *testing.T) {
	t.Parallel()
	scripts, lib := "src/scripts/", ".claude/skills/level0/lib/"
	cmd := exec.Command("git", "ls-files", scripts+"copilot.js", scripts+"copilot-door.js", lib+"copilot.js", lib+"copilot-dispatch.js", lib+"copilot-setup.js", "src/doors/session.js", "src/doors/fake/session.js")
	cmd.Dir = treeRoot
	said, err := cmd.Output()
	if err != nil || strings.TrimSpace(string(said)) != "" {
		t.Fatalf("git ls-files answers %q, %v, and wants the Copilot scripts gone", said, err)
	}
}

func TestCopilotHooksNameNoScript(t *testing.T) {
	t.Parallel()
	cmd := exec.Command("git", "grep", "-n", "src/scripts/"+"copilot", "--", ".github", "src/quack", "src/modules")
	cmd.Dir = treeRoot
	said, _ := cmd.Output()
	if strings.TrimSpace(string(said)) != "" {
		t.Fatalf("git grep answers\n%s\nand wants no hook, workflow or Go file naming the Copilot script", said)
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
