// A swap at the path calls gone once the fake clock ticks past the look span,
// and a tick short of the span leaves it waiting.
// [[spec/tickets/go-waits-on-events]]
package swap // level0: InPackageTest - reaches the unexported watchesAt and look, and fakeServer of swap_test.go

import (
	"testing"
	"testing/fstest"
	"time"

	"quackitect/src/q/qtest"
)

func TestASwapCallsGoneOnceTheFakeTicksPastTheSpan(t *testing.T) {
	disk, door, first := fakeServer(t, "old build")
	fake := qtest.NewFake(time.Unix(0, 0))
	gone := make(chan struct{}, 1)
	watchesAt(fake, door, "server", first, func() { gone <- struct{}{} })
	disk["server"] = &fstest.MapFile{Data: []byte("the new build"), Mode: 0o755, ModTime: first.ModTime().Add(time.Second)}
	fake.Tick(look - time.Millisecond)
	select {
	case <-gone:
		t.Fatal("gone runs before the look span passes")
	default:
	}
	fake.Tick(time.Millisecond)
	<-gone
}
