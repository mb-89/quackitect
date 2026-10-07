// The helpers every test of a watch's stop shares: folders appearing under a
// root, and a stop that fails the test where it hangs.
// [[spec/tickets/a-watch-stops-mid-add]]
package watchertest

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The time a stop takes before the test reads it as hung. [[spec/tickets/a-watch-stops-mid-add]]
const Hung = 10 * time.Second

// How deep the folders go under the root before Appearing starts again at the root. [[spec/tickets/a-watch-stops-mid-add]]
const depth = 10

// Makes folders under root, each under the one before, until the stop it hands back runs. The stop waits on the last folder, so the temp folder's cleanup on Windows meets none in the making. [[spec/tickets/the-watches-close-cleanly]]
func Appearing(root string) (stop func()) {
	quit := make(chan struct{})
	ended := make(chan struct{})
	go func() {
		defer close(ended)
		at := root
		for n := 0; ; n++ {
			select {
			case <-quit:
				return
			default:
			}
			at = filepath.Join(at, fmt.Sprint(n%depth))
			if os.MkdirAll(at, 0o755) != nil || n%depth == depth-1 {
				at = root
			}
		}
	}()
	return func() {
		close(quit)
		<-ended
	}
}

// Runs stop, and fails the test where it takes past Hung. [[spec/tickets/a-watch-stops-mid-add]]
func Returns(t *testing.T, stop func() error) {
	t.Helper()
	err, hung := stopsWithin(qtest.Wall(), Hung, stop)
	if hung {
		t.Fatal("the stop hangs while the watch adds a folder")
	}
	if err != nil && !errors.Is(err, fsnotify.ErrClosed) {
		t.Fatal(err)
	}
}

// The stop's answer, or hung where the clock passes the span first. [[spec/tickets/go-waits-on-events]]
func stopsWithin(clock q.Clock, span time.Duration, stop func() error) (err error, hung bool) {
	stopped := make(chan error, 1)
	go func() { stopped <- stop() }()
	select {
	case err := <-stopped:
		return err, false
	case <-clock.After(span):
		return nil, true
	}
}
