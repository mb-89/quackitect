// The lines part of the check: test lines at or under code lines, per
// language, over the files git lists and the texts the root holds.
// [[spec/tickets/test-lines-stay-under-code]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"encoding/json"
	"errors"
	"path/filepath"
	"reflect"
	"regexp"
	"slices"
	"strings"
	"testing"

	"quackitect/src/imports"
)

// A text of n lines, as wc -l counts them. [[spec/tickets/test-lines-stay-under-code]]
func repeatedLines(n int) string { return strings.Repeat("line\n", n) }

// Doors over a temp root holding the files, and a git answering ls-files with the listed ones alone. [[spec/guidance/code/testing]]
func linesDoors(t *testing.T, files map[string]int, listed []string) (checkDoors, *bytes.Buffer, *bytes.Buffer) {
	t.Helper()
	root := t.TempDir() // level0: FixtureOutsideHome - each case lays its own counted files into a root of its own
	d := (&checkFake{}).doors()
	d.root = root
	for rel, n := range files {
		at := filepath.Join(root, filepath.FromSlash(rel))
		if err := d.disk.makeAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := d.disk.write(at, []byte(repeatedLines(n)), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	var out, errs bytes.Buffer
	d.out, d.errs = &out, &errs
	d.git = func(args ...string) string {
		if slices.Contains(args, "ls-files") {
			return strings.Join(listed, "\x00") + "\x00"
		}
		return ""
	}
	return d, &out, &errs
}

// Whether the row names the number whole, apart from the digits beside it. [[spec/tickets/test-lines-stay-under-code]]
func wholeNumber(row, number string) bool {
	return regexp.MustCompile(`(^|\D)` + number + `(\D|$)`).MatchString(row)
}

func keysOf(files map[string]int) []string {
	out := []string{}
	for rel := range files {
		out = append(out, rel)
	}
	slices.Sort(out)
	return out
}

func TestTheLinesPartRefusesALanguageWhoseTestsOutgrowItsCode(t *testing.T) {
	t.Parallel()
	const cut = " Cut each test repeating a behaviour, per spec/guidance/code/tests.md."
	cases := []struct {
		name     string
		files    map[string]int
		unlisted map[string]int
		code     int
		refuses  string
		rows     map[string][2]string
	}{
		{
			name:    "JavaScript tests past its code refuse",
			files:   map[string]int{"src/one.js": 3, "test/level0/one.test.js": 5, "src/two.go": 4, "src/two_test.go": 2},
			code:    1,
			refuses: "JavaScript holds 5 test lines over 3 code lines." + cut,
			rows:    map[string][2]string{"JavaScript": {"5", "3"}, "Go": {"2", "4"}},
		},
		{
			name:  "every language at or under its code passes",
			files: map[string]int{"src/one.go": 4, "src/one_test.go": 4, "src/two.js": 3, "test/contract/two.test.js": 2, "src/three.sh": 2},
			code:  0,
			rows:  map[string][2]string{"Go": {"4", "4"}, "JavaScript": {"2", "3"}},
		},
		{
			name:  "JavaScript and TypeScript count as one language",
			files: map[string]int{"src/hook.ts": 2, "src/lib.js": 2, "test/level0/one.test.js": 3, "test/level0/two.test.ts": 1},
			code:  0,
			rows:  map[string][2]string{"JavaScript": {"4", "4"}},
		},
		{
			name:    "TypeScript tests past JavaScript code refuse as JavaScript",
			files:   map[string]int{"src/lib.mjs": 3, "test/level0/one.test.ts": 5},
			code:    1,
			refuses: "JavaScript holds 5 test lines over 3 code lines." + cut,
			rows:    map[string][2]string{"JavaScript": {"5", "3"}},
		},
		{
			name:    "a Go testdata file counts as test lines",
			files:   map[string]int{"src/one/one.go": 4, "src/one/one_test.go": 2, "src/one/testdata/minted.golden.json": 3},
			code:    1,
			refuses: "Go holds 5 test lines over 4 code lines." + cut,
			rows:    map[string][2]string{"Go": {"5", "4"}},
		},
		{
			name:    "a recording under test/replay counts as Go test lines",
			files:   map[string]int{"src/one/one.go": 4, "src/one/one_test.go": 2, "test/replay/session.jsonl": 3},
			code:    1,
			refuses: "Go holds 5 test lines over 4 code lines." + cut,
			rows:    map[string][2]string{"Go": {"5", "4"}},
		},
		{
			name:     "a file git lists nowhere counts nowhere",
			files:    map[string]int{"src/one.js": 3, "test/level0/one.test.js": 3},
			unlisted: map[string]int{"test/level0/stray.test.js": 40},
			code:     0,
			rows:     map[string][2]string{"JavaScript": {"3", "3"}},
		},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			all := map[string]int{}
			for rel, n := range one.files {
				all[rel] = n
			}
			for rel, n := range one.unlisted {
				all[rel] = n
			}
			d, out, errs := linesDoors(t, all, keysOf(one.files))
			if code := partNamed(partsOf(d, nil, false), "lines").run(); code != one.code {
				t.Fatalf("the lines part answers %d, and wants %d\nout: %s\nerrs: %s", code, one.code, out, errs)
			}
			if one.refuses == "" && strings.Contains(errs.String(), " holds ") {
				t.Fatalf("a tree at or under its code refuses: %s", errs)
			}
			if one.refuses != "" && !strings.Contains(errs.String(), one.refuses) {
				t.Fatalf("the refusal reads %q, and wants %q", errs, one.refuses)
			}
			for language, counts := range one.rows {
				rows := []string{}
				for _, row := range strings.Split(out.String(), "\n") {
					if slices.Contains(strings.Fields(row), language) {
						rows = append(rows, row)
					}
				}
				if len(rows) != 1 {
					t.Fatalf("%s prints %d rows, and wants one: %q", language, len(rows), out)
				}
				if !wholeNumber(rows[0], counts[0]) || !wholeNumber(rows[0], counts[1]) {
					t.Fatalf("the %s row reads %q, and wants %s test lines and %s code lines", language, rows[0], counts[0], counts[1])
				}
			}
		})
	}
}

