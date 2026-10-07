// A node naming no remedy meets a fault of the failure schema, and a node
// naming one meets none.
// [[spec/design_output/failures#a-failure-is-a-node]]
package failure // level0: InPackageTest - reaches heldNode, which registry_test declares in-package

import (
	"os" // level0: OutsideInDoors - the case reads the failure schema the tree ships, as a build check reads source
	"path/filepath"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/yaml"
)

const treeRoot = "../.."

func failureSchema(t *testing.T) *yaml.Doc {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(treeRoot, "spec", "schemas", "failure.schema.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	return yaml.AsDoc(yaml.Read(string(text)))
}

func TestANodeNamingNoRemedyMeetsASchemaFault(t *testing.T) {
	t.Parallel()
	schema := failureSchema(t)
	bare := "---\nkind: [[failure]]\nlevel: error\n---\n\n# When\n\nIt fails.\n"
	empty := "---\nkind: [[failure]]\nlevel: error\nremedies: []\n---\n\n# When\n\nIt fails.\n"
	for name, text := range map[string]string{"bare": bare, "empty": empty} {
		found := check.CheckNote(text, schema, Folder+"/"+name+".md")
		named := false
		for _, one := range found {
			if one.Rule == "Schema.remedies" {
				named = true
			}
		}
		if !named {
			t.Errorf("a node with %s remedies meets no remedies fault: %v", name, found)
		}
	}
	if found := check.CheckNote(heldNode, schema, Folder+"/leaf-held.md"); len(found) > 0 {
		t.Errorf("a whole node meets faults: %v", found)
	}
}
