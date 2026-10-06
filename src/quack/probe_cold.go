// The cold probe. It clones the commit this tree stands on into a fresh
// folder, runs the install a cloud setup runs, runs the client headless once,
// and reads the log and the stream that run leaves for the start road whole.
// [[spec/design_output/level0#the-cold-probe]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"quackitect/src/modules/hooks/brief"
)

// The cold probe's numbers and names, each as probe-cold.js and the level0 lib name it. [[spec/design_output/level0#the-cold-probe]]
const (
	// The tools the index serves start here. [[spec/design_output/level0#the-cold-probe]]
	servedTools = "mcp__level0__"
	// The one tool the hook registers itself, beside the index's, as PULL_CALL in lib/pull.js names it. [[spec/tickets/level0-tools-leave-the-bridge]]
	pullCall = servedTools + "pull"
	// The port base the vehicle reads, as PORT_BASE in lib/vehicle.js names it, and the spread past it a cold server takes. [[spec/design_output/level0#the-cold-probe]]
	portBase   = 6510
	portPast   = 200
	portSpread = 200
	// The lines a tail keeps. [[spec/design_output/level0#the-cold-probe]]
	tailLines = 6
	// The file a desk's client keeps its login in, under the config folder the client reads. [[spec/design_output/level0#the-cold-probe]]
	loginFile    = ".credentials.json"
	configFolder = ".claude"
	// The pointer the clone's hook reads its port off, as POINTER in lib/vehicle.js names it. [[spec/design_output/level0#the-cold-probe]]
	vehiclePointer = runFolder + "/vehicle.json"
	// The index binary the start road launches, as BIN in lib/index.js names it. [[spec/design_output/level0#the-cold-probe]]
	indexBinary = binFolder + "/se-index"
	// The install steps a cold clone skips, as INSTALL_SKIP in .claude/skills/level0/hooks/start.ts names them. [[spec/design_output/level0#the-cold-probe]]
	installSkip = "editor-link editor-extensions editor-client go"
)

// The checks the cold probe reads, in order. [[spec/design_output/level0#the-cold-probe]]
var coldChecks = []string{"hook", "server", "rules", "tools", "canary", "quiet"}

// The prompt the cold client runs, as COLD.prompt in src/scripts/probe-cold.js says it. [[spec/design_output/level0#the-cold-probe]]
var coldPrompt = strings.Join([]string{
	"This session probes a fresh box. Make two tool calls, one after the other.",
	"First read README.md with the Read tool.",
	"Then run `git log -1 --oneline` through Bash, with a short description.",
	"Then answer in five lines at most.",
	"End the answer with one line starting `TOOLS:` that names every tool you hold",
	"whose name starts with mcp__level0__, or `TOOLS: none`.",
	"A refused call counts as made: name the refusal in the answer, and end the turn.",
	"Pull no ticket, call no verb and work nothing else, because this session probes and holds no work.",
}, " ")

// The author the clone commits the working change under, since a fresh runner names none. [[spec/tickets/the-check-takes-a-minute]]
var deltaAuthor = []string{"-c", "user.name=probe", "-c", "user.email=probe@example.invalid", "-c", "commit.gpgsign=false"}

var (
	servedName    = regexp.MustCompile(`mcp__level0__\w+`)
	answersNought = regexp.MustCompile(`answers nothing`)
	asksTheCanary = regexp.MustCompile(`canary`)
)

// The port the cold server stands on, past the base, so a server a desk runs keeps its own. [[spec/design_output/level0#the-cold-probe]]
func coldPort(pid int) int { return portBase + portPast + pid%portSpread }

// The stream the client writes under stream-json: the tools at init, the texts and calls of the session's own, and the result. [[spec/design_output/level0#the-cold-probe]]
type coldSteps struct {
	tools, texts, called []string
	result               string
}

// Reads the client's stream into its steps, a line no parser takes dropping alone. [[spec/design_output/level0#the-cold-probe]]
func stepsOf(stream string) coldSteps {
	var steps coldSteps
	for _, line := range strings.Split(stream, "\n") {
		var one probeRow
		if json.Unmarshal([]byte(line), &one) != nil || one == nil {
			continue
		}
		if one.text("type") == "system" && one.text("subtype") == "init" {
			tools, _ := one["tools"].([]any)
			for _, each := range tools {
				steps.tools = append(steps.tools, probeValueText(each))
			}
		}
		if one.text("type") == "result" {
			steps.result = one.text("result")
		}
		if one.text("type") != "assistant" || truthy(one["parent_tool_use_id"]) {
			continue
		}
		message, _ := one["message"].(map[string]any)
		parts, _ := message["content"].([]any)
		for _, each := range parts {
			part, _ := each.(map[string]any)
			switch probeRow(part).text("type") {
			case "text":
				steps.texts = append(steps.texts, probeRow(part).text("text"))
			case "tool_use":
				steps.called = append(steps.called, probeRow(part).text("name"))
			}
		}
	}
	return steps
}

