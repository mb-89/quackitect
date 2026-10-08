// A server reads a swap at the path it runs from, and reads the same file as
// no swap.
// [[spec/design_output/lsp]]
package swap // level0: InPackageTest - reaches the unexported stat and swapped, and holds fakeServer, which watches_test reads

import (
	"io/fs"
	"testing"
	"testing/fstest"
	"time"
)

// A disk in memory holding the server's build, and the stat door reading it. [[spec/tickets/test-walks-move-onto-fakes]]
func fakeServer(t *testing.T, build string) (fstest.MapFS, stat, fs.FileInfo) {
	t.Helper()
	disk := fstest.MapFS{"server": {Data: []byte(build), Mode: 0o755, ModTime: time.Unix(100, 0)}}
	door := func(path string) (fs.FileInfo, error) { return fs.Stat(disk, path) }
	first, err := door("server")
	if err != nil {
		t.Fatal(err)
	}
	return disk, door, first
}

func TestAFileSwappedInAtThePathReadsAsSwapped(t *testing.T) {
	disk, door, first := fakeServer(t, "old build")
	if swapped(door, first, "server") {
		t.Fatal("the same file reads as swapped")
	}
	disk["server"] = &fstest.MapFile{Data: []byte("the new build"), Mode: 0o755, ModTime: first.ModTime().Add(time.Second)}
	if !swapped(door, first, "server") {
		t.Fatal("a new build at the path reads as no swap")
	}
}

func TestAPathStandingNowhereReadsAsNoSwap(t *testing.T) {
	disk, door, first := fakeServer(t, "old build")
	delete(disk, "server")
	if swapped(door, first, "server") {
		t.Fatal("a path standing nowhere reads as swapped")
	}
}
