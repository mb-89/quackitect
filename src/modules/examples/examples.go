// The examples module: each example under spec/examples as one row the
// Tutorial tab draws, with its last verdict, and the action running one.
// [[spec/design_output/examples#the-tutorial-tab]]
package examples

import (
	"encoding/json"
	"regexp"
	"sort"

	"quackitect/src/example"
	"quackitect/src/q"
)

// The name the tab reads, the action F5 posts, and the verdict file the harness writes, which src/example owns and a module spells again. [[spec/design_output/examples#the-tutorial-tab]]
const (
	RowsName   = "examples/rows"
	RunName    = "examples/run"
	VerdictsAt = ".se/.runtime/examples.json" // src/modules/check/folders.go owns the runtime folder.
)

// The node module's name and its verb, which src/modules/verbs owns, spelled again because a module imports q alone. [[spec/tickets/the-lens-calls-actions]]
const (
	nodeModule = "node"
	nodeRun    = "run"
)

// An example under its chapter. [[spec/design_output/examples#the-format]]
var exampleAt = regexp.MustCompile(`^spec/examples/[^/]+/[^/]+\.md$`)

// One verdict as the harness writes it. [[spec/design_output/examples#one-runner-two-drivers]]
type verdict struct {
	Verdict string `json:"verdict"`
	Miss    string `json:"miss,omitempty"`
}

// The verdict file's text over each example's miss, pass where the miss is empty. [[spec/design_output/examples#one-runner-two-drivers]]
func VerdictsText(misses map[string]string) string {
	said := map[string]verdict{}
	for path, miss := range misses {
		said[path] = verdict{Verdict: "pass"}
		if miss != "" {
			said[path] = verdict{Verdict: "fail", Miss: miss}
		}
	}
	text, _ := json.MarshalIndent(said, "", "  ")
	return string(text) + "\n"
}

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
func rowsOf(in filesIn) []Row {
	verdicts := map[string]verdict{}
	_ = json.Unmarshal([]byte(in.Files[VerdictsAt].Text), &verdicts)
	out := []Row{}
	for path, content := range in.Files {
		if !exampleAt.MatchString(path) {
			continue
		}
		read, _ := example.Read(path, content.Text)
		said := verdicts[path]
		out = append(out, Row{
			Path: path, Chapter: read.Chapter, Dev: read.Dev, Title: read.Title, Keywords: read.Keywords,
			Interface: read.Interface, Body: content.Text, Verdict: said.Verdict, Miss: said.Miss,
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Path < out[j].Path })
	return out
}

// The run verb, through the node module. [[spec/design_output/examples#one-runner-two-drivers]]
func runOf(in RunIn) []q.Request {
	args := []string{"example", "run", in.Path}
	return []q.Request{{Module: nodeModule, Verb: nodeRun, Args: args, NoUndo: "example run works in a clone of its own, which keeps no undo"}}
}
