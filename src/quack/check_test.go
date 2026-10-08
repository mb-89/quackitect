// The check verb in Go: its parts, each one's road, the server read, the Go
// gate, the test runner's files and the rows under --errors. The battery's
// run stands in check_battery_test.go.
// [[spec/design_output/work#the-battery-answers-first]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"reflect"
	"regexp"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"
)

// A clock moving a step at each read. [[spec/guidance/code/testing]]
func ticking(step time.Duration) func() time.Time {
	at := time.Date(2026, 9, 20, 10, 0, 0, 0, time.UTC)
	var held sync.Mutex
	return func() time.Time {
		held.Lock()
		defer held.Unlock()
		at = at.Add(step)
		return at
	}
}

// Doors over fakes, recording each verb and each process the parts reach. The parts run together, so a lock holds the records. [[spec/guidance/code/testing]]
type checkFake struct {
	held  sync.Mutex
	verbs [][]string
	runs  [][]string
	envs  [][]string
	rows  []map[string]any
	codes map[string]int
	said  map[string]string
	gone  map[string]bool
}

func (one *checkFake) doors() checkDoors {
	d := checkDoors{
		root:     "/tree",
		disk:     newFakeDisk(),
		platform: "linux",
		verb: func(words []string, _ bool) int {
			one.held.Lock()
			defer one.held.Unlock()
			one.verbs = append(one.verbs, words)
			return one.codes[strings.Join(words, " ")]
		},
		run: func(argv, env []string, _ bool) (int, string, error) {
			one.held.Lock()
			defer one.held.Unlock()
			one.runs = append(one.runs, argv)
			one.envs = append(one.envs, env)
			if one.gone[argv[0]] {
				return 0, "", errors.New("not found")
			}
			return one.codes[argv[0]], one.said[argv[0]], nil
		},
		get:     func(string) ([]byte, error) { return []byte(`{"ok":true}`), nil },
		indexUp: func() bool { return true },
		now:     ticking(time.Millisecond),
		config:  func(string) float64 { return 0 },
		git:     func(...string) string { return "" },
		log: func(row map[string]any) error {
			one.held.Lock()
			defer one.held.Unlock()
			one.rows = append(one.rows, row)
			return nil
		},
		out:  io.Discard,
		errs: io.Discard,
	}
	return d
}

func partNamed(parts []part, name string) part {
	for _, one := range parts {
		if one.name == name {
			return one
		}
	}
	return part{name: name, run: func() int { return -1 }}
}

