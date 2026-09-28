// The watch that holds the rows level with the tree. It names each path it
// hears, and the door moves those rows alone once a burst settles.
// [[spec/design_output/index#the-watcher-keeps-it-warm]]
package index

import (
	"io/fs"
	"path/filepath"

	"github.com/fsnotify/fsnotify"

	"quackitect/src/watcher"
)

// The watcher's loop adds a folder while the door's stop runs, and its Close returns. [[spec/tickets/a-watch-stops-mid-add]]
func watches(root string, one *door) (*watcher.Watcher, error) {
	eyes, err := watcher.New(func(eyes *watcher.Watcher, said fsnotify.Event) {
		if said.Op&fsnotify.Create != 0 {
			if info, err := statOf(said.Name); err == nil && info.IsDir() {
				folders(root, said.Name, eyes)
			}
		}
		if rel, ok := relOf(root, said.Name); ok {
			one.Touched(rel)
		}
	})
	if err != nil {
		return nil, err
	}

	if err := folders(root, root, eyes); err != nil {
		eyes.Close()
		return nil, err
	}
	// Git's own folder alone, with no folder under it, so a change to the tracked list reaches the flags. [[spec/design_output/index#a-change-moves-its-rows]]
	eyes.Add(filepath.Join(root, ".git"))
	// The runtime folder alone, for the plan file the work tab draws, so a plan write reaches the tab. [[spec/design_output/index#the-index-fires-on-change]]
	runtime := filepath.Join(root, filepath.FromSlash(Runtime))
	if makeDir(runtime, 0o755) == nil {
		eyes.Add(runtime)
	}
	return eyes, nil
}

// What folders adds to: the door's watcher, or a bare fsnotify watch in a test. [[spec/tickets/a-watch-stops-mid-add]]
type adder interface{ Add(path string) error }

func folders(root, from string, eyes adder) error {
	return filepath.Walk(from, func(abs string, info fs.FileInfo, err error) error {
		if err != nil || !info.IsDir() {
			return nil
		}
		// The watch stands off every folder the walk stands off, so a log line moves nothing. [[spec/design_output/index#the-watcher-keeps-it-warm]]
		if skips(root, abs, info) {
			return filepath.SkipDir
		}
		return eyes.Add(abs)
	})
}
