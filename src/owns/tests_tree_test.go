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
				t.Errorf("%s:%d:%d: %s", at, one.Line, one.Column, one.Says())
			}
		}
	}
}

// Whether the path names a Go fake or a helper a test package imports. [[spec/tickets/watchertest-helper-meets-its-door]]
func fakeOrHelper(at string) bool {
	return path.Ext(at) == ".go" && !strings.HasSuffix(at, "_test.go") && (strings.HasSuffix(path.Dir(at), "test") || strings.Contains(path.Base(at), "fake"))
}

// A fake or a test helper reaches the outside through a door that holds it, and a marker passes none. [[spec/tickets/watchertest-helper-meets-its-door]]
func TestNoFakeOrTestHelperWalksAroundADoorMarkedOrNot(t *testing.T) {
	t.Parallel()
	doors, files := doorsOf(t)
	for at := range files {
		if !fakeOrHelper(at) {
			continue
		}
		text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(at)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range Walks(at, string(text), doors) {
			t.Errorf("%s:%d:%d: %s", at, one.Line, one.Column, one.Says())
		}
	}
}
