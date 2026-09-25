package main

import (
	"fmt"
	"strings"

	"quackitect/yaml"
)

const (
	groupAsks = "GroupAsksNobody"
	stateOpen = "open"
	byPerson  = "person"
	byAnyone  = "anyone"
)

// An open group holds no child at a step a person takes, so a cloud box works the group to its merge and waits on nobody. [[spec/design_output/work#a-person-step-leaves]]
func groupAsksNobody(tree *Tree) []Finding {
	out := []Finding{}
	for _, name := range tree.Names(ticketsAt, ".md") {
		path := ticketsAt + name
		front := frontOf(yaml.SplitLines(tree.Read(path))).Said
		group := yaml.AsString(front.Get("group"))
		if group == "" || yaml.AsString(front.Get("state")) != stateOpen {
			continue
		}
		held := frontOf(yaml.SplitLines(tree.Read(ticketsAt + group + ".md"))).Said
		if yaml.AsString(held.Get("state")) != stateOpen {
			continue
		}
		step, by := leafBy(front)
		if by != byPerson {
			continue
		}
		child := strings.TrimSuffix(name, ".md")
		out = append(out, fault(groupAsks, path, 1, fmt.Sprintf(
			"%s stands at %s, a step a person takes, inside the open group %s. A desk runs ./RUNME.sh branch unblock %s <successor>. A cloud box takes the step, per rule 7 of spec/guidance/cloud.",
			child, step, group, child)))
	}
	return out
}

// The leaf the ticket's `step` names, or the first leaf where it names none, and the nearest `by` on its path, as `leafOf` and `stepPathOf` in src/scripts/pull-route.js read them. [[spec/design_output/work#a-person-step-leaves]]
func leafBy(front *yaml.Doc) (string, string) {
	wanted := strings.Split(yaml.AsString(front.Get("step")), "/")
	steps := yaml.AsList(front.Get("steps"))
	path, by := []string{}, byAnyone
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
			return strings.Join(path, "/"), ""
		}
		path = append(path, yaml.AsString(found.Get("name")))
		if said := yaml.AsString(found.Get("by")); said != "" {
			by = said
		}
		steps = yaml.AsList(found.Get("steps"))
	}
	return strings.Join(path, "/"), by
}
