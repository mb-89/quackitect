// The check verb: the tests, level zero, the Go tests, the doors, the
// projections, the plugin, the server and the rules over the tree, all at
// once and each timed, and the stamp a door reads before a push.
// [[spec/design_output/work#the-battery-answers-first]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"sync"
	"time"
)

// The runtime folder .claude/skills/level0/lib/folders.js owns, spelled again here because Go imports no JavaScript. [[spec/design_input/the-runtime-files-stand-apart]]
const runtimeDir = ".se/.runtime"

// The runtime files the check reads and writes, which runs.js and vehicle.js name. [[spec/design_output/work#the-battery-answers-first]]
const (
	timesFile   = runtimeDir + "/tests.jsonl"
	spawnsFile  = runtimeDir + "/spawns.txt"
	stampFile   = runtimeDir + "/check.json"
	lintFile    = runtimeDir + "/lint-found.json"
	pointerFile = runtimeDir + "/vehicle.json"
	reporter    = "src/scripts/battery-reporter.js"
	pluginDir   = ".claude/skills/level0"
	installer   = "src/scripts/install.sh"
)

// The flags and variables the parts read: the quiet run, the working change the dry session clones, the tally the process door writes, the list the lint leaves, and Go with no C compiler. [[spec/tickets/the-verbs-need-no-wrapper]] [[spec/tickets/level0-runs-on-the-door]]
const (
	errorsFlag  = "--errors"
	workingFlag = "--working"
	spawnsEnv   = "SE_SPAWNS"
	lintEnv     = "SE_LINT_FOUND"
	noCgo       = "CGO_ENABLED=0"
	contractTag = "contract"
)

// The keys the check reads: its budget and the runs a stamp keeps. [[spec/tickets/the-check-runs-fast-again]] [[spec/guidance/retro/effect]]
const (
	budgetKey = "battery.budget"
	runsKey   = "battery.runs"
)

const noErrors = "The check names no red case and no finding at error."

// The line a red part prints, while the parts beside it run on. [[spec/tickets/the-parts-start-at-once]]
const redPart = "%s answers red, and the parts beside it ran on.\n"

var (
	goTestFunc = regexp.MustCompile(`(?m)^func (Test\w+)\(`)
	goFailRow  = regexp.MustCompile(`^\s*--- FAIL`)
)

// One part of the battery: its name and its run. [[spec/design_output/work#the-battery-answers-first]]
type part struct {
	name string
	run  func() int
}

// What the check reaches: the root, a verb through quack's own road and the same at low priority, a process and the same at low priority, the health call, the clock, the platform, the red list, the config, git, the session log and the streams. [[spec/design_output/work#the-battery-answers-first]]
type checkDoors struct {
	root      string
	self      string
	verb      func(words []string, quiet bool) int
	calmVerb  func(words []string, quiet bool) int
	run       func(argv, env []string, quiet bool) (int, string, error)
	calm      func(argv, env []string, quiet bool) (int, string, error)
	get       func(url string) ([]byte, error)
	now       func() time.Time
	windows   bool
	red       []string
	config    func(key string) float64
	git       func(args ...string) string
	log       func(row map[string]any) error
	out, errs io.Writer
}

// One run of the test part. A unit test touches memory alone, so every unit file shares one process. A contract test drives a real door, so each keeps a process of its own. [[spec/tickets/the-tests-start-fewer-processes]]
type testPart struct {
	glob, times string
	shared      bool
}

var testParts = []testPart{
	{glob: "test/level0/*.test.js", times: runtimeDir + "/tests-unit.jsonl", shared: true},
	{glob: "test/contract/*.test.js", times: runtimeDir + "/tests-contract.jsonl", shared: false},
}

// What the lint leaves where SE_LINT_FOUND points: the findings standing at warning, and a line a finding at error. [[spec/design_output/work#the-battery-answers-first]]
type lintFound struct {
	Stood []finding `json:"stood"`
	Erred []string  `json:"erred"`
}

func init() { register("check", checkVerb(checkDoorsOf)) }

