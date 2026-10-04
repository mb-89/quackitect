// The check verb in Go: its parts in order, each one's road, the battery run,
// the server read, the Go gate, the test runner's files and the rows under
// --errors.
// [[spec/design_output/work#the-battery-answers-first]]
package main

import (
	"errors"
	"io"
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
		run: func(argv, _ []string, _ bool) (int, string, error) {
			one.runs = append(one.runs, argv)
			if one.gone[argv[0]] {
				return 0, "", errors.New("not found")
			}
			return one.codes[argv[0]], one.said[argv[0]], nil
		},
		get:  func(string) ([]byte, error) { return []byte(`{"ok":true}`), nil },
		now:  ticking(time.Millisecond),
		out:  io.Discard,
		errs: io.Discard,
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
}

func TestTestArgv(t *testing.T) {
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
	lines := caseLine(map[string]any{"file": "test/a.test.js", "name": "a case", "ok": false, "said": "it broke"})
	if got := errorsSaid(lines, []string{"src/a.js:1:1: Rule: a message"}); !reflect.DeepEqual(got, []string{"test/a.test.js: a case: it broke", "src/a.js:1:1: Rule: a message"}) {
		t.Fatalf("the rows read %q", got)
	}
	if got := errorsSaid("", nil); !reflect.DeepEqual(got, []string{"The check names no red case and no finding at error."}) {
		t.Fatalf("a clean run reads %q", got)
	}
}

func TestCheckRegisters(t *testing.T) {
	for _, words := range []string{"check", "test"} {
		if registry[words] == nil {
			t.Fatalf("the registry holds no %s, so quack hands it to node", words)
		}
	}
}
