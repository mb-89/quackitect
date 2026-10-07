// The contract of a q.Clock: each wait fires past its span as the time moves
// on, a hand runs once, and a stopped hand stays still. The fake, the wall and
// the real clock each run it.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package qtest

import (
	"context"
	"errors"
	"testing"
	"time"

	"quackitect/src/q"
)

// The span a wait has to fire in, read off the wall, past which the suite fails the wait. [[spec/tickets/go-waits-on-events]]
const firesWithin = time.Second

// Runs the contract over one clock, where pass moves its time on by a span: the fake ticks, and a real clock passes nothing. [[spec/design_output/model#the-fake-keeps-a-contract]]
func ClockSuite(t *testing.T, one q.Clock, pass func(time.Duration)) {
	t.Helper()
	before := one.Now()
	fired := one.After(time.Millisecond)
	ran := make(chan struct{}, 2)
	one.AfterFunc(time.Millisecond, func() { ran <- struct{}{} })
	bounded, cancel := one.WithTimeout(context.Background(), time.Millisecond)
	defer cancel()
	pass(time.Millisecond)
	fires(t, "After", drained(fired))
	fires(t, "AfterFunc", ran)
	fires(t, "WithTimeout", bounded.Done())
	if !errors.Is(bounded.Err(), context.DeadlineExceeded) {
		t.Fatalf("the context ends on %v, and wants its deadline", bounded.Err())
	}
	if after := one.Now(); !after.After(before) {
		t.Fatalf("the clock reads %v, then %v past its waits", before, after)
	}
	stopped := make(chan struct{}, 1)
	stop := one.AfterFunc(time.Hour, func() { stopped <- struct{}{} })
	if !stop() {
		t.Fatal("stop reports the hand gone before its span")
	}
	pass(2 * time.Hour)
	if took(ran) || took(stopped) {
		t.Fatal("the hand runs twice, or after its stop")
	}
}

// Fails the case where the wait stands unfired within its bound. [[spec/design_output/model#the-fake-keeps-a-contract]]
func fires(t *testing.T, name string, ready <-chan struct{}) {
	t.Helper()
	select {
	case <-ready:
	case <-Wall().After(firesWithin):
		t.Fatalf("%s stands unfired past its span", name)
	}
}

// Closes once the wait sends its time. [[spec/design_output/model#the-fake-keeps-a-contract]]
func drained(fired <-chan time.Time) <-chan struct{} {
	out := make(chan struct{})
	go func() {
		<-fired
		close(out)
	}()
	return out
}

// Whether a hand sent on the channel, read at once. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func took(ran <-chan struct{}) bool {
	select {
	case <-ran:
		return true
	default:
		return false
	}
}