func TestCheckParts(t *testing.T) {
	t.Parallel()
	t.Run("the battery holds its parts in order", func(t *testing.T) {
		fake := &checkFake{}
		parts := partsOf(fake.doors(), nil, false)
		names := []string{}
		for _, one := range parts {
			names = append(names, one.name)
		}
		want := []string{"changed", "tests", "level0", "go", "doors", "guards", "projections", "plugin", "types", "plugin-tests", "server", "rules", "lines", "javascript"}
		if !reflect.DeepEqual(names, want) {
			t.Fatalf("the parts read %v, and want %v", names, want)
		}
	})
	t.Run("a part another verb owns runs that verb through the road", func(t *testing.T) {
		fake := &checkFake{}
		parts := partsOf(fake.doors(), []string{"--errors", "src/quack"}, true)
		for _, name := range []string{"level0", "doors", "projections", "rules"} {
			partNamed(parts, name).run()
		}
		want := [][]string{{"probe", "smoke", "--working"}, {"doors"}, {"project", "--check"}, {"lint", "src/quack"}}
		if !reflect.DeepEqual(fake.verbs, want) {
			t.Fatalf("the verbs read %v, and want %v", fake.verbs, want)
		}
	})
	// A warning in a file the branch changes turns the check red, before the tests run. [[spec/tickets/rules-lint-changed-files-first]]
	t.Run("the changed part runs the strict lint over the changed files, and the rules read the root where the words name no path", func(t *testing.T) {
		for name, want := range map[string][]string{"changed": {"lint", "--changed", "--strict"}, "rules": {"lint", "."}} {
			fake := &checkFake{}
			partNamed(partsOf(fake.doors(), nil, false), name).run()
			if !reflect.DeepEqual(fake.verbs, [][]string{want}) {
				t.Fatalf("the %s part ran %v", name, fake.verbs)
			}
		}
	})
	// [[spec/tickets/level0-smoke-runs-in-seconds]]
	t.Run("level zero runs the smoke on the working tree, on Windows as on Linux", func(t *testing.T) {
		for _, platform := range []string{"linux", "windows"} {
			fake := &checkFake{}
			doors := fake.doors()
			doors.platform = platform
			if code := partNamed(partsOf(doors, nil, false), "level0").run(); code != 0 || !reflect.DeepEqual(fake.verbs, [][]string{{"probe", "smoke", "--working"}}) {
				t.Fatalf("on %s the level0 part answers %d and runs %v", platform, code, fake.verbs)
			}
		}
	})
	// [[spec/tickets/level0-tests-to-plugin-test]]
	t.Run("the plugin part validates the plugin strictly, the plugin-tests part runs the kit over it, and each passes where claude stands nowhere", func(t *testing.T) {
		plugin := filepath.Join(".claude", "skills", "level0")
		for name, want := range map[string][]string{"plugin": {"claude", "plugin", "validate", "--strict", plugin}, "plugin-tests": {"claude", "plugin", "test", plugin}} {
			fake := &checkFake{codes: map[string]int{"claude": 1}}
			if code := partNamed(partsOf(fake.doors(), nil, false), name).run(); code != 1 || !reflect.DeepEqual(fake.runs, [][]string{want}) {
				t.Fatalf("a refused %s part answers %d, and ran %v", name, code, fake.runs)
			}
			gone := &checkFake{gone: map[string]bool{"claude": true}}
			if code := partNamed(partsOf(gone.doors(), nil, false), name).run(); code != 0 {
				t.Fatalf("no claude answers %d", code)
			}
		}
	})
	t.Run("the types part lays the engine's types, then runs tsc over the plugin", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"claude": 1, "tsc": 0}}
		if code := partNamed(partsOf(fake.doors(), nil, false), "types").run(); code != 0 {
			t.Fatalf("a plugin whose types hold answers %d", code)
		}
		plugin := filepath.Join(".claude", "skills", "level0")
		want := [][]string{{"claude", "--plugin-dir", plugin, "-p", ""}, {"tsc", "-p", plugin}}
		if !reflect.DeepEqual(fake.runs, want) {
			t.Fatalf("the types part ran %v, and want %v", fake.runs, want)
		}
	})
	t.Run("the types part fails where tsc refuses the hooks", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"tsc": 2}, said: map[string]string{"tsc": "hooks/level0.ts(1,1): error TS2322"}}
		doors := fake.doors()
		var said strings.Builder
		doors.errs = &said
		if code := partNamed(partsOf(doors, nil, false), "types").run(); code != 1 || !strings.Contains(said.String(), "TS2322") {
			t.Fatalf("a refused type answers %d, and says %q", code, said.String())
		}
	})
	t.Run("the types part passes where claude or tsc stands nowhere", func(t *testing.T) {
		for _, gone := range []string{"claude", "tsc"} {
			fake := &checkFake{codes: map[string]int{"tsc": 2}, gone: map[string]bool{gone: true}}
			if code := partNamed(partsOf(fake.doors(), nil, false), "types").run(); code != 0 {
				t.Fatalf("no %s answers %d", gone, code)
			}
		}
	})
	t.Run("the server part reads the health call", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.get = func(string) ([]byte, error) { return []byte(`{"ok":false,"dead":"the bus"}`), nil }
		if code := partNamed(partsOf(doors, nil, false), "server").run(); code != 1 {
			t.Fatalf("a server failing its health call answers %d", code)
		}
		doors.get = func(string) ([]byte, error) { return nil, errors.New("refused") }
		if code := partNamed(partsOf(doors, nil, false), "server").run(); code != 0 {
			t.Fatalf("no server answers %d", code)
		}
	})
}

