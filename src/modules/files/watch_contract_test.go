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
		stop, err := watch.Changes(func(path, text string, gone bool) {
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
