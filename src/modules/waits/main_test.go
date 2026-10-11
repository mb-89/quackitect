// The fixture home of the wait cases: the outside a case waits over, on a
// temp root and the fake clock.
// [[spec/guidance/code/testing]]
package waits // level0: InPackageTest - the case files beside it stand in the package and share its helper

import (
	"testing"
	"time"
)

// An outside over a temp root, the fake clock, a cap and a quiet span, with no report and every process alive. [[spec/tickets/find-and-wait-in-go]]
func outsideOf(t *testing.T, most, quiet time.Duration) (Outside, *fakeClock) {
	t.Helper()
	start := time.Unix(1000, 0)
	clock := &fakeClock{t: t, start: start, now: start}
	return Outside{
		Root: t.TempDir(), Now: clock.Now, Pause: clock.Pause, Most: most, Quiet: quiet,
		Reported: func(string) bool { return false },
		Alive:    func(int) bool { return true },
	}, clock
}
