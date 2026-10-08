// The hook verb, over a real repository and its bare origin: each refusal the
// pre-commit and pre-push scripts gave, and the roads each lets through.
// [[spec/tickets/git-hooks-run-in-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"io"
	// level0: OutsideInDoors - the case reads the real repository it drives, the verb's door test
	"os"
	// level0: OutsideInDoors - the case runs the real hook script, the hook's door test
	"os/exec"
	"path/filepath"
	"reflect"
	"strconv"
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
		disk:  realDisk(),
	}
}

// A real repository and its bare origin, holding an open ticket, a closed one and a readme on main, since a git hook runs over real git. [[spec/tickets/git-hooks-run-in-go]]
func hookRepo(t *testing.T) (string, string) {
	t.Helper()
	root := shortDir(t)
	origin := filepath.Join(shortDir(t), "origin.git")
	gitDoes(t, "", "init", "-q", "--bare", origin)
	gitDoes(t, "", "init", "-q", "-b", "main", root)
	for _, one := range [][]string{{"user.name", "a hand"}, {"user.email", "hand@example.invalid"}, {"commit.gpgsign", "false"}, {"core.autocrlf", "false"}} {
		gitDoes(t, root, "config", one[0], one[1])
	}
	seedFile(t, root, "spec/tickets/a-ticket.md", "---\nstate: open\n---\n\n# Ask\n")
	seedFile(t, root, "spec/tickets/shut.md", "---\nstate: closed\n---\n\n# Ask\n")
	seedFile(t, root, "README.md", "a tree\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "a-ticket: the tree opens")
	gitDoes(t, root, "remote", "add", "origin", origin)
	gitDoes(t, root, "push", "-q", "origin", "main")
	return root, origin
}

// Runs git under the dir, and stops the test where it fails. [[spec/tickets/git-hooks-run-in-go]]
func gitDoes(t *testing.T, dir string, args ...string) string {
	t.Helper()
	run := exec.Command("git", args...) // level0: FixtureOutsideHome - each case drives a real repository and its bare origin of its own
	run.Dir = dir
	said, err := run.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s answers %v: %s", strings.Join(args, " "), err, said)
	}
	return strings.TrimSpace(string(said))
}

// The agent's environment: the engine runs. [[spec/tickets/git-hooks-run-in-go]]
var hookAgent = map[string]string{"SE_ENGINE": "1"}

// Stages a file and runs the pre-commit event. [[spec/tickets/git-hooks-run-in-go]]
func preCommits(t *testing.T, path, text string) (int, string) {
	t.Helper()
	root, _ := hookRepo(t)
	seedFile(t, root, path, text)
	gitDoes(t, root, "add", "-A")
	// level0: OutsideInDoors - the case hands the hook doors one wall reading over the real repository, the verb's door test
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
	root, _ := hookRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/x")
	seedFile(t, root, "spec/tickets/x.md", "---\nkind: [[ticket]]\nstate: open\nrecord:\n  - step: design/draft\n    hand: "+hookHolder+"\n    hash_before: abc123\n---\n\n# Ask\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "x: the hold")
	gitDoes(t, root, "push", "-q", "origin", "work/x")
	gitDoes(t, root, "commit", "-q", "--allow-empty", "-m", "x: a plain commit")
	seedFile(t, root, ".se/.runtime/box.json", `{"id":"myb0x"}`)
	return root, gitDoes(t, root, "rev-parse", "HEAD")
}

// Pre-commit refuses a private delta by line and rule and a change with no test beside it, and passes a clean delta in silence. [[spec/tickets/git-hooks-run-in-go]]
func TestHookPreCommitRefusesAPrivateDeltaAndAnUntestedChange(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		path, text string
		code       int
		says       []string
	}{
		{"spec/guidance/voice.md", "Write to " + hookAddress + " where the door refuses.\n", exitFailed, []string{"spec/guidance/voice.md:1:1", "ShapeStaysHome"}},
		{"src/bridge/one.js", "export const one = 1;\n", exitFailed, []string{"no test beside it"}},
		{"spec/guidance/voice.md", "The door reads the delta a commit carries.\n", 0, nil},
	} {
		code, errs := preCommits(t, one.path, one.text)
		if code != one.code || (one.says == nil && errs != "") {
			t.Fatalf("pre-commit over %s answers %d, %q", one.path, code, errs)
		}
		for _, said := range one.says {
			if !strings.Contains(errs, said) {
				t.Fatalf("pre-commit over %s says %q, and wants %q", one.path, errs, said)
			}
		}
	}
}

