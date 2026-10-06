// The process read and its hash answer what process.js and processHash
// answered over the same text, and the tickets a group holds read as
// pull-hand.js read them.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package pull

import (
	"strings"
	"testing"

	"quackitect/src/yaml"
)

func TestProcessHash(t *testing.T) {
	t.Parallel()
	// The hashes processHash in lib/schema-route.js answered over each text. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
	cases := []struct{ text, hash string }{
		{"ask:\n  - name: why\n    form: text\n    says: why it matters\nsteps:\n  - name: build\n    does: makes the change\n    evidence:\n      - name: lint\n        form: command\n        expects: 0\n        says: the tree lints\n", "61a7767d3f2bb8d1"},
		{"ask:\n  - name: gain\n    form: text\n    says: what \"it\" gains, and why\nsteps:\n  - name: build\n    tags: [code, testing]\n    final: true\n    expects: 0\n    steps:\n      - name: one\n        does: a step\n", "64f39a6dc090b185"},
		{"steps:\n  - name: alone\n", "b1244a03d4019ed6"},
	}
	for _, one := range cases {
		if got := ProcessHash(yaml.AsDoc(yaml.Read(one.text))); got != one.hash {
			t.Errorf("the hash of\n%s\nreads %s, and processHash answers %s", one.text, got, one.hash)
		}
	}
}

// Each named field lands in the order the process names it, a text field as a paragraph and a list field as lines, and a field nobody names stays out. [[spec/tickets/verbs-mint-tickets-and-keys]]
func TestAskFromWritesEachFieldInRouteOrder(t *testing.T) {
	t.Parallel()
	ask := []any{}
	for _, one := range [][2]string{{"gain", "text"}, {"breaks", "text"}, {"done_when", "list"}, {"view", "text"}} {
		field := yaml.New()
		field.Set("name", one[0])
		field.Set("form", one[1])
		ask = append(ask, field)
	}
	said := map[string][]string{"done_when": {"one passes", "two passes"}, "gain": {"It gains."}, "breaks": {"It breaks."}}
	if got, want := AskFrom(ask, said), "It gains.\n\nIt breaks.\n\n- one passes\n- two passes"; got != want {
		t.Errorf("AskFrom reads %q, want %q", got, want)
	}
}

func TestProcessAt(t *testing.T) {
	t.Parallel()
	disk := FakeDisk{"spec/processes/small.yaml": "ask:\n  - name: why\n    says: why it matters\nsteps:\n  - name: build\n", "spec/processes/group.yaml": "steps: []\n"}
	t.Run("a link, a path and a bare name read one process", func(t *testing.T) {
		for _, said := range []string{"small", "[[spec/processes/small]]", "spec/processes/small.yaml"} {
			held, why := ProcessAt(disk, said)
			if why != "" || held.Link != "spec/processes/small" || len(held.Route) != 1 || held.Hash == "" {
				t.Fatalf("%s reads %+v, %q", said, held, why)
			}
		}
	})
	t.Run("a name no process holds names the ones that stand", func(t *testing.T) {
		if _, why := ProcessAt(disk, "nope"); why != "spec/processes holds no nope. It holds group, small." {
			t.Fatalf("the read answers %q", why)
		}
		if _, why := ProcessAt(disk, ""); why != "Name a process. spec/processes holds group, small." {
			t.Fatalf("the read answers %q", why)
		}
	})
	t.Run("an ask row with no form reads as text", func(t *testing.T) {
		held, _ := ProcessAt(disk, "small")
		if got := AskRows(held.Ask); got != "<!-- why, as text: why it matters -->" {
			t.Fatalf("the ask rows read %q", got)
		}
	})
}

func TestGroups(t *testing.T) {
	t.Parallel()
	disk := FakeDisk{
		"spec/tickets/big.md":   "---\nprocess: [[spec/processes/group]]\n---\n",
		"spec/tickets/inner.md": "---\nprocess: [[spec/processes/group]]\ngroup: big\n---\n",
		"spec/tickets/leaf.md":  "---\nprocess: [[spec/processes/trivial]]\ngroup: inner\n---\n",
		".se/tickets/aside.md":  "---\ngroup: big\n---\n",
		"spec/tickets/shut.md":  "---\nstate: closed\nprocess: [[spec/processes/group]]\n---\n",
	}
	t.Run("a group holds its groups' children, and a private note stands outside it", func(t *testing.T) {
		names := []string{}
		for _, one := range ChildrenOf(TicketsHere(disk), "big") {
			names = append(names, one.Name)
		}
		if strings.Join(names, " ") != "inner leaf" {
			t.Fatalf("big holds %v", names)
		}
	})
	t.Run("a group no ticket names stands refused", func(t *testing.T) {
		if why := EmptyGroup(disk, "---\nprocess: spec/processes/group\n---\n", "lonely"); !strings.HasPrefix(why, "lonely is a group, and no ticket names it") {
			t.Fatalf("the read answers %q", why)
		}
		if why := EmptyGroup(disk, disk["spec/tickets/big.md"], "big"); why != "" {
			t.Fatalf("a group with children answers %q", why)
		}
	})
	t.Run("a ticket naming a closed group stands refused", func(t *testing.T) {
		if why := ClosedGroup(disk, "---\ngroup: shut\n---\n"); !strings.HasPrefix(why, "shut stands closed, so it takes no new child.") {
			t.Fatalf("the read answers %q", why)
		}
		if why := ClosedGroup(disk, disk["spec/tickets/leaf.md"]); why != "" {
			t.Fatalf("a ticket under an open group answers %q", why)
		}
	})
	t.Run("a box's ticket joins its group, and the group itself and a person's process stay out", func(t *testing.T) {
		for _, one := range []struct{ group, process, branch, name, want string }{
			{"", "spec/processes/trivial", "work/big", "fix", "big"},
			{"other", "spec/processes/trivial", "work/big", "fix", "other"},
			{"", "spec/processes/trivial", "main", "fix", ""},
			{"", "spec/processes/group", "work/big", "big", ""},
			{"", "[[spec/processes/person]]", "work/big", "fix", ""},
		} {
			if got := JoinsGroup(one.group, one.process, one.branch, one.name); got != one.want {
				t.Errorf("%+v joins %q", one, got)
			}
		}
	})
}
