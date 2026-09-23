// The watch that holds the rows level with the tree. It names each path it
// hears, and the door moves those rows alone once a burst settles.
// [[spec/design_output/index#the-watcher-keeps-it-warm]]
package main

import (
	"io/fs"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func watches(root string, one *door) (*fsnotify.Watcher, error) {
	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	if err := folders(root, root, eyes); err != nil {
		eyes.Close()
		return nil, err
	}
	// Git's own folder alone, with no folder under it, so a change to the tracked list reaches the flags. [[spec/design_output/index#a-change-moves-its-rows]]
	eyes.Add(filepath.Join(root, ".git"))

	go func() {
		for {
			select {
			case said, open := <-eyes.Events:
				if !open {
					return
				}
				if said.Op&fsnotify.Create != 0 {
					if info, err := statOf(said.Name); err == nil && info.IsDir() {
						folders(root, said.Name, eyes)
					}
				}
				if rel, ok := relOf(root, said.Name); ok {
					one.Touched(rel)
				}
			case _, open := <-eyes.Errors:
				if !open {
					return
				}
			}
		}
	}()
	return eyes, nil
}

func folders(root, from string, eyes *fsnotify.Watcher) error {
	return filepath.Walk(from, func(abs string, info fs.FileInfo, err error) error {
		if err != nil || !info.IsDir() {
			return nil
		}
		// The walk still reads the log, and the next sweep carries what it holds. [[spec/design_output/index#the-watcher-keeps-it-warm]]
		if skips(root, abs, info) || logs(root, abs) {
			return filepath.SkipDir
		}
		return eyes.Add(abs)
	})
}