func TestServerRead(t *testing.T) {
	t.Parallel()
	if code, line, red := serverRead(true, true, "http://127.0.0.1:6510/health", ""); code != 0 || red || !strings.Contains(line, "stands at") {
		t.Fatalf("a server answering well reads %d, %q, %v", code, line, red)
	}
	if code, line, red := serverRead(true, false, "http://127.0.0.1:6510/health", "the bus"); code != 1 || !red || !strings.Contains(line, "the bus") {
		t.Fatalf("a server answering ill reads %d, %q, %v", code, line, red)
	}
	if code, line, red := serverRead(false, false, "http://127.0.0.1:6510/health", "refused"); code != 0 || red || !strings.Contains(line, "./RUNME.sh serve") {
		t.Fatalf("no server reads %d, %q, %v", code, line, red)
	}
}

// level0: FixtureOutsideHome - a red run writes its red cases under a root of the case's own
func TestGoGate(t *testing.T) {
	t.Parallel()
	read := func(path string) string {
		if path == "src/one/one_test.go" {
			return "package one\n\nfunc TestB(t *testing.T) {}\nfunc helper() {}\nfunc TestA(t *testing.T) {}\nfunc TestB(t *testing.T) {}\n"
		}
		return ""
	}
	t.Run("the Go test names read each test function once, in order", func(t *testing.T) {
		if got := goTestNames([]string{"src/one/one_test.go", "test/level0/a.test.js", "src/gone_test.go"}, read); !reflect.DeepEqual(got, []string{"TestA", "TestB"}) {
			t.Fatalf("the names read %v", got)
		}
	})
	t.Run("the Go run skips every test a red Go file names, and nothing where none stands red", func(t *testing.T) {
		if got := goSkipOf([]string{"src/one/one_test.go, test/level0/a.test.js"}, read); !reflect.DeepEqual(got, []string{"-skip", "^(TestA|TestB)$"}) {
			t.Fatalf("the skip reads %v", got)
		}
		if got := goSkipOf([]string{"test/level0/a.test.js"}, read); len(got) != 0 {
			t.Fatalf("no red Go file skips %v", got)
		}
	})
	t.Run("the gate runs the tests under the contract tag, then the formatter over src", func(t *testing.T) {
		fake := &checkFake{said: map[string]string{"gofmt": "src/one/one.go\n"}}
		if code := goGate(fake.doors(), false, []string{"-skip", "^(TestA)$"}); code != 1 {
			t.Fatalf("a file the formatter lists answers %d", code)
		}
		want := [][]string{{"go", "test", "-tags", "contract", "-skip", "^(TestA)$", "./..."}, {"gofmt", "-l", "src"}}
		if !reflect.DeepEqual(fake.runs, want) {
			t.Fatalf("the gate ran %v, and wants %v", fake.runs, want)
		}
		red := &checkFake{codes: map[string]int{"go": 1}}
		redDoors := red.doors()
		redDoors.root = t.TempDir()
		if code := goGate(redDoors, false, nil); code != 1 || len(red.runs) != 1 {
			t.Fatalf("a red test answers %d after %v", code, red.runs)
		}
		gone := &checkFake{gone: map[string]bool{"go": true}}
		if code := goGate(gone.doors(), false, nil); code != 1 {
			t.Fatalf("no go answers %d", code)
		}
	})
	t.Run("a quiet red run names each failing Go test on the error stream alone", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"go": 1}, said: map[string]string{"go": "=== RUN   TestA\n    --- FAIL: TestA (0.00s)\nok  \tquackitect/src/two\n--- FAIL: TestB (0.01s)\n"}}
		doors := fake.doors()
		var errs, out strings.Builder
		doors.errs, doors.out, doors.root = &errs, &out, t.TempDir()
		if code := goGate(doors, true, nil); code != 1 {
			t.Fatalf("a red quiet run answers %d", code)
		}
		if got := errs.String(); got != "--- FAIL: TestA (0.00s)\n--- FAIL: TestB (0.01s)\n" {
			t.Fatalf("the error stream reads %q", got)
		}
		if out.Len() != 0 {
			t.Fatalf("the out stream reads %q", out.String())
		}
	})
}

