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
	t.Run("real", func(t *testing.T) { clockSuite(t, New(), func() { time.Sleep(time.Millisecond) }) })
}
