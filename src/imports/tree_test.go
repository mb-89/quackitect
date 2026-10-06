// Every rule over every package of the module, so a single import that
// breaks one turns the battery red.
// [[spec/design_output/model#the-build-checks-imports]]
package imports_test

import (
	"strings"
	"testing"

	"golang.org/x/tools/go/packages"

	"quackitect/src/imports"
)

func TestTheTreeHoldsTheImportRules(t *testing.T) {
	t.Parallel()
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
		for _, fault := range imports.FaultsIn(one.PkgPath, imported, imports.CarriesIO(one.Syntax)) {
			t.Error(fault)
		}
		for _, fault := range imports.RendererFaults(one.PkgPath, one.Fset, one.Syntax) {
			t.Error(fault)
		}
		for _, fault := range imports.SuiteFaults(one.PkgPath, one.Fset, one.Syntax) {
			t.Error(fault)
		}
	}
}

func TestAFolderSharingAPrefixStandsOutsideTheRules(t *testing.T) {
	t.Parallel()
	if said := imports.Faults("quackitect/src/modulesx/work", []string{"quackitect/src/doors/disk"}); len(said) != 0 {
		t.Fatalf("src/modulesx reads as a module: %v", said)
	}
	if said := imports.Faults("quackitect/src/q", []string{"quackitect/src/modules/work"}); len(said) != 0 {
		t.Fatalf("the q core reads as a door: %v", said)
	}
}