func TestTestArgv(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	if len(testParts) != 2 || !testParts[0].shared || testParts[1].shared {
		t.Fatalf("the test parts read %v, and want the shared unit run, then the contract run", testParts)
	}
	red := "test/level0/lens.test.js"
	argv := testArgv(realDisk(), root, []string{red}, testParts[0])
	if slices.Contains(argv, red) || !slices.Contains(argv, "test/level0/logbook.test.js") {
		t.Fatalf("the run names %v, and wants every file but the red one", argv)
	}
	for _, one := range argv {
		if strings.Contains(one, "*") {
			t.Fatalf("a glob reaches the red file: %s", one)
		}
	}
	if !slices.Contains(argv, "--experimental-test-isolation=none") || !slices.Contains(argv, "--test") {
		t.Fatalf("the unit run reads %v, and wants one shared process", argv)
	}
	if !slices.Contains(testArgv(realDisk(), root, nil, testParts[1]), "test/contract/*.test.js") {
		t.Fatal("no red list runs the glob")
	}
}

// A red check ends by naming each red case with its file, and its line where the run names one. [[spec/tickets/ci-reds-name-their-cases]]
// level0: FixtureOutsideHome - a red run writes its red cases under a root of the case's own
func TestCheckEndsOnTheRedCases(t *testing.T) {
	t.Parallel()
	ends := func(t *testing.T, run func(doors *checkDoors, argv []string) (int, string)) []string {
		t.Helper()
		var said strings.Builder
		doors := (&checkFake{}).doors()
		doors.root, doors.out = t.TempDir(), &said
		doors.run = func(argv, _ []string, _ bool) (int, string, error) {
			code, out := run(&doors, argv)
			return code, out, nil
		}
		if code := checkVerb(func(io.Writer, io.Writer) checkDoors { return doors })([]string{"check"}, false, &said, io.Discard); code != 1 {
			t.Fatalf("a red run answers %d: %q", code, said.String())
		}
		rows := strings.Split(strings.TrimRight(said.String(), "\n"), "\n")
		return rows[max(0, len(rows)-2):]
	}
	t.Run("a red runner case ends the log with its file and line", func(t *testing.T) {
		rows := ends(t, func(doors *checkDoors, argv []string) (int, string) {
			if argv[0] != "node" || !slices.Contains(argv, testParts[0].glob) {
				return 0, ""
			}
			row := caseLine(map[string]any{"file": "test/level0/a.test.js", "name": "a case", "nesting": 0, "ms": 3, "ok": false, "said": "it broke", "line": 12})
			_ = doors.disk.makeAll(filepath.Dir(doors.at(testParts[0].times)), checkFolderMode)
			_ = doors.disk.write(doors.at(testParts[0].times), []byte(row+"\n"), checkFileMode)
			return 1, ""
		})
		if want := []string{"The red cases:", "  test/level0/a.test.js:12: a case: it broke"}; !reflect.DeepEqual(rows, want) {
			t.Fatalf("the log ends %q, and wants %q", rows, want)
		}
	})
	t.Run("a red Go test ends the log with its file under its package and its line", func(t *testing.T) {
		rows := ends(t, func(_ *checkDoors, argv []string) (int, string) {
			if argv[0] != "go" {
				return 0, ""
			}
			return 1, "--- FAIL: TestA (0.00s)\n    --- FAIL: TestA/inner (0.00s)\n        a_test.go:7: one is two\nFAIL\nFAIL\tquackitect/src/one\t0.01s\nFAIL\n"
		})
		if want := []string{"The red cases:", "  src/one/a_test.go:7: TestA/inner: one is two"}; !reflect.DeepEqual(rows, want) {
			t.Fatalf("the log ends %q, and wants %q", rows, want)
		}
	})
}

