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
	s := q.NewStore(c)
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

func TestAStoppedClockCommitsNoMinute(t *testing.T) {
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	commits := 0
	stop := Start(fake, func(map[string]any) error {
		commits++
		return nil
	})
	stop()
	fake.Tick(time.Minute)
	if commits != 1 {
		t.Fatalf("the clock commits %d times, past the one at start", commits)
	}
}

// The minute commits as it turns, and a poll inside the same minute commits nothing, so two clocks started apart agree within a poll. [[spec/tickets/process-shadow-reads-clean]]
func TestTheMinuteCommitsAsItTurns(t *testing.T) {
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 30, 0, time.UTC))
	var minutes []any
	stop := Start(fake, func(values map[string]any) error {
		minutes = append(minutes, values[Port])
		return nil
	})
	defer stop()
	fake.Tick(29 * time.Second)
	if len(minutes) != 1 {
		t.Fatalf("the clock commits %v before the minute turns, and wants the one at start", minutes)
	}
	fake.Tick(time.Second)
	if len(minutes) != 2 || minutes[1] != minutes[0].(int64)+1 {
		t.Fatalf("the clock commits %v as the minute turns, and wants the next minute", minutes)
	}
}

// Only the clock's own writer commits the minute. [[spec/tickets/commits-name-their-writer]]
func TestTheMinuteRefusesAnotherWriter(t *testing.T) {
	c := q.New()
	Registers(c)
	other := q.OutIn(c, "t/other", 0)
	s := q.NewStore(c)
	if _, err := s.Commit(0, other, map[string]any{Port: int64(1)}); err == nil {
		t.Fatalf("a commit of %s as another writer lands", Port)
	}
	if got := s.Snapshot().Read(Port); got != int64(0) {
		t.Fatalf("the minute reads %v after the refusal", got)
	}
}
