// What the schema allows at the cursor. A frontmatter key, its value, a
// chapter heading and a pointer each read the schema or the tree, and the rest
// of a note is prose no schema speaks to.
// [[spec/design_output/lsp#the-completion-reads-the-schema]]
package main

import (
	"encoding/json"
	"strings"

	"quackitect/yaml"
)

// The characters an editor asks again on. [[spec/design_output/lsp#the-completion-reads-the-schema]]
var triggers = []string{":", " ", "#", "["}

// The kinds of item the protocol names. [[spec/design_output/lsp#the-completion-reads-the-schema]]
const (
	itemProperty  = 10
	itemValue     = 12
	itemChapter   = 15
	itemFile      = 17
	itemReference = 18
)

type completion struct {
	Label      string    `json:"label"`
	Kind       int       `json:"kind"`
	Detail     string    `json:"detail,omitempty"`
	InsertText string    `json:"insertText,omitempty"`
	TextEdit   *textEdit `json:"textEdit,omitempty"`
}

type textEdit struct {
	Range   span   `json:"range"`
	NewText string `json:"newText"`
}

// The line up to the cursor, the note around it, and the schema it reads. [[spec/design_output/lsp#the-completion-reads-the-schema]]
type typing struct {
	tree    *Tree
	path    string
	rows    []string
	line    int
	before  string
	after   string
	front   *yaml.Doc
	schemas *Kinds
	schema  *yaml.Doc
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one *server) completes(params json.RawMessage) []completion {
	var said struct {
		TextDocument struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
		Position position `json:"position"`
	}
	if json.Unmarshal(params, &said) != nil {
		return []completion{}
	}
	where := pathOf(said.TextDocument.URI)
	if where == "" {
		return []completion{}
	}
	tree := one.checker.Tree()
	return offers(tree, relativeTo(tree.Root, where), said.Position)
}

// The items at a position of a file, read off the buffer the tree holds. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func offers(tree *Tree, path string, at position) []completion {
	text := tree.Read(path)
	rows := yaml.SplitLines(text)
	if at.Line < 0 || at.Line >= len(rows) {
		return []completion{}
	}
	row := rows[at.Line]
	cut := byteAt(row, at.Character)
	here := typing{tree: tree, path: path, rows: rows, line: at.Line, before: row[:cut], after: row[cut:],
		front: readNote(text).Front.Said, schemas: schemasIn(tree)}
	here.schema = here.schemas.Get(kindOf(text))
	if here.schema == nil {
		here.schema = governorOf(here.schemas, path)
	}

	switch {
	case here.inFront():
		return here.frontOffers()
	case here.bare():
		return here.kindOffers(0, "---\n", "\n---\n")
	}
	if from, open := here.opened(); open {
		return here.pointerOffers(from)
	}
	return here.chapterOffers()
}

// Whether the cursor stands between the frontmatter's fences, or under an opening one no fence closes yet. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) inFront() bool {
	if len(one.rows) == 0 || strings.TrimSpace(one.rows[0]) != "---" {
		return false
	}
	for i := 1; i < len(one.rows); i++ {
		if strings.TrimSpace(one.rows[i]) == "---" {
			return one.line > 0 && one.line < i
		}
	}
	return one.line > 0
}

// The first line of a note carrying no frontmatter, where a kind opens it. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) bare() bool {
	if one.line != 0 || !strings.HasSuffix(one.path, ".md") || strings.TrimSpace(one.rows[0]) == "---" {
		return false
	}
	return strings.HasPrefix("kind", one.before) || strings.HasPrefix("---", one.before)
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) frontOffers() []completion {
	nested := strings.TrimLeft(one.before, " \t") != one.before
	key, _, colon := strings.Cut(one.before, ":")
	key = strings.TrimSpace(key)
	past := strings.Index(one.before, ":") + 1
	if !nested && colon && key == "kind" {
		return one.valueOffers(past, one.kindValues())
	}
	if from, open := one.opened(); open {
		return one.pointerOffers(from)
	}
	switch {
	case nested:
		return []completion{}
	case colon:
		return one.valueOffers(past, one.propertyValues(key))
	}
	return one.keyOffers()
}

// Each property the schema names and the note lacks, and the kind where the note names none. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) keyOffers() []completion {
	out := []completion{}
	if !one.written("kind") {
		out = append(out, one.kindOffers(0, "", "")...)
	}
	if one.schema == nil {
		return out
	}
	props := yaml.AsDoc(yaml.AsDoc(one.schema.Get("frontmatter")).Get("properties"))
	for _, key := range props.Keys() {
		if key == "kind" || one.written(key) {
			continue
		}
		detail := yaml.AsString(yaml.AsDoc(props.Get(key)).Get("description"))
		out = append(out, one.over(0, key, itemProperty, detail, key+": "))
	}
	return out
}

// A kind line for the schema governing the path, or else for every kind the tree knows, wrapped as the caller asks. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) kindOffers(from int, open, close string) []completion {
	out := []completion{}
	for _, said := range one.kindValues() {
		line := "kind: " + said.label
		out = append(out, one.over(from, line, itemProperty, said.detail, open+line+close))
	}
	return out
}

