// The example schema this tree ships, read off spec/schemas: the check the lint
// and the write door ask refuses an example out of shape, field by field.
// [[spec/design_output/examples#the-format]]
package main

import (
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

// A user example the schema passes whole. [[spec/design_output/examples#the-format]]
const wholeExample = "---\nkind: [[example]]\ntitle: The check runs\nkeywords: [check]\ninterface: [check]\n---\n\nThe check runs.\n\n```sh\n./RUNME.sh check\n# expect: exit 0\n```\n"

// The schema and example rules the checker names over one example, sorted. [[spec/design_output/examples#the-format]]
func exampleRules(t *testing.T, path, text string) []string {
	t.Helper()
	schema, err := os.ReadFile(filepath.Join("..", "..", "spec", "schemas", "example.schema.yaml"))
	if err != nil {
		t.Fatalf("the example schema stands nowhere: %v", err)
	}
	tree := check.TreeOver("/tree", check.Texts{"spec/schemas/example.schema.yaml": string(schema), path: text})
	out := []string{}
	for _, one := range check.CheckerOver(tree, 0, 0).Over(path) {
		if strings.HasPrefix(one.Rule, "Schema.") || strings.HasPrefix(one.Rule, "Example.") {
			out = append(out, one.Rule)
		}
	}
	sort.Strings(out)
	return out
}

func TestTheExampleSchemaRefusesAnExampleOutOfShape(t *testing.T) {
	t.Parallel()
	dev := strings.Replace(wholeExample, "interface: [check]\n", "interface: [check]\nedge: a check on an empty tree\n", 1)
	for _, one := range []struct {
		name, path, text string
		want             []string
	}{
		{"a whole user example passes", "spec/examples/110_check/runs.md", wholeExample, []string{}},
		{"a developer case naming its edge passes", "spec/examples/910_dev_check/empty.md", dev, []string{}},
		{"an example names its title, keywords and interface", "spec/examples/110_check/runs.md",
			strings.Replace(wholeExample, "title: The check runs\nkeywords: [check]\ninterface: [check]\n", "", 1),
			[]string{"Schema.interface", "Schema.keywords", "Schema.title"}},
		{"a developer case names its edge", "spec/examples/910_dev_check/empty.md", wholeExample, []string{"Schema.edge"}},
		{"a user example names no edge", "spec/examples/110_check/runs.md", dev, []string{"Schema.edge"}},
		{"a call past ./RUNME.sh refuses", "spec/examples/110_check/runs.md", strings.Replace(wholeExample, "./RUNME.sh check\n", "./RUNME.sh check | tail\n", 1), []string{"Example.Call"}},
		{"an expect form outside the table refuses", "spec/examples/110_check/runs.md", strings.Replace(wholeExample, "exit 0", "golden out.txt", 1), []string{"Example.Expect"}},
	} {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			if got := exampleRules(t, one.path, one.text); !reflect.DeepEqual(got, one.want) {
				t.Fatalf("the check names %v, and wants %v", got, one.want)
			}
		})
	}
}
