// The fake index settles a change as one wave: a module fed twice by one
// change runs once, and a change during a wave waits for the next.
// [[spec/design_output/model#one-wave-settles-a-change]]
package qtest

import (
	"testing"

	"quackitect/src/q"
)

type xOf struct {
	X int `q:"t/x"`
}

type xAndA struct {
	X int `q:"t/x"`
	A int `q:"t/a"`
}

// X feeds A and B, and A feeds B, and seen holds each pair of X and A that B reads. [[spec/design_output/model#one-wave-settles-a-change]]
func diamond(during func(x int)) func(*q.Catalog) {
	return func(c *q.Catalog) {
		q.GivenIn(c, "t/x", 0, q.Doc("X"))
		q.DerivedIn(c, "t/a", 0, func(in xOf) int { during(in.X); return in.X * 2 }, q.Doc("A"))
		q.DerivedIn(c, "t/b", "", func(in xAndA) string { return seenPair(in.X, in.A) }, q.Doc("B"))
	}
}

var seen []string

func seenPair(x, a int) string {
	pair := string(rune('0'+x)) + ":" + string(rune('0'+a))
	seen = append(seen, pair)
	return pair
}

func TestTheDiamondRunsBOnceAfterA(t *testing.T) {
	seen = nil
	index := New(t, diamond(func(int) {}))
	index.Seed(map[string]any{"t/x": 1})
	if len(seen) != 1 || seen[0] != "1:2" {
		t.Fatalf("B reads %v after one change of X", seen)
	}
}

func TestAChangeDuringAWaveWaitsForTheNext(t *testing.T) {
	seen = nil
	var index *Index
	moved := false
	index = New(t, diamond(func(x int) {
		if x == 1 && !moved {
			moved = true
			index.Seed(map[string]any{"t/x": 3})
		}
	}))
	index.Seed(map[string]any{"t/x": 1})
	if len(seen) != 2 || seen[0] != "1:2" || seen[1] != "3:6" {
		t.Fatalf("B reads %v over a change during the wave", seen)
	}
}
