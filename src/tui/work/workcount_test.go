// The count's reason where the tree holds no base file, so the button draws
// no number.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"os"
	"path/filepath"
	"testing"
)

// [[spec/design_output/tui#the-work-tab]]
func TestTheCountAnswersWhyWhereNoBaseFileStands(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	log := filepath.Join(root, ".se", ".log", "session.jsonl")
	if err := os.MkdirAll(filepath.Dir(log), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := Drawn(log); err == nil {
		t.Fatal("a tree with no base file answers why")
	}
}