func TestPluginTestsPart(t *testing.T) {
	t.Parallel()
	t.Run("the plugin-tests part fails where the tests run longer than the code the hooks entry reaches", func(t *testing.T) {
		lines := func(n int) string { return strings.Repeat("x\n", n) }
		for _, one := range []struct {
			tests int
			want  int
		}{{tests: 9, want: 0}, {tests: 10, want: 1}} {
			fake := &checkFake{}
			doors := fake.doors()
			plugin := filepath.Join(doors.root, ".claude", "skills", "level0")
			for rel, text := range map[string]string{
				"hooks/hooks.json":   `{"modules": ["./a.ts"]}`,
				"hooks/a.ts":         "import { b } from \"./b.ts\";\nimport { c } from \"../lib/c.js\";\n" + lines(2),
				"hooks/b.ts":         lines(3),
				"lib/c.js":           lines(2),
				"hooks/unreached.ts": lines(50),
				"tests/world.ts":     lines(4),
				"tests/door.test.ts": lines(one.tests - 4),
			} {
				at := filepath.Join(plugin, filepath.FromSlash(rel))
				if err := doors.disk.makeAll(filepath.Dir(at), 0o755); err != nil {
					t.Fatal(err)
				}
				if err := doors.disk.write(at, []byte(text), 0o644); err != nil {
					t.Fatal(err)
				}
			}
			var said strings.Builder
			doors.errs = &said
			if code := partNamed(partsOf(doors, nil, false), "plugin-tests").run(); code != one.want {
				t.Fatalf("%d test lines over 9 code lines answer %d, and want %d: %s", one.tests, code, one.want, said.String())
			}
			if one.want == 1 && !strings.Contains(said.String(), "10") {
				t.Fatalf("the refusal names no count: %q", said.String())
			}
		}
	})
}

// A doors note holding the list's rows under its heading. [[spec/design_output/doors#the-javascript-that-stays]]
func doorsNoteListing(rows ...string) string {
	listed := "# Scope\n\nThe doors.\n\n# The JavaScript that stays\n\n| files | reason |\n|---|---|\n"
	for _, one := range rows {
		listed += "| `" + one + "` | a reason |\n"
	}
	return listed + "\n# One door per outside thing\n"
}

