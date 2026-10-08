// The lines part of the check: test lines at or under code lines, per
// language, over the files git lists and the texts the root holds.
// [[spec/tickets/test-lines-stay-under-code]]
package main

import (
	"bytes"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
)

// A text of n lines, as wc -l counts them. [[spec/tickets/test-lines-stay-under-code]]
func repeatedLines(n int) string { return strings.Repeat("line\n", n) }

// Doors over a temp root holding the files, and a git answering ls-files with the listed ones alone. [[spec/guidance/code/testing]]
func linesDoors(t *testing.T, files map[string]int, listed []string) (checkDoors, *bytes.Buffer, *bytes.Buffer) {
	t.Helper()
	root := t.TempDir()
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
