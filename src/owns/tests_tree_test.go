// The test files of the tree: none walks around a door, past a line marked
// with its reason.
// [[spec/tickets/test-walks-move-onto-fakes]]
package owns

import (
	"os" // level0: OutsideInDoors - the case reads the tests the tree holds, as a build check reads source
	"path"
	"path/filepath"
	"strings"
	"testing"
)

// Whether the path names a Go test file or a script a test runs. [[spec/tickets/test-walks-move-onto-fakes]]
func testFile(at string) bool {
	if strings.HasSuffix(at, "_test.go") {
		return true
	}
	ext := path.Ext(at)
	return (ext == ".js" || ext == ".mjs" || ext == ".cjs") && scriptTest(at)
}

func TestNoTestFileWalksAroundADoor(t *testing.T) {
	t.Parallel()
	doors, files := doorsOf(t)
	for at := range files {
		if !testFile(at) {
			continue
		}
		text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(at)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range Walks(at, string(text), doors) {
			if !one.Marked {
				t.Errorf("%s:%d:%d: %s walks around %s", at, one.Line, one.Column, one.Name, strings.Join(one.Doors, ", "))
			}
		}
	}
}
