package main

import "testing"

// A FLAG'S VALUE IS NOT A PATH TO SEARCH.
//
// pathsAmong knew six flags that take a value, and every other one left its
// value on the list. A bare word that is not a flag is read as a path, a
// relative path counts as inside the tree, and the search was refused by the
// message whose last line promises that a search outside is not.
//
// MEASURED. rg -n "func runningPath" -A 12 /tmp/wk98/src/engine/watch.go was
// refused with THE TREE IS INDEXED. The 12 after -A is a context count. It is
// bare and relative, so anyInside answered true, and the path under /tmp beside
// it never decided anything.
//
// This is the shape two earlier fixes closed already: a guard ruling on words
// it has not finished reading.
func TestAFlagsValueIsNotAPath(t *testing.T) {
	t.Parallel()
	work := "/home/user/quackitect"

	for _, outside := range []string{
		`rg -n "func runningPath" -A 12 /tmp/wk98/src/engine/watch.go`,
		`rg -n pattern -B 3 /tmp/somewhere`,
		`rg -n pattern -C 5 /tmp/somewhere`,
		`rg -n pattern -m 2 /tmp/somewhere`,
		`rg -n pattern --after-context 12 /tmp/somewhere`,
		`rg -n pattern --max-count 2 /tmp/somewhere`,
		`grep -n -A 4 pattern /tmp/somewhere`,
		`rg -n pattern -j 4 /tmp/somewhere`,
		`rg -n pattern --iglob !*.lock /tmp/somewhere`,
	} {
		if _, refused := ASearchOverTheTree(outside, work); refused {
			t.Errorf("a flag's value was read as a path, and a search outside the tree was refused: %s", outside)
		}
	}

	// AND THE TREE IS STILL GUARDED, which is the half that must not move.
	for _, inside := range []string{
		`rg -n pattern -A 12 src/engine`,
		`rg -n pattern -C 5 doc`,
		`grep -n -A 4 pattern src/engine/watch.go`,
		`rg -n pattern -m 2`,
	} {
		if _, refused := ASearchOverTheTree(inside, work); !refused {
			t.Errorf("a search that reaches the tree went through: %s", inside)
		}
	}
}
