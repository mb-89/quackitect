// The schema reader and the note checker. A file in spec/schemas says what one
// kind of note holds, this reads it, and the checker weighs a note against it.
// The caller hands the tree in, so a test drives both over a fake one.
// [[spec/design_output/schema#the-reader-and-the-checker]]
package main

import (
	"quackitect/yaml"

	"fmt"
	"sort"
	"strconv"
	"strings"
)

const (
	Schemas   = "spec/schemas"
	SchemaEnd = ".schema.yaml"
	shown     = 40
	ellipsis  = "..."
)

// [[spec/design_output/schema#the-schemas-read-once]]
type Kinds struct {
	order []string
	at    map[string]*yaml.Doc
}

func (one *Kinds) set(kind string, said *yaml.Doc) {
	if one.at == nil {
		one.at = map[string]*yaml.Doc{}
	}
	if _, held := one.at[kind]; !held {
		one.order = append(one.order, kind)
	}
	one.at[kind] = said
}

func (one *Kinds) Get(kind string) *yaml.Doc {
	if one == nil {
		return nil
	}
	return one.at[kind]
}

func (one *Kinds) Len() int {
	if one == nil {
		return 0
	}
	return len(one.order)
}

func (one *Kinds) Names() []string {
	out := append([]string(nil), one.order...)
	sort.Strings(out)
	return out
}

// [[spec/design_output/schema#a-schema-names-its-chapters]]
func isNoteSchema(said *yaml.Doc) bool {
	if said == nil || yaml.AsString(said.Get("kind")) == "" {
		return false
	}
	body := yaml.AsDoc(said.Get("body"))
	return body != nil && len(yaml.AsList(body.Get("sections"))) > 0
}

