// The edit the work tab takes: a column cursor, a cell opening on a key a
// person writes, and a post of the field to the action the base file names. The ticket schema
// says what each field takes and which field the verbs own, so the tab offers
// the values it names, refuses the rest the way the write door does, and reads
// no list of its own.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package work

import (
	"fmt"
	"io/fs"
	"slices"
	"strconv"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/tree"
	"quackitect/src/yaml"
)

// The schema the door weighs a ticket against, owned by spec/schemas and read here for its fields. [[spec/design_output/schema#the-verbs-own-their-fields]]
const TicketSchemaAt = "spec/schemas/ticket.schema.yaml"

// The word the schema marks a field the verbs own with. [[spec/design_output/schema#the-verbs-own-their-fields]]
const engineMark = "x-engine"

// The bits a number the schema names reads in. [[spec/design_output/tree-view#the-completion-knows-the-field]]
const floatBits = 64

// The two marks a key flips, and the values a flag takes. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
const (
	UrgentKey = "urgent"
	TodoKey   = "todo"
	FlagOn    = "true"
	FlagOff   = "false"
)

// What the ticket schema says of each front field. [[spec/design_output/tree-view#the-completion-knows-the-field]]
type TicketSchema struct {
	fields map[string]fieldRule
	needed map[string]bool
}

// One front field: the values its enum or const names, the types it takes, and whether the verbs own it. [[spec/design_output/tree-view#the-completion-knows-the-field]]
type fieldRule struct {
	values []string
	types  []string
	owned  bool
}

// The values the completion offers: the ones the schema names, or the two a flag takes. [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (s TicketSchema) Takes(key string) []string {
	one := s.fields[key]
	if len(one.values) > 0 {
		return one.values
	}
	if slices.Contains(one.types, "boolean") {
		return []string{FlagOn, FlagOff}
	}
	return nil
}

// Whether the field stands in the front at all, so a column the index derives refuses an edit. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (s TicketSchema) Knows(key string) bool {
	_, held := s.fields[key]
	return held
}

// Whether the verbs own the field, which the door refuses a hand. [[spec/design_output/schema#the-verbs-own-their-fields]]
func (s TicketSchema) Owned(key string) bool { return s.fields[key].owned }

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func readTicketSchema(files fs.FS) (TicketSchema, error) {
	text, err := fs.ReadFile(files, TicketSchemaAt)
	if err != nil {
		return TicketSchema{}, err
	}
	return SchemaOf(string(text)), nil
}

// The front half of the ticket schema, read through the one YAML reader. [[spec/design_output/tree-view#one-reader-holds-the-yaml]]
func SchemaOf(text string) TicketSchema {
	out := TicketSchema{fields: map[string]fieldRule{}, needed: map[string]bool{}}
	front := yaml.AsDoc(yaml.AsDoc(yaml.Read(text)).Get("frontmatter"))
	if front == nil {
		return out
	}
	for _, key := range yaml.StringsOf(front.Get("required")) {
		out.needed[key] = true
	}
	props := yaml.AsDoc(front.Get("properties"))
	for _, key := range props.Keys() {
		rule := yaml.AsDoc(props.Get(key))
		if rule == nil {
			continue
		}
		values := yaml.StringsOf(rule.Get("enum"))
		if rule.Has("const") {
			values = append(values, yaml.AsString(rule.Get("const")))
		}
		out.fields[key] = fieldRule{
			values: values,
			types:  yaml.StringsOf(rule.Get("type")),
			owned:  yaml.AsBool(rule.Get(engineMark)),
		}
	}
	return out
}

// Why the tab refuses to open an edit on a key, and nothing where it opens. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (s TicketSchema) Refuses(key string) string {
	switch {
	case s.Owned(key):
		return fmt.Sprintf("%s is the verbs' to write, so ./RUNME.sh ticket moves it and the door refuses the edit.", key)
	case !s.Knows(key):
		return fmt.Sprintf("%s stands in no ticket's front, so the tab edits it nowhere.", key)
	}
	return ""
}

// Why the field refuses the value, and nothing where the schema takes it. An empty value drops the field, which a required one refuses. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func (s TicketSchema) Weighs(key, said string) string {
	if why := s.Refuses(key); why != "" {
		return why
	}
	one := s.fields[key]
	switch {
	case said == "" && s.needed[key]:
		return fmt.Sprintf("%s stands in every ticket, so it takes no empty value.", key)
	case said == "":
		return ""
	case len(one.values) > 0 && !slices.Contains(one.values, said):
		return fmt.Sprintf("%s takes %s alone, and %q is none of them.", key, strings.Join(one.values, ", "), said)
	case len(one.values) > 0 || len(one.types) == 0:
		return ""
	}
	for _, kind := range one.types {
		if typeTakes(kind, said) {
			return ""
		}
	}
	return fmt.Sprintf("%s takes a %s, and %q reads as none.", key, strings.Join(one.types, " or "), said)
}

