package main

import "testing"

// A SEARCH OUTSIDE THE TREE GOES THROUGH, BECAUSE THE REFUSAL PROMISES IT WILL.
//
// Its last line reads: OUTSIDE THIS TREE THE DISK IS YOURS. A call naming rg, a
// pattern and a path under /root was refused with exactly that message, so a
// reader who did what the refusal said got the refusal again. That is the worst
// shape a guard can have: it teaches nothing and leaves no next move.
//
// The cause is the redirection. 2>/dev/null was read as a path, and a relative
// path is inside the tree, so one word of shell plumbing turned a search of the
// disc into a search of the tree.
func TestASearchOutsideTheTreeIsLeftAlone(t *testing.T) {
	t.Parallel()
	work := "/home/user/quackitect"

	for _, outside := range []string{
		"rg --count-matches quackitect /root/.ccr/README.md 2>/dev/null",
		"rg pattern /tmp/somewhere",
		"rg pattern /tmp/somewhere > /tmp/out.txt",
		"grep -r pattern /root/notes",
	} {
		if _, refused := ASearchOverTheTree(outside, work); refused {
			t.Errorf("a search whose every path is outside the tree was refused: %q", outside)
		}
	}

	// AND THE TREE IS STILL GUARDED, which is the half that must not move.
	for _, inside := range []string{
		"rg pattern src/engine 2>/dev/null",
		"rg pattern",
		"rg pattern /home/user/quackitect/doc",
		"rg pattern /tmp/elsewhere src/engine",
	} {
		if _, refused := ASearchOverTheTree(inside, work); !refused {
			t.Errorf("a search that reaches the tree went through, so the index door is not held: %q", inside)
		}
	}
}
