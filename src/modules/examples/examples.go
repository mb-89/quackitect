// The examples module: each example under spec/examples as one row the
// Tutorial tab draws, with its last verdict, and the action running one.
// [[spec/design_output/examples#the-tutorial-tab]]
package examples

import "quackitect/src/q"

// The name the tab reads, the action F5 posts, and the verdict file the harness writes, which src/example owns and a module spells again. [[spec/design_output/examples#the-tutorial-tab]]
const (
	RowsName   = "examples/rows"
	RunName    = "examples/run"
	VerdictsAt = ".se/.runtime/examples.json" // .claude/skills/level0/lib/folders.js owns the runtime folder.
)

// One example as the tab reads it. [[spec/design_output/examples#the-tutorial-tab]]
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

type filesIn struct {
	Files map[string]q.Content `q:"files/<path...>"`
}

// The input of a run: the example's path. [[spec/design_output/examples#the-tutorial-tab]]
type RunIn struct {
	Path string `json:"path" label:"path" doc:"the example's path under spec/examples"`
}

// [[spec/design_output/examples#the-tutorial-tab]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.DerivedIn(c, RowsName, []Row{}, rowsOf, q.Doc("every example under spec/examples, by path, with its chapter and its last verdict")),
		q.ActionIn(c, RunName, runOf, q.Doc("Run one example against the real tree, in a clone of its own."), q.Label("Run"), q.Writes()),
	)
}

// Each example as a row, in path order. [[spec/design_output/examples#the-tutorial-tab]]
func rowsOf(in filesIn) []Row { return []Row{} }

// The run verb, through the node module. [[spec/design_output/examples#one-runner-two-drivers]]
func runOf(in RunIn) []q.Request { return nil }
