// A manifest reads each file as the ops before it leave it, and refuses whole.
// [[spec/tickets/edit-tools-answer-in-go]]
package edits

import (
	"strings"
	"testing"
)

// [[spec/tickets/edit-tools-answer-in-go]]
func TestEachOpReadsTheFileTheOpsBeforeItLeave(t *testing.T) {
	held := map[string]Held{"a.txt": {Exists: true, Text: "one\n"}}
	took := Applied(held, []Op{
		{File: "a.txt", Old: "one", New: "two"},
		{File: "a.txt", Op: "append", New: "three\n"},
		{File: "a.txt", Op: "regex", Pattern: "t(\\w+)", Replacement: "T$1"},
		{File: "b.txt", Op: "create", New: "new\n"},
	})
	if took.Why != "" || len(took.Files) != 2 {
		t.Fatalf("the manifest answers %+v", took)
	}
	if one := took.Files[0]; one.Was != "one\n" || one.Made != "Two\nThree\n" || one.Born {
		t.Errorf("a.txt reads %+v", one)
	}
	if one := took.Files[1]; !one.Born || one.Made != "new\n" {
		t.Errorf("b.txt reads %+v", one)
	}
	refused := Applied(held, []Op{{File: "a.txt", Old: "one", New: "x"}, {File: "a.txt", Old: "one", New: "y"}})
	if refused.Why != "edit 2 (a.txt): the text stands nowhere in the file. Read it and copy the bytes exactly" || refused.Files != nil {
		t.Errorf("a second op over the text the first moved answers %+v", refused)
	}
}

// A replacement reads as JavaScript reads it: a group by its number or its name, the whole match, and a dollar standing alone. [[spec/tickets/regex-replacements-read-js-groups]]
func TestAReplacementReadsAsJavaScriptReadsIt(t *testing.T) {
	for _, one := range []struct{ pattern, replacement, want string }{
		{`(\d+)px`, "$1rem", "a 12rem b"},
		{`(\d+)px`, "[$&]", "a [12px] b"},
		{`(\d+)px`, "$$1", "a $1 b"},
		{`(\d+)px`, "$9 $x", "a $9 $x b"},
		{`(?P<n>\d+)px`, "$<n>em", "a 12em b"},
	} {
		took := Applied(map[string]Held{"a.txt": {Exists: true, Text: "a 12px b"}}, []Op{{File: "a.txt", Op: "regex", Pattern: one.pattern, Replacement: one.replacement}})
		if took.Why != "" || took.Files[0].Made != one.want {
			t.Errorf("%s over a 12px b reads %+v, and wants %q", one.replacement, took, one.want)
		}
	}
	refused := Applied(map[string]Held{"a.txt": {Exists: true, Text: "a 12px b"}}, []Op{{File: "a.txt", Op: "regex", Pattern: "px", Replacement: "$`"}})
	if !strings.Contains(refused.Why, "the text before the match") {
		t.Errorf("a replacement naming the text before the match answers %q", refused.Why)
	}
}

// [[spec/tickets/edit-regex-names-its-limit]]
func TestAPatternNamesTheConstructGoLacks(t *testing.T) {
	for pattern, name := range map[string]string{`a(?=b)`: "a lookaround", `(?<!a)b`: "a lookaround", `(a)\1`: "a backreference", `(?<x>a)\k<x>`: "a backreference"} {
		if _, err := Compiled(pattern, ""); err == nil || !strings.Contains(err.Error(), "the pattern names "+name+", which Go regexp takes nowhere") {
			t.Errorf("%s compiles to %v, and wants a refusal naming %s", pattern, err, name)
		}
	}
	if _, err := Compiled(`a\\1(b)`, "i"); err != nil {
		t.Errorf("an escaped backslash before a digit reads as a backreference: %v", err)
	}
	took := Applied(map[string]Held{"a.txt": {Exists: true, Text: "ab\n"}}, []Op{{File: "a.txt", Op: "regex", Pattern: `a(?=b)`}})
	if !strings.Contains(took.Why, "edit 1 (a.txt): the pattern compiles to nothing: the pattern names a lookaround") {
		t.Errorf("a regex op over a lookaround answers %q", took.Why)
	}
}
