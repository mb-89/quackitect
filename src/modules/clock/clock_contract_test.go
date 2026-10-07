//go:build contract

// The contract of the clock: Now moves forward and Minute counts it, and each
// wait fires past its span, on the fake, the real clock and the test wall.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package clock

import (
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func clockSuite(t *testing.T, one q.Clock, pass func()) {
	before := one.Now()
	pass()
	after := one.Now()
	if !after.After(before) {
		t.Fatalf("the clock reads %v, then %v", before, after)
	}
	if Minute(after) != after.Unix()/60 {
		t.Fatalf("the minute of %v reads %d", after, Minute(after))
	}
}

func afterSuite(t *testing.T, one q.Clock, pass func()) {
	waits := waiterOf(t, one)
	fired := waits.After(time.Millisecond)
	ran := make(chan struct{})
	waits.AfterFunc(time.Millisecond, func() { close(ran) })
	pass()
	for name, each := range map[string]<-chan struct{}{"After": drained(fired), "AfterFunc": ran} {
		select {
		case <-each:
		case <-time.After(time.Second):
			t.Fatalf("%s stands unfired past its span", name)
		}
	}
}

func drained(fired <-chan time.Time) <-chan struct{} {
	out := make(chan struct{})
	go func() {
		<-fired
		close(out)
	}()
	return out
}

func TestClockKeepsItsContract(t *testing.T) {
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	t.Run("fake", func(t *testing.T) { clockSuite(t, fake, func() { fake.Tick(time.Millisecond) }) })
	t.Run("real", func(t *testing.T) { clockSuite(t, New(), func() { time.Sleep(time.Millisecond) }) })
	t.Run("fake waits", func(t *testing.T) { afterSuite(t, fake, func() { fake.Tick(time.Millisecond) }) })
	t.Run("real waits", func(t *testing.T) { afterSuite(t, New(), func() {}) })
	t.Run("wall", func(t *testing.T) { clockSuite(t, qtest.Wall(), func() { time.Sleep(time.Millisecond) }) })
	t.Run("wall waits", func(t *testing.T) { afterSuite(t, qtest.Wall(), func() {}) })
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

// A hand runs once its span passes, once alone, and stays still after its stop. Await reads whether the hand ran, the real clock blocking on it and the fake reading it at once. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func stopSuite(t *testing.T, one q.Clock, pass func(time.Duration), await func(<-chan struct{}) bool) {
	ran := make(chan struct{}, 2)
	one.AfterFunc(time.Millisecond, func() { ran <- struct{}{} })
	pass(time.Millisecond)
	if !await(ran) {
		t.Fatal("the hand runs nowhere once its span passes")
	}
	stopped := make(chan struct{}, 1)
	stop := one.AfterFunc(time.Hour, func() { stopped <- struct{}{} })
	stop()
	pass(2 * time.Hour)
	if took(ran) || took(stopped) {
		t.Fatal("the hand runs twice, or after its stop")
	}
}

func TestAfterFuncKeepsItsContract(t *testing.T) {
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	t.Run("fake", func(t *testing.T) { stopSuite(t, fake, fake.Tick, took) })
	t.Run("real", func(t *testing.T) {
		stopSuite(t, New(), func(time.Duration) {}, func(ran <-chan struct{}) bool { <-ran; return true })
	})
}
