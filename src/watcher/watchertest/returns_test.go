// A stop that hangs reads as hung once the wall passes the span, and a quick
// stop answers its own error.
// [[spec/tickets/go-waits-on-events]]
package watchertest

import (
	"errors"
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

func TestAHungStopReadsAsHungThroughTheWall(t *testing.T) {
	t.Parallel()
	block := make(chan struct{})
	defer close(block)
	if _, hung := stopsWithin(qtest.Wall(), 10*time.Millisecond, func() error { <-block; return nil }); !hung {
		t.Fatal("a stop that never returns reads as returned")
	}
}

func TestAQuickStopAnswersItsError(t *testing.T) {
	t.Parallel()
	want := errors.New("the stop fails")
	if err, hung := stopsWithin(qtest.Wall(), Hung, func() error { return want }); hung || !errors.Is(err, want) {
		t.Fatalf("a quick stop answers %v, hung %v", err, hung)
	}
}