// A push to main refuses a cloud box and an agent with no stamp, and lets the owner's terminal through. [[spec/tickets/git-hooks-run-in-go]]
func TestHookPrePushRefusesACloudPushToTrunk(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		cloud, stamp bool
		env          map[string]string
		code         int
		says         string
	}{
		{true, true, nil, exitFailed, "A cloud box pushes its own work branch alone, and main stands for the desk."},
		{false, false, hookAgent, exitFailed, "main takes a green battery, and "},
		{false, false, nil, 0, ""},
	} {
		root, _ := hookRepo(t)
		gitDoes(t, root, "commit", "-q", "--allow-empty", "-m", "a-ticket: no check")
		if one.stamp {
			stampsGreen(t, root, gitDoes(t, root, "rev-parse", "HEAD"))
		}
		// level0: OutsideInDoors - the push dates its claims against the real commits' wall time, the verb's door test
		code, errs := prePushes(root, one.cloud, one.env, pushLine("main", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
		if code != one.code || !strings.HasPrefix(errs, one.says) || (one.says == "" && errs != "") || (one.env != nil && !strings.Contains(errs, "Run `./RUNME.sh check` last")) {
			t.Fatalf("pre-push answers %d, %q, and wants %d opening %q", code, errs, one.code, one.says)
		}
	}
}

func TestHookPrePushRefusesABranchAnotherBoxHolds(t *testing.T) {
	t.Parallel()
	root, sha := heldBranch(t)
	stampsGreen(t, root, sha)
	tip, err := strconv.ParseInt(gitDoes(t, root, "log", "-1", "--format=%ct", "origin/work/x"), 10, 64)
	if err != nil {
		t.Fatalf("the hold's commit time reads %v", err)
	}
	code, errs := prePushes(root, true, nil, pushLine("work/x", sha), time.Unix(tip, 0))
	if code != exitFailed || !strings.Contains(errs, "work/x stands in the hand of "+hookHolder) || !strings.Contains(errs, "branch sync") {
		t.Fatalf("pre-push answers %d, %q, and wants a branch another box holds refused, naming the holder and main", code, errs)
	}
}

func TestHookPrePushRefusesATodoTag(t *testing.T) {
	t.Parallel()
	root, _ := hookRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/z")
	seedFile(t, root, "spec/tickets/z.md", "---\nkind: [[ticket]]\nstate: open\nurgency: whenever\ntodo: true\n---\n\n# Ask\n\nLook at the lint.\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "z: a tagged note")
	// level0: OutsideInDoors - the push dates its claims against the real commits' wall time, the verb's door test
	code, errs := prePushes(root, false, nil, pushLine("work/z", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed || !strings.Contains(errs, "spec/tickets/z.md") {
		t.Fatalf("pre-push answers %d, %q, and wants a push carrying a tagged note refused by name", code, errs)
	}
}

func TestHookPrePushLetsARedWorkBranchThroughUnderCI(t *testing.T) {
	t.Parallel()
	root, _ := hookRepo(t)
	gitDoes(t, root, "checkout", "-q", "-b", "work/y")
	seedFile(t, root, ".github/workflows/check.yml", "name: check\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "y: the workflow")
	// level0: OutsideInDoors - the push dates its claims against the real commits' wall time, the verb's door test
	code, errs := prePushes(root, false, hookAgent, pushLine("work/y", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != 0 || errs != "" {
		t.Fatalf("pre-push answers %d, %q, and wants an agent's red work branch through where CI guards the tree", code, errs)
	}
	// level0: OutsideInDoors - the push dates its claims against the real commits' wall time, the verb's door test
	code, _ = prePushes(root, false, hookAgent, pushLine("main", gitDoes(t, root, "rev-parse", "HEAD")), time.Now())
	if code != exitFailed {
		t.Fatalf("pre-push answers %d, and wants the red push to main refused under CI still", code)
	}
}

// A fake hooks door: the posts it takes, and the effects it answers, or an error where it stands down. [[spec/tickets/copilot-hooks-run-in-go]]
type copilotDoor struct {
	posts   []hooks.Post
	effects []hooks.Effect
	down    bool
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
	// level0: OutsideInDoors - the case hands the hook doors one wall reading over the real repository, the verb's door test
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
	root := sharedFolder()
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
	said := copilotHooks(sharedFolder(), "vscode", door.ask, nil, "PreToolUse", `{"session_id":"s1","tool_name":"functions.run_in_terminal","tool_input":{"command":"ls"}}`)
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
	root := t.TempDir() // level0: FixtureOutsideHome - the case lays the file it edits into a root of its own
	seedFile(t, root, "spec/a.md", "The door reads.\n")
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
	said := copilotHooks(sharedFolder(), "vscode", (&copilotDoor{down: true}).ask, nil, "PreToolUse",
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
		passed := copilotHooks(sharedFolder(), "vscode", (&copilotDoor{down: true}).ask, nil, one.event, one.input)
		if passed.code != 0 || passed.reply == nil || len(passed.reply) != 0 {
			t.Errorf("%s %s while the door stands down answers %d, %q, and wants it through", one.event, one.input, passed.code, passed.out)
		}
	}
}

// A post tool use posts classic and answers nothing, and a Stop answers the door's block. [[spec/tickets/copilot-hooks-run-in-go]]
func TestHookPostToolUsePostsClassicAndAnswersNothing(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		event, input string
		effects      []hooks.Effect
		want         map[string]any
	}{
		{"PostToolUse", `{"session_id":"s1","tool_name":"read_file","tool_input":{"filePath":"a.md"}}`, nil, map[string]any{}},
		{"Stop", `{"session_id":"s1"}`, []hooks.Effect{{Kind: "block", Text: "Write the result."}}, map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "Stop", "decision": "block", "reason": "Write the result."}}},
	} {
		door := &copilotDoor{effects: one.effects}
		said := copilotHooks(sharedFolder(), "vscode", door.ask, nil, one.event, one.input)
		if said.code != 0 || !reflect.DeepEqual(said.reply, one.want) {
			t.Fatalf("a %s answers %d, %q, and wants %v", one.event, said.code, said.out, one.want)
		}
		if len(door.posts) != 1 || door.posts[0].Event != "classic."+one.event || !reflect.DeepEqual(door.posts[0].E, map[string]any{"session_id": "s1"}) {
			t.Errorf("the door takes %+v, and wants one classic.%s for s1", door.posts, one.event)
		}
	}
}

func TestHookStopRetryEndsWithoutClaimingDone(t *testing.T) {
	t.Parallel()
	full := errors.New("the log is full")
	first := copilotHooks(sharedFolder(), "vscode", (&copilotDoor{}).ask, full, "Stop", `{"session_id":"s1"}`)
	wantFirst := map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "Stop", "decision": "block", "reason": "Level zero: the log is full"}}
	if first.code != 0 || !reflect.DeepEqual(first.reply, wantFirst) || !strings.Contains(first.errs, "Level zero: the log is full") {
		t.Fatalf("a broken Stop answers %d, %q, %q, and wants the fault as a block and a stderr line", first.code, first.out, first.errs)
	}
	retry := copilotHooks(sharedFolder(), "vscode", (&copilotDoor{}).ask, full, "Stop", `{"session_id":"s1","stop_hook_active":true}`)
	wantRetry := map[string]any{"continue": false, "stopReason": "Level zero: the log is full", "systemMessage": "Level zero: the log is full"}
	if retry.code != 0 || !reflect.DeepEqual(retry.reply, wantRetry) {
		t.Errorf("a broken Stop retry answers %d, %q, and wants the turn ended with the fault", retry.code, retry.out)
	}
	cloud := copilotHooks(sharedFolder(), "cloud", (&copilotDoor{}).ask, full, "Stop", `{"sessionId":"s1","stop_hook_active":true}`)
	if cloud.reply == nil || cloud.reply["decision"] != nil || cloud.reply["additionalContext"] != "Level zero: the log is full" {
		t.Errorf("a broken cloud retry answers %q, and wants the fault as context with no block", cloud.out)
	}
}

func TestHookCloudTakesJSONStringArgumentsAndItsOwnEnvelope(t *testing.T) {
	t.Parallel()
	door := &copilotDoor{effects: []hooks.Effect{{Kind: "result", Text: "Fix line two."}}}
	said := copilotHooks(sharedFolder(), "cloud", door.ask, nil, "PreToolUse", `{"sessionId":"one","toolName":"bash","toolArgs":"{\"command\":\"ls\"}"}`)
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
	d, _, _, _ := fakeBoxDoors(t)
	root := d.root
	hq1SeedDisk(t, d.disk, root, map[string]string{hooks.StandingFile: `{"port":4711,"token":"t0k"}`})
	var address, bearer string
	var posted hooks.Post
	post := func(url, token, body string, _ time.Duration) (int, string, error) {
		address, bearer = url, token
		_ = json.Unmarshal([]byte(body), &posted)
		return 200, `{"effects":[{"kind":"after","text":"from the door"}]}`, nil
	}
	said := copilotHooks(root, "vscode", hookAsk(d.disk, post, root, time.Second), nil, "SessionStart", `{"session_id":"s1"}`)
	want := map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "SessionStart", "additionalContext": "from the door"}}
	if !reflect.DeepEqual(said.reply, want) {
		t.Fatalf("the real ask answers %q, and wants the door's after as context", said.out)
	}
	if address != "http://127.0.0.1:4711/hook" || bearer != "t0k" || posted.Event != "session.start" || posted.Root != root {
		t.Errorf("the door took %q at %q, %+v, and wants the standing token and a session.start under the root at the standing port", bearer, address, posted)
	}
}