// Whether a JSON value reads as true in JavaScript. [[spec/design_output/level0#the-cold-probe]]
func truthy(value any) bool {
	switch one := value.(type) {
	case nil:
		return false
	case bool:
		return one
	case string:
		return one != ""
	case float64:
		return one != 0
	}
	return true
}

// One check of the cold probe, whether it passes, and what shows it. [[spec/design_output/level0#the-cold-probe]]
type coldCheck struct {
	check    string
	pass     bool
	evidence string
}

// Reads the log rows and the stream for every check, in order. [[spec/design_output/level0#the-cold-probe]]
func readsCold(rows []probeRow, steps coldSteps) []coldCheck {
	reads := []func() (bool, string){
		func() (bool, string) { return hookRan(rows) },
		func() (bool, string) { return serverAnswered(rows) },
		func() (bool, string) { return rulesReached(rows) },
		func() (bool, string) { return toolsRegistered(steps) },
		func() (bool, string) { return canaryOnce(rows, steps) },
		func() (bool, string) { return quietOnce(rows) },
	}
	out := make([]coldCheck, len(reads))
	for i, read := range reads {
		pass, evidence := read()
		out[i] = coldCheck{check: coldChecks[i], pass: pass, evidence: evidence}
	}
	return out
}

// Whether the row is the bridgehead's own, which carries the event it answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func bridgeheadRow(row probeRow) bool {
	_, carries := row["event"]
	return row.text("kind") == "bridge" && carries
}

// A row as its kind and what it says. [[spec/design_output/level0#the-cold-probe]]
func shownRow(row probeRow) string { return row.text("kind") + " row, " + row.text("said") }

// A cold start falls at most once before its door stands, and no row says the server answers nothing once the rules reached the session. [[spec/tickets/level0-runs-on-the-door]]
func quietOnce(rows []probeRow) (bool, string) {
	ruled := -1
	for i, one := range rows {
		if one.text("kind") == "context" {
			ruled = i
			break
		}
	}
	if ruled < 0 {
		return false, "no context row"
	}
	var fell []probeRow
	for _, one := range rows[ruled+1:] {
		if answersNought.MatchString(one.text("said")) {
			fell = append(fell, one)
		}
	}
	if len(fell) == 0 {
		return true, "no row says the server answers nothing past the rules"
	}
	first := fell[0].text("kind")
	if fell[0].holds("event") {
		first = fell[0].text("event")
	}
	return false, fmt.Sprintf("%d row(s) say the server answers nothing after the rules reached the session, first on %s", len(fell), first)
}

// Whether the bridgehead ran: its session.start row or a context row. [[spec/design_output/level0#the-cold-probe]]
func hookRan(rows []probeRow) (bool, string) {
	for _, one := range rows {
		if (bridgeheadRow(one) && one.text("event") == "session.start") || one.text("kind") == "context" {
			return true, shownRow(one)
		}
	}
	return false, "no session.start row and no context row"
}

// The bridgehead's own rows carry the event they answer, so every other row is the server's. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func serverAnswered(rows []probeRow) (bool, string) {
	for _, one := range rows {
		if !bridgeheadRow(one) {
			return true, shownRow(one)
		}
	}
	return false, "the log holds rows the bridgehead alone writes"
}

// Whether a context row names the canary block. [[spec/design_output/level0#the-cold-probe]]
func rulesReached(rows []probeRow) (bool, string) {
	var reads []probeRow
	for _, one := range rows {
		if one.text("kind") == "context" {
			reads = append(reads, one)
		}
	}
	if len(reads) == 0 {
		return false, "no context row"
	}
	for _, one := range reads {
		for _, name := range strings.Fields(one.text("detail")) {
			if name == "level0-canary" {
				return true, "context row, " + one.text("detail")
			}
		}
	}
	return false, "no context row names level0-canary: " + reads[0].text("detail")
}

// The hook registers the pull itself, so a name past it proves the index's tools reached the client. [[spec/tickets/level0-tools-leave-the-bridge]]
func toolsRegistered(steps coldSteps) (bool, string) {
	named := map[string]bool{}
	for _, one := range append(append([]string{}, steps.tools...), steps.called...) {
		named[one] = true
	}
	for _, text := range steps.texts {
		for _, one := range servedName.FindAllString(text, -1) {
			named[one] = true
		}
	}
	var ours []string
	pullAlone := true
	for one := range named {
		if strings.HasPrefix(one, servedTools) {
			ours = append(ours, one)
			pullAlone = pullAlone && one == pullCall
		}
	}
	sort.Strings(ours)
	if len(ours) == 0 {
		return false, "no level0 tool in the init, a call or the answer"
	}
	if pullAlone {
		return false, "the pull alone: " + strings.Join(ours, ", ")
	}
	return true, strings.Join(ours, ", ")
}

