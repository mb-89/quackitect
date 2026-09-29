// The registry tabs: index, cli and help, each drawing the rows one catalog
// name holds, with its columns and its details.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import (
	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/frame"
)

// [[spec/design_output/model#the-registry-tabs]]
type Tab struct {
	name string
	From Catalog
	All  []Row
}

// One row of a catalog list, keyed as its json. [[spec/design_output/model#the-registry-tabs]]
type Row map[string]any

func (r Row) Field(_ string) (string, bool) { return "", false }

func Index(c Catalog) *Tab { return &Tab{name: "index", From: c} }

func Cli(c Catalog) *Tab { return &Tab{name: "cli", From: c} }

func Help(c Catalog) *Tab { return &Tab{name: "help", From: c} }

func (t *Tab) Name() string                                  { return t.name }
func (t *Tab) Label(_ *frame.Model) string                   { return t.name }
func (t *Tab) Init(_ *frame.Model) tea.Cmd                   { return func() tea.Msg { return nil } }
func (t *Tab) Update(_ *frame.Model, _ tea.Msg) (bool, tea.Cmd) { return false, nil }
func (t *Tab) Left(_ *frame.Model, _, _ int) string          { return "" }
func (t *Tab) Detail(_ *frame.Model, _ int) []frame.Part     { return nil }
func (t *Tab) Selected(_ *frame.Model) string                { return "" }
func (t *Tab) Narrowed(_ *frame.Model) bool                  { return false }
func (t *Tab) Keys(_ *frame.Model) frame.Band                { return frame.Band{} }
func (t *Tab) Selection(_ *frame.Model) frame.Band           { return frame.Band{} }
func (t *Tab) Presets(_ *frame.Model) []frame.Preset         { return nil }
func (t *Tab) Move(_ *frame.Model, _ int)                    {}
func (t *Tab) Jump(_ *frame.Model, _ string)                 {}
func (t *Tab) Press(_ *frame.Model, _, _ int)                {}
func (t *Tab) Narrow(_ *frame.Model, _ string) error         { return nil }
func (t *Tab) Sorted(_ *frame.Model, _ frame.Preset)         {}
func (t *Tab) Pressed(_ *frame.Model, _ frame.Preset) bool   { return false }
func (t *Tab) Marks(_ *frame.Model) (string, string)         { return "", "" }
