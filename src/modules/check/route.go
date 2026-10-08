// The route checks: the keywords naming a step, and the slots a route feeds,
// off refersFaults and slotFaults the plugin library held.
// [[spec/design_output/schema#keywords-that-name-a-step]]
package check

import (
	"fmt"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/yaml"
)

// The suffix a gate's reject names each copy with. [[spec/design_output/pull#the-gate]]
var roundAt = regexp.MustCompile(`-\d+$`)

// The inputs a step reads from outside the route, and the forms the engine reads. [[spec/design_input/the-agent-pulls-tickets#the-route]]
var (
	outside     = []string{"ask", "diff"}
	engineReads = []string{"command", "verdict"}
)

// One step of a route, by its path and the key path it stands at. [[spec/design_output/schema#keywords-that-name-a-step]]
type entry struct {
	name, path, parent, at string
	said                   *yaml.Doc
	leaf                   bool
	index                  int
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func entriesIn(list any, base, parent string, out []*entry) []*entry {
	for i, each := range yaml.AsList(list) {
		one := yaml.AsDoc(each)
		if one == nil {
			continue
		}
		name := yaml.AsString(one.Get("name"))
		path := name
		if parent != "" {
			path = parent + "/" + name
		}
		at := fmt.Sprintf("%s[%d]", base, i)
		leaf := !slices.ContainsFunc(yaml.AsList(one.Get("steps")), func(it any) bool { return yaml.AsDoc(it) != nil })
		out = append(out, &entry{name: name, path: path, parent: parent, at: at, said: one, leaf: leaf, index: len(out)})
		if !leaf {
			out = entriesIn(one.Get("steps"), at+".steps", path, out)
		}
	}
	return out
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func holderOf(walk []*entry, at string) *entry {
	var out *entry
	for _, one := range walk {
		if strings.HasPrefix(at, one.at+".") && (out == nil || len(one.at) > len(out.at)) {
			out = one
		}
	}
	return out
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func entryNamed(walk []*entry, said string, holder *entry) *entry {
	want := strings.TrimSpace(said)
	if want == "" {
		return nil
	}
	if strings.Contains(want, "/") {
		return firstEntry(walk, func(one *entry) bool { return one.path == want })
	}
	parent := ""
	if holder != nil {
		parent = holder.parent
	}
	if sibling := firstEntry(walk, func(one *entry) bool { return one.parent == parent && one.name == want }); sibling != nil {
		return sibling
	}
	return firstEntry(walk, func(one *entry) bool { return one.parent == "" && one.name == want })
}

func firstEntry(walk []*entry, holds func(*entry) bool) *entry {
	if at := slices.IndexFunc(walk, holds); at >= 0 {
		return walk[at]
	}
	return nil
}

func stepPaths(walk []*entry) string {
	out := []string{}
	for _, one := range walk {
		out = append(out, one.path)
	}
	return strings.Join(out, ", ")
}

// The step a keyword names, with a word it admits and the prefix it reads past taken off. [[spec/design_output/schema#keywords-that-name-a-step]]
func wantedStep(said string, rule *yaml.Doc) (string, bool) {
	if said == "" || slices.Contains(yaml.StringsOf(rule.Get("x-words")), said) {
		return "", false
	}
	prefix := yaml.AsString(rule.Get("x-prefix"))
	if prefix != "" && strings.HasPrefix(said, prefix+" ") {
		return strings.TrimSpace(said[len(prefix)+1:]), true
	}
	return said, true
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func refersFaults(key string, value any, rule *yaml.Doc, held keyWalk, at string, line int) []Finding {
	earlier := yaml.AsString(rule.Get("x-earlier"))
	list := yaml.AsString(rule.Get("x-names"))
	if list == "" {
		list = earlier
	}
	if list == "" {
		return nil
	}
	walk := entriesIn(held.root.Get(list), list, "", nil)
	holder := holderOf(walk, at)
	out := []Finding{}
	for _, one := range yaml.Flat(value) {
		said, named := wantedStep(strings.TrimSpace(yaml.AsString(one)), rule)
		if !named {
			continue
		}
		found := entryNamed(walk, said, holder)
		if found == nil {
			if fieldBefore(walk, holder, said, rule) {
				continue
			}
			standing := stepPaths(walk)
			if standing == "" {
				standing = "no entry"
			}
			out = append(out, schemaFault(key, held.where, line, fmt.Sprintf("%s names %s, and %s holds %s.", key, show(said), list, standing)))
			continue
		}
		if yaml.AsBool(rule.Get("x-leaf")) && !found.leaf {
			out = append(out, schemaFault(key, held.where, line, fmt.Sprintf("%s names a leaf, and %s holds steps.", key, found.path)))
		}
		if earlier != "" && holder != nil && found.index >= holder.index && !fieldBefore(walk, holder, said, rule) {
			out = append(out, schemaFault(key, held.where, line, fmt.Sprintf("%s names %s, and a %s names a step standing before %s.", key, found.path, held.kind, holder.path)))
		}
	}
	return out
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func fieldBefore(walk []*entry, holder *entry, said string, rule *yaml.Doc) bool {
	list := yaml.AsString(rule.Get("x-fields"))
	if list == "" || holder == nil {
		return false
	}
	for _, one := range walk[:holder.index] {
		if namesField(one.said.Get(list), said) {
			return true
		}
	}
	return false
}

func namesField(fields any, said string) bool {
	return slices.ContainsFunc(yaml.AsList(fields), func(it any) bool {
		field := yaml.AsDoc(it)
		return field != nil && field.Has("name") && yaml.AsString(field.Get("name")) == said
	})
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func slotFaults(said *yaml.Doc, where string, lines map[string]int) []Finding {
	walk := entriesIn(said.Get("steps"), "steps", "", nil)
	held := keyWalk{where: where, lines: lines}
	reads := make([][]string, len(walk))
	for at, one := range walk {
		reads[at] = inputOf(one.said)
	}
	return append(unfedIn(walk, reads, held), orphansIn(walk, reads, held)...)
}

func inputOf(said *yaml.Doc) []string {
	out := []string{}
	for _, one := range yaml.Flat(said.Get("input")) {
		if token := strings.TrimSpace(yaml.AsString(one)); token != "" {
			out = append(out, token)
		}
	}
	return out
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func unfedIn(walk []*entry, reads [][]string, held keyWalk) []Finding {
	out := []Finding{}
	for at, one := range walk {
		for _, token := range reads[at] {
			if slices.Contains(outside, token) || feedsIt(walk, one, token) {
				continue
			}
			out = append(out, schemaFault("Input", held.where, held.lineOf(one.at+".input"),
				fmt.Sprintf("%s reads %s, and no step before it holds that. A step reads %s, an earlier step, or an earlier field.", one.path, token, strings.Join(outside, ", "))))
		}
	}
	return out
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func feedsIt(walk []*entry, holder *entry, token string) bool {
	if step := entryNamed(walk, token, holder); step != nil && step.index < holder.index {
		return true
	}
	for _, one := range walk[:holder.index] {
		if namesField(one.said.Get("evidence"), token) {
			return true
		}
	}
	return false
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func orphansIn(walk []*entry, reads [][]string, held keyWalk) []Finding {
	out := []Finding{}
	for _, one := range walk {
		if !one.leaf {
			continue
		}
		for i, each := range yaml.AsList(one.said.Get("evidence")) {
			field := yaml.AsDoc(each)
			name := yaml.AsString(field.Get("name"))
			if name == "" || slices.Contains(engineReads, yaml.AsString(field.Get("form"))) || handedOn(walk, one) || readIn(walk, reads, one, name) {
				continue
			}
			out = append(out, schemaFault("Output", held.where, held.lineOf(fmt.Sprintf("%s.evidence[%d].name", one.at, i)),
				fmt.Sprintf("%s writes %s, and nothing reads it. Name it under a later step's input, or say who takes the output under to.", one.path, name)))
		}
	}
	return out
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func handedOn(walk []*entry, leaf *entry) bool {
	for at := leaf; at != nil; {
		if strings.TrimSpace(yaml.AsString(at.said.Get("to"))) != "" {
			return true
		}
		if at.parent == "" {
			return false
		}
		parent := at.parent
		at = firstEntry(walk, func(one *entry) bool { return one.path == parent })
	}
	return false
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func readIn(walk []*entry, reads [][]string, leaf *entry, field string) bool {
	mine := map[string]bool{roundAt.ReplaceAllString(leaf.path, ""): true}
	for parts := strings.Split(leaf.path, "/"); len(parts) > 0; parts = parts[:len(parts)-1] {
		mine[strings.Join(parts, "/")] = true
	}
	for _, one := range walk[leaf.index+1:] {
		if mine[one.path] {
			continue
		}
		for _, token := range reads[one.index] {
			if token == field {
				return true
			}
			if named := entryNamed(walk, token, one); named != nil && mine[named.path] {
				return true
			}
		}
	}
	return false
}
