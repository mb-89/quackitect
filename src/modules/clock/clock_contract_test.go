//go:build contract

// The contract of the clock: the real clock runs the suite qtest holds, and
// each wait fires past its span.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package clock

import (
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

func TestTheRealClockKeepsItsContract(t *testing.T) {
	qtest.ClockSuite(t, New(), func(time.Duration) {})
}
