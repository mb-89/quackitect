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
	"sync"
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

// The folders the planted trees stand in. They outlive every case, so TestMain removes them once the run ends. [[spec/tickets/shared-plant-outlives-each-case]]
var plants struct {
	sync.Mutex
	dirs []string
}

// The clean tree, built once a run. [[spec/tickets/shared-plant-outlives-each-case]]
var cleanTree = sync.OnceValues(func() (string, error) { return plantedTree(planted) })

// A folder of its own holding every set of files, which no case writes to. [[spec/tickets/shared-plant-outlives-each-case]]
func plantedTree(sets ...map[string]string) (string, error) {
	dir, err := os.MkdirTemp("", "planted-")
	if err != nil {
		return "", err
	}
	plants.Lock()
	plants.dirs = append(plants.dirs, dir)
	plants.Unlock()
	for _, set := range sets {
		for rel, text := range set {
			at := filepath.Join(dir, "src", "quackitect", "src", filepath.FromSlash(rel))
			if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
				return "", err
			}
			if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
				return "", err
			}
		}
	}
	return dir, nil
}

// Runs every case, then removes the planted trees. [[spec/tickets/shared-plant-outlives-each-case]]
func TestMain(m *testing.M) {
	code := m.Run()
	for _, dir := range plants.dirs {
		os.RemoveAll(dir)
	}
	os.Exit(code)
}

// [[spec/design_output/model#the-build-checks-imports]]
func plant(t *testing.T) string {
	t.Helper()
	dir, err := cleanTree()
	if err != nil {
		t.Fatal(err)
	}
	return dir
}

// The planted trees build once a run, and every case reads them, since no analyzer writes there. [[spec/tickets/each-door-meets-one-test]]
func TestThePlantedTreeBuildsOnce(t *testing.T) {
	t.Parallel()
	if plant(t) != plant(t) || plantFlagged(t) != plantFlagged(t) {
		t.Fatal("a planted tree builds again for each case, where one build serves every case")
	}
	// The flagged packages stand in a folder of their own, so none leaks into the clean cases.
	if plant(t) == plantFlagged(t) {
		t.Fatal("the flagged tree shares the clean tree's folder")
	}
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

// The example parser the check, the harness and the tab share passes, as the note reader does. [[spec/design_output/examples#one-runner-two-drivers]]
func TestAModuleImportsTheExampleParser(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modules/check", []string{"quackitect/src/q", "quackitect/src/example"}); len(said) != 0 {
		t.Fatalf("src/example reads as past q: %v", said)
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

// A window package importing past its row is named, and a package the table leaves out reads no fault. [[spec/design_output/tui#the-packages-the-window-holds]]
func TestAWindowImportPastItsRowIsNamed(t *testing.T) {
	t.Parallel()
	if said := WindowFaults("quackitect/src/tui/tree", []string{"quackitect/src/tui/draw", "quackitect/src/tui/frame", "strings"}); len(said) != 1 || !strings.Contains(said[0], "src/tui/frame") {
		t.Fatalf("tree importing frame reads %v", said)
	}
	if said := WindowFaults("quackitect/src/tui", []string{"quackitect/src/tui/frame", "quackitect/src/tui/tree"}); len(said) != 1 {
		t.Fatalf("the root importing tree reads %v", said)
	}
	if said := WindowFaults("quackitect/src/tui/unnamed", []string{"quackitect/src/tui/frame"}); len(said) != 0 {
		t.Fatalf("a package the table leaves out reads %v", said)
	}
	if said := WindowFaults("quackitect/src/tui", []string{"quackitect/src/tui/tutorial"}); len(said) != 0 {
		t.Fatalf("the root importing the tutorial tab reads %v", said)
	}
	if said := WindowFaults("quackitect/src/tui/tutorial", []string{"quackitect/src/tui/registry", "quackitect/src/tui/tree"}); len(said) != 1 || !strings.Contains(said[0], "src/tui/tree") {
		t.Fatalf("the tutorial tab importing tree reads %v", said)
	}
}

// A module the index reaches below its own imports is named. [[spec/tickets/tickets-becomes-a-module]]
func TestAModuleTheIndexReachesBelowIsNamed(t *testing.T) {
	t.Parallel()
	graph := map[string][]string{
		"quackitect/src/index":         {"quackitect/src/q", "strings"},
		"quackitect/src/q":             {"quackitect/src/modules/work"},
		"quackitect/src/modules/other": {},
	}
	if said := IndexFaults(graph); len(said) != 1 || !strings.Contains(said[0], "src/modules/work") {
		t.Fatalf("the faults read %v", said)
	}
}
