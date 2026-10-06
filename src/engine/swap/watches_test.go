// A swap at the path calls gone once the fake clock ticks past the look span,
// and a tick short of the span leaves it waiting.
// [[spec/tickets/go-waits-on-events]]
package swap

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

func TestASwapCallsGoneOnceTheFakeTicksPastTheSpan(t *testing.T) {
	path := filepath.Join(t.TempDir(), "server")
	if err := os.WriteFile(path, []byte("old build"), 0o755); err != nil {
		t.Fatal(err)
	}
	first, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	fake := qtest.NewFake(time.Unix(0, 0))
	gone := make(chan struct{}, 1)
	watchesAt(fake, path, first, func() { gone <- struct{}{} })
	if err := os.WriteFile(path, []byte("the new build"), 0o755); err != nil {
		t.Fatal(err)
	}
	later := first.ModTime().Add(time.Second)
	if err := os.Chtimes(path, later, later); err != nil {
		t.Fatal(err)
	}
	fake.Tick(look - time.Millisecond)
	select {
	case <-gone:
		t.Fatal("gone runs before the look span passes")
	case <-time.After(50 * time.Millisecond):
	}
	fake.Tick(time.Millisecond)
	select {
	case <-gone:
	case <-time.After(time.Second):
		t.Fatal("gone stands uncalled once the span passes over a swapped file")
	}
}
