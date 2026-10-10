// A ticket on an old hash keeps its step where the route moved in its wording
// alone, and takes the new wording on the leaves ahead.
// [[spec/tickets/tests-green-names-the-ask]]
package pull // level0: InPackageTest - the case hashes a leaf as the record keeps it

import (
	"strings"
	"testing"

	"quackitect/src/yaml"
)

// The new tests-green wording the reworded process carries. [[spec/tickets/tests-green-names-the-ask]]
const newGreen = "makes the change the ask names, the red tests its floor"

// A leaf as the route a ticket copied holds it, with the one field it answers. [[spec/tickets/tests-green-names-the-ask]]
type oldLeaf struct{ name, field, text string }

func leafNamed(name, extra, field string) oldLeaf {
	return oldLeaf{name, field, "  - name: " + name + "\n" + extra + "    to: retro\n    evidence:\n      - name: " + field + "\n        form: text\n        says: what it holds\n"}
}

func routeOf(leaves []oldLeaf) string {
	text := ""
	for _, one := range leaves {
		text += one.text
	}
	return text
}

// The route a ticket copied, in the order the standard route stands. [[spec/tickets/tests-green-names-the-ask]]
var oldLeaves = []oldLeaf{
	leafNamed("draft", "    does: writes the approach\n", "approach"),
	leafNamed("gate", "    gate: does the approach answer the ask\n    does: reads the design\n", "verdict"),
	leafNamed("tests-green", "    does: makes the tests pass\n", "says"),
	leafNamed("later", "    does: reads the work\n", "seen"),
}

// The process past the reword: the gate scopes the reviewer, and tests-green aims at the ask. [[spec/tickets/tests-green-names-the-ask]]
func rewordedProcess() string {
	text := "steps:\n" + routeOf(oldLeaves)
	text = strings.Replace(text, "does the approach answer the ask", "which rules of the ask does the work break", 1)
	return strings.Replace(text, "makes the tests pass", newGreen, 1)
}

// A ticket on an old hash at the step named, its record holding the def of every leaf before it. [[spec/tickets/tests-green-names-the-ask]]
func oldHashTicket(step string) string {
	record, chapters := "", ""
	reached := true
	for _, leaf := range oldLeaves {
		name := leaf.name
		reached = reached && name != step
		chapters += "# " + name + "\n\n## " + leaf.field + "\n\n"
		if reached {
			said := yaml.AsDoc(yaml.Flat(yaml.Read(leaf.text))[0])
			record += "  - step: " + name + "\n    hand: box cafecafecafe · claude-code-remote\n    def: " + HashOf(said) + "\n"
			chapters += "It holds " + name + ".\n\n"
		}
	}
	return "---\nkind: [[ticket]]\nstate: open\nsteps:\n" + routeOf(oldLeaves) +
		"process: [[spec/processes/small]]\nprocess_hash: \"abcdabcdabcdabcd\"\ngroup: g\nstep: " + step + "\nrecord:\n" + record +
		"---\n\n# Ask\n\nSome change the owner asks for.\n\n" + chapters + "# Discussion\n"
}

// The first pull over the ticket at the step named and the process named, and what it hands out. [[spec/tickets/tests-green-names-the-ask]]
func pullsOldHash(t *testing.T, step, process string) string {
	t.Helper()
	it, out, errs := cloudPull(t)
	it.Method = workRoot
	must(t, it.Disk.Write("spec/processes/small.yaml", process))
	must(t, it.Disk.Write("spec/tickets/alpha.md", oldHashTicket(step)))
	if code := it.Pulling([]string{"pull"}); code != 0 {
		t.Fatalf("the pull answers %d:\n%s\n%s", code, out, errs)
	}
	return out.String()
}

func TestATicketPastTestsGreenKeepsItsStepOnAReword(t *testing.T) {
	if said := pullsOldHash(t, "later", rewordedProcess()); !strings.HasPrefix(said, "work  alpha at later") {
		t.Fatalf("the pull hands out:\n%s", said)
	}
}

func TestATicketAtTestsGreenTakesTheNewWording(t *testing.T) {
	said := pullsOldHash(t, "tests-green", rewordedProcess())
	if !strings.HasPrefix(said, "work  alpha at tests-green") || !strings.Contains(said, newGreen) {
		t.Fatalf("the pull hands out:\n%s", said)
	}
}

func TestAnEvidenceMoveStillSendsATicketBack(t *testing.T) {
	moved := "steps:\n" + strings.Replace(routeOf(oldLeaves), "name: says\n        form: text", "name: says\n        form: list", 1)
	if said := pullsOldHash(t, "later", moved); !strings.HasPrefix(said, "work  alpha at tests-green") {
		t.Fatalf("the pull hands out:\n%s", said)
	}
}
