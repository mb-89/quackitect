// The helpers every test of a watch's stop shares: folders appearing under a
// root, and a stop that fails the test where it hangs.
// [[spec/tickets/a-watch-stops-mid-add]]
package watchertest

import (
	"errors"
	"fmt"
	"os" // level0: OutsideInDoors - a test helper makes the folders a real watch hears
	"path/filepath"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
)

// The time a stop takes before the test reads it as hung. [[spec/tickets/a-watch-stops-mid-add]]
const Hung = 10 * time.Second

// Makes folders under root, each under the one before, until quit closes. [[spec/tickets/a-watch-stops-mid-add]]
func Appearing(root string, quit <-chan struct{}) {
	go func() {
		at := root
		for n := 0; ; n++ {
			select {
			case <-quit:
				return
			default:
			}
			at = filepath.Join(at, fmt.Sprint(n%10))
			if os.MkdirAll(at, 0o755) != nil || n%10 == 9 {
				at = root
			}
		}
	}()
}

// Runs stop, and fails the test where it takes past Hung. [[spec/tickets/a-watch-stops-mid-add]]
func Returns(t *testing.T, stop func() error) {
	t.Helper()
	stopped := make(chan error, 1)
	go func() { stopped <- stop() }()
	select {
	case err := <-stopped:
		if err != nil && !errors.Is(err, fsnotify.ErrClosed) {
			t.Fatal(err)
		}
	case <-time.After(Hung):
		t.Fatal("the stop hangs while the watch adds a folder")
	}
}
