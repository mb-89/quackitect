// A server reads a swap at the path it runs from, and reads the same file as
// no swap.
// [[spec/design_output/lsp]]
package swap

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestAFileSwappedInAtThePathReadsAsSwapped(t *testing.T) {
	path := filepath.Join(t.TempDir(), "server")
	if err := os.WriteFile(path, []byte("old build"), 0o755); err != nil {
		t.Fatal(err)
	}
	first, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if Swapped(first, path) {
		t.Fatal("the same file reads as swapped")
	}

	if err := os.Rename(path, path+".old"); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte("the new build"), 0o755); err != nil {
		t.Fatal(err)
	}
	later := first.ModTime().Add(time.Second)
	if err := os.Chtimes(path, later, later); err != nil {
		t.Fatal(err)
	}
	if !Swapped(first, path) {
		t.Fatal("a new build at the path reads as no swap")
	}
}
