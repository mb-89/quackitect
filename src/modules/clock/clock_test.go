// The minute moves when the fake clock ticks, and stands still otherwise.
// [[spec/design_output/model#io-modules-and-their-fakes]]
package clock

import (
	"context"
	"errors"
	"testing"
	"time"

	"quackitect/src/q"
)

var standsAt = time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)

// The waits a clock offers beside the time now. [[spec/tickets/go-waits-on-events]]
type waiter interface {
	After(span time.Duration) <-chan time.Time
	AfterFunc(span time.Duration, hand func()) (stop func() bool)
	WithTimeout(parent context.Context, span time.Duration) (context.Context, context.CancelFunc)
}

func waiterOf(t *testing.T, one any) waiter {
	t.Helper()
	found, ok := one.(waiter)
	if !ok {
		t.Fatalf("%T offers no After, AfterFunc and WithTimeout", one)
	}
	return found
}

func TestTheRealClockAndTheFakeWait(t *testing.T) {
	t.Parallel()
	waiterOf(t, New())
	waiterOf(t, NewFake(standsAt))
}

// [[spec/tickets/clock-test-asserts-q-clock]]
func TestTheRealClockAndTheFakeAreAQClock(t *testing.T) {
	t.Parallel()
	for name, one := range map[string]any{"real": New(), "fake": NewFake(standsAt)} {
		if _, ok := one.(q.Clock); !ok {
			t.Fatalf("the %s clock %T stands as no q.Clock", name, one)
		}
	}
}

func TestTheFakeFiresAfterOnTick(t *testing.T) {
	t.Parallel()
	fake := NewFake(standsAt)
	fired := waiterOf(t, fake).After(time.Second)
	fake.Tick(time.Second - time.Millisecond)
	select {
	case <-fired:
		t.Fatal("After fires before its span passes")
	default:
	}
	fake.Tick(time.Millisecond)
	select {
	case <-fired:
	default:
		t.Fatal("After stands unfired once its span passes")
	}
}

func TestTheFakeEndsAContextOnTick(t *testing.T) {
	t.Parallel()
	fake := NewFake(standsAt)
	bounded, cancel := waiterOf(t, fake).WithTimeout(context.Background(), time.Second)
	defer cancel()
	fake.Tick(time.Second)
	select {
	case <-bounded.Done():
		if !errors.Is(bounded.Err(), context.DeadlineExceeded) {
			t.Fatalf("the context ends on %v, and wants its deadline", bounded.Err())
		}
	default:
		t.Fatal("the context stands open once its span passes")
	}
}

func TestAStoppedAfterFuncNeverRuns(t *testing.T) {
	t.Parallel()
	fake := NewFake(standsAt)
	ran := false
	stop := waiterOf(t, fake).AfterFunc(time.Second, func() { ran = true })
	if !stop() {
		t.Fatal("stop reports the hand gone before its span")
	}
	fake.Tick(2 * time.Second)
	if ran {
		t.Fatal("a stopped hand runs")
	}
}

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
