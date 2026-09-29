// The fields the queue splits its lists by, and the port naming the tickets
// the cloud holds.
// [[spec/tickets/the-queue-becomes-a-module]]
package tickets

import (
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const personLeaf = `---
kind: [[ticket]]
state: open
cloud: true
todo: another-one
step: design/owner-read
steps:
  - name: design
    steps:
      - name: owner-read
        by: person
      - name: draft
        by: anyone
record:
  - step: design/owner-read
    hand: box one
    hash_before: aaa
---

# Ask

A leaf a person takes.
`

func TestAFrontReadsHeldPersonAndCloud(t *testing.T) {
	one := Of("spec/tickets/one.md", "one", personLeaf, 0)
	if !one.Held || !one.Person || !one.Cloud || one.TodoAt != "another-one" {
		t.Fatalf("the front reads held, person, cloud and the todo's anchor, and the ticket reads %+v", one)
	}
	bare := Of("spec/tickets/two.md", "two", "---\nstate: open\nstep: design/draft\n---\n", 0)
	if bare.Held || bare.Person || bare.Cloud || bare.TodoAt != "" {
		t.Fatalf("a bare front reads none of the four, and the ticket reads %+v", bare)
	}
}

func TestTheCloudPortNamesAMarkedGroup(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { withTips(c) })
	index.Seed(map[string]any{
		"files/spec/tickets/marked.md":    q.Content{Hash: "m", Text: "---\nkind: [[ticket]]\nstate: open\ncloud: true\nprocess: [[spec/processes/group]]\n---\n"},
		"files/spec/tickets/its-child.md": q.Content{Hash: "c", Text: "---\nkind: [[ticket]]\nstate: open\ngroup: marked\n---\n"},
		"files/spec/tickets/free.md":      q.Content{Hash: "f", Text: "---\nkind: [[ticket]]\nstate: open\n---\n"},
	})
	said, _ := index.Run(CloudPort).([]string)
	if want := []string{"its-child", "marked"}; !reflect.DeepEqual(said, want) {
		t.Fatalf("%s reads %v, and wants %v", CloudPort, said, want)
	}
}
