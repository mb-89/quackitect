//go:build contract

// The contract of the clock: Now moves forward and Minute counts it, on the
// fake and on the real clock.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package clock

import (
	"testing"
	"time"
)

func clockSuite(t *testing.T, one Clock, pass func()) {
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

func TestClockKeepsItsContract(t *testing.T) {
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	t.Run("fake", func(t *testing.T) { clockSuite(t, fake, func() { fake.Tick(time.Millisecond) }) })
	real := New()
	t.Run("real", func(t *testing.T) {
		clockSuite(t, real, func() {
			passed := make(chan struct{})
			real.After(time.Millisecond, func(time.Time) { close(passed) })
			<-passed
		})
	})
}

// Whether a hand sent on the channel, read at once. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func took(ran <-chan time.Time) bool {
	select {
	case <-ran:
		return true
	default:
		return false
	}
}

// The hand runs once its span passes, once alone, and before any stop. Await reads whether the hand ran, the real clock blocking on it and the fake reading it at once. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func afterSuite(t *testing.T, one Clock, pass func(time.Duration), await func(<-chan time.Time) bool) {
	ran := make(chan time.Time, 2)
	one.After(time.Millisecond, func(at time.Time) { ran <- at })
	pass(time.Millisecond)
	if !await(ran) {
		t.Fatal("the hand runs nowhere once its span passes")
	}
	stopped := make(chan time.Time, 1)
	stop := one.After(time.Hour, func(at time.Time) { stopped <- at })
	stop()
	pass(2 * time.Hour)
	if took(ran) || took(stopped) {
		t.Fatal("the hand runs twice, or after its stop")
	}
}

func TestAfterKeepsItsContract(t *testing.T) {
	fake := NewFake(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	t.Run("fake", func(t *testing.T) { afterSuite(t, fake, fake.Tick, took) })
	t.Run("real", func(t *testing.T) {
		afterSuite(t, New(), func(time.Duration) {}, func(ran <-chan time.Time) bool { <-ran; return true })
	})
}
