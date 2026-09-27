// The import rules over planted packages: each refused import carries a want
// comment, and a clean one carries none. The test writes the packages to a
// folder of its own, so no fixture stands in the tree.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"os"
	"path/filepath"
	"testing"

	"golang.org/x/tools/go/analysis/analysistest"
)

var planted = map[string]string{
	"doors/disk/disk.go":       "package disk\n\nfunc Read() string { return \"\" }\n",
	"doors/nosy/nosy.go":       "package nosy\n\nimport \"quackitect/src/modules/work\" // want `quackitect/src/doors/nosy imports quackitect/src/modules/work`\n\nfunc Name() string { return work.Name() }\n",
	"modules/leaky/leaky.go":   "package leaky\n\nimport \"quackitect/src/doors/disk\" // want `quackitect/src/modules/leaky imports quackitect/src/doors/disk`\n\nfunc Name() string { return disk.Read() }\n",
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

func TestAModuleImportingADoorIsNamed(t *testing.T) {
	analysistest.Run(t, plant(t), NoDoor, "quackitect/src/modules/leaky")
}

func TestADoorImportingAModuleIsNamed(t *testing.T) {
	analysistest.Run(t, plant(t), NoModule, "quackitect/src/doors/nosy")
}

func TestARendererImportingAModuleIsNamed(t *testing.T) {
	analysistest.Run(t, plant(t), NoModule, "quackitect/src/tui/frame")
}

// [[spec/tickets/the-wiring-file-binds-ports]]
func TestAModuleTestImportingItsOwnModulePasses(t *testing.T) {
	if said := Faults("quackitect/src/modules/work_test", []string{"quackitect/src/modules/work"}); len(said) != 0 {
		t.Fatalf("the faults read %v", said)
	}
}

// [[spec/tickets/the-wiring-file-binds-ports]]
func TestFaultsNameAModuleImportingAModuleOnce(t *testing.T) {
	if said := Faults("quackitect/src/modules/greedy", []string{"quackitect/src/modules/names"}); len(said) != 1 {
		t.Fatalf("the faults read %v", said)
	}
}

// [[spec/design_output/model#the-build-checks-imports]]
func TestAModuleImportingOsIsNamed(t *testing.T) {
	analysistest.Run(t, plant(t), OnlyQ, "quackitect/src/modules/nosy")
}

func TestFaultsNameAModuleImportingOs(t *testing.T) {
	if said := Faults("quackitect/src/modules/work", []string{"strings", "quackitect/src/q", "os"}); len(said) != 1 {
		t.Fatalf("the faults read %v", said)
	}
}

func TestFaultsNameADoorImportOnce(t *testing.T) {
	if said := Faults("quackitect/src/modules/work", []string{"quackitect/src/q/qtest", "quackitect/src/doors/disk"}); len(said) != 1 {
		t.Fatalf("the faults read %v", said)
	}
}

// [[spec/design_output/model#the-build-checks-imports]]
func TestAModuleImportingAModuleIsNamed(t *testing.T) {
	analysistest.Run(t, plant(t), NoModule, "quackitect/src/modules/greedy")
}
