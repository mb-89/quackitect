// Both rules over every package of the module, so a single import that
// breaks one turns the battery red.
// [[spec/design_output/go-doors#the-build-checks-imports]]
package imports

import (
	"testing"

	"golang.org/x/tools/go/packages"
)

func TestTheTreeHoldsTheImportRules(t *testing.T) {
	loaded, err := packages.Load(&packages.Config{Mode: packages.NeedName | packages.NeedImports, Dir: "../..", Tests: true}, "./...")
	if err != nil {
		t.Fatal(err)
	}
	if len(loaded) == 0 {
		t.Fatal("the load answers no package")
	}
	for _, one := range loaded {
		var imported []string
		for path := range one.Imports {
			imported = append(imported, path)
		}
		for _, fault := range Faults(one.PkgPath, imported) {
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
