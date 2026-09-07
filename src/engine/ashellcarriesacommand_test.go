package main

import (
	"strings"
	"testing"
)

// A SHELL WITH -c CARRIES A COMMAND, AND EVERY GUARD READ THE WORD sh.
//
// pipeline cut at every separator, quotes and all, so the semicolon inside
// sh -c "cd src; go test ./..." split the string and go test became the first
// word of a part. The cut learnt to read quotes, which it had to, because a
// pipe inside a quoted pattern was cutting a search in two. The catch went with
// it, and nothing had ever taught it: the guards caught this by accident.
//
// THE GUARDS ARE DRIVEN, NOT THE SPLIT. What a part is is this tree's own
// business, and what a hand may run is the thing the rule is about.
func TestAShellCarryingACommandIsOpened(t *testing.T) {
	t.Parallel()
	const work = "/home/user/quackitect"
	for _, one := range []struct {
		what, command string
		refused       bool
	}{
		{"a shell carrying go test", `sh -c "cd src; go test ./..."`, true},
		{"a shell carrying go test in single quotes", `bash -c 'go test ./...'`, true},
		{"a shell with no -c", `sh util/git/land.sh "a message" doc/work/wk-000.md`, false},
		{"the words in somebody's prose", `se work --detail "sh -c go test"`, false},
	} {
		why, refused := ATestRunByHand(one.command, work)
		if refused != one.refused {
			t.Errorf("%s: refused %v and it should be %v, for %q", one.what, refused, one.refused, one.command)
			continue
		}
		if refused && !strings.Contains(why, "THE ENGINE OWNS THE TESTS") {
			t.Errorf("%s: the refusal does not say whose the tests are: %s", one.what, why)
		}
	}

	// AND THE SEARCH GUARD READS THE SAME PARTS, because they are one list.
	if _, refused := ASearchOverTheTree(`sh -c "cd src; rg -n LoadConfig ."`, work); !refused {
		t.Error("a search over the tree went through inside a shell's -c argument")
	}
	if _, refused := ASearchOverTheTree(`sh -c "rg -n LoadConfig /root/notes"`, work); refused {
		t.Error("a search outside the tree was refused inside a shell's -c argument")
	}

	// AND THE INNER COMMAND IS A PIPELINE OF ITS OWN. A searcher with no path
	// reads the tree where it stands, and reads another program's output behind
	// a pipe. Wrapping it in a shell does not put it behind one.
	if _, refused := ASearchOverTheTree(`sh -c "rg -n LoadConfig"`, work); !refused {
		t.Error("a searcher with no path read as though it stood behind a pipe")
	}
}
