// The fake clock and the test wall both stand as a q.Clock, so every caller
// takes either where it takes the real one.
// [[spec/tickets/go-waits-on-events]]
package q_test

import (
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestTheFakeAndTheWallAreAQClock(t *testing.T) {
	t.Parallel()
	for name, one := range map[string]any{"fake": qtest.NewFake(time.Unix(0, 0)), "wall": qtest.Wall()} {
		if _, ok := one.(q.Clock); !ok {
			t.Fatalf("the %s %T stands as no q.Clock", name, one)
		}
	}
}
