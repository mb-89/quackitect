// The edit the work tab takes: a column cursor, a cell opening on a key a
// person writes, and the write into the ticket's own front. The ticket schema
// says which field the verbs own, so the tab refuses those the way the write
// door does, and reads no list of its own.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package work

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/tree"
	"quackitect/yaml"
)

// The schema the door weighs a ticket against, owned by spec/schemas and read here for its fields. [[spec/design_output/schema#the-verbs-own-their-fields]]
const TicketSchemaAt = "spec/schemas/ticket.schema.yaml"

// The word the schema marks a field the verbs own with. [[spec/design_output/schema#the-verbs-own-their-fields]]
const engineMark = "x-engine"

// The two marks a key flips, and the values a flag takes. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
const (
	UrgentKey = "urgent"
	TodoKey   = "todo"
	FlagOn    = "true"
	FlagOff   = "false"
)

// What the ticket schema says of each front field. [[spec/design_output/schema#the-verbs-own-their-fields]]
type TicketSchema struct {
	takes map[string][]string
	owned map[string]bool
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (s TicketSchema) Takes(key string) []string { return s.takes[key] }

// Whether the field stands in the front at all, so a column the index derives refuses an edit. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (s TicketSchema) Knows(key string) bool {
	_, held := s.takes[key]
	return held
}

// Whether the verbs own the field, which the door refuses a hand. [[spec/design_output/schema#the-verbs-own-their-fields]]
func (s TicketSchema) Owned(key string) bool { return s.owned[key] }

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func readTicketSchema(root string) (TicketSchema, error) {
	text, err := readFile(filepath.Join(root, filepath.FromSlash(TicketSchemaAt)))
	if err != nil {
		return TicketSchema{}, err
	}
	return SchemaOf(string(text)), nil
}

func SchemaOf(text string) TicketSchema {
	out := TicketSchema{takes: map[string][]string{}, owned: map[string]bool{}}
	front := yaml.AsDoc(yaml.AsDoc(yaml.Read(text)).Get("frontmatter"))
	if front == nil {
		return out
	}
	props := yaml.AsDoc(front.Get("properties"))
	if props == nil {
		return out
	}
	for _, key := range props.Keys() {
		rule := yaml.AsDoc(props.Get(key))
		if rule == nil {
			continue
		}
		out.takes[key] = yaml.StringsOf(rule.Get("enum"))
		if yaml.AsBool(rule.Get(engineMark)) {
			out.owned[key] = true
		}
	}
	return out
}

// Why the tab refuses to open an edit on a key, and nothing where it opens. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (s TicketSchema) Refuses(key string) string {
	switch {
	case s.Owned(key):
		return fmt.Sprintf("%s is the verbs' to write, and the door refuses the edit.", key)
	case !s.Knows(key):
		return fmt.Sprintf("%s stands in no ticket's front, so the tab edits it nowhere.", key)
	}
	return ""
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

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func (t *Tab) TicketRules() TicketSchema {
	if t.rules == nil {
		said, err := readTicketSchema(Root(t.Path))
		if err != nil {
			said = TicketSchema{takes: map[string][]string{}, owned: map[string]bool{}}
		}
		t.rules = &said
	}
	return *t.rules
}

// A key while an edit stands open: Enter takes it, Escape drops it, and shift with Enter fills the view. [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tab) editing(msg tea.KeyMsg) {
	switch msg.String() {
	case "esc":
		t.Tree.Drop()
		t.Notice = ""
	case "enter":
		left := t.Tree.Take()
		t.writes(left)
	case "shift+enter":
		left := t.Tree.Fill()
		t.writes(left)
	default:
		t.Tree.Typing(msg)
	}
}

// Every item the edit wrote reaches its ticket, and the rows the schema kept back get named. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func (t *Tab) writes(left []string) {
	said := []string{}
	for _, one := range t.Tree.Written() {
		if err := writeTicket(Root(t.Path), one); err != nil {
			said = append(said, err.Error())
		}
	}
	if len(left) > 0 {
		said = append(said, "the schema refuses the value for "+strings.Join(left, ", "))
	}
	t.Notice = strings.Join(said, " ")
}

// A key flips a mark on the selected row, or on every marked row where marks stand. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t *Tab) flip(key string) {
	if t.Tree == nil {
		return
	}
	if why := t.TicketRules().Refuses(key); why != "" {
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

// The front with one top-level field set, or dropped where the value is empty or a flag standing off. [[spec/design_output/tui#the-work-tab-takes-edits]]
func WithField(text, key, value string) (string, bool) {
	lines := strings.Split(text, "\n")
	if len(lines) == 0 || lines[0] != "---" {
		return text, false
	}
	shut := -1
	for at := 1; at < len(lines); at++ {
		if lines[at] == "---" {
			shut = at
			break
		}
	}
	if shut < 0 {
		return text, false
	}
	drop := value == "" || value == FlagOff
	row := key + ": " + quotedValue(value)
	for at := 1; at < shut; at++ {
		if strings.HasPrefix(lines[at], key+":") {
			if drop {
				return strings.Join(append(lines[:at:at], lines[at+1:]...), "\n"), true
			}
			lines[at] = row
			return strings.Join(lines, "\n"), true
		}
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
