//go:build contract

// The contract of watch: a write under the folder comes back as a change, on
// the fake over FakeDisk and on the real watch over the real disk. A truncating
// write fires a change on the empty file first, so the case reads every change
// until the text it wrote comes back.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package files

import (
	"path/filepath"
	"runtime"
	"testing"

	"quackitect/src/watcher/watchertest"
)

func watchSuite(t *testing.T, open func(t *testing.T) (Disk, Watch)) {
	t.Run("a write comes back as a change", func(t *testing.T) {
		disk, watch := open(t)
		seen := make(chan string, 16)
		stop, err := watch.Changes(func(path, text string, _ int64, gone bool) {
			if path == "a.md" && !gone {
				select {
				case seen <- text:
				default:
				}
			}
		})
		if err != nil {
			t.Fatal(err)
		}
		defer stop()
		if err := disk.Write("a.md", "said"); err != nil {
			t.Fatal(err)
		}
		for last := ""; last != "said"; {
			last = <-seen
		}
	})
	t.Run("a runtime JSON file comes back, and the database does not", func(t *testing.T) {
		disk, watch := open(t)
		for _, folder := range []string{".se/.runtime/hold/keep.json", ".se/.runtime/undo/keep.json"} {
			if err := disk.Write(folder, "{}\n"); err != nil {
				t.Fatal(err)
			}
		}
		seen := make(chan string, 64)
		stop, err := watch.Changes(func(path, _ string, _ int64, gone bool) {
			if !gone {
				select {
				case seen <- path:
				default:
				}
			}
		})
		if err != nil {
			t.Fatal(err)
		}
		defer stop()
		for _, path := range []string{".se/.runtime/index.db", ".se/.runtime/undo/one.json", ".se/.runtime/plan.json"} {
			if err := disk.Write(path, "{}\n"); err != nil {
				t.Fatal(err)
			}
		}
		if path := <-seen; path != ".se/.runtime/plan.json" {
			t.Fatalf("the watch hands %s", path)
		}
	})
}

func TestWatchKeepsItsContract(t *testing.T) {
	t.Run("fake", func(t *testing.T) {
		watchSuite(t, func(*testing.T) (Disk, Watch) {
			disk := NewFakeDisk()
			return disk, NewFakeWatchOver(disk)
		})
	})
	t.Run("real", func(t *testing.T) {
		watchSuite(t, func(t *testing.T) (Disk, Watch) {
			root := t.TempDir()
			return NewDisk(root), NewWatch(root)
		})
	})
}

// The stop hung on Windows while the watch added a folder, so the real watch stops while folders appear, once the first stands. [[spec/tickets/a-watch-stops-mid-add]]
// level0: FixtureOutsideHome - the contract runs the real watch over a real folder of its own, since the hang stood in the real watch alone
func TestAStopReturnsWhileFoldersAppear(t *testing.T) {
	for round := 0; round < 20; round++ {
		root := t.TempDir()
		stop, err := NewWatch(root).Changes(func(string, string, int64, bool) {})
		if err != nil {
			t.Fatal(err)
		}
		appearing := watchertest.Appearing(root)
		for stands, _ := filepath.Glob(filepath.Join(root, "*")); len(stands) == 0; stands, _ = filepath.Glob(filepath.Join(root, "*")) {
			runtime.Gosched()
		}
		watchertest.Returns(t, func() error { stop(); return nil })
		appearing()
	}
}
