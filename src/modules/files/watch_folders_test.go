// The real watch follows a folder that appears, moves in or moves out, and a
// named folder made after the start. The cases hand hears the events the
// watcher delivers, over a root of their own, so each reads at once.
// [[spec/tickets/watch-hands-new-folders]]
package files // level0: InPackageTest - the cases drive the unexported watch, held and joined the real watch runs on

import (
	"os"
	"path/filepath"
	"slices"
	"testing"

	"github.com/fsnotify/fsnotify"
)

// The folders a case's watch takes. [[spec/tickets/watch-hands-new-folders]]
type joined []string

func (one *joined) Add(path string) error {
	*one = append(*one, path)
	return nil
}

// A watcher refusing every folder named bad. [[spec/tickets/seed-survives-bad-files]]
type refusing struct{ joined }

func (one *refusing) Add(path string) error {
	if filepath.Base(path) == "bad" {
		return os.ErrPermission
	}
	return one.joined.Add(path)
}

// A folder refusing its Add costs itself alone, and the watch starts. [[spec/tickets/seed-survives-bad-files]]
// level0: FixtureOutsideHome - the walk reads a root of the case's own
func TestAFolderRefusingItsAddLeavesTheWatchStanding(t *testing.T) {
	one, _, _, _ := started(t, "bad/a.md", "good/b.md")
	eyes := &refusing{}
	if err := one.adds(eyes, one.root, newHeld(), nil); err != nil || !slices.Contains(eyes.joined, filepath.Join(one.root, "good")) {
		t.Fatalf("the watch answers %v and takes %v, and wants the good folder", err, eyes.joined)
	}
}

// A watch over a root of its own, started, with the record of what it hands. [[spec/tickets/watch-hands-new-folders]]
func started(t *testing.T, files ...string) (watch, *held, *joined, *[]string) {
	root := t.TempDir()
	for _, one := range files {
		if err := NewDisk(root).Write(one, "said"); err != nil {
			t.Fatal(err)
		}
	}
	one, state, eyes := watch{root}, newHeld(), &joined{}
	if err := one.adds(eyes, root, state, nil); err != nil {
		t.Fatal(err)
	}
	return one, state, eyes, &[]string{}
}

// The record a hand writes: each path, with gone where it leaves. [[spec/tickets/watch-hands-new-folders]]
func recording(into *[]string) Hand {
	return func(path, _ string, _ int64, gone bool) {
		if gone {
			path += " gone"
		}
		*into = append(*into, path)
	}
}

// [[spec/tickets/watch-hands-new-folders]]
// level0: FixtureOutsideHome - the case moves a folder into a root of its own
func TestAFolderMovedInHandsItsFiles(t *testing.T) {
	one, state, eyes, handed := started(t)
	if err := NewDisk(one.root).Write("m/x.md", "said"); err != nil {
		t.Fatal(err)
	}
	one.hears(eyes, fsnotify.Event{Name: filepath.Join(one.root, "m"), Op: fsnotify.Create}, recording(handed), state)
	if !slices.Contains(*handed, "m/x.md") {
		t.Fatalf("the watch hands %v, and wants the file the folder brings", *handed)
	}
}

// [[spec/tickets/watch-hands-new-folders]]
// level0: FixtureOutsideHome - the case moves a folder out of a root of its own
func TestAFolderMovedOutHandsItsFilesGone(t *testing.T) {
	one, state, eyes, handed := started(t, "gone/g.md")
	if err := os.RemoveAll(filepath.Join(one.root, "gone")); err != nil {
		t.Fatal(err)
	}
	one.hears(eyes, fsnotify.Event{Name: filepath.Join(one.root, "gone"), Op: fsnotify.Rename}, recording(handed), state)
	if !slices.Contains(*handed, "gone/g.md gone") {
		t.Fatalf("the watch hands %v, and wants the file the folder takes away", *handed)
	}
}

// [[spec/tickets/watch-hands-new-folders]]
// level0: FixtureOutsideHome - the case makes the log folder in a root of its own
func TestALateLogFolderJoinsTheWatch(t *testing.T) {
	one, state, eyes, handed := started(t, ".se/plan.md")
	if err := NewDisk(one.root).Write(".se/.log/session.jsonl", "{}\n"); err != nil {
		t.Fatal(err)
	}
	log := filepath.Join(one.root, ".se", ".log")
	one.hears(eyes, fsnotify.Event{Name: log, Op: fsnotify.Create}, recording(handed), state)
	if !slices.Contains(*eyes, log) || !slices.Contains(*handed, ".se/.log/session.jsonl") {
		t.Fatalf("the watch takes %v and hands %v, and wants the log folder and its file", *eyes, *handed)
	}
}
