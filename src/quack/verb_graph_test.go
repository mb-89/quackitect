// The graph verb answers a process or a ticket as the nodes and the edges
// graphIn in src/scripts/graph.js draws, as JSON indented by two.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
package main

import (
	"strings"
	"testing"
)

const graphProcess = `steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
      - name: review
        by: person
        on_fail: draft
  - name: build
    when: cloud
`

// What graphIn answers for graphProcess, as JSON.stringify writes it indented by two. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
const graphDrawn = `{
  "nodes": [
    {
      "id": "design",
      "name": "design",
      "kind": "phase",
      "parent": ""
    },
    {
      "id": "design/draft",
      "name": "draft",
      "kind": "leaf",
      "parent": "design",
      "does": "writes the approach"
    },
    {
      "id": "design/review",
      "name": "review",
      "kind": "leaf",
      "parent": "design",
      "person": true
    },
    {
      "id": "build",
      "name": "build",
      "kind": "leaf",
      "parent": "",
      "when": "cloud",
      "dotted": true
    }
  ],
  "edges": [
    {
      "from": "design",
      "to": "design/draft",
      "kind": "holds",
      "label": "holds"
    },
    {
      "from": "design",
      "to": "design/review",
      "kind": "holds",
      "label": "holds"
    },
    {
      "from": "design",
      "to": "build",
      "kind": "pass",
      "label": "pass"
    },
    {
      "from": "design/draft",
      "to": "design/review",
      "kind": "pass",
      "label": "pass"
    },
    {
      "from": "design/review",
      "to": "design/draft",
      "kind": "fail",
      "label": "fail"
    }
  ]
}
`

func TestGraphVerb(t *testing.T) {
	t.Run("a process answers its graph as JSON indented by two", func(t *testing.T) {
		root := t.TempDir()
		seedsFile(t, root, "spec/processes/small.yaml", graphProcess)
		code, said := runsVerb(t, root, "graph", "spec/processes/small.yaml")
		if code != 0 || said != graphDrawn {
			t.Fatalf("the graph answers %d:\n%s\nand wants:\n%s", code, said, graphDrawn)
		}
	})
	t.Run("a ticket reads through its front, and each node names its chapter and its line", func(t *testing.T) {
		root := t.TempDir()
		seedsFile(t, root, "spec/tickets/small.md", "---\nkind: [[ticket]]\nstep: design/draft\nsteps:\n  - name: design\n    steps:\n      - name: draft\n---\n\n# Ask\n\nsome ask\n\n# design\n\n## draft\n")
		code, said := runsVerb(t, root, "graph", "spec/tickets/small.md")
		for _, want := range []string{`"chapter": "## draft"`, `"line": 16`, `"at": true`, `"reached": true`, `"chapter": "# design"`} {
			if code != 0 || !strings.Contains(said, want) {
				t.Fatalf("the graph answers %d:\n%s\nand wants %s", code, said, want)
			}
		}
	})
	t.Run("a path standing nowhere comes back refused", func(t *testing.T) {
		code, said := runsVerb(t, t.TempDir(), "graph", "spec/processes/gone.yaml")
		if code != 2 || !strings.Contains(said, "spec/processes/gone.yaml stands nowhere.") {
			t.Fatalf("the graph answers %d, %q", code, said)
		}
	})
	t.Run("a call naming no path prints the usage", func(t *testing.T) {
		code, said := runsVerb(t, t.TempDir(), "graph")
		if code != 2 || !strings.Contains(said, "Usage: ./RUNME.sh graph <process or ticket>") || !strings.Contains(said, "It answers the nodes and the edges as JSON, and draws nothing.") {
			t.Fatalf("the graph answers %d, %q", code, said)
		}
	})
}
