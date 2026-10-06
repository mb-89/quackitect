// Each prefilter in front of a pattern answers what the pattern answers, line
// for line, so the sweep reads the same findings and spends less on them.
// [[spec/tickets/check-patterns-compile-once]]
package check

import (
	"strings"
	"testing"
)

// The ceilings the size cases hold a file and a function to. [[spec/design_output/level0#the-size-ceiling]]
const (
	caseFileCeiling     = 10
	caseFunctionCeiling = 4
)

// A text of the given count of plain lines. [[spec/design_output/level0#the-size-ceiling]]
func linesOf(count int) string {
	return strings.Repeat("x\n", count-1) + "x"
}

// The rules of the named kind the text rules answer for one file under the case ceilings. [[spec/design_output/level0#the-size-ceiling]]
func sizeFound(path, text, rule string) []Finding {
	tree := TreeOver("/tree", Texts{path: text})
	out := []Finding{}
	for _, one := range textFaults(tree, path, caseFunctionCeiling, caseFileCeiling, "") {
		if one.Rule == rule {
			out = append(out, one)
		}
	}
	return out
}

func TestACodeFileOneLinePastTheCeilingMeetsFileCeilingAtItsFirstLine(t *testing.T) {
	said := sizeFound("src/a.go", linesOf(caseFileCeiling+1), FileCeiling)
	if len(said) != 1 || said[0].Line != 1 || said[0].File != "src/a.go" {
		t.Fatalf("the file past the ceiling meets %v, and wants one FileCeiling at line 1", said)
	}
}

func TestACodeFileAtTheCeilingMeetsNoFileCeiling(t *testing.T) {
	if said := sizeFound("src/a.go", linesOf(caseFileCeiling), FileCeiling); len(said) != 0 {
		t.Fatalf("the file at the ceiling meets %v, and wants nothing", said)
	}
}

func TestAProseFilePastTheCeilingMeetsNoFileCeiling(t *testing.T) {
	if said := sizeFound("spec/a.md", linesOf(caseFileCeiling+1), FileCeiling); len(said) != 0 {
		t.Fatalf("the prose file meets %v, and the ceiling covers code files alone", said)
	}
}

func TestAFunctionPastItsCeilingMeetsFunctionCeilingAtItsOpeningLine(t *testing.T) {
	text := "package a\n\nfunc long() {\n" + linesOf(caseFunctionCeiling) + "\n}\n"
	said := sizeFound("src/a.go", text, FunctionCeiling)
	if len(said) != 1 || said[0].Line != 3 {
		t.Fatalf("the long function meets %v, and wants one FunctionCeiling at line 3", said)
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
