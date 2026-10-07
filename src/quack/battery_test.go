// The battery's report and the stamp, read off fixtures.
// [[spec/guidance/retro/effect]] [[spec/design_output/work#the-battery-answers-first]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"reflect"
	"regexp"
	"strings"
	"testing"
)

const batteryAt = "2026-09-20T10:00:00.000Z"

func caseLine(row map[string]any) string {
	said, _ := json.Marshal(row)
	return string(said)
}

var caseLines = strings.Join([]string{
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "a fast case", "nesting": 0, "ms": 2.5, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "a slow case", "nesting": 0, "ms": 900.25, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "inside a group", "nesting": 1, "ms": 30, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "a group", "nesting": 0, "ms": 47.25, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/two.test.js", "name": "a case", "nesting": 0, "ms": 40, "ok": true}),
	"",
	"not a row",
}, "\n")

var redLines = strings.Join([]string{
	caseLine(map[string]any{"file": "test/contract/stub.test.js", "name": "a stub holds its files", "nesting": 0, "ms": 13.8, "ok": false, "said": "ENOENT: no such file"}),
	caseLine(map[string]any{"file": "test/contract/stub.test.js", "name": "a todo case", "nesting": 0, "ms": 1, "ok": false, "todo": true, "said": "by design"}),
	caseLine(map[string]any{"file": "test/contract/stub.test.js", "name": "the shim hands a verb", "nesting": 0, "ms": 6.2, "ok": true}),
}, "\n")

