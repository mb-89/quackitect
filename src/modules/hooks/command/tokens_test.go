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

// A shell write's path reads with its dot segments folded, so a free prefix followed by .. lands on the prose the rule guards, and a .. after a name stands. [[spec/tickets/shell-write-paths-clean]]
func TestAShellWriteThroughDotDotLandsOnTheGuardedProse(t *testing.T) {
	for command, want := range map[string]string{
		"echo x > .se/../AGENTS.md":               "AGENTS.md",
		"echo x >> ./.se/./../AGENTS.md":          "AGENTS.md",
		"echo x > node_modules/a/../../AGENTS.md": "AGENTS.md",
		"echo x | tee .git/../spec/notes.md":      "spec/notes.md",
	} {
		said := writesAPath(command)
		if len(said) != 1 || said[0].path != want {
			t.Errorf("writesAPath(%q) reads %+v, want one write into %s", command, said, want)
		}
	}
	for path, want := range map[string]string{".se/../AGENTS.md": "AGENTS.md", "a/..": ".", "$HOME/../.se/x": "$HOME/../.se/x", "../x": "../x", "./": ""} {
		if got := Clean(path); got != want {
			t.Errorf("Clean(%q) reads %q, want %q", path, got, want)
		}
	}
}
