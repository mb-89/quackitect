// A stop call asks main for the door's stop, and ends the process past its bound.
// [[spec/tickets/the-index-stops-its-tools]]
package index // level0: InPackageTest - it drives the unexported stopsAfter and stopAsked

import (
	"testing"
	"time"
)

// The span a case waits for a stop call's ask to reach main. [[spec/tickets/the-index-stops-its-tools]]
const stopAskWithin = time.Second

// level0: FixtureOutsideHome - the case reads a fresh root of its own
func TestAStopCallAsksMainForTheDoorsStop(t *testing.T) {
	t.Parallel()
	exited := make(chan int, 1)
	go stopsAfter(t.TempDir(), 0, time.Hour, func(code int) { exited <- code })
	select {
	case <-stopAsked:
	case <-time.After(stopAskWithin):
		t.Fatal("a stop call asks main for nothing, so the door's stop never runs")
	}
	select {
	case code := <-exited:
		t.Fatalf("the process ends at %d inside the bound, before the door's stop runs", code)
	default:
	}
}

// level0: FixtureOutsideHome - the case reads a fresh root of its own
func TestAStopOutlastingItsBoundEndsTheProcess(t *testing.T) {
	t.Parallel()
	exited := make(chan int, 1)
	go stopsAfter(t.TempDir(), 0, 0, func(code int) { exited <- code })
	select {
	case code := <-exited:
		if code != 0 {
			t.Fatalf("the process ends at %d past the bound, and wants 0", code)
		}
	case <-time.After(stopAskWithin):
		t.Fatal("a stop outlasting its bound leaves the process standing")
	}
}
