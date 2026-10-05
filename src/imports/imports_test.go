// The import rules over planted packages: each refused import carries a want
// comment, and a clean one carries none. The test writes the packages to a
// folder of its own, so no fixture stands in the tree.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"go/build"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"golang.org/x/tools/go/analysis/analysistest"
)

var planted = map[string]string{
	"doors/disk/disk.go":       "package disk\n\nfunc Read() string { return \"\" }\n",
	"doors/nosy/nosy.go":       "package nosy\n\nimport \"quackitect/src/modules/work\" // want `quackitect/src/doors/nosy imports quackitect/src/modules/work`\n\nfunc Name() string { return work.Name() }\n",
	"modules/nosy/nosy.go":     "package nosy\n\nimport \"os\" // want `quackitect/src/modules/nosy imports os`\n\nfunc Name() string { return os.Getenv(\"NAME\") }\n",
	"modules/work/work.go":     "package work\n\nfunc Name() string { return \"work\" }\n",
	"modules/names/names.go":   "package names\n\nfunc Of() string { return \"work\" }\n",
	"modules/greedy/greedy.go": "package greedy\n\nimport \"quackitect/src/modules/names\" // want `quackitect/src/modules/greedy imports quackitect/src/modules/names`\n\nfunc Name() string { return names.Of() }\n",
	"tui/frame/frame.go":       "package frame\n\nimport \"quackitect/src/modules/work\" // want `quackitect/src/tui/frame imports quackitect/src/modules/work`\n\nfunc Title() string { return work.Name() }\n",
}

// [[spec/design_output/model#the-build-checks-imports]]
func plant(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	for rel, text := range planted {
		at := filepath.Join(dir, "src", "quackitect", "src", filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func TestADoorImportingAModuleIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plant(t), NoModule, "quackitect/src/doors/nosy")
}

func TestARendererImportingAModuleIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plant(t), NoModule, "quackitect/src/tui/frame")
}

// [[spec/tickets/the-wiring-file-binds-ports]]
func TestAModuleTestImportingItsOwnModulePasses(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/work_test", []string{"quackitect/src/modules/work"}); len(said) != 0 {
		t.Fatalf("the faults read %v", said)
	}
}

// [[spec/tickets/the-wiring-file-binds-ports]]
func TestFaultsNameAModuleImportingAModuleOnce(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/greedy", []string{"quackitect/src/modules/names"}); len(said) != 1 {
		t.Fatalf("the faults read %v", said)
	}
}

// [[spec/design_output/model#the-build-checks-imports]]
func TestAModuleImportingOsIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plant(t), OnlyQ, "quackitect/src/modules/nosy")
}

func TestFaultsNameAModuleImportingOs(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/work", []string{"strings", "quackitect/src/q", "os"}); len(said) != 1 {
		t.Fatalf("the faults read %v", said)
	}
}

// The yaml reader q rests on passes, and another package of the tree does not. [[spec/tickets/tickets-becomes-a-module]]
func TestAModuleReadsYamlAsQDoes(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/tickets", []string{"quackitect/src/q", "quackitect/src/yaml"}); len(said) != 0 {
		t.Fatalf("src/yaml reads as past q: %v", said)
	}
	if said := Faults("quackitect/src/modules/tickets", []string{"quackitect/src/config"}); len(said) != 1 {
		t.Fatalf("src/config reads as pure: %v", said)
	}
}

// The pointer reader the moved rules take passes, as the yaml reader does. [[spec/tickets/lsp-rules-move-to-check]]
func TestAModuleImportsThePointerReader(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/check", []string{"quackitect/src/q", "quackitect/src/pointer"}); len(said) != 0 {
		t.Fatalf("src/pointer reads as past q: %v", said)
	}
}

// The note reader the check and the tickets modules share passes, as the pointer reader does. [[spec/tickets/the-lens-reads-v1]]
func TestAModuleImportsTheNoteReader(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/tickets", []string{"quackitect/src/q", "quackitect/src/note"}); len(said) != 0 {
		t.Fatalf("src/note reads as past q: %v", said)
	}
}

// Each reader of the tree a module takes imports the pure standard library and the other readers alone, so a name joining pureTree keeps a module off the outside. [[spec/tickets/lsp-rules-move-to-check]]
// [[spec/tickets/edit-tools-answer-in-go]]
func TestAModuleImportsTheFrontWriter(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/check", []string{"quackitect/src/q", "quackitect/src/front"}); len(said) != 0 {
		t.Fatalf("src/front reads as past q: %v", said)
	}
}

func TestEveryPureReaderImportsThePureLibraryAlone(t *testing.T) {
	t.Parallel()
	for _, path := range pureTree {
		found, err := build.ImportDir(filepath.Join("..", "..", strings.TrimPrefix(path, module)), 0)
		if err != nil {
			t.Fatalf("%s reads as no package: %v", path, err)
		}
		for _, one := range found.Imports {
			if strings.HasPrefix(one, module) && !slices.Contains(pureTree, one) {
				t.Errorf("%s imports %s, which pureTree names nowhere", path, one)
			}
			if !strings.HasPrefix(one, module) && strings.Contains(strings.Split(one, "/")[0], ".") {
				t.Errorf("%s imports %s, past the standard library", path, one)
			}
			for _, bad := range impure {
				if one == bad || strings.HasPrefix(one, bad+"/") {
					t.Errorf("%s imports %s, which reaches the outside", path, one)
				}
			}
		}
	}
}

// The ticket type a wire between two modules carries passes, as the yaml reader does. [[spec/tickets/the-queue-becomes-a-module]]
func TestAModuleReadsTheTicketType(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/queue", []string{"quackitect/src/q", "quackitect/src/ticket"}); len(said) != 0 {
		t.Fatalf("src/ticket reads as past q: %v", said)
	}
}

func TestAnIOModuleImportingOsPassesOnlyQ(t *testing.T) {
	t.Parallel()
	if said := FaultsIn("quackitect/src/modules/files", []string{"os", "github.com/fsnotify/fsnotify"}, true); len(said) != 0 {
		t.Fatalf("the faults read %v", said)
	}
	if said := FaultsIn("quackitect/src/modules/files", []string{"quackitect/src/modules/names"}, true); len(said) != 1 {
		t.Fatalf("an IO module importing a module reads %v", said)
	}
}

// [[spec/design_output/model#the-build-checks-imports]]
func TestAModuleImportingAModuleIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plant(t), NoModule, "quackitect/src/modules/greedy")
}