// A verb through quack's road, under the variable naming the lint's file. A quiet red run hands its output to the error stream, so --errors names why the part failed. [[spec/tickets/check-errors-names-the-part]]
func verbOver(run func(argv, env []string, quiet bool) (int, string, error), road, env []string, errs io.Writer) func(words []string, quiet bool) int {
	return func(words []string, quiet bool) int {
		code, said, err := run(append(slices.Clone(road), words...), env, quiet)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if quiet && code != 0 {
			fmt.Fprint(errs, said)
		}
		return code
	}
}

// The check over the doors: the parts in order, each timed, then the red cases and findings at error under --errors, or the parts' table, then the stamp. [[spec/design_output/work#the-battery-answers-first]] [[spec/tickets/the-verbs-need-no-wrapper]]
func checkVerb(doorsOf func(out, errs io.Writer) checkDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := doorsOf(out, errs)
		words := argv[1:]
		quiet := slices.Contains(words, errorsFlag)
		// Under --errors the stream carries the red rows alone, which the merge hands on. [[spec/tickets/check-errors-names-the-part]]
		if quiet {
			d.out = io.Discard
		}
		_ = os.Remove(d.at(lintFile))
		code, times, red, total := batteryRun(readyOf(d, quiet), partsOf(d, words, quiet), d.now)
		for _, name := range red {
			fmt.Fprintf(d.errs, redPart, name)
		}
		lines := d.text(timesFile)
		var found lintFound
		_ = json.Unmarshal([]byte(d.text(lintFile)), &found)
		var spawns *spawnTally
		if tally, err := os.ReadFile(d.at(spawnsFile)); err == nil {
			one := spawnsIn(string(tally))
			spawns = &one
		}
		report := batteryOf(times, lines, slowestKept, nil, spawns, total)
		if quiet {
			for _, row := range errorsSaid(lines, found.Erred) {
				fmt.Fprintln(out, row)
			}
		} else {
			saysParts(d, report)
		}
		if err := writesStamp(d, code, found.Stood, &report); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		return code
	}
}

// The parts print last, so a slow part shows on the run that grew it, and a run past its budget leaves a warning in the log. [[spec/tickets/the-check-runs-fast-again]]
func saysParts(d checkDoors, report batteryReport) {
	budget := int64(d.config(budgetKey))
	for _, row := range partsSaid(report, budget) {
		fmt.Fprintln(d.out, row)
	}
	if budget <= 0 || report.Total <= budget {
		return
	}
	named := []string{}
	for _, one := range report.Slowest {
		named = append(named, one.File+" "+one.Name)
	}
	row := map[string]any{"level": "warn", "kind": "check", "said": fmt.Sprintf("the check took %dms, past its budget", report.Total), "ms": report.Total, "detail": strings.Join(named, ", ")}
	if err := d.log(row); err != nil {
		fmt.Fprintln(d.errs, err)
	}
}

