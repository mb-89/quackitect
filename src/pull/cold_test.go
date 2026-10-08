// The cold path reads a folder entry as every file under it, and a file entry
// as that file alone.
// [[spec/tickets/running-work-takes-main-fixes]]
package pull_test

import (
	"slices"
	"testing"

	"quackitect/src/pull"
)

// A file under a folder entry and a file entry itself stand on the cold path, and a file beside them stands off it. [[spec/tickets/running-work-takes-main-fixes]]
func TestColdInTakesAFolderEntryAndAFileEntry(t *testing.T) {
	t.Parallel()
	got := pull.ColdIn([]string{"src/modules/hooks/a.go", "install.sh", "src/scripts/other.sh", "spec/a.md"})
	if want := []string{"src/modules/hooks/a.go", "install.sh"}; !slices.Equal(got, want) {
		t.Errorf("ColdIn reads %v, want %v", got, want)
	}
}