func TestCheckErrors(t *testing.T) {
	t.Parallel()
	lines := caseLine(map[string]any{"file": "test/a.test.js", "name": "a case", "ok": false, "said": "it broke"})
	if got := errorsSaid(lines, []string{"src/a.js:1:1: Rule: a message"}); !reflect.DeepEqual(got, []string{"test/a.test.js: a case: it broke", "src/a.js:1:1: Rule: a message"}) {
		t.Fatalf("the rows read %q", got)
	}
	if got := errorsSaid("", nil); !reflect.DeepEqual(got, []string{"The check names no red case and no finding at error."}) {
		t.Fatalf("a clean run reads %q", got)
	}
}

func TestCheckReads(t *testing.T) {
	t.Parallel()
	t.Run("the Go gate runs with no C compiler", func(t *testing.T) {
		fake := &checkFake{}
		goGate(fake.doors(), false, nil)
		if len(fake.envs) == 0 || !slices.Contains(fake.envs[0], "CGO_ENABLED=0") {
			t.Fatalf("the gate ran under %v", fake.envs)
		}
	})
	t.Run("the port reads off the vehicle pointer, and the base where none stands", func(t *testing.T) {
		if portOf(`{"port":6612}`) != 6612 || portOf("") != portBase || portOf(`{"port":"x"}`) != portBase {
			t.Fatal("the port reads wrong")
		}
	})
	// [[spec/tickets/platform-red-line-tested]]
	// [[spec/tickets/level0-claims-name-the-platform]]
	t.Run("level zero names the platform it ran on, red or green, and a Windows box names the desk trial covering it", func(t *testing.T) {
		for _, one := range []struct {
			platform string
			code     int
			says     []string
		}{
			{"linux", 1, []string{"so this tree is red", "on linux"}},
			{"linux", 0, []string{"on linux"}},
			{"windows", 0, []string{"on windows", deskTrial}},
		} {
			fake := &checkFake{codes: map[string]int{"probe smoke --working": one.code}}
			doors := fake.doors()
			doors.platform = one.platform
			var said strings.Builder
			doors.out, doors.errs = &said, &said
			code := level0Runs(doors, false)
			for _, want := range one.says {
				if code != one.code || !strings.Contains(said.String(), want) {
					t.Fatalf("on %s level zero answers %d, %q, and wants %q", one.platform, code, said.String(), want)
				}
			}
		}
	})
}