// The stamp the check leaves, which a door reads before a push. [[spec/design_output/work#the-battery-answers-first]]
func writesStamp(d checkDoors, code int, stood []finding, report *batteryReport) error {
	at := d.at(stampFile)
	before, _ := os.ReadFile(at)
	said := stampFor(code, d.git("rev-parse", "HEAD"), d.git("status", "--porcelain") == "", d.now().UTC().Format(logStamp), stood, report, before, int(d.config(runsKey)))
	text, err := json.MarshalIndent(said, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	return os.WriteFile(at, append(text, '\n'), 0o644)
}

// A path under the root, and the text a file there holds, or nothing. [[spec/design_output/work#the-battery-answers-first]]
func (d checkDoors) at(rel string) string { return filepath.Join(d.root, filepath.FromSlash(rel)) }

func (d checkDoors) text(rel string) string {
	said, _ := os.ReadFile(d.at(rel))
	return string(said)
}

// The battery: the ready step alone, then every part at once. The run reads every part's start, then starts every part and waits for all of them, each timed under its name, the ready step among them. It answers the first red code, the ready step's first and then in part order, and the red names, so a red part names itself while every part beside it still reports. Every part reads the ready step's output, the built binaries and the index door standing on them, so every part waits on it. No part reads another part's output, so no part waits on another, and the total is the ready step's span and the slowest part's. [[spec/tickets/index-cases-wait-for-it]] [[spec/tickets/the-parts-start-at-once]] [[spec/guidance/retro/effect]]
func batteryRun(ready part, parts []part, now func() time.Time) (int, map[string]float64, []string, float64) {
	from := now()
	readyCode := ready.run()
	readyTook := float64(now().Sub(from).Milliseconds())
	starts := make([]time.Time, len(parts))
	for at := range parts {
		starts[at] = now()
	}
	codes := make([]int, len(parts))
	took := make([]float64, len(parts))
	var all sync.WaitGroup
	for at, one := range parts {
		all.Add(1)
		go func() {
			defer all.Done()
			codes[at] = one.run()
			took[at] = float64(now().Sub(starts[at]).Milliseconds())
		}()
	}
	all.Wait()
	code := readyCode
	times := map[string]float64{ready.name: readyTook}
	red := []string{}
	if readyCode != 0 {
		red = append(red, ready.name)
	}
	for at, one := range parts {
		times[one.name] = took[at]
		if codes[at] == 0 {
			continue
		}
		red = append(red, one.name)
		if code == 0 {
			code = codes[at]
		}
	}
	return code, times, red, float64(now().Sub(from).Milliseconds())
}

// The step every part waits on: the install, which builds a stale binary and swaps it in, then one ask of the index, which stands a door on the build the disk holds. A part reading the index mid-swap or mid-restart reads a door going down, which halts its tools and fails its operations, so the parts start once both stand. [[spec/tickets/index-cases-wait-for-it]]
func readyOf(d checkDoors, quiet bool) part {
	return part{name: "ready", run: func() int {
		code, said, err := d.run([]string{"sh", installer}, nil, quiet)
		if err != nil || code != 0 {
			fmt.Fprintln(d.errs, strings.TrimSpace(said))
			fmt.Fprintf(d.errs, "The install answers %d, so the parts read the binaries as they stand. %v\n", code, err)
		}
		code, said, err = d.run([]string{d.self, "standing"}, nil, true)
		if err != nil || code != 0 {
			fmt.Fprintln(d.errs, strings.TrimSpace(said))
			fmt.Fprintln(d.errs, "The index stands no door here, so every part reading it reads nothing.")
			return max(code, 1)
		}
		return 0
	}}
}

// The battery's parts, which all start at once once the ready step ends. A part another verb owns runs that verb through quack's own road. [[spec/design_output/work#the-battery-answers-first]] [[spec/tickets/level0-runs-on-the-door]] [[spec/tickets/the-check-takes-a-minute]]
func partsOf(d checkDoors, words []string, quiet bool) []part {
	where := []string{}
	for _, one := range words {
		if !strings.HasPrefix(one, "-") {
			where = append(where, one)
		}
	}
	if len(where) == 0 {
		where = []string{"."}
	}
	return []part{
		{name: "tests", run: func() int { return testsRun(d, quiet) }},
		{name: "level0", run: func() int { return level0Runs(d, quiet) }},
		{name: "go", run: func() int { return goGate(d, quiet, goSkipOf(d.red, d.text)) }},
		{name: "doors", run: func() int { return d.verb([]string{"doors"}, quiet) }},
		{name: "projections", run: func() int { return d.verb([]string{"project", "--check"}, quiet) }},
		{name: "plugin", run: func() int { return pluginHolds(d) }},
		{name: "server", run: func() int { return serverHolds(d) }},
		{name: "rules", run: func() int { return d.verb(append([]string{"lint"}, where...), quiet) }},
	}
}

// Level zero runs on a fresh box, or the check is red. The dry session times nothing against the wall, so it runs at low priority and yields the cores to the parts that do. [[spec/tickets/the-parts-start-at-once]] The start road stands a cloud box alone, and a cloud box runs Linux, so a Windows desk says so and carries on. [[spec/tickets/level0-runs-on-the-door]]
func level0Runs(d checkDoors, quiet bool) int {
	if d.windows {
		fmt.Fprintln(d.out, "The start road stands a cloud box alone, so this Windows box runs no dry session.")
		return 0
	}
	code := d.calmVerb([]string{"probe", "dry", workingFlag}, quiet)
	if code != 0 {
		fmt.Fprintln(d.errs, "Level zero does not run whole on a fresh box, so this tree is red.")
	}
	return code
}

// The plugin the engine reads validates, and a box with no claude says so and carries on. [[spec/design_output/copilot#setup-and-discovery]]
func pluginHolds(d checkDoors) int {
	code, said, err := d.run([]string{"claude", "plugin", "validate", filepath.FromSlash(pluginDir)}, nil, true)
	if err != nil {
		fmt.Fprintln(d.out, "claude stands nowhere, so the plugin goes unvalidated here.")
		return 0
	}
	if code == 0 {
		return 0
	}
	fmt.Fprintln(d.errs, strings.TrimSpace(said))
	fmt.Fprintln(d.errs, "The engine reads this module's source, and it refuses the above.")
	return 1
}

// What the health call found, and whether the check carries on past it. [[spec/design_output/level0#the-check-reads-the-server]]
func serverHolds(d checkDoors) int {
	where := fmt.Sprintf("http://127.0.0.1:%d/health", portOf(d.text(pointerFile)))
	var said struct {
		Ok   bool   `json:"ok"`
		Dead string `json:"dead"`
	}
	body, err := d.get(where)
	if err == nil {
		err = json.Unmarshal(body, &said)
	}
	why := said.Dead
	if err != nil {
		why = err.Error()
	}
	code, line, red := serverRead(err == nil, said.Ok, where, why)
	if red {
		fmt.Fprintln(d.errs, line)
	} else {
		fmt.Fprintln(d.out, line)
	}
	return code
}

// The port the vehicle pointer names, or the base where it names none. [[spec/design_output/level0#the-check-reads-the-server]]
func portOf(pointer string) int {
	var said struct {
		Port int `json:"port"`
	}
	if json.Unmarshal([]byte(pointer), &said) != nil || said.Port <= 0 {
		return portBase
	}
	return said.Port
}

// A box running no server reads every rule, and a server standing and failing its health call is red. [[spec/design_output/level0#the-check-reads-the-server]]
func serverRead(answers, ok bool, where, why string) (int, string, bool) {
	if ok {
		return 0, fmt.Sprintf("The server stands at %s.", where), false
	}
	if answers {
		return 1, fmt.Sprintf("The server at %s fails its health call: %s", where, why), true
	}
	return 0, fmt.Sprintf("No server answers at %s, so the rules run without one. Start it with ./RUNME.sh serve, or the hook button in the sidebar.", where), false
}

// The test functions the named Go test files declare, each once, sorted. [[spec/design_output/pull#the-test-verb]]
func goTestNames(paths []string, read func(string) string) []string {
	names := []string{}
	for _, path := range paths {
		if !strings.HasSuffix(path, "_test.go") {
			continue
		}
		for _, found := range goTestFunc.FindAllStringSubmatch(read(path), -1) {
			names = append(names, found[1])
		}
	}
	slices.Sort(names)
	return slices.Compact(names)
}

// A red Go test file stands apart until its tests-green closes, as a red JavaScript one does, so the Go run skips the tests it names. A ticket names its red files in one comma-separated line. [[spec/design_output/pull#the-gate]]
func goSkipOf(red []string, read func(string) string) []string {
	paths := []string{}
	for _, one := range red {
		for _, path := range strings.Split(one, ",") {
			paths = append(paths, strings.TrimSpace(path))
		}
	}
	names := goTestNames(paths, read)
	if len(names) == 0 {
		return nil
	}
	return []string{"-skip", "^(" + strings.Join(names, "|") + ")$"}
}

// The Go gate: the tests under the contract tag, then the formatter over src. Under --errors each failing Go test reaches the error stream alone. [[spec/tickets/go-checks-need-go]] [[spec/tickets/go-code-shares-one-module]]
func goGate(d checkDoors, quiet bool, skip []string) int {
	argv := append(append([]string{"go", "test", "-tags", contractTag}, skip...), "./...")
	code, said, err := d.run(argv, []string{noCgo}, quiet)
	if err != nil {
		fmt.Fprintln(d.out, "go stands nowhere, so the check refuses: run ./RUNME.sh tools, or install Go.")
		return 1
	}
	if code != 0 {
		if quiet {
			for _, row := range strings.Split(said, "\n") {
				if goFailRow.MatchString(row) {
					fmt.Fprintln(d.errs, strings.TrimSpace(row))
				}
			}
		}
		return code
	}
	_, listed, _ := d.run([]string{"gofmt", "-l", "src"}, nil, true)
	faults := 0
	for _, name := range strings.Split(listed, "\n") {
		if name = strings.TrimSpace(name); name != "" {
			fmt.Fprintf(d.out, "%s: Gofmt: the file reads another way than the formatter writes it.\n", name)
			faults++
		}
	}
	return min(faults, 1)
}

// The test part: the unit run, then the contract run, the red list apart, each run's cases written for the battery's report. The runs go one after the other, because a contract case reads a clock a loaded box slows. [[spec/tickets/the-tests-start-fewer-processes]] [[spec/design_output/pull#the-gate]]
func testsRun(d checkDoors, quiet bool) int {
	if len(d.red) > 0 {
		fmt.Fprintf(d.out, "The red list stands apart until its tests-green closes: %s\n", strings.Join(d.red, ", "))
	}
	tally, err := freshTally(d)
	if err != nil {
		fmt.Fprintln(d.errs, err)
		return exitFailed
	}
	code := 0
	lines := []string{}
	for _, one := range testParts {
		_ = os.Remove(d.at(one.times))
		ran, _, err := d.run(append([]string{"node"}, testArgv(d.root, d.red, one)...), []string{spawnsEnv + "=" + tally}, quiet)
		if err != nil {
			fmt.Fprintln(d.errs, startFault("node", err))
			ran = exitFailed
		}
		if code == 0 {
			code = ran
		}
		if said, err := os.ReadFile(d.at(one.times)); err == nil {
			lines = append(lines, string(said))
		}
	}
	if err := os.WriteFile(d.at(timesFile), []byte(strings.Join(lines, "\n")), 0o644); err != nil {
		fmt.Fprintln(d.errs, err)
		return exitFailed
	}
	return code
}

// An empty tally the process door writes into while the tests run. [[spec/design_output/work#the-battery-answers-first]]
func freshTally(d checkDoors) (string, error) {
	at := d.at(spawnsFile)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		return "", err
	}
	return at, os.WriteFile(at, nil, 0o644)
}

