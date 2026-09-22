// The edit the work tab takes: a column cursor, a cell opening on a key a
// person writes, and the write into the ticket's own front. The ticket schema
// says which field the verbs own, so the tab refuses those the way the write
// door does, and reads no list of its own.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package main

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"quackitect/yaml"
)

// The schema the door weighs a ticket against, owned by spec/schemas and read here for its fields. [[spec/design_output/schema#the-verbs-own-their-fields]]
const ticketSchemaAt = "spec/schemas/ticket.schema.yaml"

// The word the schema marks a field the verbs own with. [[spec/design_output/schema#the-verbs-own-their-fields]]
const engineMark = "x-engine"

// The two marks a key flips, and the values a flag takes. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
const (
	urgentKey = "urgent"
	todoKey   = "todo"
	flagOn    = "true"
	flagOff   = "false"
)

// What the ticket schema says of each front field. [[spec/design_output/schema#the-verbs-own-their-fields]]
type ticketSchema struct {
	takes map[string][]string
	owned map[string]bool
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (s ticketSchema) Takes(key string) []string { return s.takes[key] }

// Whether the field stands in the front at all, so a column the index derives refuses an edit. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (s ticketSchema) Knows(key string) bool {
	_, held := s.takes[key]
	return held
}

// Whether the verbs own the field, which the door refuses a hand. [[spec/design_output/schema#the-verbs-own-their-fields]]
func (s ticketSchema) Owned(key string) bool { return s.owned[key] }

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func readTicketSchema(root string) (ticketSchema, error) {
	text, err := readFile(filepath.Join(root, filepath.FromSlash(ticketSchemaAt)))
	if err != nil {
		return ticketSchema{}, err
	}
	return schemaOf(string(text)), nil
}

func schemaOf(text string) ticketSchema {
	out := ticketSchema{takes: map[string][]string{}, owned: map[string]bool{}}
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
func (s ticketSchema) refuses(key string) string {
	switch {
	case s.Owned(key):
		return fmt.Sprintf("%s is the verbs' to write, and the door refuses the edit.", key)
	case !s.Knows(key):
		return fmt.Sprintf("%s stands in no ticket's front, so the tab edits it nowhere.", key)
	}
	return ""
}

// The edit opens on the cell under the cursor, where the schema lets a hand write it. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (m *model) openEdit() {
	if m.work == nil {
		return
	}
	col := m.work.Cursor()
	if col < 0 || col >= len(m.work.Cols) {
		return
	}
	key := m.work.Cols[col].Key
	if why := m.ticketRules().refuses(key); why != "" {
		m.workNotice = why
		return
	}
	m.work.Schema = m.ticketRules()
	if !m.work.Open(col) {
		m.workNotice = "No row stands under the cursor."
	}
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func (m *model) ticketRules() ticketSchema {
	if m.rules == nil {
		said, err := readTicketSchema(workRoot(m.path))
		if err != nil {
			said = ticketSchema{takes: map[string][]string{}, owned: map[string]bool{}}
		}
		m.rules = &said
	}
	return *m.rules
}

// A key while an edit stands open: Enter takes it, Escape drops it, and shift with Enter fills the view. [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (m model) editing(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "esc":
		m.work.Drop()
		m.workNotice = ""
	case "enter":
		left := m.work.Take()
		m.writes(left)
	case "shift+enter":
		left := m.work.Fill()
		m.writes(left)
	default:
		m.work.Typing(msg)
	}
	return m, nil
}

// Every item the edit wrote reaches its ticket, and the rows the schema kept back get named. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func (m *model) writes(left []string) {
	said := []string{}
	for _, one := range m.work.Written() {
		if err := writeTicket(workRoot(m.path), one); err != nil {
			said = append(said, err.Error())
		}
	}
	if len(left) > 0 {
		said = append(said, "the schema refuses the value for "+strings.Join(left, ", "))
	}
	m.workNotice = strings.Join(said, " ")
}

// A key flips a mark on the selected row, or on every marked row where marks stand. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (m *model) flip(key string) {
	if m.work == nil {
		return
	}
	if why := m.ticketRules().refuses(key); why != "" {
		m.workNotice = why
		return
	}
	rows := m.work.MarkedItems()
	if len(rows) == 0 {
		if one := m.work.Selected(); one != nil {
			rows = []*Item{one}
		}
	}
	said := []string{}
	for _, one := range rows {
		value := flagOn
		if one.Keys[key] == flagOn {
			value = flagOff
		}
		setValue(one, key, value)
		setValue(one, editedKey, key)
		if err := writeTicket(workRoot(m.path), *one); err != nil {
			said = append(said, err.Error())
		}
	}
	m.workNotice = strings.Join(said, " ")
}

// The write into the ticket's front, on the one key the item's edit changed. [[spec/design_output/tui#the-work-tab-takes-edits]]
func writeTicket(root string, one Item) error {
	at := one.Keys["path"]
	if at == "" {
		return errors.New(one.Name + " names no path, so the write reaches no file")
	}
	key := one.Keys[editedKey]
	if key == "" {
		return nil
	}
	file := filepath.Join(root, filepath.FromSlash(at))
	text, err := readFile(file)
	if err != nil {
		return err
	}
	said, ok := withField(string(text), key, one.Keys[key])
	if !ok {
		return errors.New(at + " carries no front, so the write reaches no field")
	}
	return writeFile(file, []byte(said), 0o644)
}

// The front with one top-level field set, or dropped where the value is empty or a flag standing off. [[spec/design_output/tui#the-work-tab-takes-edits]]
func withField(text, key, value string) (string, bool) {
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
	drop := value == "" || value == flagOff
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
