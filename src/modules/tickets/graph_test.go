// The graph of one file: a process reads whole as a route and places nothing,
// and a ticket reads through its front and places each node at its chapter.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
package tickets

import "testing"

func TestGraphIn(t *testing.T) {
	t.Run("a process reads whole, and its nodes stand under no chapter", func(t *testing.T) {
		said := GraphIn("steps:\n  - name: draft\n  - name: review\n    on_fail: draft\n")
		if len(said.Nodes) != 2 || said.Nodes[0].Chapter != "" || len(said.Edges) != 2 || said.Edges[1].Kind != failEdge {
			t.Fatalf("the graph reads %+v", said)
		}
	})
	t.Run("a ticket reads through its front, and a node names its chapter", func(t *testing.T) {
		said := GraphIn("---\nkind: [[ticket]]\nstep: draft\nsteps:\n  - name: draft\n---\n\n# Ask\n\n# draft\n")
		if len(said.Nodes) != 1 || said.Nodes[0].Chapter != "# draft" || said.Nodes[0].Line != 10 || !said.Nodes[0].At {
			t.Fatalf("the graph reads %+v", said)
		}
	})
}
