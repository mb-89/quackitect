// The schema reader and the note checker. A file in spec/schemas says what one
// kind of note holds, this reads it, and the checker weighs a note against it.
// The caller hands the tree in, so a test drives both over a fake one.
// [[spec/design_output/schema#the-reader-and-the-checker]]
package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

const (
	Schemas   = "spec/schemas"
	SchemaEnd = ".schema.yaml"
)

// Schemas keep the order the folder lists them, so a governor answers the same
// way every sweep.
type Kinds struct {
	order []string
	at    map[string]*Doc
}

func (one *Kinds) set(kind string, said *Doc) {
	if one.at == nil {
		one.at = map[string]*Doc{}
	}
	if _, held := one.at[kind]; !held {
		one.order = append(one.order, kind)
	}
	one.at[kind] = said
}

func (one *Kinds) Get(kind string) *Doc {
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
func isNoteSchema(said *Doc) bool {
	if said == nil || asString(said.Get("kind")) == "" {
		return false
	}
	body := asDoc(said.Get("body"))
	return body != nil && len(asList(body.Get("sections"))) > 0
}

// [[spec/design_output/schema#the-schemas-read-once]]
func schemasIn(tree *Tree) *Kinds {
	out := &Kinds{}
	for _, name := range tree.Names(Schemas, SchemaEnd) {
		said := asDoc(readYaml(tree.Read(Schemas + "/" + name)))
		if isNoteSchema(said) {
			out.set(asString(said.Get("kind")), said)
		}
	}
	return out
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
func governorOf(schemas *Kinds, path string) *Doc {
	where := slashed(path)
	for _, kind := range schemas.order {
		schema := schemas.at[kind]
		for _, glob := range stringsOf(schema.Get("governs")) {
			if matches(glob, where) {
				return schema
			}
		}
	}
	return nil
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
func strangerFault(text string, schema *Doc, where string) (Finding, bool) {
	held := asString(schema.Get("kind"))
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
func checkNote(text string, schema *Doc, where string) []Finding {
	note := readNote(text)
	kind := asString(schema.Get("kind"))
	out := frontFaults(note, asDoc(schema.Get("frontmatter")), kind, where)
	return append(out, bodyFaults(note, asDoc(schema.Get("body")), kind, where)...)
}

func frontFaults(note Note, spec *Doc, kind, where string) []Finding {
	if !note.Front.Stands {
		return []Finding{schemaFault("Frontmatter", where, 1,
			fmt.Sprintf("A %s note opens with frontmatter.", kind))}
	}

	out := []Finding{}
	said := note.Front.Said
	props := asDoc(spec.Get("properties"))

	for _, key := range stringsOf(spec.Get("required")) {
		if !empty(said.Get(key)) {
			continue
		}
		out = append(out, schemaFault(key, where, 1,
			fmt.Sprintf("A %s note names %s in its frontmatter.", kind, key)))
	}

	for _, key := range said.Keys() {
		value := said.Get(key)
		rule := asDoc(props.Get(key))
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

func fieldFaults(key string, value any, rule *Doc, kind, where string, line int) []Finding {
	out := []Finding{}
	isLink := asBool(rule.Get("x-link"))
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
			fmt.Sprintf("%s reads %s, and a %s note names %s.", key, show(said), kind, asString(rule.Get("const")))))
	}
	if allowed, held := rule.Get("enum").([]any); held {
		if !holds(allowed, said) {
			out = append(out, schemaFault(key, where, line,
				fmt.Sprintf("%s reads %s, and the schema allows %s.", key, show(said), joined(allowed, ", "))))
		}
	}
	if rule.Has("type") && !typed(value, rule.Get("type")) {
		out = append(out, schemaFault(key, where, line,
			fmt.Sprintf("%s takes %s, and this reads %s.", key, joined(flat(rule.Get("type")), " or "), typeOf(value))))
	}
	return out
}

type standingAt struct {
	Section
	at int
}

func bodyFaults(note Note, spec *Doc, kind, where string) []Finding {
	level := 1
	if spec.Has("headingLevel") {
		level = asInt(spec.Get("headingLevel"))
	}
	wanted := asList(spec.Get("sections"))

	standing := []standingAt{}
	for i, one := range note.Sections {
		if one.Level == level {
			standing = append(standing, standingAt{Section: one, at: i})
		}
	}

	named := map[string]*Doc{}
	for _, one := range wanted {
		if rule := asDoc(one); rule != nil {
			named[asString(rule.Get("header"))] = rule
		}
	}

	out := []Finding{}
	for _, one := range wanted {
		rule := asDoc(one)
		if rule == nil || !asBool(rule.Get("required")) {
			continue
		}
		header := asString(rule.Get("header"))
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

	if asString(spec.Get("order")) == "strict" {
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

func orderFaults(standing []standingAt, wanted []any, kind, where string) []Finding {
	order := []string{}
	for _, one := range wanted {
		if rule := asDoc(one); rule != nil {
			order = append(order, asString(rule.Get("header")))
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
		rule := asDoc(one)
		if rule == nil || asString(rule.Get("position")) != "last" {
			continue
		}
		header := asString(rule.Get("header"))
		found := headed(standing, header)
		if found < 0 || found == len(standing)-1 {
			continue
		}
		out = append(out, schemaFault(header, where, standing[found].Line,
			fmt.Sprintf("%s closes this note, and %s stands after it.", header, standing[found+1].Header)))
	}
	return out
}

func sectionFaults(held standingAt, rule *Doc, note Note, where string) []Finding {
	out := []Finding{}
	items := itemsIn(held.Own)

	if asBool(rule.Get("list")) && len(items) == 0 {
		out = append(out, schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s holds a list of items.", held.Header)))
	}
	if asBool(rule.Get("ordered")) && someUnnumbered(items) {
		out = append(out, schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s numbers every item.", held.Header)))
	}
	if most := asInt(rule.Get("maxItems")); most > 0 && len(items) > most {
		out = append(out, schemaFault(held.Header, where, held.Line+items[most].line,
			fmt.Sprintf("A note holds %d items.", most)))
	}
	if spec := asDoc(rule.Get("subsections")); spec != nil {
		out = append(out, underFaults(held, spec, note, where)...)
	}
	return out
}

type numberedSection struct {
	said   int
	line   int
	header string
}

func underFaults(held standingAt, spec *Doc, note Note, where string) []Finding {
	level := held.Level + 1
	if spec.Has("headingLevel") {
		level = asInt(spec.Get("headingLevel"))
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
		if asBool(spec.Get("numbered")) && found == nil {
			out = append(out, schemaFault(held.Header, where, one.Line,
				fmt.Sprintf("A chapter under %s opens with the number of the item it argues.", held.Header)))
			continue
		}
		if found != nil {
			said, _ := strconv.Atoi(found[1])
			numbers = append(numbers, numberedSection{said: said, line: one.Line, header: one.Header})
		}
	}

	if asString(spec.Get("order")) != "strict" {
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
func placeholderFaults(text string, schema *Doc, where string) []Finding {
	rows := splitLines(text)
	note := readNote(text)
	props := asDoc(asDoc(schema.Get("frontmatter")).Get("properties"))
	out := []Finding{}

	for _, key := range note.Front.LineKeys {
		line := note.Front.Lines[key]
		rule := asDoc(props.Get(key))
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
	for _, one := range asList(asDoc(schema.Get("body")).Get("sections")) {
		rule := asDoc(one)
		if rule == nil {
			continue
		}
		if said := asString(rule.Get("description")); said != "" {
			named[asString(rule.Get("header"))] = fmt.Sprintf("<!-- %s -->", said)
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

	if governor != nil && asString(governor.Get("kind")) != kind {
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

func minted(rule *Doc) string {
	if rule.Has("const") {
		if asBool(rule.Get("x-link")) {
			return fmt.Sprintf("[[%s]]", asString(rule.Get("const")))
		}
		return asString(rule.Get("const"))
	}
	if allowed, listed := rule.Get("enum").([]any); listed && len(allowed) > 0 {
		return asString(allowed[0])
	}

	said := asString(rule.Get("description"))
	if said == "" {
		said = "what goes here"
	}
	for _, one := range flat(rule.Get("type")) {
		if asString(one) == "array" {
			return fmt.Sprintf("[%q]", said)
		}
	}
	if asBool(rule.Get("x-link")) {
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

// same reads the way strict equality reads: a type apart is a value apart.
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
	if asDoc(a) != nil || asDoc(b) != nil {
		return false
	}
	return fmt.Sprintf("%T:%v", a, a) == fmt.Sprintf("%T:%v", b, b)
}

func typed(value any, said any) bool {
	for _, one := range flat(said) {
		switch asString(one) {
		case "array":
			if _, held := value.([]any); held {
				return true
			}
		case "object":
			if asDoc(value) != nil {
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
	if asDoc(value) != nil {
		return "a map"
	}
	return "one line"
}

func show(said any) string {
	flatSaid := asString(said)
	if one, held := said.([]any); held {
		flatSaid = joined(one, ", ")
	}
	if len(flatSaid) > 40 {
		return flatSaid[:37] + "..."
	}
	return flatSaid
}

func joined(said []any, with string) string {
	parts := make([]string, 0, len(said))
	for _, one := range said {
		parts = append(parts, asString(one))
	}
	return strings.Join(parts, with)
}