func TestTheJavaScriptPartRefusesAFileTheListLeavesOut(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name    string
		note    string
		files   []string
		code    int
		refuses string
	}{
		{
			name:    "a JavaScript file no row covers refuses",
			note:    doorsNoteListing("src/extension/"),
			files:   []string{"src/extension/one.js", "src/engine/stray.mjs", "src/one.go"},
			code:    1,
			refuses: "src/engine/stray.mjs",
		},
		{
			name:    "a row covering no tracked file refuses",
			note:    doorsNoteListing("src/extension/", "src/gone.js"),
			files:   []string{"src/extension/one.js"},
			code:    1,
			refuses: "src/gone.js",
		},
		{
			name:    "a note with no list refuses",
			note:    "# Scope\n\nThe doors.\n",
			files:   []string{"src/extension/one.js"},
			code:    1,
			refuses: "The JavaScript that stays",
		},
		{
			name:  "a list covering every file, a folder row and a file row, passes",
			note:  doorsNoteListing("src/extension/", "src/engine/three.js"),
			files: []string{"src/extension/one.js", "src/extension/lib/two.ts", "src/engine/three.js", "src/one.go"},
			code:  0,
		},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			files := map[string]int{}
			for _, rel := range one.files {
				files[rel] = 1
			}
			d, _, errs := linesDoors(t, files, one.files)
			at := filepath.Join(d.root, "spec", "design_output", "doors.md")
			if err := d.disk.makeAll(filepath.Dir(at), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := d.disk.write(at, []byte(one.note), 0o644); err != nil {
				t.Fatal(err)
			}
			if got := javascriptListed(d); got != one.code {
				t.Fatalf("the part answers %d, and wants %d; it said\n%s", got, one.code, errs)
			}
			if one.refuses != "" && !strings.Contains(errs.String(), one.refuses) {
				t.Fatalf("the refusal names no %q:\n%s", one.refuses, errs)
			}
			if one.code == 0 && errs.Len() > 0 {
				t.Fatalf("a passing list says\n%s", errs)
			}
		})
	}
}

// What a red go test prints. [[spec/tickets/test-walks-move-onto-fakes]]
const hq1GoRedText = "--- FAIL: TestA (0.00s)\n    a_test.go:7: one is two\nFAIL\nFAIL\tquackitect/src/one\t0.01s\nFAIL\n"

// A loud red run keeps what the go run said, so the Go gate writes the red case the report reads. The runner's own print stands in the contract test. [[spec/tickets/ci-reds-name-their-cases]]
func TestLoudRunKeepsAGoRedForTheReport(t *testing.T) {
	t.Parallel()
	doors := (&checkFake{}).doors()
	doors.root = "/tree"
	doors.run = func(argv, env []string, quiet bool) (int, string, error) {
		return 1, hq1GoRedText, nil
	}
	if code := goGate(doors, false, nil); code != 1 {
		t.Fatalf("a red Go run answers %d", code)
	}
	var red []redCase
	if err := json.Unmarshal([]byte(doors.text(goRedFile)), &red); err != nil {
		t.Fatal(err)
	}
	if want := []redCase{{File: "src/one/a_test.go", Name: "TestA", Said: "one is two", Line: 7}}; !reflect.DeepEqual(red, want) {
		t.Fatalf("the report reads %v, and wants %v", red, want)
	}
}

// A road naming a worktree's scripts roots the check there, past the method root's variable. [[spec/tickets/check-reads-the-road-root]]
func TestRoadRootTakesTheTreeTheRoadNames(t *testing.T) {
	t.Parallel()
	method := func() (string, error) { return filepath.FromSlash("/main"), nil }
	scripts := filepath.Join("/work", "tree", "src", "scripts")
	if got, want := roadRoot([]string{"quack", "verb", scripts, "check"}, method), filepath.Join("/work", "tree"); got != want {
		t.Fatalf("the road root reads %q, want %q", got, want)
	}
}

// No road leaves the root to the index, and a failed read leaves the folder quack stands in. [[spec/tickets/check-reads-the-road-root]]
func TestRoadRootFallsBackToTheIndexRoot(t *testing.T) {
	t.Parallel()
	method := func() (string, error) { return filepath.FromSlash("/main"), nil }
	if got := roadRoot([]string{"quack", "check"}, method); got != filepath.FromSlash("/main") {
		t.Fatalf("without a road the root reads %q", got)
	}
	failed := func() (string, error) { return "", errors.New("no root") }
	if got := roadRoot([]string{"quack"}, failed); got != "." {
		t.Fatalf("a failed read roots at %q", got)
	}
}

