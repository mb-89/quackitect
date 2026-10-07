// The fake clock fires each wait on the tick past its span, earliest first,
// a stopped hand stays still, and its context names its deadline.
// [[spec/tickets/go-waits-on-events]]
package qtest

import (
	"context"
	"errors"
	"slices"
	"testing"
	"time"
)

var startsAt = time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)

func TestTheFakeFiresEachWaitOnTheTickPastItsSpan(t *testing.T) {
	t.Parallel()
	fake := NewFake(startsAt)
	fired := fake.After(2 * time.Second)
	var ran []string
	fake.AfterFunc(3*time.Second, func() { ran = append(ran, "late") })
	fake.AfterFunc(time.Second, func() { ran = append(ran, "early") })
	bounded, cancel := fake.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	fake.Tick(time.Second + time.Second/2)
	select {
	case <-fired:
		t.Fatal("After fires before its span passes")
	case <-bounded.Done():
		t.Fatal("the context ends before its span passes")
	default:
	}
	fake.Tick(2 * time.Second)
	select {
	case <-fired:
	default:
		t.Fatal("After stands unfired once its span passes")
	}
	select {
	case <-bounded.Done():
	default:
		t.Fatal("the context stands open once its span passes")
	}
	if !slices.Equal(ran, []string{"early", "late"}) {
		t.Fatalf("the hands run as %v, and want the earliest first", ran)
	}
}

func TestAStoppedHandNeverRuns(t *testing.T) {
	t.Parallel()
	fake := NewFake(startsAt)
	ran := false
	stop := fake.AfterFunc(time.Second, func() { ran = true })
	if !stop() {
		t.Fatal("the first stop reports the hand gone before its span")
	}
	if stop() {
		t.Fatal("a second stop reports a hand it already stopped")
	}
	fake.Tick(2 * time.Second)
	if ran {
		t.Fatal("a stopped hand runs")
	}
}

func TestTheContextNamesItsDeadlineAndEndsOnIt(t *testing.T) {
	t.Parallel()
	fake := NewFake(startsAt)
	bounded, cancel := fake.WithTimeout(context.Background(), time.Second)
	defer cancel()
	if at, ok := bounded.Deadline(); !ok || !at.Equal(startsAt.Add(time.Second)) {
		t.Fatalf("the context names %v, %v as its deadline", at, ok)
	}
	if bounded.Err() != nil {
		t.Fatalf("the context ends on %v before its deadline", bounded.Err())
	}
	fake.Tick(time.Second)
	if !errors.Is(bounded.Err(), context.DeadlineExceeded) {
		t.Fatalf("the context ends on %v, and wants its deadline", bounded.Err())
	}
}

func TestACancelledContextEndsCancelled(t *testing.T) {
	t.Parallel()
	fake := NewFake(startsAt)
	bounded, cancel := fake.WithTimeout(context.Background(), time.Second)
	cancel()
	fake.Tick(time.Second)
	if !errors.Is(bounded.Err(), context.Canceled) {
		t.Fatalf("a cancelled context ends on %v, and wants the cancel", bounded.Err())
	}
}
