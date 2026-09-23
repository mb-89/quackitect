// The edit the work tab takes: a column cursor, a cell opening on a key a
// person writes, and the write into the ticket's own front. The ticket schema
// says what each field takes and which field the verbs own, so the tab offers
// the values it names, refuses the rest the way the write door does, and reads
// no list of its own.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package work

import (
	"errors"
	"fmt"
	"path/filepath"
	"slices"
	"strconv"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/draw"
	"quackitect/tui/tree"
	"quackitect/yaml"
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
func readTicketSchema(root string) (TicketSchema, error) {
	text, err := readFile(filepath.Join(root, filepath.FromSlash(TicketSchemaAt)))
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
		said, err := readTicketSchema(Root(t.Path))
		if err != nil {
			said = TicketSchema{fields: map[string]fieldRule{}, needed: map[string]bool{}}
		}
		t.rules = &said
	}
	return *t.rules
}

// A key while an edit stands open: Enter takes it, Escape drops it, Tab takes the first value offered, and alt or shift with Enter fills the view. [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tab) editing(msg tea.KeyMsg) {
	switch msg.String() {
	case "esc":
		t.Tree.Drop()
		t.Notice = ""
	case "enter":
		left := t.Tree.Take()
		t.writes(left)
	case "alt+enter", "shift+enter":
		left := t.Tree.Fill()
		t.writes(left)
	case "tab":
		t.Tree.Complete()
	default:
		t.Tree.Typing(msg)
	}
}

// Every item the edit wrote reaches its ticket, and the rows the schema kept back get named with its reason. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func (t *Tab) writes(left []string) {
	said := []string{}
	for _, one := range t.Tree.Written() {
		if err := writeTicket(Root(t.Path), one); err != nil {
			said = append(said, err.Error())
		}
	}
	if len(left) > 0 {
		said = append(said, t.Tree.Refused(), strings.Join(left, ", ")+" keeps the value it carries.")
	}
	t.Notice = strings.Join(said, " ")
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

// A key flips a mark on the selected row, or on every marked row where marks stand. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t *Tab) flip(key string) {
	if t.Tree == nil {
		return
	}
	if why := t.TicketRules().Weighs(key, FlagOn); why != "" {
		t.Notice = why
		return
	}
	rows := t.Tree.MarkedItems()
	if len(rows) == 0 {
		if one := t.Tree.Selected(); one != nil {
			rows = []*tree.Item{one}
		}
	}
	said := []string{}
	for _, one := range rows {
		value := FlagOn
		if one.Keys[key] == FlagOn {
			value = FlagOff
		}
		tree.SetValue(one, key, value)
		tree.SetValue(one, tree.EditedKey, key)
		if err := writeTicket(Root(t.Path), *one); err != nil {
			said = append(said, err.Error())
		}
	}
	t.Notice = strings.Join(said, " ")
}

// The write into the ticket's front, on the one key the item's edit changed. [[spec/design_output/tui#the-work-tab-takes-edits]]
func writeTicket(root string, one tree.Item) error {
	at := one.Keys["path"]
	if at == "" {
		return errors.New(one.Name + " names no path, so the write reaches no file")
	}
	key := one.Keys[tree.EditedKey]
	if key == "" {
		return nil
	}
	file := filepath.Join(root, filepath.FromSlash(at))
	text, err := readFile(file)
	if err != nil {
		return err
	}
	said, ok := WithField(string(text), key, one.Keys[key])
	if !ok {
		return errors.New(at + " carries no front, so the write reaches no field")
	}
	return writeFile(file, []byte(said), 0o644)
}

// The front with one top-level field set, or dropped where the value is empty or a flag standing off. A front fenced with CRLF keeps its line ends. [[spec/design_output/tui#the-work-tab-takes-edits]]
func WithField(text, key, value string) (string, bool) {
	lines := strings.Split(text, "\n")
	fence := func(at int) bool { return strings.TrimSuffix(lines[at], "\r") == "---" }
	if !fence(0) {
		return text, false
	}
	shut := -1
	for at := 1; at < len(lines); at++ {
		if fence(at) {
			shut = at
			break
		}
	}
	if shut < 0 {
		return text, false
	}
	drop := value == "" || value == FlagOff
	row := key + ": " + quotedValue(value)
	if strings.HasSuffix(lines[0], "\r") {
		row += "\r"
	}
	for at := 1; at < shut; at++ {
		if !strings.HasPrefix(lines[at], key+":") {
			continue
		}
		// A block value runs on in the lines under the key, and the write takes them with it. [[spec/design_output/tui#the-work-tab-takes-edits]]
		end := at + 1
		for end < shut && strings.ContainsAny(lines[end][:min(1, len(lines[end]))], " \t-") {
			end++
		}
		kept := lines[:at:at]
		if !drop {
			kept = append(kept, row)
		}
		return strings.Join(append(kept, lines[end:]...), "\n"), true
	}
	if drop {
		return text, true
	}
	out := append(lines[:shut:shut], append([]string{row}, lines[shut:]...)...)
	return strings.Join(out, "\n"), true
}

// A value every YAML reader takes as one string, the way the record quotes its own. [[spec/design_output/work#the-record-quotes-its-value]]
func quotedValue(said string) string {
	plain := said != "" && !strings.Contains(said, ": ") && !strings.Contains(said, " #") &&
		!strings.ContainsAny(said[:1], "\"'[{&*!|>%@`#") && !strings.HasSuffix(said, " ")
	if plain {
		return said
	}
	return `"` + strings.NewReplacer(`\`, `\\`, `"`, `\"`).Replace(said) + `"`
}