func plantedGuard(refuses bool) []imports.Guard {
	return []imports.Guard{{Name: "planted", Refuses: refuses, Names: func([]string, func(string) string) []string { return []string{"a", "b"} }}}
}

func baselineReads(path string) string {
	if path == imports.BaselineOf("planted") {
		return "b\nc\n"
	}
	return ""
}

func TestTheGuardsReportAnswersZeroAndNamesEachOffender(t *testing.T) {
	t.Parallel()
	lines, code := guardsSaid(plantedGuard(false), nil, baselineReads)
	joined := strings.Join(lines, "\n")
	if code != 0 || !strings.Contains(joined, "a") || !strings.Contains(joined, "c") || slices.Contains(lines, "planted: new b") || !slices.Contains(lines, "planted: new a") || !slices.Contains(lines, "planted: stale c") {
		t.Fatalf("the report answers %d over %q, not 0 naming a as new and c as stale", code, lines)
	}
}

// The guards report counts the offenders per package, and prints each offender whole where no package groups them. [[spec/design_output/model#the-guards-hold-a-baseline]]
func TestTheGuardsReportCountsTheOffendersPerPackage(t *testing.T) {
	t.Parallel()
	guards := []imports.Guard{{Name: "planted", PackageOf: func(one string) string { return strings.Split(one, "/")[0] }, Names: func([]string, func(string) string) []string {
		return []string{"x/a_test.go", "x/b_test.go", "y/c_test.go"}
	}}, {Name: "ratio", Names: func([]string, func(string) string) []string {
		return []string{"go a\t3 test lines, 2 code lines"}
	}}}
	lines, _ := guardsSaid(guards, nil, func(string) string { return "" })
	if !slices.Contains(lines, "planted: x holds 2") || !slices.Contains(lines, "planted: y holds 1") || !slices.Contains(lines, "ratio: go a\t3 test lines, 2 code lines") {
		t.Fatalf("the report reads %q, not x holding 2, y holding 1 and the module with both counts", lines)
	}
}

var refusingGuards = map[string]map[string]string{
	"blackbox": {"a/a_test.go": "package a\n"},
	"fixture":  {"a/a_test.go": "package a_test\n\nimport \"testing\"\n\nfunc TestBuilds(t *testing.T) { _ = t.TempDir() }\n"},
	"ratio":    {"a/a.go": "package a\n", "a/a_test.go": "package a_test\n\nfunc one() {}\nfunc two() {}\n"},
	"script":   {"tools/run": "#!/bin/sh\necho one\n"},
}

func guardNamed(t *testing.T, name string) imports.Guard {
	t.Helper()
	at := slices.IndexFunc(imports.Guards, func(one imports.Guard) bool { return one.Name == name })
	if at < 0 {
		t.Fatalf("no guard is named %s", name)
	}
	return imports.Guards[at]
}

func plantedReads(files map[string]string, baseline string) ([]string, func(string) string) {
	tracked := []string{}
	for path := range files {
		tracked = append(tracked, path)
	}
	slices.Sort(tracked)
	return tracked, func(path string) string {
		if strings.HasPrefix(path, "src/imports/baseline/") {
			return baseline
		}
		return files[path]
	}
}

func TestEachTestGuardRefusesItsPlantedOffenderPastTheBaseline(t *testing.T) {
	t.Parallel()
	for name, files := range refusingGuards {
		guard := guardNamed(t, name)
		tracked, read := plantedReads(files, "")
		lines, code := guardsSaid([]imports.Guard{guard}, tracked, read)
		if code != exitFailed || !slices.ContainsFunc(lines, func(line string) bool { return strings.HasPrefix(line, name+": new ") }) {
			t.Errorf("the %s guard answers %d over %q, not a refusal naming the planted offender", name, code, lines)
		}
	}
}

func TestATestGuardRefusesABaselineLineItNoLongerNames(t *testing.T) {
	t.Parallel()
	tracked, read := plantedReads(map[string]string{"docs/a.md": "# a\n"}, "tools/gone\n")
	lines, code := guardsSaid([]imports.Guard{guardNamed(t, "script")}, tracked, read)
	if code != exitFailed || !slices.Contains(lines, "script: stale tools/gone") {
		t.Fatalf("the script guard answers %d over %q, not a refusal naming the stale line", code, lines)
	}
}
