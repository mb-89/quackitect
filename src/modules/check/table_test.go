// The table a chapter holds where its schema names one: the heads it opens
// with, and each row naming an item of the chapter it follows, in order.
// [[spec/tickets/schema-libs-leave]]
package check // level0: InPackageTest - reaches the unexported checkNote and mintSchema

import (
	"strings"
	"testing"

	"quackitect/src/yaml"
)

const tabled = "---\nkind: [[sample]]\ntags: [\"a\"]\n---\n\n# Scope\n\nOne thing.\n\n# Steps\n\n1. The first.\n2. The second.\n\n# Examples\n\n"

// [[spec/design_output/schema#a-chapter-holds-a-table]]
func TestAChapterTableOpensWithItsHeadsAndNamesItemsInOrder(t *testing.T) {
	t.Parallel()
	schema := yaml.AsDoc(yaml.Read(mintSchema))
	for _, one := range []struct{ table, says string }{
		{"| the rule | do |\n|---|---|\n| 1 | a |\n| 2 | b |\n", ""},
		{"Nothing here.\n", "Examples holds a table headed the rule, do."},
		{"| rule | do |\n|---|---|\n| 1 | a |\n", "The table under Examples opens with the heads the rule, do."},
		{"| the rule | do |\n|---|---|\n| 3 | a |\n", "A row of Examples opens with the number of an item of Steps, and this one opens with 3."},
		{"| the rule | do |\n|---|---|\n| 2 | a |\n| 1 | b |\n", "A row of Examples for item 1 stands after one for item 2, and the numbers run up."},
	} {
		said := []string{}
		for _, found := range checkNote(tabled+one.table, schema, "spec/sample/one.md") {
			if found.Rule == "Schema.Examples" {
				said = append(said, found.Message)
			}
		}
		if got := strings.Join(said, "\n"); got != one.says {
			t.Errorf("the table\n%sanswers %q, and wants %q", one.table, got, one.says)
		}
	}
}
