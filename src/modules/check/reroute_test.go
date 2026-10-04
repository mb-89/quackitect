// The re-route keeps the chapters a route still names, and lays the new one.
// [[spec/tickets/work-verbs-port-to-go]]
package check

import (
	"strings"
	"testing"

	"quackitect/src/yaml"
)

// A schema whose body lays the Ask, then one chapter a step. [[spec/design_output/schema#the-render-follows-the-tree]]
const routeSchema = `frontmatter:
  properties:
    kind: {}
    state: {}
    steps: {}
    step: {}
body:
  sections:
    - header: Ask
      description: what the ticket asks
    - x-one-per: steps
`

// A step put in before the leaf gets its chapter, and the leaf keeps what its chapter holds. [[spec/design_output/schema#the-render-follows-the-tree]]
func TestARerouteKeepsTheHeldChapters(t *testing.T) {
	text := "---\nkind: \"[[ticket]]\"\nstate: open\nsteps:\n  - name: build\n    does: builds it\nstep: build\n---\n\n# Ask\n\nBuild it.\n\n# build\n\nIt builds.\n"
	steps := yaml.AsDoc(yaml.Read("steps:\n  - name: person-1\n    does: answers\n  - name: build\n    does: builds it\n")).Get("steps")
	said := ReRouted(text, yaml.AsDoc(yaml.Read(routeSchema)), steps)
	for _, want := range []string{"  - name: person-1\n", "# Ask\n\nBuild it.\n", "# person-1\n\n<!-- answers -->\n", "# build\n\nIt builds.\n"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the re-route holds no %q:\n%s", want, said)
		}
	}
	if strings.Index(said, "# person-1") > strings.Index(said, "# build") {
		t.Fatalf("the new chapter stands after the leaf:\n%s", said)
	}
}