func TestTheHookHandReadsTheBoxDoors(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	hq1SeedDisk(t, d.disk, d.root, map[string]string{hooks.StandingFile: `{"port":4711,"token":"t0k"}`})
	asked := ""
	d.post = func(url, _, _ string, _ time.Duration) (int, string, error) {
		asked = url
		return 200, `{"effects":[]}`, nil
	}
	hand := hookOn(d)
	if _, err := hand.ask(hooks.Post{Event: "session.start"}); err != nil || asked != "http://127.0.0.1:4711/hook" {
		t.Errorf("the hand asks %q and meets %v, and wants the box's post at the standing port", asked, err)
	}
	if err := hand.log("warn", copilotKind, "from the hand", nil); err != nil {
		t.Fatal(err)
	}
	if logged, err := d.disk.read(filepath.Join(d.root, filepath.FromSlash(sessionLog))); err != nil || !strings.Contains(string(logged), `"said":"from the hand"`) {
		t.Errorf("the box's disk holds the log %q, and wants the hand's row", logged)
	}
	if hand.root != d.root || !hand.now().Equal(d.clock.Now()) {
		t.Errorf("the hand stands at %q at %v, and wants the box's root and clock", hand.root, hand.now())
	}
}

// The cage verb and the box doors read the one input the box doors name. [[spec/tickets/doors-pr-windows-goes-green]]
func TestTheBoxDoorsReadTheProcessInput(t *testing.T) {
	t.Parallel()
	if got := realBoxDoors(io.Discard, io.Discard).input; got != stdin {
		t.Fatalf("the box doors read %v, and want the process input %v", got, stdin)
	}
}

