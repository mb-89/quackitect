// The root's files: none past the root's own doors reaches the box, past a
// line marked with its reason.
// [[spec/tickets/quack-reaches-the-box-through-doors]]
package owns

import (
	"os" // level0: OutsideInDoors - the case reads the root's files, as a build check reads source
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The packages the root reaches the box through. [[spec/tickets/quack-reaches-the-box-through-doors]]
var boxPackages = []string{"os", "os/exec", "net", "net/http", "syscall"}

func TestNoRootFileReachesTheBoxPastItsDoors(t *testing.T) {
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
			if !one.Marked && slices.Contains(boxPackages, one.Name) {
				t.Errorf("%s:%d:%d: %s", at, one.Line, one.Column, one.Says())
			}
		}
	}
}
