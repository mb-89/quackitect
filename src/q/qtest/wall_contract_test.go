//go:build contract

// The wall and the fake keep the q.Clock contract.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package qtest_test

import (
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

func TestTheWallAndTheFakeKeepTheClockContract(t *testing.T) {
	fake := qtest.NewFake(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	t.Run("fake", func(t *testing.T) { qtest.ClockSuite(t, fake, fake.Tick) })
	t.Run("wall", func(t *testing.T) { qtest.ClockSuite(t, qtest.Wall(), func(time.Duration) {}) })
}