func TestBatteryReport(t *testing.T) {
	t.Parallel()
	t.Run("the slowest cases come off the lines, slowest first, each with its file", func(t *testing.T) {
		want := []slowCase{{"a slow case", 900.25, "test/level0/one.test.js"}, {"a group", 47.25, "test/level0/one.test.js"}, {"a case", 40, "test/level0/two.test.js"}}
		if got := slowestIn(caseLines, 3); !reflect.DeepEqual(got, want) {
			t.Fatalf("the slowest read %v, and want %v", got, want)
		}
		if got := slowestIn("", 3); len(got) != 0 {
			t.Fatalf("no lines read %v", got)
		}
	})
	t.Run("a time a test file sums its cases at the top, the slowest first", func(t *testing.T) {
		want := []fileTime{{"test/level0/one.test.js", 950}, {"test/level0/two.test.js", 40}}
		if got := filesIn(caseLines); !reflect.DeepEqual(got, want) {
			t.Fatalf("the files read %v, and want %v", got, want)
		}
	})
	t.Run("a red case comes off the lines in its own words, and a todo case reads none", func(t *testing.T) {
		want := []redCase{{File: "test/contract/stub.test.js", Name: "a stub holds its files", Said: "ENOENT: no such file"}}
		if got := redIn(redLines); !reflect.DeepEqual(got, want) {
			t.Fatalf("the red read %v, and want %v", got, want)
		}
		if got := redIn(caseLines); len(got) != 0 {
			t.Fatalf("green lines read red %v", got)
		}
	})
	t.Run("a red runner case keeps the line its reporter wrote", func(t *testing.T) {
		row := caseLine(map[string]any{"file": "test/a.test.js", "name": "a case", "ok": false, "said": "it broke", "line": 4})
		if got := redIn(row); !reflect.DeepEqual(got, []redCase{{File: "test/a.test.js", Name: "a case", Said: "it broke", Line: 4}}) {
			t.Fatalf("the red read %v", got)
		}
	})
	t.Run("a red Go test reads its file under its package, and a parent with no message of its own stays out", func(t *testing.T) {
		said := "--- FAIL: TestA (0.00s)\n    --- FAIL: TestA/inner (0.00s)\n        a_test.go:7: one is two\n        and more\n--- FAIL: TestB (0.00s)\n    b_test.go:3: three\nFAIL\nFAIL\tquackitect/src/one\t0.01s\nok  \tquackitect/src/two\t0.02s\nFAIL\n"
		want := []redCase{{File: "src/one/a_test.go", Name: "TestA/inner", Said: "one is two", Line: 7}, {File: "src/one/b_test.go", Name: "TestB", Said: "three", Line: 3}}
		if got := goRedIn(said); !reflect.DeepEqual(got, want) {
			t.Fatalf("the Go red read %v, and want %v", got, want)
		}
		if got := goRedIn("ok  \tquackitect/src/two\t0.02s\n"); len(got) != 0 {
			t.Fatalf("a green run reads red %v", got)
		}
	})
	t.Run("the red rows open on their header, a row a case, and a green run prints none", func(t *testing.T) {
		got := redSaid([]redCase{{File: "a.js", Name: "one", Said: "broke", Line: 2}, {Name: "two"}})
		if want := []string{"", "The red cases:", "  a.js:2: one: broke", "  two"}; !reflect.DeepEqual(got, want) {
			t.Fatalf("the rows read %q, and want %q", got, want)
		}
		if got := redSaid(nil); len(got) != 0 {
			t.Fatalf("a green run reads %q", got)
		}
	})
	t.Run("the tally counts a line a spawn, and the ones that are Vale", func(t *testing.T) {
		tally := strings.Join([]string{"/tree/.se/.runtime/bin/vale", "/usr/bin/node", `C:\tree\.se\.runtime\bin\vale.exe`, "sh", ""}, "\n")
		if got := spawnsIn(tally); got != (spawnTally{4, 2}) {
			t.Fatalf("the tally reads %v, and wants 4 and 2", got)
		}
		if got := spawnsIn(""); got != (spawnTally{}) {
			t.Fatalf("no tally reads %v", got)
		}
	})
	t.Run("a report carries the span the run names", func(t *testing.T) {
		said := batteryOf(map[string]float64{"tests": 1000, "level0": 900, "go": 400.4}, "", 10, nil, nil, 1400.4)
		if said.Total != 1400 || !reflect.DeepEqual(said.Parts, map[string]int64{"tests": 1000, "level0": 900, "go": 400}) {
			t.Fatalf("the report reads %v and %v", said.Total, said.Parts)
		}
	})
	t.Run("a report carries each part rounded, their sum, the slowest, the files, the unrun, the red and the spawns", func(t *testing.T) {
		said := batteryOf(map[string]float64{"tests": 1200.6, "go": 300.2, "rules": 0}, redLines, 1, []string{"go", "rules"}, &spawnTally{4, 2}, -1)
		if !reflect.DeepEqual(said.Parts, map[string]int64{"tests": 1201, "go": 300, "rules": 0}) || said.Total != 1501 {
			t.Fatalf("the parts read %v in %d", said.Parts, said.Total)
		}
		if len(said.Slowest) != 1 || !reflect.DeepEqual(said.Files, []fileTime{{"test/contract/stub.test.js", 21}}) {
			t.Fatalf("the slowest read %v, and the files %v", said.Slowest, said.Files)
		}
		if !reflect.DeepEqual(said.Unrun, []string{"go", "rules"}) || len(said.Red) != 1 || *said.Spawns != (spawnTally{4, 2}) {
			t.Fatalf("the unrun read %v, the red %v, the spawns %v", said.Unrun, said.Red, said.Spawns)
		}
		bare := batteryOf(map[string]float64{"tests": 5}, caseLines, 10, nil, nil, -1)
		if bare.Unrun == nil || len(bare.Unrun) != 0 || bare.Spawns != nil {
			t.Fatalf("a bare report reads %v and %v", bare.Unrun, bare.Spawns)
		}
	})
	t.Run("the parts print the slowest first, and a run under its budget warns nothing", func(t *testing.T) {
		rows := partsSaid(batteryOf(map[string]float64{"go": 4200, "tests": 61000, "rules": 950}, "", 10, nil, nil, -1), 120000)
		want := []string{"   61.0  tests", "    4.2  go", "    1.0  rules", "   66.2  in all"}
		if len(rows) < 2 || !reflect.DeepEqual(rows[2:], want) {
			t.Fatalf("the rows read %q, and want %q after the heading", rows, want)
		}
	})
	t.Run("a run past its budget names the part that took the most and its slowest cases", func(t *testing.T) {
		lines := caseLine(map[string]any{"name": "slow", "ms": 9000, "file": "test/contract/a.test.js"}) + "\n" + caseLine(map[string]any{"name": "quick", "ms": 10, "file": "test/level0/b.test.js"})
		report := batteryOf(map[string]float64{"tests": 90000, "rules": 40000}, lines, 10, nil, nil, -1)
		rows := partsSaid(report, 120000)
		warned := -1
		for at, one := range rows {
			if strings.HasPrefix(one, "Warning:") {
				warned = at
			}
		}
		if warned < 0 || !regexp.MustCompile(`took 130\.0s, past its budget of 120\.0s under battery\.budget\. tests took the most`).MatchString(rows[warned]) {
			t.Fatalf("the rows read %q, and want the warning", rows)
		}
		if rows[warned+1] != "    9.0  test/contract/a.test.js slow" {
			t.Fatalf("the slowest case reads %q", rows[warned+1])
		}
		for _, one := range partsSaid(report, 0) {
			if strings.HasPrefix(one, "Warning:") {
				t.Fatal("a budget of 0 warns")
			}
		}
	})
}