func TestCheckVerb(t *testing.T) {
	t.Parallel()
	whole := func(t *testing.T, fake *checkFake, budget float64, words ...string) (checkDoors, string, int) {
		t.Helper()
		var said strings.Builder
		doors := fake.doors()
		doors.root, doors.out = t.TempDir(), &said
		doors.config = func(key string) float64 {
			if key == budgetKey {
				return budget
			}
			return 1
		}
		doors.git = func(args ...string) string {
			if args[0] == "rev-parse" {
				return "abc"
			}
			return ""
		}
		code := checkVerb(func(io.Writer, io.Writer) checkDoors { return doors })(append([]string{"check"}, words...), false, &said, io.Discard)
		return doors, said.String(), code
	}
	t.Run("a green run prints its parts and stamps ok at the commit", func(t *testing.T) {
		doors, said, code := whole(t, &checkFake{}, 0)
		if code != 0 || !strings.Contains(said, "The check's parts, in seconds:") {
			t.Fatalf("the run answers %d, %q", code, said)
		}
		if stamp := doors.text(stampFile); !strings.Contains(stamp, `"sha": "abc"`) || !strings.Contains(stamp, `"ok": true`) || !strings.Contains(stamp, `"spawns": {`) {
			t.Fatalf("the stamp reads %s", stamp)
		}
	})
	t.Run("a red part names itself on the error stream, and the parts beside it still report", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"doors": 1}}
		var said, erred strings.Builder
		doors := fake.doors()
		doors.root, doors.out, doors.errs = t.TempDir(), &said, &erred
		code := checkVerb(func(io.Writer, io.Writer) checkDoors { return doors })([]string{"check"}, false, &said, &erred)
		if code != 1 || !strings.Contains(erred.String(), "doors answers red") {
			t.Fatalf("the run answers %d, and its error stream reads %q", code, erred.String())
		}
		for _, name := range []string{"tests", "level0", "go", "projections", "plugin", "server", "rules"} {
			if !regexp.MustCompile(`(?m)^\s*[0-9.]+  ` + name + `$`).MatchString(said.String()) {
				t.Errorf("the table names no time for %s:\n%s", name, said.String())
			}
		}
	})
	t.Run("a run past its budget warns in the log, naming its time", func(t *testing.T) {
		fake := &checkFake{}
		whole(t, fake, 1)
		if len(fake.rows) != 1 || fake.rows[0]["level"] != "warn" || !strings.Contains(fake.rows[0]["said"].(string), "past its budget") {
			t.Fatalf("the log took %v", fake.rows)
		}
	})
	t.Run("under --errors the run prints the red cases and findings alone", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"doors": 1}}
		doors, said, code := whole(t, fake, 0, "--errors")
		if code != 1 || strings.TrimSpace(said) != noErrors {
			t.Fatalf("the run answers %d, %q", code, said)
		}
		if stamp := doors.text(stampFile); !strings.Contains(stamp, `"ok": false`) || !strings.Contains(stamp, `"projections"`) {
			t.Fatalf("the stamp reads %s, and wants the unrun parts", stamp)
		}
	})
	t.Run("a green run under --errors prints the no-red line alone, past the parts' own lines", func(t *testing.T) {
		fake := &checkFake{}
		var said strings.Builder
		doors := fake.doors()
		doors.root, doors.out, doors.red = t.TempDir(), &said, []string{"test/level0/a.test.js"}
		code := checkVerb(func(io.Writer, io.Writer) checkDoors { return doors })([]string{"check", "--errors"}, false, &said, io.Discard)
		if code != 0 || strings.TrimSpace(said.String()) != noErrors {
			t.Fatalf("the run answers %d, %q", code, said.String())
		}
	})
	// [[spec/tickets/the-check-runs-beside]]
	t.Run("a run that stood the index up stops it last, and a door standing before the run stays", func(t *testing.T) {
		for _, before := range []bool{false, true} {
			fake := &checkFake{}
			doors := fake.doors()
			doors.root, doors.self = t.TempDir(), "quack"
			asked := 0
			doors.indexUp = func() bool {
				asked++
				return before || asked > 1
			}
			checkVerb(func(io.Writer, io.Writer) checkDoors { return doors })([]string{"check"}, false, io.Discard, io.Discard)
			stopped := slices.ContainsFunc(fake.runs, func(argv []string) bool { return reflect.DeepEqual(argv, []string{"quack", "stop"}) })
			if stopped == before || (stopped && !reflect.DeepEqual(fake.runs[len(fake.runs)-1], []string{"quack", "stop"})) {
				t.Fatalf("with a door standing before the run %v, the run ran %v", before, fake.runs)
			}
		}
	})
	t.Run("the standing file names a door where its process lives", func(t *testing.T) {
		for text, want := range map[string]bool{"": false, `{"pid":0}`: false, fmt.Sprintf(`{"pid":%d}`, quietBox().pid): true} {
			if indexStands(text) != want {
				t.Fatalf("%q reads a door %v", text, !want)
			}
		}
	})
	t.Run("the stamp counts the warnings the lint leaves", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.root = t.TempDir()
		doors.verb = func(words []string, _ bool) int {
			if words[0] == "lint" {
				_ = doors.disk.makeAll(filepath.Dir(doors.at(lintFile)), 0o755)
				_ = doors.disk.write(doors.at(lintFile), []byte(`{"stood":[{"file":"src/a.go","source":"tree"}],"erred":[]}`), 0o644)
			}
			return 0
		}
		checkVerb(func(io.Writer, io.Writer) checkDoors { return doors })([]string{"check"}, false, io.Discard, io.Discard)
		if stamp := doors.text(stampFile); !strings.Contains(stamp, `"warnings": 1`) || !strings.Contains(stamp, `"src/a.go"`) {
			t.Fatalf("the stamp reads %s", stamp)
		}
	})
}

