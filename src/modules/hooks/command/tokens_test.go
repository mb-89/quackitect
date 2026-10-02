// The parse the command rules read: words, operators, quotes and escapes.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"reflect"
	"testing"
)

func TestTokensOfSplitsOperatorsAndQuotes(t *testing.T) {
	for _, one := range []struct {
		text string
		want []Token
	}{
		{"echo hi > a.md", []Token{{Text: "echo"}, {Text: "hi"}, {Text: ">", Op: true}, {Text: "a.md"}}},
		{"a&&b||c", []Token{{Text: "a"}, {Text: "&&", Op: true}, {Text: "b"}, {Text: "||", Op: true}, {Text: "c"}}},
		{`git commit -m "a b" ''`, []Token{{Text: "git"}, {Text: "commit"}, {Text: "-m"}, {Text: "a b"}, {Text: ""}}},
		{`say "a \"b\""`, []Token{{Text: "say"}, {Text: `a "b"`}}},
		{"a\nb", []Token{{Text: "a"}, {Text: ";", Op: true}, {Text: "b"}}},
		{"x 2>&1 <<<y", []Token{{Text: "x"}, {Text: "2"}, {Text: ">&", Op: true}, {Text: "1"}, {Text: "<<<", Op: true}, {Text: "y"}}},
		{`a\ b`, []Token{{Text: "a b"}}},
	} {
		if got := TokensOf(one.text); !reflect.DeepEqual(got, one.want) {
			t.Errorf("TokensOf(%q) reads %+v, want %+v", one.text, got, one.want)
		}
	}
}

func TestBaseNameAndCleanReadAPath(t *testing.T) {
	for word, want := range map[string]string{"/usr/bin/git": "git", `C:\bin\node.EXE`: "node", "./RUNME.sh": "RUNME.sh", "": "", "a/": ""} {
		if got := BaseName(word); got != want {
			t.Errorf("BaseName(%q) reads %q, want %q", word, got, want)
		}
	}
	if got := Clean(`.\spec\a.md`); got != "spec/a.md" {
		t.Errorf("Clean reads %q, want spec/a.md", got)
	}
}
