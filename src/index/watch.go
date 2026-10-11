// The watch that holds the rows level with the tree. It names each path it
// hears, and the door moves those rows alone once a burst settles.
// [[spec/design_output/index#the-watcher-keeps-it-warm]]
package index

import (
	"errors"
	"fmt"
	"io/fs"
	"path/filepath"

	"github.com/fsnotify/fsnotify"

	"quackitect/src/watcher"
)

// The watcher's loop adds a folder while the door's stop runs, and its Close returns. A folder the watch fails to add leaves the rest watched, and the error names it. [[spec/tickets/door-guards-watch-and-drain]]
func watches(root string, one *door) (*watcher.Watcher, error) {
	eyes, err := watcher.Hearing(func(eyes *watcher.Watcher, said fsnotify.Event) {
		if said.Op&fsnotify.Create != 0 {
			if info, err := statOf(said.Name); err == nil && info.IsDir() {
				folders(root, said.Name, eyes)
			}
		}
		if rel, ok := relOf(root, said.Name); ok {
			one.Touched(rel)
		}
	}, one.lost)
	if err != nil {
		return nil, err
	}

	failed := folders(root, root, eyes)
	// Git's own folder alone, with no folder under it, so a change to the tracked list reaches the flags. [[spec/design_output/index#a-change-moves-its-rows]]
	eyes.Add(filepath.Join(root, ".git"))
	// The runtime folder alone, for the plan file the work tab draws, so a plan write reaches the tab. [[spec/design_output/index#the-index-fires-on-change]]
	runtime := filepath.Join(root, filepath.FromSlash(Runtime))
	if makeDir(runtime, 0o755) == nil {
		eyes.Add(runtime)
	}
	return eyes, failed
}

// What folders adds to: the door's watcher, or a bare fsnotify watch in a test. [[spec/tickets/a-watch-stops-mid-add]]
type adder interface{ Add(path string) error }

// Adds every folder the walk reaches, past one that fails, and answers the first failure. [[spec/tickets/door-guards-watch-and-drain]]
func folders(root, from string, eyes adder) error {
	var first error
	_ = filepath.Walk(from, func(abs string, info fs.FileInfo, err error) error {
		if err != nil || !info.IsDir() {
			return nil
		}
		// The watch stands off every folder the walk stands off, so a log line moves nothing. [[spec/design_output/index#the-watcher-keeps-it-warm]]
		if skips(root, abs, info) {
			return filepath.SkipDir
		}
		if err := eyes.Add(abs); err != nil && first == nil {
			first = err
		}
		return nil
	})
	return first
}

// An error the watch hears. An overflow lost events, so the next settle sweeps the tree, and any other names itself. [[spec/tickets/door-guards-watch-and-drain]]
func (one *door) lost(err error) {
	if !errors.Is(err, fsnotify.ErrEventOverflow) {
		fmt.Fprintln(stderr, "the index watch reports:", err)
		return
	}
	one.heard.Lock()
	one.resweep = true
	one.heard.Unlock()
	one.pending.Store(true)
	select {
	case one.dirty <- struct{}{}:
	default:
	}
}

// A sweep over the whole tree in place of the paths heard, since the watch lost some. [[spec/tickets/door-guards-watch-and-drain]]
func (one *door) resweeps() {
	_, moved, err := one.walks()
	if err != nil {
		fmt.Fprintln(stderr, "the index did not sweep, and tries again on the next question:", err)
		one.heard.Lock()
		one.resweep = true
		one.heard.Unlock()
		one.pending.Store(true)
		return
	}
	if moved > 0 {
		one.moved()
	}
}
