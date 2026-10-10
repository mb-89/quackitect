// The holds module: each box's hold file, a loaded projection of files/
// under hold/, and whether an agent at this desk blesses a gate.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package holds

import (
	"encoding/json"
	"path"
	"sort"
	"strconv"
	"strings"

	"quackitect/src/q"
	"quackitect/src/ticket"
	"quackitect/src/yaml"
)

// The hold files, which src/modules/check/folders.go owns and a module spells again. [[spec/design_output/model#everything-on-disk-mirrors]]
const Glob = ".se/.runtime/hold/*.json"

// The bless file, which BlessFile in src/pull/pull_bless.go owns and a module spells again, and the name its word answers at. [[spec/design_output/pull#the-bless]]
const (
	// src/modules/check/folders.go owns this name. [[spec/design_output/pull#the-bless]]
	Bless     = ".se/.runtime/bless.json"
	BlessName = "bless/agent"
)

type blessIn struct {
	// src/modules/check/folders.go owns this name. [[spec/design_output/pull#the-bless]]
	File q.Content `q:"files/.se/.runtime/bless.json"`
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ProjectIn(c, "hold", Glob, q.JSON, q.Loaded, q.Ordered{}, q.Doc("a box's hold, keyed by its file")),
		q.DerivedIn(c, BlessName, false, blesses, q.Doc("whether an agent at this desk blesses a gate, off the bless file the sidebar writes")),
		q.DerivedIn(c, StandingName, []Standing{}, standingOf, q.Doc("every hold whose ticket stands, one row a hold file, marked where a person holds it")),
		// [[spec/tickets/the-sidebar-writes-through-actions]]
		q.ActionIn(c, BlessSet, deskBless, q.Doc("Write whether an agent at this desk blesses a gate, as a person."), q.Label("Bless"), q.Writes()),
	)
}

// The action the bless button posts. [[spec/tickets/the-sidebar-writes-through-actions]]
const BlessSet = "bless/set"

// The node module's name and its verb, and the fields of a run a person posts. src/modules/verbs owns them, and a module spells them again because it imports q alone. [[spec/tickets/the-lens-calls-actions]]
const (
	nodeModule  = "node"
	nodeRun     = "run"
	wordsField  = "words"
	personField = "person"
)

// The input of a bless: the desk's word, and the person mark. [[spec/tickets/the-sidebar-writes-through-actions]]
type BlessIn struct {
	Agent  bool `json:"agent" label:"agent blesses" doc:"whether an agent at this desk blesses a gate"`
	Person bool `json:"person,omitempty" doc:"whether a person posts it, so the verb runs with no harness variable"`
}

// The ticket verb's desk bless, which writes the bless file and refuses an agent. [[spec/tickets/the-sidebar-writes-through-actions]]
func deskBless(in BlessIn) []q.Request {
	var args any = []string{"ticket", "bless", "--desk=" + strconv.FormatBool(in.Agent)}
	if in.Person {
		args = map[string]any{wordsField: args, personField: true}
	}
	return []q.Request{{Module: nodeModule, Verb: nodeRun, Args: args, NoUndo: "ticket bless runs through its program, which keeps no undo"}}
}

// The standing holds, which the lens, the marks and the drawing read. [[spec/tickets/the-lens-reads-v1]]
const StandingName = "holds/standing"

// The hand a hold names where a person takes it, the rule personHolds in src/modules/lsp/lenses.go holds. [[spec/tickets/the-lens-reads-v1]]
const personHand = "person"

// The state a ticket leaves its holds at. [[spec/design_output/pull#the-hand-and-the-hold]]
const closedState = "closed"

// One hold as the lens reads it. [[spec/tickets/the-lens-reads-v1]]
type Standing struct {
	Ticket string `json:"ticket"`
	Path   string `json:"path"`
	Step   string `json:"step"`
	Hand   string `json:"hand"`
	Person bool   `json:"person"`
}

// The hold files, and every ticket the tickets module reads, by its bare name, since the holds module stands unwired. [[spec/tickets/the-lens-reads-v1]]
type standingIn struct {
	Files   map[string]q.Content `q:"files/<path...>"`
	Tickets []ticket.Ticket      `q:"tickets/all"`
}

// One row a hold file in path order, where a hold naming a closed ticket drops out, as stillHeld in the engine drops it. A file reading as no hold stands out. [[spec/tickets/the-lens-reads-v1]]
func standingOf(in standingIn) []Standing {
	closed := map[string]bool{}
	for _, one := range in.Tickets {
		closed[one.Path] = one.State == closedState
	}
	files := make([]string, 0, len(in.Files))
	for at, file := range in.Files {
		if matched, _ := path.Match(Glob, at); matched && file.Hash != "" {
			files = append(files, at)
		}
	}
	sort.Strings(files)
	out := []Standing{}
	for _, at := range files {
		var said struct {
			Ticket any `json:"ticket"`
			Path   any `json:"path"`
			Step   any `json:"step"`
			Hand   any `json:"hand"`
		}
		if json.Unmarshal([]byte(in.Files[at].Text), &said) != nil {
			continue
		}
		one := Standing{Ticket: yaml.JSONText(said.Ticket), Path: strings.TrimSpace(yaml.JSONText(said.Path)), Step: yaml.JSONText(said.Step), Hand: strings.TrimSpace(yaml.JSONText(said.Hand))}
		if one.Path != "" && closed[one.Path] {
			continue
		}
		one.Person = one.Hand == personHand || strings.HasPrefix(one.Hand, personHand+" ")
		out = append(out, one)
	}
	return out
}

// The bless file's agent word, and false where the file stands absent or unread. [[spec/design_output/pull#the-bless]]
func blesses(in blessIn) bool {
	var said struct {
		Agent bool `json:"agent"`
	}
	return json.Unmarshal([]byte(in.File.Text), &said) == nil && said.Agent
}