// Whether one JSON Schema type takes a value a person types into one line. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func typeTakes(kind, said string) bool {
	switch kind {
	case "string":
		return true
	case "boolean":
		return said == FlagOn || said == FlagOff
	case "integer":
		_, err := strconv.Atoi(said)
		return err == nil
	case "number":
		_, err := strconv.ParseFloat(said, floatBits)
		return err == nil
	}
	return false
}

// The edit opens on the cell under the cursor, where the schema lets a hand write it. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) OpenEdit() {
	if t.Tree == nil {
		return
	}
	col := t.Tree.Cursor()
	if col < 0 || col >= len(t.Tree.Cols) {
		return
	}
	key := t.Tree.Cols[col].Key
	if why := t.TicketRules().Refuses(key); why != "" {
		t.Notice = why
		return
	}
	t.Tree.Schema = t.TicketRules()
	if !t.Tree.Open(col) {
		t.Notice = "No row stands under the cursor."
	}
}

// The column cursor steps left on a or the left arrow, and right on the rest. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) MoveColumn(name string) {
	if t.Tree == nil {
		return
	}
	step := 1
	if name == "a" || name == "left" {
		step = -1
	}
	t.Tree.Schema = t.TicketRules()
	t.Tree.MoveCursor(step)
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func (t *Tab) TicketRules() TicketSchema {
	if t.rules == nil {
		files := t.Files
		if files == nil {
			files = treeAt(Root(t.Path))
		}
		said, err := readTicketSchema(files)
		if err != nil {
			said = TicketSchema{fields: map[string]fieldRule{}, needed: map[string]bool{}}
		}
		t.rules = &said
	}
	return *t.rules
}

// A key while an edit stands open: Enter takes it, Escape drops it, Tab takes the first value offered, and alt or shift with Enter fills the view. [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tab) editing(msg tea.KeyMsg) tea.Cmd {
	switch msg.String() {
	case "esc":
		t.Tree.Drop()
		t.Notice = ""
	case "enter":
		return t.writes(t.Tree.Take())
	case "alt+enter", "shift+enter":
		return t.writes(t.Tree.Fill())
	case "tab":
		t.Tree.Complete()
	default:
		t.Tree.Typing(msg)
	}
	return nil
}

// The input of a field write, as the verb reads it. [[spec/design_output/tui#the-work-tab-takes-edits]]
type fieldSet struct {
	Name  string `json:"name"`
	Field string `json:"field"`
	Value string `json:"value"`
}

// Every item the edit wrote posts its field, and the rows the schema kept back get named with its reason. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func (t *Tab) writes(left []string) tea.Cmd {
	kept := ""
	if len(left) > 0 {
		kept = t.Tree.Refused() + " " + strings.Join(left, ", ") + " keeps the value it carries."
	}
	inputs := []any{}
	for _, one := range t.Tree.Written() {
		if key := one.Keys[tree.EditedKey]; key != "" {
			inputs = append(inputs, fieldSet{Name: one.Name, Field: key, Value: one.Keys[key]})
		}
	}
	t.Notice = kept
	if len(inputs) == 0 {
		return nil
	}
	name, err := t.actionFor(editTrigger, func(one tree.Action) bool { return one.Edits == editTrigger })
	if err != nil {
		t.Notice = err.Error()
		return nil
	}
	return t.posts(name, inputs, kept)
}

// The line under the rows: a notice where one stands, and the offer or the keys while an edit stands open. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) footLine(w int) string {
	switch {
	case t.Notice != "":
		return draw.LevelStyle("warn").Render(draw.Cut(t.Notice, w))
	case t.Tree == nil || !t.Tree.Editing():
		return ""
	case len(t.Tree.Offer()) > 0:
		return draw.Dim.Render(draw.Cut("tab takes "+strings.Join(t.Tree.Offer(), " · "), w))
	}
	return draw.Dim.Render(draw.Cut("enter writes, esc drops, alt+enter fills every row", w))
}

// The input of a flip, as the verb reads it. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
type named struct {
	Name string `json:"name"`
}

// The urgent key posts a flip for the selected row, or for every marked row where marks stand. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t *Tab) flip() tea.Cmd {
	if t.Tree == nil {
		return nil
	}
	if why := t.TicketRules().Weighs(UrgentKey, FlagOn); why != "" {
		t.Notice = why
		return nil
	}
	rows := t.Tree.MarkedItems()
	if len(rows) == 0 {
		if one := t.Tree.Selected(); one != nil {
			rows = []*tree.Item{one}
		}
	}
	if len(rows) == 0 {
		return nil
	}
	name, err := t.keyAction(urgentTrigger)
	if err != nil {
		t.Notice = err.Error()
		return nil
	}
	inputs := make([]any, 0, len(rows))
	for _, one := range rows {
		inputs = append(inputs, named{Name: one.Name})
	}
	return t.posts(name, inputs, "")
}