func TestStamp(t *testing.T) {
	t.Parallel()
	t.Run("a green run stamps ok with no warning, and a red run stamps the code", func(t *testing.T) {
		green := stampFor(0, "abc", true, batteryAt, nil, nil, nil, 1)
		want := checkStamp{Sha: "abc", Ok: true, Clean: true, At: batteryAt, Warnings: 0, Files: []string{}}
		if !reflect.DeepEqual(green, want) {
			t.Fatalf("the green stamp reads %+v, and wants %+v", green, want)
		}
		said, _ := json.Marshal(green)
		if strings.Contains(string(said), "battery") || strings.Contains(string(said), "runs") {
			t.Fatalf("a stamp with no report carries %s", said)
		}
		if red := stampFor(1, "abc", false, batteryAt, nil, nil, nil, 1); red.Ok || red.Clean {
			t.Fatalf("the red stamp reads %+v", red)
		}
	})
	t.Run("the stamp counts every warning but the prose of a ticket", func(t *testing.T) {
		stood := []finding{{"spec/tickets/a-ticket.md", "vale"}, {"/tree/.se/tickets/a-note.md", "vale"}, {"spec/tickets/a-ticket.md", "tree"}, {"spec/guidance/working.md", "vale"}}
		said := stampFor(0, "abc", true, batteryAt, stood, nil, nil, 1)
		if said.Warnings != 2 || !reflect.DeepEqual(said.Files, []string{"spec/guidance/working.md", "spec/tickets/a-ticket.md"}) {
			t.Fatalf("the stamp reads %d warnings in %v", said.Warnings, said.Files)
		}
	})
	t.Run("the stamp keeps the last runs at its commit, up to the count, and drops another commit's", func(t *testing.T) {
		report := &batteryReport{Parts: map[string]int64{"tests": 30}, Total: 30}
		before := []byte(`{"sha":"abc","runs":[{"tests":20},{"tests":10}]}`)
		kept := stampFor(0, "abc", true, batteryAt, nil, report, before, 3)
		if !reflect.DeepEqual(kept.Runs, []map[string]int64{{"tests": 30}, {"tests": 20}, {"tests": 10}}) || kept.Battery != report {
			t.Fatalf("the runs read %v", kept.Runs)
		}
		if capped := stampFor(0, "abc", true, batteryAt, nil, report, before, 2); len(capped.Runs) != 2 {
			t.Fatalf("the capped runs read %v", capped.Runs)
		}
		if other := stampFor(0, "def", true, batteryAt, nil, report, before, 3); !reflect.DeepEqual(other.Runs, []map[string]int64{{"tests": 30}}) {
			t.Fatalf("another commit's runs read %v", other.Runs)
		}
	})
}
