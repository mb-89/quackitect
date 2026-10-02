// Each prefilter in front of a pattern answers what the pattern answers, line
// for line, so the sweep reads the same findings and spends less on them.
// [[spec/tickets/check-patterns-compile-once]]
package check

import "testing"

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
