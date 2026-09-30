// The mint: a note off a schema and the fields a caller names, in the shape
// the schema asks, off mintNote and mintedNote in lib/schema-mint.js.
// [[spec/design_output/schema#mint-writes-a-valid-note]]
package check

import (
	"fmt"
	"sort"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The tool a mint answers as, the end a note carries, and the placeholder a list and a table row take. [[spec/design_output/schema#the-tool-writes-the-note]]
const (
	mintTool   = "mint_note"
	noteEnd    = ".md"
	firstOne   = "Say the first one here."
	firstIndex = "1"
)

// The note a mint writes, or why it refuses: a path another kind governs, a kind no schema names, or faults the schema finds. [[spec/design_output/schema#the-tool-writes-the-note]]
func mintedNote(schemas *Kinds, kind, where string, fields map[string]any) (string, string) {
	kind, where = strings.TrimSpace(kind), strings.TrimSpace(where)
	kinds := strings.Join(schemas.Names(), ", ")
	if kind == "" || where == "" {
		return "", fmt.Sprintf("%s takes a kind and a path. %s holds %s.", mintTool, Schemas, kinds)
	}
	if !strings.HasSuffix(where, noteEnd) {
		return "", where + " names no markdown file."
	}
	schema := schemas.Get(kind)
	if schema == nil {
		return "", fmt.Sprintf("%s holds no %s. It holds %s.", Schemas, kind, kinds)
	}
	if !isDraft(where) {
		if governor := governorOf(schemas, where); governor != nil {
			if held := yaml.AsString(governor.Get("kind")); held != kind {
				return "", fmt.Sprintf("%s governs %s, and this note names %s. Name a path the %s schema governs.", held, where, kind, kind)
			}
		}
	}
	text := mintNote(schema, fields)
	if found := checkNote(text, schema, where); len(found) > 0 {
		lines := []string{fmt.Sprintf("The %s schema refuses this write to %s.", kind, where), ""}
		for _, one := range found {
			lines = append(lines, fmt.Sprintf("  %s:%d:%d  %s\n    %s", where, one.Line, one.Column, one.Rule, one.Message))
		}
		return "", strings.Join(lines, "\n")
	}
	return text, ""
}

// [[spec/design_output/schema#mint-writes-a-valid-note]]
func mintNote(schema *yaml.Doc, fields map[string]any) string {
	spec := yaml.AsDoc(schema.Get("frontmatter"))
	props := yaml.AsDoc(spec.Get("properties"))
	given := map[string]any{}
	for key, value := range fields {
		given[slugOf(key)] = value
	}
	required := yaml.StringsOf(spec.Get("required"))
	values, held := front.Ordered{}, yaml.New()
	for _, key := range required {
		values = append(values, front.Pair{Key: key, Value: frontValue(key, yaml.AsDoc(props.Get(key)), given, held)})
	}
	for _, key := range props.Keys() {
		if _, named := given[slugOf(key)]; at(required, key) >= 0 || !named {
			continue
		}
		values = append(values, front.Pair{Key: key, Value: frontValue(key, yaml.AsDoc(props.Get(key)), given, held)})
	}
	rows := []string{strings.TrimRight(front.Mint(values), "\n"), ""}
	body := yaml.AsDoc(schema.Get("body"))
	level := 1
	if said, ok := body.Get("headingLevel").(int); ok && said > 0 {
		level = said
	}
	for _, each := range chaptersWanted(yaml.AsList(body.Get("sections")), held) {
		one := yaml.AsDoc(each)
		header := yaml.AsString(one.Get("header"))
		rows = append(rows, strings.Repeat("#", level)+" "+header, "")
		if said := strings.TrimSpace(textOf(given[slugOf(header)])); said != "" {
			rows = append(rows, said, "")
			continue
		}
		if said := yaml.AsString(one.Get("description")); said != "" {
			rows = append(rows, "<!-- "+said+" -->", "")
		}
		if said := yaml.AsString(one.Get("form")); said != "" {
			rows = append(rows, "<!-- the form is "+said+" -->", "")
		}
		if yaml.AsBool(one.Get("list")) {
			first := "- " + firstOne
			if yaml.AsBool(one.Get("ordered")) {
				first = firstIndex + ". " + firstOne
			}
			rows = append(rows, first, "")
		}
		if table := yaml.AsDoc(one.Get("table")); table != nil {
			rows = append(append(rows, tableRows(table)...), "")
		}
	}
	return strings.TrimRight(strings.Join(rows, "\n"), " \n") + "\n"
}

// The value a front key takes, and what the body's chapters read of it. [[spec/design_output/schema#the-render-follows-the-tree]]
func frontValue(key string, rule *yaml.Doc, given map[string]any, held *yaml.Doc) any {
	if rule.Has("const") {
		held.Set(key, rule.Get("const"))
		return placeheld(rule)
	}
	said, named := given[slugOf(key)]
	bare := !named || said == nil || (!isBlock(said) && strings.TrimSpace(textOf(said)) == "")
	value := said
	if bare {
		if !rule.Has("default") {
			held.Set(key, minted(rule))
			return placeheld(rule)
		}
		value = rule.Get("default")
	}
	held.Set(key, value)
	if isBlock(value) {
		return frontOfValue(value)
	}
	return written(value, rule)
}

// The placeholder a key takes, as a list where the key takes a list. [[spec/design_output/schema#the-render-follows-the-tree]]
func placeheld(rule *yaml.Doc) any {
	if rule.Has("const") || rule.Has("enum") || !takesList(rule) {
		return minted(rule)
	}
	said := yaml.AsString(rule.Get("description"))
	if said == "" {
		said = "what goes here"
	}
	return []any{said}
}

// A value the caller names, a link where the key takes one, and a list where the key takes a list. [[spec/design_output/schema#the-render-follows-the-tree]]
func written(said any, rule *yaml.Doc) any {
	var each []any
	for _, one := range yaml.Flat(said) {
		text := strings.TrimSpace(textOf(one))
		if text == "" {
			continue
		}
		if yaml.AsBool(rule.Get("x-link")) && !yaml.LinkAt.MatchString(text) {
			text = "[[" + text + "]]"
		}
		each = append(each, text)
	}
	if _, isList := said.([]any); isList || takesList(rule) {
		if each == nil {
			each = []any{}
		}
		return each
	}
	if len(each) == 0 {
		return ""
	}
	return each[0]
}

// [[spec/design_output/schema#the-render-follows-the-tree]]
func takesList(rule *yaml.Doc) bool {
	for _, one := range yaml.Flat(rule.Get("type")) {
		if yaml.AsString(one) == "array" {
			return true
		}
	}
	return false
}

// Whether a value lays out as a block: an object, or a list holding one. [[spec/design_output/schema#the-render-follows-the-tree]]
func isBlock(value any) bool {
	switch said := value.(type) {
	case map[string]any, *yaml.Doc:
		return true
	case []any:
		for _, one := range said {
			if isBlock(one) {
				return true
			}
		}
	}
	return false
}

// A value as the front writer takes it: an object keeps its key order, and a map sorts its keys. [[spec/design_output/schema#the-render-follows-the-tree]]
func frontOfValue(value any) any {
	switch said := value.(type) {
	case *yaml.Doc:
		out := front.Ordered{}
		for _, key := range said.Keys() {
			out = append(out, front.Pair{Key: key, Value: frontOfValue(said.Get(key))})
		}
		return out
	case map[string]any:
		keys := make([]string, 0, len(said))
		for key := range said {
			keys = append(keys, key)
		}
		sort.Strings(keys)
		out := front.Ordered{}
		for _, key := range keys {
			out = append(out, front.Pair{Key: key, Value: frontOfValue(said[key])})
		}
		return out
	case []any:
		out := make([]any, 0, len(said))
		for _, one := range said {
			out = append(out, frontOfValue(one))
		}
		return out
	case nil, string, bool:
		return said
	}
	return fmt.Sprint(value)
}

// The head row a table names, and one row under it where the rows name a list. [[spec/design_output/schema#a-chapter-holds-a-table]]
func tableRows(table *yaml.Doc) []string {
	heads := yaml.StringsOf(table.Get("heads"))
	rules := make([]string, len(heads))
	for i := range heads {
		rules[i] = "---"
	}
	out := []string{"| " + strings.Join(heads, " | ") + " |", "|" + strings.Join(rules, "|") + "|"}
	if yaml.AsString(table.Get("namesOf")) == "" {
		return out
	}
	cells := make([]string, len(heads))
	for i := range heads {
		cells[i] = firstOne
	}
	if len(cells) > 0 {
		cells[0] = firstIndex
	}
	return append(out, "| "+strings.Join(cells, " | ")+" |")
}

// [[spec/design_output/schema#mint-writes-a-valid-note]]
func textOf(said any) string {
	if said == nil {
		return ""
	}
	if text, ok := said.(string); ok {
		return text
	}
	return fmt.Sprint(said)
}