// Runs the cage verb over the input, and answers what it prints. [[spec/tickets/level0-hooks-hold-no-rule]]
func cageSays(t *testing.T, input string) (string, int) {
	t.Helper()
	one := cageVerb(strings.NewReader(input))
	if one == nil {
		t.Fatalf("the cage verb stands nowhere")
	}
	var out, errs strings.Builder
	code := one([]string{"cage"}, false, &out, &errs)
	return out.String(), code
}

func TestCageVerb(t *testing.T) {
	t.Parallel()
	if _, one := twinOf([]string{"cage"}, registry); one == nil {
		t.Errorf("the registry holds no cage verb")
	}
	said, code := cageSays(t, `{"event":"tool.call","e":{"tool":"Write"}}`)
	if code != 0 {
		t.Errorf("a guarded write exits %d, want 0", code)
	}
	var deny map[string]any
	if err := json.Unmarshal([]byte(strings.TrimSpace(said)), &deny); err != nil {
		t.Fatalf("a guarded write prints %q, which reads as no JSON: %v", said, err)
	}
	if text, _ := deny["deny"].(string); !strings.Contains(text, "Write") || !strings.Contains(text, "./RUNME.sh serve") {
		t.Errorf("a guarded write prints %v, and wants a deny naming Write and ./RUNME.sh serve", deny)
	}
	if !strings.HasSuffix(said, "\n") || strings.Count(said, "\n") != 1 {
		t.Errorf("a guarded write prints %q, and wants one line", said)
	}
	said, code = cageSays(t, `{"event":"tool.call","e":{"tool":"Bash","command":"./RUNME.sh serve"}}`)
	if code != 0 || said != "" {
		t.Errorf("the serve prints %q and exits %d, and wants nothing and 0", said, code)
	}
}

// Takes one post. [[spec/tickets/copilot-hooks-run-in-go]]
func (c *copilotDoor) ask(post hooks.Post) (hooks.Answer, error) {
	c.posts = append(c.posts, post)
	if c.down {
		return hooks.Answer{}, errors.New("Unable to connect")
	}
	return hooks.Answer{Effects: c.effects}, nil
}
