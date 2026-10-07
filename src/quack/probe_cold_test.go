// The cold probe over fake doors: its reading of the log rows and the
// client's stream, and the runner over the clone, the install and the client.
// [[spec/design_output/level0#the-cold-probe]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"testing"

	"quackitect/src/pull"
)

const coldSentence = "level0 holds this session: 58 rules, 4 notes, the stop hook on."

func coldStarted() probeRow {
	return probeRowOf("info", "bridge", "no server answered, so the bridgehead starts one", map[string]any{"event": "session.start", "detail": "exit 0"})
}

func coldStands() probeRow {
	return probeRowOf("info", "bridge", "the server stands at http://127.0.0.1:6601", map[string]any{"root": "/tmp/tree"})
}

func coldContext(detail string) probeRow {
	return probeRowOf("info", "context", "3 block(s) reach the session", map[string]any{"detail": detail, "reason": "first"})
}

func coldHeard(said string) probeRow {
	level := "warn"
	if said == heardSame {
		level = "info"
	}
	return probeRowOf(level, "level0", said, map[string]any{"detail": coldSentence})
}

func coldAsked() probeRow {
	return probeRowOf("debug", "gate", "asked Bash for the canary", map[string]any{"tool": "Bash"})
}

func coldWhole() []probeRow {
	return []probeRow{coldStarted(), coldStands(), coldContext("level0-tools level0-canary"), coldHeard(heardSame)}
}

func streamLine(one map[string]any) string {
	line, _ := json.Marshal(one)
	return string(line)
}

func streamInit(tools ...string) string {
	return streamLine(map[string]any{"type": "system", "subtype": "init", "tools": tools})
}

func streamSaid(text string, parent any) string {
	return streamLine(map[string]any{"type": "assistant", "parent_tool_use_id": parent, "message": map[string]any{"content": []any{map[string]any{"type": "text", "text": text}}}})
}

func streamCalls(name string) string {
	return streamLine(map[string]any{"type": "assistant", "parent_tool_use_id": nil, "message": map[string]any{"content": []any{map[string]any{"type": "tool_use", "name": name, "input": map[string]any{}}}}})
}

func stream(lines ...string) string { return strings.Join(lines, "\n") + "\n" }

func coldClean() coldSteps {
	return stepsOf(stream(
		streamInit("Read", "Bash", "mcp__level0__find"),
		streamSaid(coldSentence+"\n\nI read the README, then the log.", nil),
		streamCalls("Read"),
		streamCalls("Bash"),
		streamSaid("Done.\nTOOLS: mcp__level0__find, mcp__level0__stop", nil),
		streamLine(map[string]any{"type": "result", "result": "Done."}),
	))
}

func verdictOf(t *testing.T, checks []coldCheck, name string) coldCheck {
	t.Helper()
	for _, one := range checks {
		if one.check == name {
			return one
		}
	}
	t.Fatalf("no %s check", name)
	return coldCheck{}
}

func TestAStreamReadsIntoTheSessionsOwnSteps(t *testing.T) {
	t.Parallel()
	steps := stepsOf(stream(
		streamInit("Read", "mcp__level0__find"),
		streamSaid("one", nil),
		streamSaid("a helper's own", "toolu_1"),
		streamCalls("Bash"),
		"{torn",
		streamSaid("two", nil),
		streamLine(map[string]any{"type": "result", "result": "two"}),
	))
	if !slices.Equal(steps.tools, []string{"Read", "mcp__level0__find"}) || !slices.Equal(steps.texts, []string{"one", "two"}) ||
		!slices.Equal(steps.called, []string{"Bash"}) || steps.result != "two" {
		t.Errorf("the steps read %+v", steps)
	}
}

func TestAWholeColdRoadPassesEveryCheck(t *testing.T) {
	t.Parallel()
	checks := readsCold(coldWhole(), coldClean())
	for i, one := range checks {
		if one.check != coldChecks[i] || !one.pass {
			t.Errorf("%s fails: %s", one.check, one.evidence)
		}
	}
}

