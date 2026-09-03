package main

import (
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"testing"
)

// A READ, A CHANGE AND A WRITE UNDER THE LOCK LOSE NOTHING.
//
// Every store under .se is read whole, changed and written whole by a fresh
// process per event, and two events overlapping lost one of the two changes.
// Fifty writers each adding one to a counter must leave fifty, and without
// the lock they leave fewer.
func TestChangesUnderTheLockAreNotLost(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "count.txt")
	const writers = 50

	var wg sync.WaitGroup
	for range writers {
		wg.Go(func() {
			err := locked(path, func() error {
				n := 0
				if b, err := os.ReadFile(path); err == nil {
					n, _ = strconv.Atoi(string(b)) // an unreadable count starts at nought, which the total would show
				}
				return writeAtomic(path, []byte(strconv.Itoa(n+1)), 0o644)
			})
			if err != nil {
				t.Error(err)
			}
		})
	}
	wg.Wait()

	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if got, _ := strconv.Atoi(string(b)); got != writers {
		t.Fatalf("%d writers left a count of %d", writers, got)
	}
	// AND THE LOCK IS GONE, so the next writer does not wait a second to
	// steal a lock nobody holds.
	if _, err := os.Stat(path + ".lock"); err == nil {
		t.Fatal("the lock file was left behind")
	}
}