type valued struct{ label, detail string }

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) kindValues() []valued {
	if governor := governorOf(one.schemas, one.path); governor != nil {
		return []valued{{"[[" + yaml.AsString(governor.Get("kind")) + "]]", "the schema governing this path"}}
	}
	out := []valued{}
	for _, kind := range one.schemas.Names() {
		out = append(out, valued{"[[" + kind + "]]", "a kind the tree knows"})
	}
	return out
}

// The const and the enum of a property, in brackets where it names a link, or the two a boolean takes. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) propertyValues(key string) []valued {
	if one.schema == nil {
		return nil
	}
	rule := yaml.AsDoc(yaml.AsDoc(yaml.AsDoc(one.schema.Get("frontmatter")).Get("properties")).Get(key))
	if rule == nil {
		return nil
	}
	detail := yaml.AsString(rule.Get("description"))
	said := []any{}
	if rule.Has("const") {
		said = append(said, rule.Get("const"))
	}
	if allowed, listed := rule.Get("enum").([]any); listed {
		said = append(said, allowed...)
	}
	for _, kind := range yaml.Flat(rule.Get("type")) {
		if yaml.AsString(kind) == "boolean" {
			said = append(said, "true", "false")
		}
	}
	out := []valued{}
	for _, each := range said {
		label := yaml.AsString(each)
		if yaml.AsBool(rule.Get("x-link")) {
			label = "[[" + label + "]]"
		}
		out = append(out, valued{label, detail})
	}
	return out
}

// Each value in place of what the line holds past the colon. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) valueOffers(from int, said []valued) []completion {
	out := []completion{}
	for _, each := range said {
		out = append(out, one.over(from, each.label, itemValue, each.detail, " "+each.label))
	}
	return out
}

// Whether the frontmatter writes the key at its top level. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) written(key string) bool {
	for i := 1; i < len(one.rows); i++ {
		if strings.TrimSpace(one.rows[i]) == "---" {
			return false
		}
		if i != one.line && strings.HasPrefix(one.rows[i], key+":") {
			return true
		}
	}
	return false
}

// The byte past a `[[` the line leaves open before the cursor. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) opened() (int, bool) {
	at := strings.LastIndex(one.before, "[[")
	if at < 0 || strings.Contains(one.before[at:], "]]") {
		return 0, false
	}
	return at + 2, true
}

// Every path the tree tracks after `[[`, and the slugs of a note's headings after `[[note#`. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) pointerOffers(from int) []completion {
	close := "]]"
	if strings.HasPrefix(one.after, "]]") {
		close = ""
	}
	out := []completion{}
	name, _, chaptered := strings.Cut(one.before[from:], "#")
	if !chaptered {
		for _, path := range one.tree.Paths() {
			label := strings.TrimSuffix(path, ".md")
			out = append(out, one.over(from, label, itemFile, path, label+close))
		}
		return out
	}
	at := placesIn(one.tree).fileOf(name)
	if !strings.HasSuffix(at, ".md") {
		return out
	}
	note := one.tree.parsed(at)
	seen := map[string]bool{}
	for i, section := range note.sections {
		slug := note.slugs[i]
		if slug == "" || seen[slug] {
			continue
		}
		seen[slug] = true
		out = append(out, one.over(from+len(name)+1, slug, itemReference, section.Header, slug+close))
	}
	return out
}

// Each chapter the schema wants at its heading level and the note lacks. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) chapterOffers() []completion {
	out := []completion{}
	if one.schema == nil {
		return out
	}
	hashes := len(one.before) - len(strings.TrimLeft(one.before, "#"))
	body := yaml.AsDoc(one.schema.Get("body"))
	level := 1
	if body.Has("headingLevel") {
		level = yaml.AsInt(body.Get("headingLevel"))
	}
	rest := one.before[hashes:]
	if hashes != level || (rest != "" && rest[0] != ' ') {
		return out
	}
	held := map[string]bool{}
	for _, section := range sectionsOf(one.rows) {
		if section.Level == level && section.Line-1 != one.line {
			held[section.Header] = true
		}
	}
	for _, each := range chaptersWanted(yaml.AsList(body.Get("sections")), one.front) {
		rule := yaml.AsDoc(each)
		header := yaml.AsString(rule.Get("header"))
		if header == "" || held[header] {
			continue
		}
		out = append(out, one.over(hashes, header, itemChapter, yaml.AsString(rule.Get("description")), " "+header))
	}
	return out
}

// One item replacing the line from a byte up to the cursor. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one typing) over(from int, label string, kind int, detail, text string) completion {
	row := one.before + one.after
	return completion{
		Label:      label,
		Kind:       kind,
		Detail:     detail,
		InsertText: text,
		TextEdit: &textEdit{
			Range: span{
				Start: position{Line: one.line, Character: unitsTo(row, from)},
				End:   position{Line: one.line, Character: unitsTo(row, len(one.before))},
			},
			NewText: text,
		},
	}
}
