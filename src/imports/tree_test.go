// Every rule over every package of the module, so a single import that
// breaks one turns the battery red.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"path"
	"strings"
	"sync"
	"testing"

	"golang.org/x/tools/go/packages"
)

// Every package of the module and its test variants, loaded once a package run, since no case writes to it. [[spec/guidance/code/testing]]
var treeLoad = sync.OnceValues(func() ([]*packages.Package, error) {
	return packages.Load(&packages.Config{Mode: packages.NeedName | packages.NeedImports | packages.NeedFiles | packages.NeedCompiledGoFiles | packages.NeedSyntax, Dir: "../..", Tests: true}, "./...")
})

// The index holds no module's logic, so nothing it reaches inside the module stands under src/modules or is src/tickets. A package outside the module imports nothing inside it, so the walk stays inside. [[spec/tickets/tickets-becomes-a-module]]
func TestTheIndexReachesNoModuleNorTheTickets(t *testing.T) {
	t.Parallel()
	loaded, err := treeLoad()
	if err != nil {
		t.Fatal(err)
	}
	plain := map[string]*packages.Package{}
	for _, one := range loaded {
		if one.ID == one.PkgPath {
			plain[one.PkgPath] = one
		}
	}
	if plain[indexPackage] == nil {
		t.Fatalf("the load holds no %s", indexPackage)
	}
	seen := map[string]bool{indexPackage: true}
	for walk := []string{indexPackage}; len(walk) > 0; walk = walk[1:] {
		for path := range plain[walk[0]].Imports {
			if strings.HasPrefix(path, "quackitect/src/modules/") || path == "quackitect/src/tickets" {
				t.Fatalf("the index reaches %s through %s", path, walk[0])
			}
			if !seen[path] && plain[path] != nil {
				seen[path] = true
				walk = append(walk, path)
			}
		}
	}
}

// The package the index stands in. [[spec/tickets/tickets-becomes-a-module]]
const indexPackage = "quackitect/src/index"

func TestTheTreeHoldsTheImportRules(t *testing.T) {
	t.Parallel()
	loaded, err := treeLoad()
	if err != nil {
		t.Fatal(err)
	}
	if len(loaded) == 0 {
		t.Fatal("the load answers no package")
	}
	graph := map[string][]string{}
	for _, one := range loaded {
		if strings.HasSuffix(one.PkgPath, ".test") {
			continue
		}
		var imported []string
		for path := range one.Imports {
			imported = append(imported, path)
		}
		if one.ID == one.PkgPath {
			graph[one.PkgPath] = imported
			for _, fault := range WindowFaults(one.PkgPath, imported) {
				t.Error(fault)
			}
		}
		for _, fault := range FaultsIn(one.PkgPath, imported, CarriesIO(one.Syntax)) {
			t.Error(fault)
		}
		for _, fault := range RendererFaults(one.PkgPath, one.Fset, one.Syntax) {
			t.Error(fault)
		}
		for _, fault := range SuiteFaults(one.PkgPath, one.Fset, one.Syntax) {
			t.Error(fault)
		}
	}
	for folder := range window {
		if _, ok := graph[path.Join(module+"src/tui", folder)]; !ok {
			t.Errorf("the window's table names src/tui/%s, which holds no package", folder)
		}
	}
	if _, ok := graph[indexPath]; !ok {
		t.Errorf("the load answers no %s", indexPath)
	}
	for _, fault := range IndexFaults(graph) {
		t.Error(fault)
	}
}

func TestAFolderSharingAPrefixStandsOutsideTheRules(t *testing.T) {
	t.Parallel()
	if said := Faults("quackitect/src/modulesx/work", []string{"quackitect/src/doors/disk"}); len(said) != 0 {
		t.Fatalf("src/modulesx reads as a module: %v", said)
	}
	if said := Faults("quackitect/src/q", []string{"quackitect/src/modules/work"}); len(said) != 0 {
		t.Fatalf("the q core reads as a door: %v", said)
	}
}