func TestVerbOver(t *testing.T) {
	t.Parallel()
	type ran struct {
		argv, env []string
		quiet     bool
	}
	over := func(code int, said string) (func(words []string, quiet bool) int, *[]ran, *strings.Builder) {
		runs := []ran{}
		var errs strings.Builder
		run := func(argv, env []string, quiet bool) (int, string, error) {
			runs = append(runs, ran{argv, env, quiet})
			return code, said, nil
		}
		return verbOver(run, []string{"/q", "verb", "/tree/src/scripts"}, []string{"SE_LINT_FOUND=/tree/x"}, &errs), &runs, &errs
	}
	t.Run("a verb runs through the road, under the lint's variable", func(t *testing.T) {
		verb, runs, _ := over(0, "")
		if code := verb([]string{"doors"}, false); code != 0 {
			t.Fatalf("a green verb answers %d", code)
		}
		want := []ran{{[]string{"/q", "verb", "/tree/src/scripts", "doors"}, []string{"SE_LINT_FOUND=/tree/x"}, false}}
		if !reflect.DeepEqual(*runs, want) {
			t.Fatalf("the road ran %v", *runs)
		}
	})
	t.Run("a quiet red verb names why on the error stream", func(t *testing.T) {
		verb, _, errs := over(1, "src/doors/x.js has no test/contract/x.test.js.\n")
		if code := verb([]string{"doors"}, true); code != 1 {
			t.Fatalf("a red verb answers %d", code)
		}
		if got := errs.String(); got != "src/doors/x.js has no test/contract/x.test.js.\n" {
			t.Fatalf("the error stream reads %q", got)
		}
	})
	t.Run("a quiet green verb and a loud red one add nothing to the error stream", func(t *testing.T) {
		green, _, quietErrs := over(0, "all well\n")
		green([]string{"doors"}, true)
		red, _, loudErrs := over(1, "")
		red([]string{"doors"}, false)
		if quietErrs.Len()+loudErrs.Len() != 0 {
			t.Fatalf("the error streams read %q and %q", quietErrs.String(), loudErrs.String())
		}
	})
}

func TestTestVerb(t *testing.T) {
	t.Parallel()
	t.Run("named files go to branch test under a fresh tally", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.root = t.TempDir()
		self := func() (string, error) { return "/bin/quack", nil }
		testVerb(func(io.Writer, io.Writer) checkDoors { return doors }, self)([]string{"test", "src/quack"}, false, io.Discard, io.Discard)
		want := []string{"/bin/quack", "verb", filepath.Join(doors.root, "src", "scripts"), "branch", "test", "src/quack"}
		if len(fake.runs) != 1 || !reflect.DeepEqual(fake.runs[0], want) || fake.envs[0][0] != "SE_SPAWNS="+doors.at(spawnsFile) {
			t.Fatalf("the verb ran %v under %v", fake.runs, fake.envs)
		}
	})
	t.Run("no word runs the test part", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.root = t.TempDir()
		testVerb(func(io.Writer, io.Writer) checkDoors { return doors }, func() (string, error) { return "/bin/quack", nil })([]string{"test"}, false, io.Discard, io.Discard)
		if len(fake.runs) != len(testParts) || fake.runs[0][0] != "node" {
			t.Fatalf("the verb ran %v", fake.runs)
		}
	})
}

func TestTheTestRunHandsNodeTheBrowserTheBoxHolds(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name, browser, want string
	}{
		{"a browser the box holds rides every run", "/b/chrome", "PLAYWRIGHT_CHROMIUM=/b/chrome"},
		{"no browser names no variable", "", ""},
	} {
		fake := &checkFake{}
		doors := fake.doors()
		doors.root = sharedFolder()
		doors.browser = one.browser
		testsRun(doors, true)
		if len(fake.envs) != len(testParts) {
			t.Fatalf("%s: the run started %v", one.name, fake.runs)
		}
		for _, env := range fake.envs {
			named := slices.ContainsFunc(env, func(v string) bool { return strings.HasPrefix(v, "PLAYWRIGHT_CHROMIUM=") })
			if (one.want == "" && named) || (one.want != "" && !slices.Contains(env, one.want)) {
				t.Errorf("%s: node runs under %v, and wants %q", one.name, env, one.want)
			}
		}
	}
}
