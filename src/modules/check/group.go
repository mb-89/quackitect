package check

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

const (
	groupAsks = "GroupAsksNobody"
	stateOpen = "open"
	byPerson  = "person"
	byAnyone  = "anyone"
	onHanded  = "handed"
)

// The `from:` line under `# Ask` that sends a ticket through a leaf gated `when: handed`. [[spec/design_output/pull#a-condition-skips-a-leaf]]
var fromHandover = regexp.MustCompile(`(?im)^from:[ \t]*handover[ \t]*$`)

// An open group holds no child at a step a person takes, so a cloud box works the group to its merge and waits on nobody. [[spec/design_output/work#a-person-step-leaves]]
func groupAsksNobody(tree *Tree) []Finding {
	out := []Finding{}
	for _, name := range tree.Names(ticketsAt, ".md") {
		path := ticketsAt + name
		text := tree.Read(path)
		front := frontOf(yaml.SplitLines(text)).Said
		group := yaml.AsString(front.Get("group"))
		if group == "" || yaml.AsString(front.Get("state")) != stateOpen {
			continue
		}
		held := frontOf(yaml.SplitLines(tree.Read(ticketsAt + group + ".md"))).Said
		if yaml.AsString(held.Get("state")) != stateOpen {
			continue
		}
		step, by, when := leafBy(front)
		if by != byPerson || skipsHanded(when, text) {
			continue
		}
		child := strings.TrimSuffix(name, ".md")
		out = append(out, fault(groupAsks, path, 1, fmt.Sprintf(
			"%s stands at %s, a step a person takes, inside the open group %s. A desk runs ./RUNME.sh branch unblock %s <successor>. A cloud box takes the step, per rule 7 of spec/guidance/cloud/cloud.",
			child, step, group, child)))
	}
	return out
}

// A leaf gated `when: handed` stands skipped where the Ask comes off no handover, so the pull passes it and nobody waits there. [[spec/design_output/pull#a-condition-skips-a-leaf]]
func skipsHanded(when, text string) bool {
	if when != onHanded {
		return false
	}
	ask := text
	if at := strings.Index(ask, "\n# Ask"); at >= 0 {
		ask = ask[at+len("\n# Ask"):]
	}
	if next := strings.Index(ask, "\n# "); next >= 0 {
		ask = ask[:next]
	}
	return !fromHandover.MatchString(ask)
}

// The leaf the ticket's `step` names, or the first leaf where it names none, the nearest `by` on its path, and the leaf's own `when`, as `LeafOf` and `StepPathOf` in src/pull/pull_route.go read them. [[spec/design_output/work#a-person-step-leaves]]
func leafBy(front *yaml.Doc) (string, string, string) {
	wanted := strings.Split(yaml.AsString(front.Get("step")), "/")
	steps := yaml.AsList(front.Get("steps"))
	path, by, when := []string{}, byAnyone, ""
	for depth := 0; len(steps) > 0; depth++ {
		var found *yaml.Doc
		for _, one := range steps {
			doc := yaml.AsDoc(one)
			if doc == nil {
				continue
			}
			if depth >= len(wanted) || wanted[depth] == "" || yaml.AsString(doc.Get("name")) == wanted[depth] {
				found = doc
				break
			}
		}
		if found == nil {
			return strings.Join(path, "/"), "", ""
		}
		path = append(path, yaml.AsString(found.Get("name")))
		if said := yaml.AsString(found.Get("by")); said != "" {
			by = said
		}
		when = yaml.AsString(found.Get("when"))
		steps = yaml.AsList(found.Get("steps"))
	}
	return strings.Join(path, "/"), by, when
}
