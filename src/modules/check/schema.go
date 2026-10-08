// The schema reader and the note checker. A file in spec/schemas says what one
// kind of note holds, this reads it, and the checker weighs a note against it.
// The caller hands the tree in, so a test drives both over a fake one.
// [[spec/design_output/schema#the-reader-and-the-checker]]
package check

import (
	"quackitect/src/yaml"

	"fmt"
	"sort"
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
	// Every schema by its kind, which a $ref names, and the schemas governing a data file. [[spec/design_output/schema#one-home-for-a-shape]]
	every map[string]*yaml.Doc
	data  *Kinds
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

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
func isDataSchema(said *yaml.Doc) bool {
	return said != nil && yaml.AsString(said.Get("kind")) != "" && yaml.AsDoc(said.Get("data")) != nil
}

// [[spec/design_output/schema#the-schemas-read-once]]
func schemasIn(tree *Tree) *Kinds {
	out := &Kinds{every: map[string]*yaml.Doc{}, data: &Kinds{}}
	for _, name := range tree.Names(Schemas, SchemaEnd) {
		said := yaml.AsDoc(yaml.Read(tree.Read(Schemas + "/" + name)))
		kind := yaml.AsString(said.Get("kind"))
		if kind == "" {
			continue
		}
		out.every[kind] = said
		if isNoteSchema(said) {
			out.set(kind, said)
		}
		if isDataSchema(said) {
			out.data.set(kind, said)
		}
	}
	return out
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
func governorOf(schemas *Kinds, path string) *yaml.Doc {
	if schemas == nil {
		return nil
	}
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
// A reading past one buffer wants the tree, and the write door holds none. [[spec/design_output/lsp#a-marked-rule-wants-argument]]
func checkNoteIn(tree *Tree, text string, schema *yaml.Doc, where string, schemas *Kinds) []Finding {
	out := checkNoteWith(text, schema, where, schemas)
	return append(out, markedFaults(tree, readNote(text), schema, where)...)
}

func checkNote(text string, schema *yaml.Doc, where string) []Finding {
	return checkNoteWith(text, schema, where, nil)
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
func checkNoteWith(text string, schema *yaml.Doc, where string, schemas *Kinds) []Finding {
	note := readNote(text)
	kind := yaml.AsString(schema.Get("kind"))
	out := frontFaults(note, schema, kind, where, schemas)
	return append(out, bodyFaults(note, yaml.AsDoc(schema.Get("body")), kind, where)...)
}

// What a walk over one note's keys holds: the kind, the file, the line of each key path, the root a keyword names a step in, and the schemas a $ref reads. [[spec/design_output/schema#the-checker-walks-every-key]]
type keyWalk struct {
	kind, where, calls string
	lines              map[string]int
	root, schema       *yaml.Doc
	schemas            *Kinds
}

func (one keyWalk) lineOf(path string) int {
	if line := one.lines[path]; line > 0 {
		return line
	}
	return 1
}

func frontFaults(note Note, schema *yaml.Doc, kind, where string, schemas *Kinds) []Finding {
	if !note.Front.Stands {
		return []Finding{schemaFault("Frontmatter", where, 1,
			fmt.Sprintf("A %s note opens with frontmatter.", kind))}
	}
	said := note.Front.Said
	held := keyWalk{kind: kind, where: where, calls: "frontmatter", lines: note.Front.Lines, root: said, schema: schema, schemas: schemas}
	out := mapFaults(said, yaml.AsDoc(schema.Get("frontmatter")), held, "")
	return append(out, slotFaults(said, where, note.Front.Lines)...)
}

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
func checkData(text string, schema *yaml.Doc, where string, schemas *Kinds) []Finding {
	read, lines := yaml.ReadLines(text)
	said := yaml.AsDoc(read)
	if said == nil {
		said = yaml.New()
	}
	held := keyWalk{kind: yaml.AsString(schema.Get("kind")), where: where, calls: "file", lines: lines, root: said, schema: schema, schemas: schemas}
	out := mapFaults(said, yaml.AsDoc(schema.Get("data")), held, "")
	return append(out, slotFaults(said, where, lines)...)
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
func mapFaults(said, spec *yaml.Doc, held keyWalk, path string) []Finding {
	out := []Finding{}
	props := yaml.AsDoc(spec.Get("properties"))
	for _, key := range yaml.StringsOf(spec.Get("required")) {
		if !yaml.Empty(said.Get(key)) || waitsForFill(said, yaml.AsDoc(props.Get(key))) {
			continue
		}
		message := fmt.Sprintf("A %s names %s in its %s.", held.kind, key, held.calls)
		if path != "" {
			message = fmt.Sprintf("%s names %s, and a %s names it on every entry.", path, key, held.kind)
		}
		out = append(out, schemaFault(key, held.where, held.lineOf(path), message))
	}

	for _, key := range said.Keys() {
		at := yaml.Keyed(path, key)
		rule := yaml.AsDoc(props.Get(key))
		line := held.lineOf(at)
		if rule == nil {
			if spec.Get("additionalProperties") != false {
				continue
			}
			message := fmt.Sprintf("The %s schema names no %s.", held.kind, key)
			if path != "" {
				message = fmt.Sprintf("The %s schema names no %s under %s.", held.kind, key, path)
			}
			out = append(out, schemaFault(key, held.where, line, message))
			continue
		}
		out = append(out, fieldFaults(key, said.Get(key), solved(rule, held), held, at, line)...)
	}
	return out
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
func deeperFaults(value any, rule *yaml.Doc, held keyWalk, at string) []Finding {
	out := []Finding{}
	if items := solved(yaml.AsDoc(rule.Get("items")), held); items.Has("properties") {
		if list, isList := value.([]any); isList {
			for i, each := range list {
				if one := yaml.AsDoc(each); one != nil {
					out = append(out, mapFaults(one, items, held, fmt.Sprintf("%s[%d]", at, i))...)
				}
			}
		}
	}
	if one := yaml.AsDoc(value); one != nil && rule.Has("properties") {
		out = append(out, mapFaults(one, rule, held, at)...)
	}
	return out
}

// A rule naming a $ref reads the shape it points at, under the keys standing beside it. [[spec/design_output/schema#one-home-for-a-shape]]
func solved(rule *yaml.Doc, held keyWalk) *yaml.Doc {
	if !rule.Has("$ref") {
		return rule
	}
	out := yaml.New()
	base := refOf(yaml.AsString(rule.Get("$ref")), held.schema, held.schemas)
	for _, key := range base.Keys() {
		out.Set(key, base.Get(key))
	}
	for _, key := range rule.Keys() {
		if key != "$ref" {
			out.Set(key, rule.Get(key))
		}
	}
	return out
}

// [[spec/design_output/schema#one-home-for-a-shape]]
func refOf(said string, schema *yaml.Doc, schemas *Kinds) *yaml.Doc {
	name, pointer, _ := strings.Cut(said, "#")
	root := schema
	if name != "" {
		root = nil
		if schemas != nil {
			root = schemas.every[name]
		}
	}
	if root == nil {
		return yaml.New()
	}
	var at any = root
	for _, part := range strings.Split(strings.TrimPrefix(pointer, "/"), "/") {
		if part == "" {
			continue
		}
		one := yaml.AsDoc(at)
		if one == nil {
			return yaml.New()
		}
		at = one.Get(strings.ReplaceAll(strings.ReplaceAll(part, "~1", "/"), "~0", "~"))
	}
	if one := yaml.AsDoc(at); one != nil {
		return one
	}
	return yaml.New()
}

func fieldFaults(key string, value any, rule *yaml.Doc, held keyWalk, at string, line int) []Finding {
	kind, where := held.kind, held.where
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
	out = append(out, refersFaults(key, value, rule, held, at, line)...)
	return append(out, deeperFaults(value, rule, held, at)...)
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
		// A chapter the schema marks x-fills false stays at its comment with no warning. [[spec/design_output/schema#a-placeholder-stands-at-warning]]
		if fills, set := rule.Get("x-fills").(bool); set && !fills {
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

// A governed folder holds its own kind alone, so a page or a picture there stands at warning until the owner moves it. [[spec/tickets/each-folder-holds-its-kind]]
func folderFault(where string, schema *yaml.Doc) Finding {
	kind := yaml.AsString(schema.Get("kind"))
	found := schemaFault("Folder", where, 1,
		fmt.Sprintf("%s stands in a folder the %s schema governs, which holds %s notes alone. Move it off the governed folder.", where, kind, kind))
	found.Severity = SeverityWarning
	return found
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
			out = append(out, fileFaults(schemas, path, tree.Read)...)
			continue
		}
		text := tree.Read(path)
		out = append(out, noteFaults(tree, schemas, path, text)...)
	}
	return out
}

// [[spec/design_output/schema#the-sweep-over-the-tree]]
func noteFaults(tree *Tree, schemas *Kinds, path, text string) []Finding {
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
	out = append(out, checkNoteIn(tree, text, schema, path, schemas)...)
	return append(out, placeholderFaults(text, schema, path)...)
}

// A file past markdown: a data schema weighs the file it governs, and a note schema warns that its folder holds notes alone. [[spec/design_output/schema#a-data-schema-holds-yaml]]
func fileFaults(schemas *Kinds, path string, read func(string) string) []Finding {
	if governor := governorOf(schemas.data, path); governor != nil {
		return checkData(read(path), governor, path, schemas)
	}
	if governor := governorOf(schemas, path); governor != nil {
		return []Finding{folderFault(path, governor)}
	}
	return nil
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