func TestEveryColdCheckFailsOnItsOwnRoad(t *testing.T) {
	t.Parallel()
	refused := coldStarted()
	refused["event"], refused["level"] = "classic.SessionStart", "warn"
	fall := probeRow{"level": "warn", "kind": "bridge", "event": "env.get", "said": "the server answers nothing at http://127.0.0.1:6510/event"}
	cases := []struct {
		name, check string
		rows        []probeRow
		steps       coldSteps
		evidence    string
	}{
		{"no bridgehead row and no context row", "hook", []probeRow{coldStands()}, coldClean(), "no session.start row"},
		{"the bridgehead's rows alone", "server", []probeRow{coldStarted(), refused}, coldClean(), "bridgehead alone"},
		{"a context row naming no canary block", "rules", []probeRow{coldStarted(), coldStands(), coldContext("level0-tools"), coldHeard(heardSame)}, coldClean(), "level0-canary"},
		{"no context row", "rules", []probeRow{coldStarted(), coldStands()}, coldClean(), "no context row"},
		{"the pull alone", "tools", coldWhole(), stepsOf(stream(streamInit("Read", "mcp__level0__pull"), streamSaid(coldSentence+"\nTOOLS: mcp__level0__pull", nil))), "pull alone"},
		{"no level zero tool", "tools", coldWhole(), stepsOf(stream(streamInit("Read"), streamSaid(coldSentence+"\nTOOLS: none", nil))), "no level0 tool"},
		{"a first text opening on no canary", "canary", coldWhole(), stepsOf(stream(streamSaid("I read the README.", nil), streamSaid(coldSentence, nil))), "opens on none"},
		{"a canary with other counts", "canary", coldWhole(), stepsOf(stream(streamSaid("level0 holds this session: 1 rules, 1 notes, the stop hook on.", nil))), "opens on other"},
		{"a later text repeating the canary", "canary", coldWhole(), stepsOf(stream(streamSaid(coldSentence, nil), streamCalls("Read"), streamSaid(coldSentence+"\nDone.", nil))), "text 2 repeats"},
		{"a first text saying it twice", "canary", coldWhole(), stepsOf(stream(streamSaid(coldSentence+"\nAgain: "+coldSentence, nil))), "text 1 repeats"},
		{"a repeat row in the log", "canary", append(coldWhole(), coldHeard(heardAgain)), coldClean(), "second answer"},
		{"a gate asking after the payment", "canary", append(coldWhole(), coldAsked()), coldClean(), "asks again after the payment"},
		{"no level0 row", "canary", []probeRow{coldStarted(), coldStands(), coldContext("level0-tools level0-canary")}, coldClean(), "no level0 row"},
		{"a fall past the rules", "quiet", append(coldWhole(), fall), coldClean(), "1 row(s) say the server answers nothing"},
	}
	for _, one := range cases {
		got := verdictOf(t, readsCold(one.rows, one.steps), one.check)
		if got.pass || !strings.Contains(got.evidence, one.evidence) {
			t.Errorf("%s: %s reads %+v", one.name, one.check, got)
		}
	}
}

func TestEveryColdCheckPassesOnItsOwnRoad(t *testing.T) {
	t.Parallel()
	down := coldStarted()
	down["level"], down["said"] = "warn", "the bridge code fails its self-test"
	early := probeRow{"level": "warn", "kind": "bridge", "event": "classic.SessionStart", "said": "the server answers nothing at http://127.0.0.1:6510/event"}
	cases := []struct {
		name, check string
		rows        []probeRow
		steps       coldSteps
		evidence    string
	}{
		{"a bridgehead row saying the road stood down", "hook", []probeRow{down}, coldClean(), "self-test"},
		{"a tool the session calls", "tools", coldWhole(), stepsOf(stream(streamInit("Read"), streamSaid(coldSentence, nil), streamCalls("mcp__level0__stop"))), "mcp__level0__stop"},
		{"a gate asking before the payment", "canary", []probeRow{coldStarted(), coldStands(), coldContext("level0-tools level0-canary"), coldAsked(), coldHeard(heardSame)}, coldClean(), "once"},
		{"a fall before the rules", "quiet", append([]probeRow{early}, coldWhole()...), coldClean(), "no row says"},
	}
	for _, one := range cases {
		got := verdictOf(t, readsCold(one.rows, one.steps), one.check)
		if !got.pass || !strings.Contains(got.evidence, one.evidence) {
			t.Errorf("%s: %s reads %+v", one.name, one.check, got)
		}
	}
}

func TestEachColdCheckReadsAsOneLine(t *testing.T) {
	t.Parallel()
	got := coldLines([]coldCheck{{check: "hook", pass: true, evidence: "a row"}, {check: "server", evidence: "no row"}})
	if !slices.Equal(got, []string{"PASS hook: a row", "FAIL server: no row"}) {
		t.Errorf("the lines read %v", got)
	}
}

func TestTheColdPortStandsPastTheBase(t *testing.T) {
	t.Parallel()
	if coldPort(12345) <= portBase || coldPort(12345) != coldPort(12345) {
		t.Errorf("the cold port reads %d", coldPort(12345))
	}
}

