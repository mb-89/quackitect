// The example schema this tree ships, read off spec/schemas: the check the lint
// and the write door ask refuses an example out of shape, field by field.
// [[spec/design_output/examples#the-format]]
package imports_test

import (
	"os" // level0: OutsideInDoors - the cases read the example schema and the examples the tree ships, as a build check reads source
	"path/filepath"
	"reflect"
	"slices"
	"sort"
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

// A user example the schema passes whole. [[spec/design_output/examples#the-format]]
const wholeExample = "---\nkind: [[example]]\ntitle: The check runs\nkeywords: [check]\ninterface: [check]\n---\n\nThe check runs.\n\n```sh\n./RUNME.sh check\n# expect: exit 0\n```\n"

func TestTheExampleSchemaRefusesAnExampleOutOfShape(t *testing.T) {
	t.Parallel()
	schema, err := os.ReadFile(filepath.Join("..", "..", "spec", "schemas", "example.schema.yaml"))
	if err != nil {
		t.Fatalf("the example schema stands nowhere: %v", err)
	}
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
		tree := check.TreeOver("/tree", check.Texts{"spec/schemas/example.schema.yaml": string(schema), one.path: one.text})
		got := []string{}
		for _, found := range check.CheckerOver(tree, 0, 0).Over(one.path) {
			if strings.HasPrefix(found.Rule, "Schema.") || strings.HasPrefix(found.Rule, "Example.") {
				got = append(got, found.Rule)
			}
		}
		if sort.Strings(got); !reflect.DeepEqual(got, one.want) {
			t.Errorf("%s: the check names %v, and wants %v", one.name, got, one.want)
		}
	}
}

// The verbs the first chapters show, which the coverage rule names no more over this tree's examples and verb files. [[spec/tickets/example-first-chapters-stand]]
func TestTheFirstChaptersLeaveTheirVerbsUnreported(t *testing.T) {
	t.Parallel()
	root, texts := filepath.Join("..", ".."), check.Texts{}
	for _, folder := range []string{"spec/examples", "src/quack"} {
		_ = filepath.WalkDir(filepath.Join(root, folder), func(at string, one os.DirEntry, err error) error {
			if err == nil && !one.IsDir() && !strings.HasSuffix(at, "_test.go") {
				text, _ := os.ReadFile(at)
				rel, _ := filepath.Rel(root, at)
				texts[filepath.ToSlash(rel)] = string(text)
			}
			return err
		})
	}
	if texts["spec/examples/110_tickets/pull.md"] == "" {
		t.Fatal("the tree the rule reads holds no first example")
	}
	for _, one := range check.ExampleCovers(check.TreeOver("/tree", texts)) {
		if call, _, _ := strings.Cut(one.Message, check.UnshownSays); slices.Contains([]string{"ticket pull", "ticket note", "ticket set", "ticket todo", "ticket urgent", "branch", "check"}, strings.TrimPrefix(call, "./RUNME.sh ")) {
			t.Errorf("the coverage report names a verb the first chapters show: %s", one.Message)
		}
	}
}
