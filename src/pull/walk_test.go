// The walk names each step by its path, finds a step a keyword names, and
// reads the leaves a ticket reached.
// [[spec/design_input/the-agent-pulls-tickets#the-route]]
package pull

import (
	"testing"

	"quackitect/src/yaml"
)

const walkFront = `step: build/one
steps:
  - name: design
    steps:
      - name: draft
  - name: build
    steps:
      - name: one
      - name: two
record:
  - step: build/two
`

func TestWalk(t *testing.T) {
	t.Parallel()
	front := yaml.AsDoc(yaml.Read(walkFront))
	walk := EntriesIn(front.Get("steps"))
	paths := []string{}
	for _, one := range walk {
		paths = append(paths, one.Path)
	}
	if got := Canonical(stringsAny(paths)); got != `["design","design/draft","build","build/one","build/two"]` || walk[0].Leaf || !walk[1].Leaf {
		t.Fatalf("the walk reads %s", got)
	}
	holder := walk[4]
	if one, ok := EntryNamed(walk, "one", &holder); !ok || one.Path != "build/one" {
		t.Fatalf("a sibling reads %+v", one)
	}
	if one, ok := EntryNamed(walk, "design", &holder); !ok || one.Path != "design" {
		t.Fatalf("a top step reads %+v", one)
	}
	reached := ReachedOf(front)
	if len(reached) != 3 || !reached["design/draft"] || !reached["build/one"] || !reached["build/two"] {
		t.Fatalf("the reached leaves read %v", reached)
	}
}
