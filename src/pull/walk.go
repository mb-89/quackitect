// The walk of a route: every step with its path and its parent, a leaf where
// it holds no named step, off entriesIn and entryNamed in
// .claude/skills/level0/lib/schema-route.js and reachedOf in ticket-route.js.
// [[spec/design_input/the-agent-pulls-tickets#the-route]]
package pull

import (
	"strings"

	"quackitect/src/yaml"
)

// One step of a route as the walk meets it. [[spec/design_input/the-agent-pulls-tickets#the-route]]
type Entry struct {
	Name, Path, Parent string
	Said               *yaml.Doc
	Leaf               bool
}

// Every step under the list, depth first, each phase before the steps it holds. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func EntriesIn(list any) []Entry { return entriesUnder(list, "", nil) }

func entriesUnder(list any, parent string, out []Entry) []Entry {
	for _, item := range yaml.Flat(list) {
		one := yaml.AsDoc(item)
		if one == nil {
			continue
		}
		name := yaml.AsString(one.Get("name"))
		path := name
		if parent != "" {
			path = parent + "/" + name
		}
		under := false
		for _, each := range yaml.Flat(one.Get("steps")) {
			under = under || yaml.AsDoc(each) != nil
		}
		out = append(out, Entry{Name: name, Path: path, Parent: parent, Said: one, Leaf: !under})
		if under {
			out = entriesUnder(one.Get("steps"), path, out)
		}
	}
	return out
}

// The step a keyword names: a path, a sibling of the holder, then a step at the top. [[spec/design_output/schema#keywords-that-name-a-step]]
func EntryNamed(walk []Entry, said string, holder *Entry) (Entry, bool) {
	want := strings.TrimSpace(said)
	if want == "" {
		return Entry{}, false
	}
	if strings.Contains(want, "/") {
		for _, one := range walk {
			if one.Path == want {
				return one, true
			}
		}
		return Entry{}, false
	}
	parent := ""
	if holder != nil {
		parent = holder.Parent
	}
	for _, one := range walk {
		if one.Parent == parent && one.Name == want {
			return one, true
		}
	}
	for _, one := range walk {
		if one.Parent == "" && one.Name == want {
			return one, true
		}
	}
	return Entry{}, false
}

// The leaves a ticket reached: each one at or before the pointer, and each one the record names. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ReachedOf(front *yaml.Doc) map[string]bool {
	step := strings.TrimSpace(yaml.AsString(front.Get("step")))
	walk := EntriesIn(front.Get("steps"))
	at := -1
	for i, one := range walk {
		if one.Path == step {
			at = i
			break
		}
	}
	out := map[string]bool{}
	for i, one := range walk {
		if one.Leaf && at >= 0 && i <= at {
			out[one.Path] = true
		}
	}
	for _, item := range yaml.Flat(front.Get("record")) {
		if one := yaml.AsDoc(item); one != nil && yaml.AsString(one.Get("step")) != "" {
			out[yaml.AsString(one.Get("step"))] = true
		}
	}
	return out
}

// Words as the list a YAML value holds. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func stringsAny(said []string) []any {
	out := make([]any, 0, len(said))
	for _, one := range said {
		out = append(out, one)
	}
	return out
}

// Two steps read the same where their canonical forms match. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func SameStep(a, b any) bool { return Canonical(a) == Canonical(b) }

// A phase's own fields, past the steps it holds. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func FieldsOf(said *yaml.Doc) *yaml.Doc {
	out := yaml.New()
	for _, key := range said.Keys() {
		if key != "steps" {
			out.Set(key, said.Get(key))
		}
	}
	return out
}
