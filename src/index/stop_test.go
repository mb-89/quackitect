// A stop call asks main for the door's stop, and ends the process past its bound.
// [[spec/tickets/the-index-stops-its-tools]]
package index

import (
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

func TestAStopCallAsksMainForTheDoorsStop(t *testing.T) {
	exited := make(chan int, 1)
	go stopsAfter(qtest.NewFake(time.Time{}), t.TempDir(), 0, time.Hour, func(code int) { exited <- code })
	<-stopAsked
	select {
	case code := <-exited:
		t.Fatalf("the process ends at %d inside the bound, before the door's stop runs", code)
	default:
	}
}

func TestAStopOutlastingItsBoundEndsTheProcess(t *testing.T) {
	exited := make(chan int, 1)
	go stopsAfter(qtest.NewFake(time.Time{}), t.TempDir(), 0, 0, func(code int) { exited <- code })
	if code := <-exited; code != 0 {
		t.Fatalf("the process ends at %d past the bound, and wants 0", code)
	}
}
