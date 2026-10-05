// The check verb in Go: its parts in order, each one's road, the battery run,
// the server read, the Go gate, the test runner's files and the rows under
// --errors.
// [[spec/design_output/work#the-battery-answers-first]]
package main

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"reflect"
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

// Doors over fakes, recording each verb and each process the parts reach. [[spec/guidance/code/testing]]
type checkFake struct {
	verbs [][]string
	runs  [][]string
	envs  [][]string
	rows  []map[string]any
	codes map[string]int
	said  map[string]string
	gone  map[string]bool
}

func (one *checkFake) doors() checkDoors {
	return checkDoors{
		root: "/tree",
		verb: func(words []string, _ bool) int {
			one.verbs = append(one.verbs, words)
			return one.codes[strings.Join(words, " ")]
		},
		run: func(argv, env []string, _ bool) (int, string, error) {
			one.runs = append(one.runs, argv)
			one.envs = append(one.envs, env)
			if one.gone[argv[0]] {
				return 0, "", errors.New("not found")
			}
			return one.codes[argv[0]], one.said[argv[0]], nil
		},
		get:    func(string) ([]byte, error) { return []byte(`{"ok":true}`), nil },
		now:    ticking(time.Millisecond),
		config: func(string) float64 { return 0 },
		git:    func(...string) string { return "" },
		log:    func(row map[string]any) error { one.rows = append(one.rows, row); return nil },
		out:    io.Discard,
		errs:   io.Discard,
	}
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
	t.Run("the parts run in order, and level zero runs beside the parts after the tests", func(t *testing.T) {
		fake := &checkFake{}
		parts := partsOf(fake.doors(), nil, false)
		names := []string{}
		for _, one := range parts {
			names = append(names, one.name)
		}
		want := []string{"tests", "level0", "go", "doors", "projections", "plugin", "server", "rules"}
		if !reflect.DeepEqual(names, want) {
			t.Fatalf("the parts read %v, and want %v", names, want)
		}
		if !partNamed(parts, "level0").beside || partNamed(parts, "go").beside {
			t.Fatal("level zero alone runs beside")
		}
	})
	t.Run("a part another verb owns runs that verb through the road", func(t *testing.T) {
		fake := &checkFake{}
		parts := partsOf(fake.doors(), []string{"--errors", "src/quack"}, true)
		for _, name := range []string{"level0", "doors", "projections", "rules"} {
			partNamed(parts, name).run()
		}
		want := [][]string{{"probe", "dry", "--working"}, {"doors"}, {"project", "--check"}, {"lint", "src/quack"}}
		if !reflect.DeepEqual(fake.verbs, want) {
			t.Fatalf("the verbs read %v, and want %v", fake.verbs, want)
		}
	})
	t.Run("the rules read the root where the words name no path", func(t *testing.T) {
		fake := &checkFake{}
		partNamed(partsOf(fake.doors(), nil, false), "rules").run()
		if !reflect.DeepEqual(fake.verbs, [][]string{{"lint", "."}}) {
			t.Fatalf("the rules ran %v", fake.verbs)
		}
	})
	t.Run("a Windows box runs no dry session, and says so", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.windows = true
		var said strings.Builder
		doors.out = &said
		if code := partNamed(partsOf(doors, nil, false), "level0").run(); code != 0 || len(fake.verbs) != 0 || !strings.Contains(said.String(), "Windows") {
			t.Fatalf("the level0 part answers %d, ran %v, and says %q", code, fake.verbs, said.String())
		}
	})
	t.Run("the plugin part validates the plugin, and passes where claude stands nowhere", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"claude": 1}}
		if code := partNamed(partsOf(fake.doors(), nil, false), "plugin").run(); code != 1 {
			t.Fatalf("a refused plugin answers %d", code)
		}
		if !reflect.DeepEqual(fake.runs, [][]string{{"claude", "plugin", "validate", filepath.Join(".claude", "skills", "level0")}}) {
			t.Fatalf("the plugin part ran %v", fake.runs)
		}
		gone := &checkFake{gone: map[string]bool{"claude": true}}
		if code := partNamed(partsOf(gone.doors(), nil, false), "plugin").run(); code != 0 {
			t.Fatalf("no claude answers %d", code)
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

func TestBatteryRun(t *testing.T) {
	t.Parallel()
	step := func(name string, code int, ran *[]string) part {
		return part{name: name, run: func() int { *ran = append(*ran, name); return code }}
	}
	t.Run("the battery runs its parts in order, times each, and stops at the first red", func(t *testing.T) {
		ran := []string{}
		code, times, unrun, total := batteryRun([]part{step("tests", 0, &ran), step("rules", 0, &ran)}, ticking(100*time.Millisecond))
		if code != 0 || len(unrun) != 0 || times["tests"] != 100 || times["rules"] != 100 || total != 500 {
			t.Fatalf("the green run reads %d, %v, %v, %v", code, times, unrun, total)
		}
		ran = []string{}
		code, times, unrun, _ = batteryRun([]part{step("tests", 0, &ran), step("go", 1, &ran), step("rules", 0, &ran)}, ticking(time.Millisecond))
		if code != 1 || !reflect.DeepEqual(ran, []string{"tests", "go"}) || !reflect.DeepEqual(unrun, []string{"rules"}) || len(times) != 2 {
			t.Fatalf("the red run reads %d, ran %v, unrun %v, timed %v", code, ran, unrun, times)
		}
	})
	t.Run("a part beside the run starts in its place, the run goes on, and its red holds the answer", func(t *testing.T) {
		var held sync.Mutex
		order := []string{}
		say := func(one string) { held.Lock(); order = append(order, one); held.Unlock() }
		release := make(chan struct{})
		beside := part{name: "level0", beside: true, run: func() int {
			say("level0 starts")
			<-release
			say("level0 ends")
			return 1
		}}
		plain := func(name string) part {
			return part{name: name, run: func() int {
				if name == "go" {
					for !slices.Contains(func() []string { held.Lock(); defer held.Unlock(); return slices.Clone(order) }(), "level0 starts") {
						time.Sleep(time.Millisecond)
					}
				}
				say(name)
				if name == "rules" {
					close(release)
				}
				return 0
			}}
		}
		code, times, unrun, _ := batteryRun([]part{plain("tests"), beside, plain("go"), plain("rules")}, ticking(time.Millisecond))
		if !reflect.DeepEqual(order, []string{"tests", "level0 starts", "go", "rules", "level0 ends"}) {
			t.Fatalf("the order reads %v", order)
		}
		if code != 1 || len(times) != 4 || len(unrun) != 0 {
			t.Fatalf("the run reads %d, %v, %v", code, times, unrun)
		}
		ran := []string{}
		_, _, early, _ := batteryRun([]part{step("tests", 1, &ran), {name: "level0", beside: true, run: func() int { return 0 }}, step("go", 0, &ran)}, ticking(time.Millisecond))
		if !reflect.DeepEqual(early, []string{"level0", "go"}) {
			t.Fatalf("a red before the beside part leaves %v unrun", early)
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
		if code := goGate(red.doors(), false, nil); code != 1 || len(red.runs) != 1 {
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
		doors.errs, doors.out = &errs, &out
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
	red := "test/level0/battery.test.js"
	argv := testArgv(root, []string{red}, testParts[0])
	if slices.Contains(argv, red) || !slices.Contains(argv, "test/level0/pull-gate.test.js") {
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
	if !slices.Contains(testArgv(root, nil, testParts[1]), "test/contract/*.test.js") {
		t.Fatal("no red list runs the glob")
	}
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
	t.Run("level zero going red says the tree is red", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"probe dry --working": 1}}
		doors := fake.doors()
		var said strings.Builder
		doors.errs = &said
		if code := level0Runs(doors, false); code != 1 || !strings.Contains(said.String(), "so this tree is red") {
			t.Fatalf("a red dry session answers %d, %q", code, said.String())
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
	t.Run("the stamp counts the warnings the lint leaves", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.root = t.TempDir()
		doors.verb = func(words []string, _ bool) int {
			if words[0] == "lint" {
				_ = os.MkdirAll(filepath.Dir(doors.at(lintFile)), 0o755)
				_ = os.WriteFile(doors.at(lintFile), []byte(`{"stood":[{"file":"src/a.go","source":"tree"}],"erred":[]}`), 0o644)
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
		testVerb(func(io.Writer, io.Writer) checkDoors { return doors }, os.Executable)([]string{"test"}, false, io.Discard, io.Discard)
		if len(fake.runs) != len(testParts) || fake.runs[0][0] != "node" {
			t.Fatalf("the verb ran %v", fake.runs)
		}
	})
}

func TestCheckRegisters(t *testing.T) {
	t.Parallel()
	for _, words := range []string{"check", "test"} {
		if registry[words] == nil {
			t.Fatalf("the registry holds no %s, so quack hands it to node", words)
		}
	}
}
