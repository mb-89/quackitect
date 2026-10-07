// The log module: the session rows off the session log, and the level ladder
// every reader ranks a row by, held once.
// [[spec/tickets/the-log-topic-lands]]
package log

import (
	"encoding/json"
	"strings"

	"quackitect/src/q"
	"quackitect/src/yaml"
)

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	SessionPort = "session"
	RowsPort    = "rows"
	LadderPort  = "ladder"
)

// The ladder Python's logging climbs. [[spec/design_output/log#what-a-box-writes]]
var Ladder = []string{"debug", "info", "warn", "error", "fatal"}

// The level an empty or unknown level reads as. [[spec/design_output/log#what-a-box-writes]]
const fallback = 1

// The fields a row holds by name, which no extra carries. [[spec/design_output/tui#one-row]]
var own = map[string]bool{"at": true, "level": true, "kind": true, "door": true, "said": true, "text": true}

// One row of the session log. [[spec/design_output/tui#one-row]]
type Row struct {
	At     string            `json:"at"`
	Level  string            `json:"level"`
	Kind   string            `json:"kind"`
	Said   string            `json:"said"`
	Text   string            `json:"text,omitempty"`
	Extra  map[string]string `json:"extra,omitempty"`
	Broken bool              `json:"broken,omitempty"`
}

type rowsIn struct {
	Session q.Content `q:"session"`
}

// The module type the wiring loads as log. [[spec/tickets/the-log-topic-lands]]
func Registers(c *q.Catalog) q.Writer {
	rows := q.DerivedIn(c, RowsPort, []Row{}, rowsOf, q.Doc("every row of the session log, in the order it holds them"))
	ladder := q.OutIn(c, LadderPort, Ladder, q.Doc("the level ladder every reader ranks a row by"))
	// [[spec/tickets/the-sidebar-writes-through-actions]]
	says := q.ActionIn(c, SayAction, sayOf, q.Doc("Append one row to the session log."), q.Label("Say a line"), q.Writes())
	return q.Join(rows, ladder, says)
}

// The action a sidebar line posts, by its local name. [[spec/tickets/the-sidebar-writes-through-actions]]
const SayAction = "say"

// The node module's name and its verb. src/modules/verbs owns both, and a module spells them again because it imports q alone. [[spec/tickets/the-sidebar-writes-through-actions]]
const (
	nodeModule = "node"
	nodeRun    = "run"
)

// The input of a say: the row's level, kind, words and extra fields. [[spec/tickets/the-sidebar-writes-through-actions]]
type Said struct {
	Level string         `json:"level" label:"level" doc:"the row's level"`
	Kind  string         `json:"kind" label:"kind" doc:"the row's kind"`
	Said  string         `json:"said" label:"said" doc:"the row's words"`
	Extra map[string]any `json:"extra,omitempty" doc:"the row's extra fields"`
}

// The log verb's say, handed the row as one JSON word. [[spec/tickets/the-sidebar-writes-through-actions]]
func sayOf(in Said) []q.Request {
	row, _ := json.Marshal(in)
	return []q.Request{{Module: nodeModule, Verb: nodeRun, Args: []string{"log", "--say", string(row)}, NoUndo: "log --say appends through the Go log verb, which keeps no undo"}}
}

func rowsOf(in rowsIn) []Row {
	return RowsOf(in.Session.Text)
}

// One row a line that holds anything. [[spec/design_output/tui#one-row]]
func RowsOf(text string) []Row {
	out := []Row{}
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		out = append(out, RowOf(line))
	}
	return out
}

// One line's row, read the way ParseRecord reads it: a line no parser takes stands as a broken row at error. [[spec/tickets/the-log-topic-lands]]
func RowOf(line string) Row {
	var fields map[string]any
	decoder := json.NewDecoder(strings.NewReader(line))
	decoder.UseNumber()
	if err := decoder.Decode(&fields); err != nil || fields == nil {
		return Row{Level: "error", Kind: "unparsed", Said: strings.TrimSpace(line), Broken: true}
	}
	r := Row{
		At:    yaml.FieldText(fields["at"]),
		Level: Ladder[Rank(yaml.FieldText(fields["level"]))],
		Kind:  yaml.FieldText(fields["kind"]),
		Said:  yaml.FieldText(fields["said"]),
		Text:  yaml.FieldText(fields["text"]),
	}
	if r.Kind == "" {
		r.Kind = yaml.FieldText(fields["door"])
	}
	for key, value := range fields {
		if own[key] {
			continue
		}
		if r.Extra == nil {
			r.Extra = map[string]string{}
		}
		r.Extra[key] = yaml.FieldText(value)
	}
	return r
}

// A level's place on the ladder, and info's place for a level nobody knows. [[spec/design_output/log#what-a-box-writes]]
func Rank(level string) int {
	for at, one := range Ladder {
		if strings.EqualFold(one, level) {
			return at
		}
	}
	return fallback
}
