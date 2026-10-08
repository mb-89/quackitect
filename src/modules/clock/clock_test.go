// The minute moves when the fake clock ticks, and stands still otherwise.
// [[spec/design_output/model#io-modules-and-their-fakes]]
package clock

import (
	"testing"
	"time"

	"quackitect/src/q"
)

// The minute commits at start and as it turns, a poll inside the same minute commits nothing, and a stopped clock commits no more, so two clocks started apart agree within a poll. [[spec/tickets/process-shadow-reads-clean]]
func TestTheMinuteCommitsAtStartAndAsItTurns(t *testing.T) {
	c := q.New()
	hand := Registers(c)
	s := q.NewStore(c)
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 30, 0, time.UTC))
	commits := 0
	stop := Start(fake, func(values map[string]any) error {
		commits++
		_, err := s.Commit(s.Snapshot().Revision, hand, values)
		return err
	})
	first := fake.Now().Unix() / 60
	for _, step := range []struct {
		span    time.Duration
		minute  int64
		commits int
	}{{29 * time.Second, first, 1}, {time.Second, first + 1, 2}} {
		fake.Tick(step.span)
		if got := s.Snapshot().Read(Port); got != step.minute || commits != step.commits {
			t.Fatalf("the minute reads %v over %d commits, and wants %d over %d", got, commits, step.minute, step.commits)
		}
	}
	stop()
	fake.Tick(time.Minute)
	if commits != 2 {
		t.Fatalf("a stopped clock commits %d times, past the two before its stop", commits)
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
