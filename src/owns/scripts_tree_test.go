// The production scripts of the tree: none walks around a door, past a line
// marked with its reason.
// [[spec/tickets/javascript-reaches-through-doors]]
package owns

import (
	"os" // level0: OutsideInDoors - the case reads the scripts the tree holds, as a build check reads source
	"path"
	"path/filepath"
	"strings"
	"testing"
)

// Whether the path names a script a test runs, which [[spec/tickets/go-tests-meet-the-doors]] takes. [[spec/tickets/javascript-reaches-through-doors]]
func scriptTest(at string) bool {
	return strings.HasPrefix(at, "test/") || strings.HasSuffix(strings.TrimSuffix(at, path.Ext(at)), ".test")
}

func TestNoProductionScriptWalksAroundADoor(t *testing.T) {
	t.Parallel()
	doors, files := doorsOf(t)
	for at := range files {
		if ext := path.Ext(at); (ext != ".js" && ext != ".mjs" && ext != ".cjs") || scriptTest(at) {
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
