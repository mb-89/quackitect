// The tutorial tab: the examples by chapter on the left, the selected one's
// prose and calls on the right, each row's last verdict, and F5 running it.
// [[spec/design_output/examples#the-tutorial-tab]]
package tutorial

import (
	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
)

// The name the tab reads, and the action F5 posts, which src/modules/examples owns and a renderer spells again. [[spec/design_output/examples#the-tutorial-tab]]
const (
	RowsName = "examples/rows"
	RunName  = "examples/run"
)

// The mark a row wears for its last verdict, and a blank one before its first run. [[spec/design_output/examples#the-tutorial-tab]]
const (
	PassMark  = "✓"
	FailMark  = "✗"
	BlankMark = " "
)

// One example as examples/rows answers it. [[spec/design_output/examples#the-tutorial-tab]]
type Row struct {
	Path      string   `json:"path"`
	Chapter   string   `json:"chapter"`
	Dev       bool     `json:"dev,omitempty"`
	Title     string   `json:"title"`
	Keywords  []string `json:"keywords"`
	Interface []string `json:"interface"`
	Body      string   `json:"body"`
	Verdict   string   `json:"verdict,omitempty"`
	Miss      string   `json:"miss,omitempty"`
}

// The road the tab reads and posts through. [[spec/design_output/examples#the-tutorial-tab]]
type Source interface {
	registry.Catalog
	registry.Watcher
	registry.Caller
}

// [[spec/design_output/examples#the-tutorial-tab]]
type Tab struct {
	From   Source
	Rows   []Row
	Notice string
}

// The tab over its source. [[spec/design_output/examples#the-tutorial-tab]]
func New(from Source) *Tab { return &Tab{From: from} }

func (t *Tab) Name() string                                     { return "tutorial" }
func (t *Tab) Label(_ *frame.Model) string                      { return "tutorial" }
func (t *Tab) Init(_ *frame.Model) tea.Cmd                      { return nil }
func (t *Tab) Update(_ *frame.Model, _ tea.Msg) (bool, tea.Cmd) { return false, nil }
func (t *Tab) Left(_ *frame.Model, _, _ int) string             { return "" }
func (t *Tab) Detail(_ *frame.Model, _ int) []frame.Part        { return nil }
func (t *Tab) Selected(_ *frame.Model) string                   { return "" }
func (t *Tab) Narrowed(_ *frame.Model) bool                     { return false }
func (t *Tab) Keys(_ *frame.Model) frame.Band                   { return frame.Band{} }
func (t *Tab) Selection(_ *frame.Model) frame.Band              { return frame.Band{} }
func (t *Tab) Presets(_ *frame.Model) []frame.Preset            { return nil }
func (t *Tab) Move(_ *frame.Model, _ int)                       {}
func (t *Tab) Jump(_ *frame.Model, _ string)                    {}
func (t *Tab) Press(_ *frame.Model, _, _ int)                   {}
func (t *Tab) Narrow(_ *frame.Model, _ string) error            { return nil }
func (t *Tab) Sorted(_ *frame.Model, _ frame.Preset)            {}
func (t *Tab) Pressed(_ *frame.Model, _ frame.Preset) bool      { return false }
func (t *Tab) Marks(_ *frame.Model) (string, string)            { return "", "" }