// The canary opens the first text once, no row says it opens a second, and no gate asks for it after the payment. [[spec/design_output/level0#the-line-lands-once]]
func canaryOnce(rows []probeRow, steps coldSteps) (bool, string) {
	var judged probeRow
	for _, one := range rows {
		if one.text("kind") == "level0" {
			judged = one
			break
		}
	}
	if judged == nil {
		return false, "no level0 row names the sentence"
	}
	sentence := judged.text("detail")
	first := ""
	if len(steps.texts) > 0 {
		first = steps.texts[0]
	}
	if found := brief.CanaryIn(first, sentence); found != brief.Same {
		line, _, _ := strings.Cut(strings.TrimSpace(first), "\n")
		return false, "the first text opens on " + found + ": " + line
	}
	for at, text := range steps.texts {
		allowed := 0
		if at == 0 {
			allowed = 1
		}
		if strings.Count(text, sentence) > allowed {
			return false, fmt.Sprintf("text %d repeats the canary", at+1)
		}
	}
	paid := -1
	for at, one := range rows {
		if one.text("kind") != "level0" {
			continue
		}
		if one.text("said") == heardAgain {
			return false, "a level0 row says " + heardAgain
		}
		if paid < 0 && one.text("said") == heardSame {
			paid = at
		}
	}
	if paid >= 0 {
		for _, one := range rows[paid+1:] {
			if one.text("kind") == "gate" && asksTheCanary.MatchString(one.text("said")) {
				return false, "the gate asks again after the payment: " + one.text("said")
			}
		}
	}
	return true, "the first text opens on it, once: " + sentence
}

// Each check as one line, PASS or FAIL with its evidence. [[spec/design_output/level0#the-cold-probe]]
func coldLines(checks []coldCheck) []string {
	out := make([]string, len(checks))
	for i, one := range checks {
		word := "FAIL"
		if one.pass {
			word = "PASS"
		}
		out[i] = word + " " + one.check + ": " + one.evidence
	}
	return out
}

// The folders one cold run stands on: the temporary folder, the clone, its port, and the working change as a patch. [[spec/design_output/level0#the-cold-probe]]
type coldBox struct {
	temp, tree string
	port       int
	delta      string
}

// Clones the commit into a fresh folder, runs the client there, and removes the folder, stopping the index the run started. A delta is the staged change as a patch, so the clone runs the commit about to land. [[spec/design_output/level0#the-cold-probe]]
func probeCold(d boxDoors, client string, say func(string), delta string) int {
	temp, err := os.MkdirTemp("", "se-cold-")
	if err != nil {
		say("FAIL clone: " + err.Error())
		return exitFailed
	}
	box := coldBox{temp: temp, tree: filepath.Join(temp, "tree"), port: coldPort(d.pid), delta: delta}
	defer func() {
		stopsIndex(d, box.tree)
		_ = os.RemoveAll(temp)
	}()
	return coldRun(d, client, say, box)
}

// The fresh box both probes stand on: the clone of the commit, the staged delta, the install a cloud setup runs, and the pointer to a port of its own. It answers the config folder, or nothing where the clone or the delta falls. [[spec/design_output/level0#the-cold-probe]] [[spec/tickets/level0-runs-on-the-door]]
func coldTree(d boxDoors, say func(string), box coldBox) string {
	cloned := d.run([]string{"git", "clone", "--quiet", "--no-hardlinks", d.root, box.tree}, runOpts{timeout: probeWait})
	if cloned.code != 0 {
		say("FAIL clone: " + tail(orElse(cloned.stderr, cloned.fault)))
		return ""
	}
	if !takesDelta(d, box, say) {
		return ""
	}
	installed := d.run([]string{"sh", filepath.Join(box.tree, "src", "scripts", "install.sh")}, runOpts{
		cwd:     box.tree,
		env:     map[string]string{"SE_INSTALL_SKIP": installSkip},
		timeout: probeWait,
	})
	say(fmt.Sprintf("The install answers %d.", installed.code))
	if installed.code != 0 {
		say(tail(orElse(installed.stderr, installed.stdout)))
	}
	// A desk runs a server at the base port, so the clone's hook reads its own port off the pointer. [[spec/design_output/level0#the-cold-probe]]
	pointer := filepath.Join(box.tree, filepath.FromSlash(vehiclePointer))
	_ = os.MkdirAll(filepath.Dir(pointer), 0o755)
	_ = os.WriteFile(pointer, []byte(`{"method":`+jsonString(box.tree)+`,"port":`+strconv.Itoa(box.port)+"}\n"), 0o644)
	config := filepath.Join(box.temp, "config")
	_ = os.MkdirAll(config, 0o755)
	return config
}

