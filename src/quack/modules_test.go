// Each module type names the folder under src/modules registering it, which a
// placement restarts on, and a settings section alone names none.
// [[spec/tickets/topic-folder-in-the-table]]
package main

import (
	"os"
	"path/filepath"
	"slices"
	"testing"

	"quackitect/src/modules/settings"
)

func TestEachModuleTypeNamesAFolderThatStands(t *testing.T) {
	t.Parallel()
	for name, module := range modules {
		if module.folder == "" {
			if !slices.Contains(settings.Sections(), name) {
				t.Errorf("%s names no folder, and stands no settings section", name)
			}
			continue
		}
		if info, err := os.Stat(filepath.Join("..", "modules", module.folder)); err != nil || !info.IsDir() {
			t.Errorf("%s names the folder %s, which stands nowhere under src/modules", name, module.folder)
		}
	}
}