// [[spec/design_output/schema#the-schemas-read-once]]
func schemasIn(tree *Tree) *Kinds {
	out := &Kinds{}
	for _, name := range tree.Names(Schemas, SchemaEnd) {
		said := yaml.AsDoc(yaml.Read(tree.Read(Schemas + "/" + name)))
		if isNoteSchema(said) {
			out.set(yaml.AsString(said.Get("kind")), said)
		}
	}
	return out
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
func governorOf(schemas *Kinds, path string) *yaml.Doc {
	where := slashed(path)
	for _, kind := range schemas.order {
		schema := schemas.at[kind]
		for _, glob := range yaml.StringsOf(schema.Get("governs")) {
			if matches(glob, where) {
				return schema
			}
		}
	}
	return nil
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
func strangerFault(text string, schema *yaml.Doc, where string) (Finding, bool) {
	held := yaml.AsString(schema.Get("kind"))
	kind := kindOf(text)
	if held == "" || kind == held {
		return Finding{}, false
	}
	if kind == "" {
		return schemaFault("Kind", where, 1,
			fmt.Sprintf("%s names no kind, and the %s schema governs this path.", where, held)), true
	}
	return schemaFault("Kind", where, 1,
		fmt.Sprintf("%s reads as a %s, and the %s schema governs this path.", where, kind, held)), true
}

// [[spec/design_output/schema#a-finding-names-the-section]]
func checkNote(text string, schema *yaml.Doc, where string) []Finding {
	note := readNote(text)
	kind := yaml.AsString(schema.Get("kind"))
	out := frontFaults(note, yaml.AsDoc(schema.Get("frontmatter")), kind, where)
	return append(out, bodyFaults(note, yaml.AsDoc(schema.Get("body")), kind, where)...)
}

func frontFaults(note Note, spec *yaml.Doc, kind, where string) []Finding {
	if !note.Front.Stands {
		return []Finding{schemaFault("Frontmatter", where, 1,
			fmt.Sprintf("A %s note opens with frontmatter.", kind))}
	}

	out := []Finding{}
	said := note.Front.Said
	props := yaml.AsDoc(spec.Get("properties"))

	for _, key := range yaml.StringsOf(spec.Get("required")) {
		if !yaml.Empty(said.Get(key)) {
			continue
		}
		out = append(out, schemaFault(key, where, 1,
			fmt.Sprintf("A %s note names %s in its frontmatter.", kind, key)))
	}

	for _, key := range said.Keys() {
		value := said.Get(key)
		rule := yaml.AsDoc(props.Get(key))
		line := note.Front.Lines[key]
		if line == 0 {
			line = 1
		}
		if rule == nil {
			if spec.Get("additionalProperties") == false {
				out = append(out, schemaFault(key, where, line,
					fmt.Sprintf("The %s schema names no %s.", kind, key)))
			}
			continue
		}
		out = append(out, fieldFaults(key, value, rule, kind, where, line)...)
	}
	return out
}

func fieldFaults(key string, value any, rule *yaml.Doc, kind, where string, line int) []Finding {
	out := []Finding{}
	isLink := yaml.AsBool(rule.Get("x-link"))
	said := value
	if isLink {
		said = linkless(value)
	}

	if isLink && !linked(value) {
		out = append(out, schemaFault(key, where, line,
			fmt.Sprintf("%s names a link, and this reads %s.", key, show(value))))
	}
	if rule.Has("const") && !same(said, rule.Get("const")) {
		out = append(out, schemaFault(key, where, line,
			fmt.Sprintf("%s reads %s, and a %s note names %s.", key, show(said), kind, yaml.AsString(rule.Get("const")))))
	}
	if allowed, held := rule.Get("enum").([]any); held {
		if !holds(allowed, said) {
			out = append(out, schemaFault(key, where, line,
				fmt.Sprintf("%s reads %s, and the schema allows %s.", key, show(said), joined(allowed, ", "))))
		}
	}
	if rule.Has("type") && !typed(value, rule.Get("type")) {
		out = append(out, schemaFault(key, where, line,
			fmt.Sprintf("%s takes %s, and this reads %s.", key, joined(yaml.Flat(rule.Get("type")), " or "), typeOf(value))))
	}
	return out
}

type standingAt struct {
	Section
	at int
}

func bodyFaults(note Note, spec *yaml.Doc, kind, where string) []Finding {
	level := 1
	if spec.Has("headingLevel") {
		level = yaml.AsInt(spec.Get("headingLevel"))
	}
	wanted := chaptersWanted(yaml.AsList(spec.Get("sections")), note.Front.Said)

	standing := []standingAt{}
	for i, one := range note.Sections {
		if one.Level == level {
			standing = append(standing, standingAt{Section: one, at: i})
		}
	}

	named := map[string]*yaml.Doc{}
	for _, one := range wanted {
		if rule := yaml.AsDoc(one); rule != nil {
			named[yaml.AsString(rule.Get("header"))] = rule
		}
	}

	out := []Finding{}
	for _, one := range wanted {
		rule := yaml.AsDoc(one)
		if rule == nil || !yaml.AsBool(rule.Get("required")) {
			continue
		}
		header := yaml.AsString(rule.Get("header"))
		if headed(standing, header) >= 0 {
			continue
		}
		out = append(out, schemaFault(header, where, 1,
			fmt.Sprintf("A %s note carries a %s chapter.", kind, header)))
	}

	for _, held := range standing {
		if _, ours := named[held.Header]; ours {
			continue
		}
		if spec.Get("extraSections") == false {
			out = append(out, schemaFault(held.Header, where, held.Line,
				fmt.Sprintf("The %s schema names no %s chapter.", kind, held.Header)))
		}
	}

	if yaml.AsString(spec.Get("order")) == "strict" {
		out = append(out, orderFaults(standing, wanted, kind, where)...)
	}
	out = append(out, lastFaults(standing, wanted, where)...)

	for _, held := range standing {
		if rule, ours := named[held.Header]; ours {
			out = append(out, sectionFaults(held, rule, note, where)...)
		}
	}
	return out
}

// [[spec/design_output/schema#three-keywords-name-a-step]]
func chaptersWanted(sections []any, front *yaml.Doc) []any {
	out := []any{}
	for _, one := range sections {
		rule := yaml.AsDoc(one)
		list := ""
		if rule != nil {
			list = yaml.AsString(rule.Get("x-one-per"))
		}
		if list == "" {
			out = append(out, one)
			continue
		}
		if front == nil {
			continue
		}
		for _, step := range yaml.AsList(front.Get(list)) {
			said := yaml.AsDoc(step)
			if said == nil {
				continue
			}
			header := strings.TrimSpace(yaml.AsString(said.Get("name")))
			if header == "" {
				continue
			}
			chapter := yaml.New()
			chapter.Set("header", header)
			chapter.Set("required", true)
			out = append(out, chapter)
		}
	}
	return out
}

func orderFaults(standing []standingAt, wanted []any, kind, where string) []Finding {
	order := []string{}
	for _, one := range wanted {
		if rule := yaml.AsDoc(one); rule != nil {
			order = append(order, yaml.AsString(rule.Get("header")))
		}
	}

	held := []standingAt{}
	for _, one := range standing {
		if at(order, one.Header) >= 0 {
			held = append(held, one)
		}
	}

	out := []Finding{}
	for i := 1; i < len(held); i++ {
		if at(order, held[i].Header) > at(order, held[i-1].Header) {
			continue
		}
		out = append(out, schemaFault(held[i].Header, where, held[i].Line,
			fmt.Sprintf("%s stands after %s, and a %s note puts it first.", held[i].Header, held[i-1].Header, kind)))
	}
	return out
}

func lastFaults(standing []standingAt, wanted []any, where string) []Finding {
	out := []Finding{}
	for _, one := range wanted {
		rule := yaml.AsDoc(one)
		if rule == nil || yaml.AsString(rule.Get("position")) != "last" {
			continue
		}
		header := yaml.AsString(rule.Get("header"))
		found := headed(standing, header)
		if found < 0 || found == len(standing)-1 {
			continue
		}
		out = append(out, schemaFault(header, where, standing[found].Line,
			fmt.Sprintf("%s closes this note, and %s stands after it.", header, standing[found+1].Header)))
	}
	return out
}

func sectionFaults(held standingAt, rule *yaml.Doc, note Note, where string) []Finding {
	out := []Finding{}
	items := itemsIn(held.Own)

	if yaml.AsBool(rule.Get("list")) && len(items) == 0 {
		out = append(out, schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s holds a list of items.", held.Header)))
	}
	if yaml.AsBool(rule.Get("ordered")) && someUnnumbered(items) {
		out = append(out, schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s numbers every item.", held.Header)))
	}
	if most := yaml.AsInt(rule.Get("maxItems")); most > 0 && len(items) > most {
		out = append(out, schemaFault(held.Header, where, held.Line+items[most].line,
			fmt.Sprintf("A note holds %d items.", most)))
	}
	if spec := yaml.AsDoc(rule.Get("subsections")); spec != nil {
		out = append(out, underFaults(held, spec, note, where)...)
	}
	return out
}

type numberedSection struct {
	said   int
	line   int
	header string
}

func underFaults(held standingAt, spec *yaml.Doc, note Note, where string) []Finding {
	level := held.Level + 1
	if spec.Has("headingLevel") {
		level = yaml.AsInt(spec.Get("headingLevel"))
	}

	out := []Finding{}
	numbers := []numberedSection{}
	for _, one := range note.Sections[held.at+1:] {
		if one.Level <= held.Level {
			break
		}
		if one.Level != level {
			continue
		}
		found := numberedAt.FindStringSubmatch(one.Header)
		if yaml.AsBool(spec.Get("numbered")) && found == nil {
			out = append(out, schemaFault(held.Header, where, one.Line,
				fmt.Sprintf("A chapter under %s opens with the number of the item it argues.", held.Header)))
			continue
		}
		if found != nil {
			said, _ := strconv.Atoi(found[1])
			numbers = append(numbers, numberedSection{said: said, line: one.Line, header: one.Header})
		}
	}

	if yaml.AsString(spec.Get("order")) != "strict" {
		return out
	}
	for i := 1; i < len(numbers); i++ {
		if numbers[i].said > numbers[i-1].said {
			continue
		}
		out = append(out, schemaFault(held.Header, where, numbers[i].line,
			fmt.Sprintf("%s stands after %s, and the numbers run up.", numbers[i].header, numbers[i-1].header)))
	}
	return out
}

// [[spec/design_output/schema#a-placeholder-stands-at-warning]]
func placeholderFaults(text string, schema *yaml.Doc, where string) []Finding {
	rows := yaml.SplitLines(text)
	note := readNote(text)
	props := yaml.AsDoc(yaml.AsDoc(schema.Get("frontmatter")).Get("properties"))
	out := []Finding{}

	for _, key := range note.Front.LineKeys {
		line := note.Front.Lines[key]
		rule := yaml.AsDoc(props.Get(key))
		if rule == nil || rule.Has("const") {
			continue
		}
		if _, listed := rule.Get("enum").([]any); listed {
			continue
		}
		if line-1 >= len(rows) || strings.TrimSpace(rows[line-1]) != fmt.Sprintf("%s: %s", key, minted(rule)) {
			continue
		}
		out = append(out, left(where, line, key))
	}

	named := map[string]string{}
	for _, one := range yaml.AsList(yaml.AsDoc(schema.Get("body")).Get("sections")) {
		rule := yaml.AsDoc(one)
		if rule == nil {
			continue
		}
		if said := yaml.AsString(rule.Get("description")); said != "" {
			named[yaml.AsString(rule.Get("header"))] = fmt.Sprintf("<!-- %s -->", said)
		}
	}
	for _, held := range note.Sections {
		said, ours := named[held.Header]
		if !ours {
			continue
		}
		for i, line := range held.Own {
			if strings.TrimSpace(line) != said {
				continue
			}
			out = append(out, left(where, held.Line+i+1, held.Header))
			break
		}
	}
	return out
}

func left(file string, line int, what string) Finding {
	return Finding{
		File:     file,
		Rule:     "Schema.Placeholder",
		Line:     line,
		Column:   1,
		Message:  what + " still carries the placeholder mint writes. Say what stands there.",
		Severity: SeverityWarning,
	}
}

// [[spec/design_output/schema#the-sweep-over-the-tree]]
func schemaFaults(tree *Tree) []Finding {
	schemas := schemasIn(tree)
	out := []Finding{}
	if schemas.Len() == 0 {
		return out
	}

	for _, path := range tree.Paths() {
		if !strings.HasSuffix(path, ".md") {
			continue
		}
		text := tree.Read(path)
		out = append(out, noteFaults(schemas, path, text)...)
	}
	return out
}

// [[spec/design_output/schema#the-sweep-over-the-tree]]
func noteFaults(schemas *Kinds, path, text string) []Finding {
	out := []Finding{}
	kind := kindOf(text)
	governor := governorOf(schemas, path)

	if governor != nil && yaml.AsString(governor.Get("kind")) != kind {
		if found, stands := strangerFault(text, governor, path); stands {
			out = append(out, found)
		}
		return out
	}
	if kind == "" {
		return out
	}

	schema := schemas.Get(kind)
	if schema == nil {
		return append(out, schemaFault("Kind", path, 1,
			fmt.Sprintf("%s names no schema, and %s holds %s.", kind, Schemas, strings.Join(schemas.Names(), ", "))))
	}
	out = append(out, checkNote(text, schema, path)...)
	return append(out, placeholderFaults(text, schema, path)...)
}

func minted(rule *yaml.Doc) string {
	if rule.Has("const") {
		if yaml.AsBool(rule.Get("x-link")) {
			return fmt.Sprintf("[[%s]]", yaml.AsString(rule.Get("const")))
		}
		return yaml.AsString(rule.Get("const"))
	}
	if allowed, listed := rule.Get("enum").([]any); listed && len(allowed) > 0 {
		return yaml.AsString(allowed[0])
	}

	said := yaml.AsString(rule.Get("description"))
	if said == "" {
		said = "what goes here"
	}
	for _, one := range yaml.Flat(rule.Get("type")) {
		if yaml.AsString(one) == "array" {
			return fmt.Sprintf("[%q]", said)
		}
	}
	if yaml.AsBool(rule.Get("x-link")) {
		return fmt.Sprintf("[[%s]]", said)
	}
	return said
}

func schemaFault(rule, file string, line int, message string) Finding {
	return fault("Schema."+nameOf(rule), file, line, message)
}

func nameOf(said string) string {
	parts := []string{}
	for _, one := range strings.FieldsFunc(said, func(r rune) bool {
		return !(r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9')
	}) {
		parts = append(parts, one)
	}
	if len(parts) == 1 {
		return parts[0]
	}
	out := &strings.Builder{}
	for _, one := range parts {
		out.WriteString(strings.ToUpper(one[:1]) + one[1:])
	}
	return out.String()
}

func headed(standing []standingAt, header string) int {
	for i, one := range standing {
		if one.Header == header {
			return i
		}
	}
	return -1
}

func at(order []string, said string) int {
	for i, one := range order {
		if one == said {
			return i
		}
	}
	return -1
}

func someUnnumbered(items []item) bool {
	for _, one := range items {
		if !numberedAt.MatchString(one.said) {
			return true
		}
	}
	return false
}

func holds(allowed []any, said any) bool {
	for _, one := range allowed {
		if same(one, said) {
			return true
		}
	}
	return false
}

// [[spec/design_output/schema#a-finding-names-the-section]]
func same(a, b any) bool {
	one, ours := a.([]any)
	two, theirs := b.([]any)
	if ours || theirs {
		if !ours || !theirs || len(one) != len(two) {
			return false
		}
		for i := range one {
			if !same(one[i], two[i]) {
				return false
			}
		}
		return true
	}
	if yaml.AsDoc(a) != nil || yaml.AsDoc(b) != nil {
		return false
	}
	return fmt.Sprintf("%T:%v", a, a) == fmt.Sprintf("%T:%v", b, b)
}

func typed(value any, said any) bool {
	for _, one := range yaml.Flat(said) {
		switch yaml.AsString(one) {
		case "array":
			if _, held := value.([]any); held {
				return true
			}
		case "object":
			if yaml.AsDoc(value) != nil {
				return true
			}
		case "string":
			if _, held := value.(string); held {
				return true
			}
		case "integer", "number":
			if _, held := value.(int); held {
				return true
			}
		case "boolean":
			if _, held := value.(bool); held {
				return true
			}
		default:
			return true
		}
	}
	return false
}

func typeOf(value any) string {
	if _, held := value.([]any); held {
		return "a list"
	}
	if yaml.AsDoc(value) != nil {
		return "a map"
	}
	return "one line"
}

func show(said any) string {
	flatSaid := yaml.AsString(said)
	if one, held := said.([]any); held {
		flatSaid = joined(one, ", ")
	}
	if len(flatSaid) > shown {
		return flatSaid[:shown-len(ellipsis)] + ellipsis
	}
	return flatSaid
}

func joined(said []any, with string) string {
	parts := make([]string, 0, len(said))
	for _, one := range said {
		parts = append(parts, yaml.AsString(one))
	}
	return strings.Join(parts, with)
}
