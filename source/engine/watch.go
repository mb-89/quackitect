package main

import (
	"os"
	"path/filepath"
	"time"
)

// Watching guidance for a change. A digest is compared rather than a
// modification time, because a file that is written with the same content is
// not a change and must not cost a rewrite of everything that reads it.
//
// A poll is used rather than a file event. This runs once every two seconds
// over a handful of small files, and it cannot miss a change the way an event
// can.
func watchGuidance(methodRoot string) <-chan struct{} {
	out := make(chan struct{}, 1)
	go func() {
		last, _ := GuidanceDigest(methodRoot)
		for range time.Tick(2 * time.Second) {
			now, err := GuidanceDigest(methodRoot)
			if err != nil || now == last {
				continue
			}
			last = now
			select {
			case out <- struct{}{}:
			default:
			}
		}
	}()
	return out
}

// GuidanceDir is where the authored material lives. It is named here so that
// nothing else has to spell it.
func GuidanceDir(methodRoot string) string {
	return filepath.Join(methodRoot, "doc", "guidance")
}

func exists(p string) bool {
	_, err := os.Stat(p)
	return err == nil
}