// The runs the fake runner records, by their words. [[spec/design_output/level0#the-cold-probe]]
func ranWords(runner *fakeRunner) []string {
	out := make([]string, len(runner.ran))
	for i, one := range runner.ran {
		out[i] = strings.Join(one, " ")
	}
	return out
}

// The clone a cold run stood on, off the clone's own argv. [[spec/design_output/level0#the-cold-probe]]
func cloneOf(t *testing.T, runner *fakeRunner) string {
	t.Helper()
	for _, one := range runner.ran {
		if len(one) > 1 && one[0] == "git" && one[1] == "clone" {
			return one[len(one)-1]
		}
	}
	t.Fatal("no clone runs")
	return ""
}

func TestTheColdRunnerClonesInstallsRunsTheClientAndRemovesTheClone(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	d.pid = 12345
	clientAnswers(&d, func(_ []string, o runOpts) ranResult {
		writeLog(t, o.cwd, logText(coldWhole()...))
		return ranResult{stdout: stream(streamSaid(coldSentence+"\nTOOLS: mcp__level0__stop", nil), streamCalls("Read"))}
	})
	if code := probeVerb(d, []string{"cold"}); code != 0 {
		t.Fatalf("the cold probe answers %d\n%s", code, out)
	}
	var bases []string
	for _, one := range runner.ran {
		bases = append(bases, filepath.Base(one[0]))
	}
	if !slices.Equal(bases, []string{"git", "sh", "claude", "se-index"}) {
		t.Errorf("the runs read %v", ranWords(runner))
	}
	tree := cloneOf(t, runner)
	temp := filepath.Dir(tree)
	if o := runner.opts[1]; o.env["SE_INSTALL_SKIP"] != installSkip || o.cwd != tree || strings.Contains(" "+installSkip+" ", " index ") {
		t.Errorf("the install runs under %+v", o)
	}
	client, o := runner.ran[2], runner.opts[2]
	if !slices.Contains(client, "--plugin-dir") || client[slices.Index(client, "--plugin-dir")+1] != filepath.Join(tree, ".claude", "skills", "level0") {
		t.Errorf("the client runs as %v", client)
	}
	if o.env["CLAUDE_CODE_REMOTE"] != "true" || o.env["CLAUDE_CODE_ENABLE_FUNCTION_HOOKS"] != "1" ||
		o.env["CLAUDE_CONFIG_DIR"] != filepath.Join(temp, "config") || o.env["SE_BRIDGE_PORT"] != strconv.Itoa(coldPort(12345)) {
		t.Errorf("the client runs under %+v", o)
	}
	if stop := runner.ran[3]; !slices.Equal(stop, []string{filepath.Join(tree, ".se", ".runtime", "bin", "se-index"), "stop"}) {
		t.Errorf("the stop runs as %v", stop)
	}
	if _, err := os.Stat(temp); err == nil {
		t.Error("the clone still stands")
	}
	if !strings.Contains(out.String(), "The install answers 0.\nPASS hook: ") {
		t.Errorf("the probe prints\n%s", out)
	}
}

func TestAClientStandingNowhereFailsTheColdProbeAndTheCloneStillGoes(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult { return ranResult{code: 1, missing: true} })
	if code := probeVerb(d, []string{"cold"}); code != 1 || !strings.Contains(out.String(), "claude stands nowhere") {
		t.Errorf("a missing client answers %d\n%s", code, out)
	}
	if _, err := os.Stat(filepath.Dir(cloneOf(t, runner))); err == nil {
		t.Error("the clone still stands")
	}
}

// The client under a fresh config folder signs in off the desk's login alone. [[spec/tickets/the-probe-carries-the-login]]
func TestTheDesksLoginRidesIntoTheFreshConfigFolder(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	home := t.TempDir()
	env := map[string]string{"HOME": home}
	d.env = func(key string) string { return env[key] }
	config := t.TempDir()
	if carriesLogin(d, config) {
		t.Error("a desk keeping no login carries one")
	}
	_ = os.MkdirAll(filepath.Join(home, ".claude"), 0o755)
	_ = os.WriteFile(filepath.Join(home, ".claude", ".credentials.json"), []byte(`{"login":1}`), 0o600)
	_ = os.WriteFile(filepath.Join(home, ".claude", "settings.json"), []byte("{}"), 0o644)
	if !carriesLogin(d, config) {
		t.Fatal("the login carries no file")
	}
	if said, _ := readText(filepath.Join(config, ".credentials.json")); said != `{"login":1}` {
		t.Errorf("the login reads %q", said)
	}
	if stands(filepath.Join(config, "settings.json")) {
		t.Error("the desk's settings ride along")
	}
}

