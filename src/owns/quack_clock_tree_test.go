// The root's files: none reads the time or waits past the clock its hand
// carries, past a line marked with its reason.
// [[spec/tickets/quack-waits-on-the-clock]]
package owns

import (
	"os" // level0: OutsideInDoors - the case reads the root's files, as a build check reads source
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

func TestNoRootFileReadsTheClockPastItsHand(t *testing.T) {
	t.Parallel()
	doors, files := doorsOf(t)
	for at := range files {
		if !strings.HasPrefix(at, "src/quack/") || !strings.HasSuffix(at, ".go") || strings.HasSuffix(at, "_test.go") {
			continue
		}
		text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(at)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range Walks(at, string(text), doors) {
			if !one.Marked && slices.Contains(one.Doors, "clock") {
				t.Errorf("%s:%d:%d: %s walks around the clock", at, one.Line, one.Column, one.Name)
			}
		}
	}
}
