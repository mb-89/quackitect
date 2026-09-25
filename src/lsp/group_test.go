package main

import (
	"strings"
	"testing"
)

// The group a child names, open at the step that hands out its children. [[spec/design_output/work#a-person-step-leaves]]
const openGroup = `---
kind: [[ticket]]
state: open
step: children
steps:
  - name: children
    by: children
---

# Ask

The group itself.
`

// A child of that group, with the frontmatter lines a case names. [[spec/design_output/work#a-person-step-leaves]]
func groupChild(front string) string {
	return "---\nkind: [[ticket]]\ngroup: one-group\n" + front + "---\n\n# Ask\n\nOne piece of it.\n"
}

const atPerson = `state: open
step: decide
steps:
  - name: decide
    by: person
`

func groupTree(child string) *Tree {
	return fakeTree(map[string]string{
		"spec/tickets/one-group.md": openGroup,
		"spec/tickets/a-child.md":   child,
	})
}

// [[spec/design_output/work#a-person-step-leaves]]
func TestAnOpenGroupHoldingAChildAtAPersonStepDrawsTheFinding(t *testing.T) {
	one := onlyOne(t, groupAsksNobody(groupTree(groupChild(atPerson))), "GroupAsksNobody")
	if one.File != "spec/tickets/a-child.md" {
		t.Errorf("the finding names %q", one.File)
	}
	for _, said := range []string{"a-child", "decide", "./RUNME.sh branch unblock a-child", "cloud box"} {
		if !strings.Contains(one.Message, said) {
			t.Errorf("the message leaves out %q: %s", said, one.Message)
		}
	}
}

// An unblocked child closes became, so the group stands free. [[spec/design_output/work#a-person-step-leaves]]
func TestAChildClosedBecamePasses(t *testing.T) {
	closed := strings.Replace(atPerson, "state: open", "state: closed\nreason: became", 1)
	if found := groupAsksNobody(groupTree(groupChild(closed))); len(found) != 0 {
		t.Fatalf("a child closed became answers %v", found)
	}
}

// A leaf naming no `by` takes the nearest one on its path, as `leafOf` reads it. [[spec/design_output/work#a-person-step-leaves]]
func TestALeafUnderAPersonParentDrawsTheFinding(t *testing.T) {
	under := `state: open
step: answer/one
steps:
  - name: answer
    by: person
    steps:
      - name: one
        does: answers it
`
	onlyOne(t, groupAsksNobody(groupTree(groupChild(under))), "GroupAsksNobody")
}

// An empty `step` reads as the first leaf of the route, as `stepPathOf` reads it. [[spec/design_output/work#a-person-step-leaves]]
func TestAnEmptyStepReadsTheFirstLeaf(t *testing.T) {
	first := `state: open
steps:
  - name: decide
    by: person
  - name: do
    by: anyone
`
	onlyOne(t, groupAsksNobody(groupTree(groupChild(first))), "GroupAsksNobody")
}

// A leaf under no `by` takes anyone, so a hand works it. [[spec/design_output/work#a-person-step-leaves]]
func TestAChildAtAStepAnyoneTakesPasses(t *testing.T) {
	anyone := `state: open
step: design/draft
steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
`
	if found := groupAsksNobody(groupTree(groupChild(anyone))); len(found) != 0 {
		t.Fatalf("a child at a step anyone takes answers %v", found)
	}
}

// A closed group waits on nobody. [[spec/design_output/work#a-person-step-leaves]]
func TestAChildOfAClosedGroupPasses(t *testing.T) {
	tree := fakeTree(map[string]string{
		"spec/tickets/one-group.md": strings.Replace(openGroup, "state: open", "state: closed", 1),
		"spec/tickets/a-child.md":   groupChild(atPerson),
	})
	if found := groupAsksNobody(tree); len(found) != 0 {
		t.Fatalf("a child of a closed group answers %v", found)
	}
}
