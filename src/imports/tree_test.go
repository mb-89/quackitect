// Both rules over every package of the module, so a single import that
// breaks one turns the battery red.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"strings"
	"testing"

	"golang.org/x/tools/go/packages"
)

func TestTheTreeHoldsTheImportRules(t *testing.T) {
	loaded, err := packages.Load(&packages.Config{Mode: packages.NeedName | packages.NeedImports | packages.NeedFiles | packages.NeedCompiledGoFiles | packages.NeedSyntax, Dir: "../..", Tests: true}, "./...")
	if err != nil {
		t.Fatal(err)
	}
	if len(loaded) == 0 {
		t.Fatal("the load answers no package")
	}
	for _, one := range loaded {
		if strings.HasSuffix(one.PkgPath, ".test") {
			continue
		}
		var imported []string
		for path := range one.Imports {
			imported = append(imported, path)
		}
		for _, fault := range FaultsIn(one.PkgPath, imported, CarriesIO(one.Syntax)) {
			t.Error(fault)
		}
	}
}

func TestFaultsNameAModuleImportingADoor(t *testing.T) {
	said := Faults("quackitect/src/modules/work", []string{"fmt", "quackitect/src/doors/disk"})
	if len(said) != 1 {
		t.Fatalf("the faults read %v", said)
	}
}

func TestAFolderSharingAPrefixStandsOutsideTheRules(t *testing.T) {
	if said := Faults("quackitect/src/modulesx/work", []string{"quackitect/src/doors/disk"}); len(said) != 0 {
		t.Fatalf("src/modulesx reads as a module: %v", said)
	}
	if said := Faults("quackitect/src/q", []string{"quackitect/src/modules/work"}); len(said) != 0 {
		t.Fatalf("the q core reads as a door: %v", said)
	}
}
