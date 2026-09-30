// The place chord: p, then a digit, posts the place the base file names.
// [[spec/design_output/pull#the-queue-is-an-outline]]

package main

import (
	"strings"
	"testing"
)

// [[spec/design_output/pull#the-queue-is-an-outline]]
func TestPThenADigitPostsThePlace(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = pressed(toRow(m, "a-loose-one"), "p")
	if !theWork(m).Placing || !strings.Contains(theWork(m).Notice, "1 to 9") {
		t.Fatalf("p opens the chord and says what it waits for, and the tab says %q", theWork(m).Notice)
	}
	m = posting(m, "1")
	posts := postsIn(m)
	if theWork(m).Placing || len(posts) != 1 || posts[0].Name != "work/place" || string(posts[0].Input) != `{"name":"a-loose-one","n":1}` {
		t.Fatalf("p then 1 posts work/place with the row at 1, and posts %+v", posts)
	}
	m = pressed(toRow(m, "a-child"), "p", "x")
	if theWork(m).Placing || theWork(m).Notice != "" || len(postsIn(m)) != 1 {
		t.Fatalf("a key that is no digit drops the chord and posts nothing, and the tab says %q", theWork(m).Notice)
	}
	if noteAt(t, root) != childNote {
		t.Fatal("the chord writes no file")
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestTheSiblingsOfARowStandAtItsOwnLevel(t *testing.T) {
	t.Parallel()
	m, _ := editWindow(t)
	if said := theWork(m).Tree.Siblings("a-child"); len(said) != 1 || said[0].Name != "a-child" {
		t.Fatalf("a ticket under a group stands beside its group's other tickets, and reads %v", said)
	}
	if said := theWork(m).Tree.Siblings("a-loose-one"); len(said) != 2 {
		t.Fatalf("a root stands beside the other roots, and reads %v", said)
	}
	if theWork(m).Tree.Siblings("nobody") != nil {
		t.Fatal("a name the tree holds nowhere has no siblings")
	}
}
