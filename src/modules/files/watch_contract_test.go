//go:build contract

// The contract of watch: a write under the folder comes back as a change, on
// the fake over FakeDisk and on the real watch over the real disk. A truncating
// write fires a change on the empty file first, so the case reads every change
// until the text it wrote comes back.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package files

import (
	"testing"
	"time"
)

const patience = 2 * time.Second

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
		last, until := "", time.After(patience)
		for last != "said" {
			select {
			case last = <-seen:
			case <-until:
				t.Fatalf("the change reads %q", last)
			}
		}
	})
	t.Run("a runtime JSON file comes back, and the database, a new empty file and a binary file do not", func(t *testing.T) {
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
		if err := disk.Write("quack", ""); err != nil {
			t.Fatal(err)
		}
		if err := disk.Write("quack", binaryBody); err != nil {
			t.Fatal(err)
		}
		for _, path := range []string{".se/.runtime/index.db", ".se/.runtime/undo/one.json", ".se/.runtime/plan.json"} {
			if err := disk.Write(path, "{}\n"); err != nil {
				t.Fatal(err)
			}
		}
		until := time.After(patience)
		for {
			select {
			case path := <-seen:
				if path == ".se/.runtime/plan.json" {
					return
				}
				t.Fatalf("the watch hands %s", path)
			case <-until:
				t.Fatal("the plan never comes back")
			}
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