// The probe clones the commit standing, so a staged change reaches the clone as a patch, and the clone commits it. [[spec/tickets/the-check-takes-a-minute]]
func TestAStagedDeltaLandsInTheCloneBeforeTheInstall(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	runner.answers["claude"] = ranResult{code: 1}
	probeCold(d, "claude", func(string) {}, "diff --git a/x b/x")
	tree := cloneOf(t, runner)
	ran := ranWords(runner)
	applied := slices.Index(ran, "git apply --index "+filepath.Join(filepath.Dir(tree), "staged.patch"))
	installed := slices.IndexFunc(ran, func(one string) bool { return strings.HasPrefix(one, "sh ") })
	if applied <= 0 || applied > installed || runner.opts[applied].cwd != tree {
		t.Errorf("the runs read %v", ran)
	}
	committed := slices.IndexFunc(ran, func(one string) bool { return strings.Contains(one, " commit -q -m ") })
	if committed != applied+1 || runner.opts[committed].cwd != tree {
		t.Errorf("the commit runs at %d: %v", committed, ran)
	}
}

func TestADeltaTheCloneRefusesFailsTheProbe(t *testing.T) {
	t.Parallel()
	cases := []struct{ key, said string }{{"git apply", "patch does not apply"}, {"git -c", "nothing to commit"}}
	for _, one := range cases {
		d, runner, _, _ := fakeBoxDoors(t)
		runner.answers[one.key] = ranResult{code: 1, stderr: one.said}
		var lines []string
		code := probeCold(d, "claude", func(line string) { lines = append(lines, line) }, "x\n")
		if code != 1 || !strings.Contains(strings.Join(lines, "\n"), "FAIL delta: "+one.said) {
			t.Errorf("%s answers %d: %v", one.key, code, lines)
		}
		for _, ran := range runner.ran {
			if ran[0] == "sh" || ran[0] == "claude" {
				t.Errorf("%s still runs %v", one.key, ran)
			}
		}
	}
}

// The box both probes stand on. [[spec/tickets/level0-runs-on-the-door]]
func TestTheFreshBoxPointsTheHookAtAPortOfItsOwn(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	temp := t.TempDir()
	box := coldBox{temp: temp, tree: filepath.Join(temp, "tree"), port: 6900}
	if config := coldTree(d, func(string) {}, box); config != filepath.Join(temp, "config") || !stands(config) {
		t.Errorf("the config folder reads %q", config)
	}
	if ran := ranWords(runner); len(ran) != 2 || !strings.HasPrefix(ran[0], "git clone") || !strings.HasPrefix(ran[1], "sh ") {
		t.Errorf("the runs read %v", ran)
	}
	said, _ := readText(filepath.Join(box.tree, ".se", ".runtime", "vehicle.json"))
	var pointer struct{ Port int }
	if json.Unmarshal([]byte(said), &pointer) != nil || pointer.Port != 6900 {
		t.Errorf("the pointer reads %q", said)
	}
	refused, runs, _, _ := fakeBoxDoors(t)
	runs.answers["git"] = ranResult{code: 128, stderr: "no such repo"}
	var lines []string
	if config := coldTree(refused, func(line string) { lines = append(lines, line) }, box); config != "" || !slices.Contains(lines, "FAIL clone: no such repo") {
		t.Errorf("a refused clone stands %q: %v", config, lines)
	}
}

func TestATailKeepsTheLastLinesOnOne(t *testing.T) {
	t.Parallel()
	if got := tail("\n1\n2\n3\n4\n5\n6\n7\n"); got != "2 | 3 | 4 | 5 | 6 | 7" {
		t.Errorf("the tail reads %q", got)
	}
}

// A retro value reads true as JavaScript reads it: none, a nil dict, a zero and NaN read false. [[spec/tickets/shared-helpers-stand-once]]
func TestARetroValueReadsAsJavaScriptReadsIt(t *testing.T) {
	t.Parallel()
	if retroJSTruthy(retroJSNone{}) || retroJSTruthy((*retroJSDict)(nil)) || retroJSTruthy(0.0) || retroJSTruthy("") || !retroJSTruthy(&retroJSDict{}) || !retroJSTruthy("x") {
		t.Fatal("a retro value reads otherwise than JavaScript reads it")
	}
	if pull.JSQuote("a\"b\n") != `"a\"b\n"` {
		t.Fatalf("the quote reads %s", pull.JSQuote("a\"b\n"))
	}
}
