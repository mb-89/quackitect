package main

import (
	"fmt"
	"path"
	"strings"
)

// One language the lines part counts: its name, its extensions, and whether a path holds its test lines. [[spec/guidance/code/tests]]
type lineLanguage struct {
	name string
	exts []string
	test func(rel string) bool
}

// A fixture a Go test reads: a file under a testdata folder, or a recording under test/replay. [[spec/guidance/code/tests]]
func goFixture(rel string) bool {
	return strings.HasPrefix(rel, "testdata/") || strings.Contains(rel, "/testdata/") || strings.HasPrefix(rel, "test/replay/")
}

// The languages the lines part counts, JavaScript and TypeScript as one. [[spec/guidance/code/tests]]
var lineLanguages = []lineLanguage{
	{name: "Go", exts: []string{".go"}, test: func(rel string) bool { return strings.HasSuffix(rel, "_test.go") }},
	{name: "JavaScript", exts: []string{".js", ".mjs", ".cjs", ".ts", ".tsx"}, test: func(rel string) bool { return strings.HasPrefix(rel, "test/") }},
	{name: "shell", exts: []string{".sh"}, test: func(rel string) bool { return strings.HasPrefix(rel, "test/") }},
}

// The language a path counts under, and whether its lines are test lines; a Go fixture counts as Go test lines whatever its extension. [[spec/guidance/code/tests]]
func lineLanguageOf(rel string) (int, bool, bool) {
	if goFixture(rel) {
		return 0, true, true
	}
	ext := path.Ext(rel)
	for at, one := range lineLanguages {
		for _, want := range one.exts {
			if ext == want {
				return at, one.test(rel), true
			}
		}
	}
	return 0, false, false
}

// The lines part: test lines at or under code lines, per language, over the files git lists, each line counted as wc -l counts it. Rule 6 of [[spec/guidance/code/tests]]
func linesHold(d checkDoors) int {
	tests := make([]int, len(lineLanguages))
	code := make([]int, len(lineLanguages))
	for _, rel := range strings.Split(d.git("ls-files", "-z", "--cached", "--others", "--exclude-standard"), "\x00") {
		rel = strings.TrimSpace(rel)
		at, test, counted := lineLanguageOf(rel)
		if rel == "" || !counted {
			continue
		}
		n := strings.Count(d.text(rel), "\n")
		if test {
			tests[at] += n
		} else {
			code[at] += n
		}
	}
	answer := 0
	for at, one := range lineLanguages {
		if tests[at] == 0 && code[at] == 0 {
			continue
		}
		fmt.Fprintf(d.out, "%-10s %7d test lines %7d code lines\n", one.name, tests[at], code[at])
		if tests[at] > code[at] {
			fmt.Fprintf(d.errs, "%s holds %d test lines over %d code lines. Cut each test repeating a behaviour, per spec/guidance/code/tests.md.\n", one.name, tests[at], code[at])
			answer = 1
		}
	}
	return answer
}