// The first text, or the second where the first is empty, as || reads them. [[spec/design_output/level0#the-cold-probe]]
func orElse(first, second string) string {
	if first != "" {
		return first
	}
	return second
}

// Runs the client on the fresh box and reads every check off what it leaves. [[spec/design_output/level0#the-cold-probe]]
func coldRun(d boxDoors, client string, say func(string), box coldBox) int {
	config := coldTree(d, say, box)
	if config == "" {
		return exitFailed
	}
	carriesLogin(d, config)
	ran := d.run(clientArgv(client, filepath.Join(box.tree, filepath.FromSlash(pluginFolder))), runOpts{
		cwd: box.tree,
		env: map[string]string{
			"CLAUDE_CODE_REMOTE":                "true",
			"CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1",
			"CLAUDE_CONFIG_DIR":                 config,
			"SE_BRIDGE_PORT":                    strconv.Itoa(box.port),
		},
		timeout: probeWait,
	})
	if ran.missing {
		say("claude stands nowhere, so this box probes no cold start.")
		return exitFailed
	}
	if ran.fault != "" {
		say("The client stops: " + ran.fault + ".")
	}
	checks := readsCold(probeRows(filepath.Join(box.tree, filepath.FromSlash(sessionLog))), stepsOf(ran.stdout))
	for _, line := range coldLines(checks) {
		say(line)
	}
	if ran.code != 0 {
		say(fmt.Sprintf("The client answers %d: %s", ran.code, tail(ran.stderr)))
	}
	for _, one := range checks {
		if !one.pass {
			return exitFailed
		}
	}
	return 0
}

// The desk's login rides into the fresh config folder, so the client signs in and reads nothing else of the desk. The folder goes with the probe. [[spec/design_output/level0#the-cold-probe]]
func carriesLogin(d boxDoors, config string) bool {
	home := orElse(d.env("USERPROFILE"), d.env("HOME"))
	if home == "" {
		return false
	}
	login, ok := readText(filepath.Join(home, configFolder, loginFile))
	if !ok {
		return false
	}
	return os.WriteFile(filepath.Join(config, loginFile), []byte(login), 0o600) == nil
}

// Applies the staged change in the clone and commits it, as a box commits its work before it hands over, so the clear meets no work standing on this box alone. [[spec/tickets/the-check-takes-a-minute]]
func takesDelta(d boxDoors, box coldBox, say func(string)) bool {
	if box.delta == "" {
		return true
	}
	patch := filepath.Join(box.temp, "staged.patch")
	text := box.delta
	if !strings.HasSuffix(text, "\n") {
		text += "\n"
	}
	if err := os.WriteFile(patch, []byte(text), 0o644); err != nil {
		say("FAIL delta: " + err.Error())
		return false
	}
	applied := d.run([]string{"git", "apply", "--index", patch}, runOpts{cwd: box.tree, timeout: probeWait})
	if applied.code != 0 {
		say("FAIL delta: " + tail(orElse(applied.stderr, applied.stdout)))
		return false
	}
	argv := append(append([]string{"git"}, deltaAuthor...), "commit", "-q", "-m", "the working change")
	committed := d.run(argv, runOpts{cwd: box.tree, timeout: probeWait})
	if committed.code == 0 {
		return true
	}
	say("FAIL delta: " + tail(orElse(committed.stderr, committed.stdout)))
	return false
}

// The client's argv for the cold run, its stream as JSON lines. [[spec/design_output/level0#the-cold-probe]]
func clientArgv(client, plugin string) []string {
	return []string{client, "-p", coldPrompt, "--plugin-dir", plugin, "--output-format", "stream-json", "--verbose", "--permission-mode", "auto"}
}

// The index the start road launched stands over the clone, so the probe stops it with the index's own stop. [[spec/design_output/level0#the-cold-probe]]
func stopsIndex(d boxDoors, tree string) {
	d.run([]string{filepath.Join(tree, filepath.FromSlash(indexBinary)), "stop"}, runOpts{cwd: tree, timeout: probeWait})
}

// The last lines of a text, joined on one line. [[spec/design_output/level0#the-cold-probe]]
func tail(text string) string {
	lines := strings.Split(strings.TrimSpace(text), "\n")
	if len(lines) > tailLines {
		lines = lines[len(lines)-tailLines:]
	}
	return strings.Join(lines, " | ")
}
