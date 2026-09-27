// The minute moves when the fake clock ticks, and stands still otherwise.
// [[spec/design_output/model#io-modules-and-their-fakes]]
package clock

import (
	"testing"
	"time"

	"quackitect/src/q"
)

func TestTheMinuteMovesOnTick(t *testing.T) {
	c := q.New()
	hand := Registers(c)
	s := q.NewStore(c, nil)
	at := time.Date(2026, 1, 1, 0, 0, 30, 0, time.UTC)
	fake := NewFake(at)
	stop := Start(fake, func(values map[string]any) error {
		_, err := s.Commit(s.Snapshot().Revision, hand, values)
		return err
	})
	defer stop()
	first := at.Unix() / 60
	if got := s.Snapshot().Read(Port); got != first {
		t.Fatalf("the minute reads %v at start, not %d", got, first)
	}
	if fake.Now() != at {
		t.Fatalf("the fake reads %v with no tick, not %v", fake.Now(), at)
	}
	fake.Tick(time.Minute)
	if got := s.Snapshot().Read(Port); got != first+1 {
		t.Fatalf("the minute reads %v after a tick, not %d", got, first+1)
	}
}
