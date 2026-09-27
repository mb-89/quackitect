// A moved input runs its provider, and a burst during a run leaves one
// pending run and no overlap. [[spec/design_output/model#the-provider-kinds]]
package q

import (
	"sync"
	"testing"
	"time"
)

const runWait = time.Second

type countOf struct {
	N int `q:"t/n"`
}

func spawned(run func()) { go run() }

func failOn(t *testing.T) func(name string, err error) {
	return func(name string, err error) { t.Errorf("the run of %s answers %v", name, err) }
}

func TestAMovedInputRunsItsProvider(t *testing.T) {
	c := New()
	hand := GivenIn(c, "t/n", 0)
	DerivedIn(c, "t/double", 0, func(in countOf) int { return in.N * 2 })
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	if got := s.Snapshot().Read("t/double"); got != 6 {
		t.Fatalf("t/double reads %v after t/n moves to 3", got)
	}
}

func TestTwoMovesDuringARunLeaveOnePendingRunAndNoOverlap(t *testing.T) {
	c := New()
	hand := GivenIn(c, "t/n", 0)
	started := make(chan struct{}, 1)
	release := make(chan struct{})
	var held sync.Mutex
	inFlight, most, runs := 0, 0, 0
	DerivedIn(c, "t/slow", 0, func(in countOf) int {
		held.Lock()
		inFlight, runs = inFlight+1, runs+1
		most = max(most, inFlight)
		held.Unlock()
		select {
		case started <- struct{}{}:
		default:
		}
		<-release
		held.Lock()
		inFlight--
		held.Unlock()
		return in.N
	})
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	seed(t, s, hand, "t/n", 1)
	select {
	case <-started:
	case <-time.After(runWait):
		t.Fatalf("no run of t/slow starts after t/n moves")
	}
	seed(t, s, hand, "t/n", 2)
	seed(t, s, hand, "t/n", 3)
	close(release)
	scheduler.Settle()
	held.Lock()
	defer held.Unlock()
	if runs != 2 || most != 1 {
		t.Fatalf("t/slow runs %d times, at most %d at once", runs, most)
	}
	if got := s.Snapshot().Read("t/slow"); got != 3 {
		t.Fatalf("t/slow reads %v after the pending run", got)
	}
}

func TestAMoveAfterStopRunsNothing(t *testing.T) {
	c := New()
	hand := GivenIn(c, "t/n", 0)
	DerivedIn(c, "t/double", 0, func(in countOf) int { return in.N * 2 })
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	scheduler.Stop()
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	if got := s.Snapshot().Read("t/double"); got != 0 {
		t.Fatalf("t/double reads %v after a move past the stop", got)
	}
}
