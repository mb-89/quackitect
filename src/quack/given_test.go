// The core holds no given form: every name has a writer module, and a module
// registers what comes in as an out-port.
// [[spec/tickets/commits-name-their-writer]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The two forms the core drops, spelled in halves so this file names neither. [[spec/tickets/commits-name-their-writer]]
var givenForms = []string{"Given" + "In(", "q.Given" + "(", "func Given" + "["}

func TestNoRegistrationTakesTheGivenForm(t *testing.T) {
	t.Parallel()
	err := filepath.WalkDir(filepath.Join(treeRoot, "src"), func(path string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() || !strings.HasSuffix(path, ".go") {
			return err
		}
		text, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		for _, form := range givenForms {
			if strings.Contains(string(text), form) {
				t.Errorf("%s calls %s", path, form)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}
