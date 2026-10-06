// Each prefilter in front of a pattern answers what the pattern answers, line
// for line, so the sweep reads the same findings and spends less on them.
// [[spec/tickets/check-patterns-compile-once]]
package check

import (
	_ "embed"
	"encoding/json"
	"strings"
	"testing"
)

// The size golden, riding in through embed as a module test takes a fixture. [[spec/guidance/code/testing]]
//
//go:embed testdata/size.golden.json
var sizeGolden []byte

// The size ceilings the cases read: the function ceiling and the file ceiling. [[spec/tickets/size-golden-drops-line-counts]]
const (
	caseFunction = 50
	caseFile     = 600
)

// A prose file past the ceiling grows a line and draws no size row, and the size golden names no file the size rule leaves out. [[spec/tickets/size-golden-drops-line-counts]]
func TestAProseFilePastTheCeilingGrowsALineAndTheSizeGoldenHolds(t *testing.T) {
	t.Parallel()
	text := strings.Repeat("a line\n", caseFile+1)
	for _, path := range []string{"spec/a.md", "spec/config/a.json", "spec/a.yml"} {
		if rows := sizeFaults(path, text+"one more\n", caseFunction, caseFile); len(rows) != 0 {
			t.Errorf("%s draws %+v", path, rows)
		}
	}
	var golden map[string][]struct {
		File string `json:"file"`
	}
	if err := json.Unmarshal(sizeGolden, &golden); err != nil {
		t.Fatal(err)
	}
	for side, rows := range golden {
		for _, row := range rows {
			if !sizedFile.MatchString(row.File) {
				t.Errorf("the %s side of the size golden names %s, which the size rule leaves out", side, row.File)
			}
		}
	}
}

// A code file past the ceiling still names its ceiling. [[spec/tickets/size-golden-drops-line-counts]]
func TestACodeFilePastTheCeilingStillNamesItsCeiling(t *testing.T) {
	t.Parallel()
	rows := sizeFaults("src/a.go", strings.Repeat("x := 1\n", caseFile+1), caseFunction, caseFile)
	if len(rows) != 1 || rows[0].Rule != FileCeiling {
		t.Errorf("src/a.go draws %+v", rows)
	}
}

// Lines a brace language writes, with the shapes each pattern reads and the ones it refuses. [[spec/tickets/check-patterns-compile-once]]
var codeLines = []string{
	"",
	"   ",
	"function one() {",
	"export default async function* two(a, b) {",
	"export const three = async (a) => {",
	"let four = b => {  ",
	"  static async five(a, b) {\t",
	"  if (a) {",
	"  while (b) {\r",
	"func six(a int) string {",
	"func (one *Tree) seven() {",
	"funcs := 1",
	"const eight = () => 1;",
	"x = { a: 1 }",
	"  return {",
	"} else {",
	"\tnine() {\f",
	"const s = \"a // b { c\" // and { a comment",
	"const t = 'it' + `x${y}` + \"q\\\"r\"",
	"a / b { }",
	"path := \"a/b\"",
	"plain text, no marks",
	"{",
	"}",
}

func TestAFunctionNameReadsAsThePatternsReadIt(t *testing.T) {
	for _, line := range codeLines {
		if got, want := functionNamed(line), namedBy(line); got != want {
			t.Errorf("functionNamed(%q) answers %q, and the patterns %q", line, got, want)
		}
	}
}

func TestPlainCodeCutsAsThePatternsCut(t *testing.T) {
	for _, line := range codeLines {
		if got, want := plainCode(line), codeCut(line); got != want {
			t.Errorf("plainCode(%q) answers %q, and the patterns %q", line, got, want)
		}
	}
}

func TestANameReadsAsAWordAlone(t *testing.T) {
	for _, one := range []struct {
		line, name string
		want       bool
	}{
		{"the owner reads it", "owner", true},
		{"owner", "owner", true},
		{"the owners read it", "owner", false},
		{"co-owner.", "owner", true},
		{"nobody here", "owner", false},
		{"a.b stands", "a.b", true},
		{"aXb stands", "a.b", false},
		{"anything", "", false},
	} {
		for range 2 {
			if got := carriesTheName(one.line, one.name); got != one.want {
				t.Errorf("carriesTheName(%q, %q) answers %v, and wants %v", one.line, one.name, got, one.want)
			}
		}
	}
}