// The runner's flags for one part: the spec report to the screen, the battery's reporter to the part's file, and every test file the glob reaches less the red list. A reporter loads as a module, and a drive letter reads as a URL scheme, so the path goes as a file URL. [[spec/design_output/work#the-battery-answers-first]] [[spec/design_output/pull#the-gate]]
func testArgv(root string, red []string, one testPart) []string {
	argv := []string{"--test"}
	if one.shared {
		argv = append(argv, "--experimental-test-isolation=none")
	}
	argv = append(argv,
		"--test-reporter=spec",
		"--test-reporter-destination=stdout",
		"--test-reporter="+fileURL(filepath.Join(root, filepath.FromSlash(reporter))),
		"--test-reporter-destination="+filepath.Join(root, filepath.FromSlash(one.times)))
	if len(red) == 0 {
		return append(argv, one.glob)
	}
	folder, end := one.glob[:strings.LastIndex(one.glob, "/")], one.glob[strings.LastIndex(one.glob, "*")+1:]
	listed, _ := os.ReadDir(filepath.Join(root, filepath.FromSlash(folder)))
	files := []string{}
	for _, entry := range listed {
		path := folder + "/" + entry.Name()
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), end) && !slices.Contains(red, path) {
			files = append(files, path)
		}
	}
	slices.Sort(files)
	return append(argv, files...)
}

// What check --errors prints: a row a red case the reporter wrote, then a row a finding at error. [[spec/tickets/the-verbs-need-no-wrapper]]
func errorsSaid(lines string, erred []string) []string {
	rows := []string{}
	for _, one := range redIn(lines) {
		kept := []string{}
		for _, word := range []string{one.File, one.Name, one.Said} {
			if word != "" {
				kept = append(kept, word)
			}
		}
		rows = append(rows, strings.Join(kept, ": "))
	}
	rows = append(rows, erred...)
	if len(rows) == 0 {
		return []string{noErrors}
	}
	return rows
}
