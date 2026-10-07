// The person steps a ticket's route holds, repaired to name the engine as
// their reader, off src/scripts/pull-hand.js.
// [[spec/design_output/pull#the-work-answer]]
package pull

import (
	"fmt"
	"strings"

	"quackitect/src/failure"
	"quackitect/src/modules/check"
	"quackitect/src/yaml"
)

// A person step names the engine as its reader, so an older ticket lacking it takes it. [[spec/design_output/pull#the-work-answer]]
func (it *It) repairPersonSteps(who *Who) {
	for _, one := range it.ticketsHere() {
		put := it.withEngineReader(one)
		if put == "" {
			continue
		}
		one.Text = put
		it.landedAlone(one, []string{"a person step names the engine as its reader"})
		if !one.Private {
			it.pushed(who.Branch)
		}
	}
}

func (it *It) withEngineReader(one *Held) string {
	front := FrontOf(one.Text)
	lacking := []Entry{}
	for _, held := range WalkOf(front) {
		if personStep.MatchString(held.Name) && yaml.AsString(held.Said.Get("by")) == Person && held.Said.Get("to") == nil {
			lacking = append(lacking, held)
		}
	}
	bare := false
	for _, row := range rowsOf(one.Text) {
		bare = bare || bareAsks.MatchString(row)
	}
	if len(lacking) == 0 && !bare {
		return ""
	}
	steps := cloneList(yaml.Flat(front.Get("steps")))
	for _, held := range lacking {
		if step := stepAt(steps, held.Path); step != nil {
			step.Set("to", "engine")
		}
	}
	return it.reRouted(one.Text, steps, "")
}

// The step at a path of a route. [[spec/design_output/pull#a-person-step-goes-in]]
func stepAt(steps []any, path string) *yaml.Doc {
	parts := strings.Split(path, "/")
	list := steps
	for _, part := range parts[:len(parts)-1] {
		var next []any
		for _, one := range list {
			if step := yaml.AsDoc(one); step != nil && yaml.AsString(step.Get("name")) == part {
				next = yaml.Flat(step.Get("steps"))
				break
			}
		}
		list = next
	}
	for _, one := range list {
		if step := yaml.AsDoc(one); step != nil && yaml.AsString(step.Get("name")) == parts[len(parts)-1] {
			return step
		}
	}
	return nil
}

// A text rewritten over a new route, through the mint's chapters, or empty where no ticket schema stands. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func (it *It) reRouted(text string, steps []any, hash string) string {
	schema := it.ticketSchema()
	if schema == nil {
		return ""
	}
	return check.ReRouted(text, schema, steps, hash)
}

// The ticket schema, or nothing where the tree holds none. [[spec/design_output/pull#the-checks]]
func (it *It) ticketSchema() *yaml.Doc {
	if it.Schemas == nil {
		return nil
	}
	if kinds := it.Schemas(); kinds != nil {
		return kinds.Get("ticket")
	}
	return nil
}

// [[spec/design_output/pull#a-person-step-goes-in]]
func (it *It) withPersonStep(one *Held, before, asks string, options []string) string {
	standing := 0
	for _, step := range WalkOf(FrontOf(one.Text)) {
		if personStep.MatchString(step.Name) {
			standing++
		}
	}
	if it.Splits > 0 && standing >= it.Splits {
		it.Refuse(failure.Raise(it.Failures, "pull-person-steps-split", fmt.Sprintf("%s carries %d person steps already, so split it: hand back --became <ticket>.", one.Name, standing)))
		return ""
	}
	by := Person
	if it.Cloud {
		by = "anyone"
	}
	answer := yaml.New()
	answer.Set("name", "answer")
	answer.Set("form", "text")
	if options != nil {
		answer.Set("form", "choice")
	}
	answer.Set("says", "the answer, which the step behind this one reads")
	if options != nil {
		answer.Set("options", stringsAny(options))
	}
	step := yaml.New()
	step.Set("name", fmt.Sprintf("person-%d", standing+1))
	step.Set("does", "answers the question the engine asks")
	step.Set("by", by)
	step.Set("to", "engine")
	step.Set("asks", asks)
	step.Set("evidence", []any{answer})
	return it.inserted(one, before, step)
}

// A step written into the route before the leaf named, the pointer on it. [[spec/design_output/pull#a-person-step-goes-in]]
func (it *It) inserted(one *Held, before string, step *yaml.Doc) string {
	steps := cloneList(yaml.Flat(FrontOf(one.Text).Get("steps")))
	parts := strings.Split(before, "/")
	holder, list := (*yaml.Doc)(nil), steps
	for _, part := range parts[:len(parts)-1] {
		var phase *yaml.Doc
		for _, held := range list {
			if each := yaml.AsDoc(held); each != nil && yaml.AsString(each.Get("name")) == part {
				phase = each
				break
			}
		}
		if phase == nil {
			return ""
		}
		holder, list = phase, yaml.Flat(phase.Get("steps"))
	}
	at := -1
	for i, held := range list {
		if each := yaml.AsDoc(held); each != nil && yaml.AsString(each.Get("name")) == parts[len(parts)-1] {
			at = i
			break
		}
	}
	if at < 0 {
		return ""
	}
	list = append(list[:at], append([]any{step}, list[at:]...)...)
	if holder == nil {
		steps = list
	} else {
		holder.Set("steps", list)
	}
	path := strings.Join(append(append([]string{}, parts[:len(parts)-1]...), yaml.AsString(step.Get("name"))), "/")
	text := one.Text
	if put := it.reRouted(one.Text, steps, ""); put != "" {
		text = put
	}
	one.Text = withField(withField(text, "step", path), "state", Open)
	return path
}

// A deep copy of a route, so an edit to it leaves the ticket's own read alone. [[spec/design_output/pull#a-person-step-goes-in]]
func cloneList(list []any) []any {
	out := make([]any, 0, len(list))
	for _, one := range list {
		out = append(out, cloneValue(one))
	}
	return out
}

func cloneValue(value any) any {
	switch said := value.(type) {
	case *yaml.Doc:
		out := yaml.New()
		for _, key := range said.Keys() {
			out.Set(key, cloneValue(said.Get(key)))
		}
		return out
	case []any:
		return cloneList(said)
	}
	return value
}
