package main

import "testing"

// A SEPARATOR INSIDE QUOTES IS PART OF THE PATTERN, NOT A SECOND PROGRAM.
//
// The guard splits a command into the programs it runs before anything reads
// quotes. A pipe or a semicolon inside a quoted pattern is one of those
// separators, so the pattern was cut in two and each half was judged as its own
// program. The half after the cut carried the path, the half before it carried
// the searcher and no path, and a searcher with no path reads the tree.
//
// So a search whose every path is outside the tree was refused by the message
// whose last line promises it would not be. That is the worst shape a guard can
// have: the reader does what the refusal says and is refused again.
//
// THE OTHER HALF MUST NOT MOVE. A separator outside quotes still cuts, because
// that is how a search behind a pipe is judged, and a search that reaches the
// tree is still refused.
func TestASeparatorInsideQuotesDoesNotCutTheCommand(t *testing.T) {
	t.Parallel()
	work := "/home/user/quackitect"

	for _, outside := range []string{
		`rg -n "agent|proxy" /root/.ccr/README.md`,
		`rg -n "one;two" /tmp/somewhere`,
		`rg -n 'a && b' /root/notes`,
		`rg -n "a > b" /tmp/somewhere`,
	} {
		if _, refused := ASearchOverTheTree(outside, work); refused {
			t.Errorf("a quoted pattern was cut, and a search outside the tree was refused: %s", outside)
		}
	}

	// A SEPARATOR OUTSIDE QUOTES STILL CUTS, and each half is still judged.
	if _, refused := ASearchOverTheTree(`go test ./... 2>&1 | grep FAIL`, work); refused {
		t.Error("grep behind a pipe reads its input, and it was refused")
	}
	for _, inside := range []string{
		`cd src; rg -e LoadConfig .`,
		`rg -n "a|b" src/engine`,
	} {
		if _, refused := ASearchOverTheTree(inside, work); !refused {
			t.Errorf("a search that reaches the tree went through: %s", inside)
		}
	}
}
