// A find by function finds the line defining the name in each shape the
// bridge reads, and the body runs to the close that balances its first open.
// [[spec/tickets/find-and-wait-in-go]]
package search

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

// [[spec/tickets/find-and-wait-in-go]]
func TestDefinitionOfMatchesEachShape(t *testing.T) {
	defines := definitionOf("mark")
	for _, line := range []string{
		"export function mark(a) {",
		"function* mark (a) {",
		"const mark = (a) => a;",
		"let mark= 1;",
		"  async mark(a, b) {",
		"  mark() {",
		"func mark(a int) int {",
		"func (d *door) mark(a int) {",
		"func mark[T any](a T) {",
	} {
		if !defines.MatchString(line) {
			t.Errorf("the definition of mark reads %q as no definition", line)
		}
	}
	for _, line := range []string{"x := mark(1)", "function marked(a) {", "const marks = 1;", "  return mark(a) + 1;"} {
		if defines.MatchString(line) {
			t.Errorf("the definition of mark reads %q as a definition", line)
		}
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestBodyFromSkipsBracesInStringsAndComments(t *testing.T) {
	lines := []string{
		"package x",
		"func mark(a int) string {",
		"\tif a > 0 { // a } closing in a comment",
		"\t\treturn \"}\"",
		"\t}",
		"\tb := '{'",
		"\tc := `}`",
		"\treturn \"\\\"{\" + string(b) + c",
		"}",
		"func after() {}",
	}
	if got, want := strings.Join(bodyFrom(lines, 1), "\n"), strings.Join(lines[1:9], "\n"); got != want {
		t.Errorf("the body reads %q, and wants the lines to the close that balances its open: %q", got, want)
	}
	if got := bodyFrom([]string{"func open() {", "\tx := 1"}, 0); len(got) != 2 {
		t.Errorf("a body with no close reads %q, and wants every line to the end", got)
	}
}

// A find with neither words nor a function says what it takes, and asks the index nothing. [[spec/tickets/find-and-wait-in-go]]
func TestAFindWithNoWordsSaysWhatItTakes(t *testing.T) {
	asked := 0
	from := Outside{Root: t.TempDir(), Find: func(string) ([]Row, error) { asked++; return nil, nil }}
	said, err := Accept(from)(q.Request{Module: Module, Verb: findVerb, Args: Find{Words: "  "}})
	if err != nil {
		t.Fatal(err)
	}
	if want := "find takes the words to look for, or a function name."; said != want {
		t.Errorf("the find answers %q, and wants %q", said, want)
	}
	if asked != 0 {
		t.Errorf("the find asks the index %d times, and wants none", asked)
	}
}
