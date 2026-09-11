// The watch that holds the rows level with the tree. One sweep answers a
// burst, so a build touching a thousand files costs one walk.
// [[spec/design_output/index#the-watcher-keeps-it-warm]]
package main

import (
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func watches(root string, one *door) (*fsnotify.Watcher, error) {
	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	if err := folders(root, eyes); err != nil {
		eyes.Close()
		return nil, err
	}

	go func() {
		for {
			select {
			case said, open := <-eyes.Events:
				if !open {
					return
				}
				if said.Op&fsnotify.Create != 0 {
					if info, err := os.Stat(said.Name); err == nil && info.IsDir() {
						folders(said.Name, eyes)
					}
				}
				one.Touched()
			case _, open := <-eyes.Errors:
				if !open {
					return
				}
			}
		}
	}()
	return eyes, nil
}

func folders(from string, eyes *fsnotify.Watcher) error {
	return filepath.Walk(from, func(abs string, info os.FileInfo, err error) error {
		if err != nil || !info.IsDir() {
			return nil
		}
		if skipped[info.Name()] {
			return filepath.SkipDir
		}
		return eyes.Add(abs)
	})
}
