// The settings: the keys of each section no module of its own declares, each
// with its built-in value, its help, its unit and its options. The wiring loads
// a section as an instance of its own name.
// [[spec/tickets/the-config-schema-gets-generated]]
package settings

import (
	"sort"

	"quackitect/src/q"
)

type key struct {
	local string
	def   any
	doc   string
	unit  string
	enum  []string
}

var sections = map[string][]key{
	"answer": {
		{local: "enabled", def: true, doc: "The door holding the owner's prompt first. false takes it out."},
		{local: "warn-at", def: float64(5), doc: "The score where the gate starts writing a warn line to the log.", unit: "findings a thousand words"},
		{local: "ceiling", def: float64(15), doc: "The score where the gate names the band rewrite in its log line.", unit: "findings a thousand words"},
		{local: "words", def: float64(150), doc: "The words an answer holds outside its code and tables.", unit: "words"},
	},
	"ask": {
		{local: "wanted", def: "quiet", doc: "What the owner wants said at the end of this turn.", enum: []string{"quiet", "short", "full"}},
	},
	"battery": {
		{local: "runs", def: float64(5), doc: "The check's runs the stamp keeps at one commit. A retro reads each part's median over them.", unit: "runs"},
	},
	"budget": {
		{local: "pull", def: float64(1000), doc: "The median time the pull takes to hand out a leaf over a group of many tickets, with about ten times headroom over a box's measure, and 10 where that stays under a millisecond.", unit: "milliseconds"},
		{local: "hand-back", def: float64(1000), doc: "The median time a hand-back takes to land over a group of many tickets, with about ten times headroom over a box's measure, and 10 where that stays under a millisecond.", unit: "milliseconds"},
		{local: "resolver", def: float64(10), doc: "The median time the guidance resolver takes over many notes, with about ten times headroom over a box's measure, and 10 where that stays under a millisecond.", unit: "milliseconds"},
		{local: "stale", def: float64(10), doc: "The median time the query for stale steps takes to read, hash and compare the notes a hold names, with about ten times headroom over a box's measure, and 10 where that stays under a millisecond.", unit: "milliseconds"},
	},
	"code": {
		{local: "function-lines", def: float64(150), doc: "The lines a function holds at most. The write door refuses a write that grows past it.", unit: "lines"},
		{local: "file-lines", def: float64(600), doc: "The lines a file holds at most. The write door refuses a write that grows past it.", unit: "lines"},
	},
	"context": {
		{local: "handover-at", def: float64(300000), doc: "The context past which the next pull after the ticket in hand hands the handover, the clear and the read of the handover. 0 switches it off.", unit: "tokens"},
	},
	"engine": {
		{local: "binding", def: "queue", doc: "Where the session takes its work from. The chapter The engine controls, under spec/design_output/config.md, says what each value means.", enum: []string{"queue", "unbound", "god"}},
	},
	"grace": {
		{local: "update", def: float64(5), doc: "The calls the engine lets pass after the owner asks for an update, before the ask refuses them.", unit: "calls"},
		{local: "finish", def: float64(10), doc: "The calls the finish hold lets pass before it stops hard.", unit: "calls"},
	},
	"helper": {
		{local: "find", def: "haiku", doc: "The model a helper runs on that finds, lists, reads and reports.", enum: []string{"haiku", "sonnet", "opus"}},
		{local: "change", def: "opus", doc: "The model a helper runs on that makes a scoped change with its test, or reviews against a list.", enum: []string{"haiku", "sonnet", "opus"}},
		{local: "decide", def: "opus", doc: "The model a helper runs on that takes a design, an unknown cause, or a verdict the owner reads.", enum: []string{"haiku", "sonnet", "opus"}},
	},
	"log": {
		{local: "level", def: "info", doc: "The level this box writes at. info writes every line a door says, and debug writes what the hooks see too.", enum: []string{"debug", "info", "warn", "error", "fatal"}},
	},
	"names": {
		{local: "words", def: float64(5), doc: "The words a file, a folder and a branch name each hold at most.", unit: "words"},
	},
	"ops": {
		{local: "keep-done", def: float64(3600), doc: "The span a done or cancelled operation stays under ops. Zero keeps it.", unit: "seconds"},
		{local: "keep-failed", def: float64(86400), doc: "The span a failed operation stays under ops. Zero keeps it.", unit: "seconds"},
	},
	"plan": {
		{local: "every-calls", def: float64(10), doc: "The calls between two asks of the engine's three questions.", unit: "calls"},
		{local: "most-open", def: float64(5), doc: "The todos the plan holds open, past which the third question stays away.", unit: "todos"},
		{local: "grace", def: float64(6), doc: "The calls that pass after the ask, before every call waits on the plan's answer.", unit: "calls"},
	},
	"pull": {
		{local: "cap", def: float64(48823), doc: "The size up to which one tool answer reaches the model whole. Past it, the client hands back a preview.", unit: "bytes"},
		{local: "margin", def: float64(4000), doc: "The room the pull keeps free below the cap. A hand-out past cap less margin splits, and the next pull on the step prints the rest.", unit: "bytes"},
	},
	"restated": {
		{local: "pointer", def: float64(4), doc: "The run a heading shares with the heading its pointer names before the rule draws.", unit: "words"},
		{local: "rule", def: float64(6), doc: "The run two rule lines of two guidance notes share before the rule draws.", unit: "words"},
	},
	"stop": {
		{local: "enabled", def: true, doc: "The tooth. false ends every turn where the agent asks to end it."},
		{local: "most-in-a-row", def: float64(3), doc: "The turns the tooth carries one after another before it lets go.", unit: "turns"},
		{local: "hold", def: "off", doc: "What the session does when it reaches the end of a turn.", enum: []string{"off", "finish", "stop"}},
	},
	"wait": {
		{local: "most", def: float64(600), doc: "The span the wait tool holds at most before it returns with no signal.", unit: "seconds"},
		{local: "quiet", def: float64(30), doc: "The span a file stands unchanged before the wait reads it as quiet.", unit: "seconds"},
	},
	"watchdog": {
		{local: "backoff-first", def: float64(1), doc: "The wait before the first restart of a part.", unit: "seconds"},
		{local: "backoff-cap", def: float64(60), doc: "The longest wait before a restart.", unit: "seconds"},
		{local: "faults", def: float64(5), doc: "The faults inside the window that raise an alarm and stop the restarts."},
		{local: "window", def: float64(300), doc: "The span the faults of an alarm fall inside.", unit: "seconds"},
		{local: "deadline-derived", def: float64(30), doc: "The span a derived provider with a pending input commits within.", unit: "seconds"},
		{local: "deadline-fold", def: float64(30), doc: "The span a fold with a pending event commits within.", unit: "seconds"},
		{local: "deadline-action", def: float64(600), doc: "The span an action's operation ends within.", unit: "seconds"},
	},
	"work": {
		{local: "stale-after", def: "30m", doc: "The age of a held group's tip that puts it under yours.", unit: "a span, as 90m, 12h or 3d"},
		{local: "fails-before-person", def: float64(2), doc: "The times a step fails back before the pull puts a person step in, asking the reason.", unit: "returns"},
		{local: "refusals-before-fail", def: float64(5), doc: "The times one hand-back meets refused before the pull fails the leaf back with the findings.", unit: "refusals"},
		{local: "steps-before-split", def: float64(3), doc: "The person steps a ticket carries before the pull refuses another and asks for a split.", unit: "steps"},
		{local: "person-signs", def: false, doc: "The stronger door on a person's hand. Switched on, a person's hand-back on a tracked ticket meets a signed tip."},
		{local: "retro-readers", def: float64(4), doc: "The hands a retro's collect spawns, each taking the next chapter until none stands.", unit: "hands"},
		{local: "retro-cap", def: float64(8), doc: "The tickets a retro's improve step mints, so the list holds what gets done.", unit: "tickets"},
		{local: "block-score", def: float64(10), doc: "The score a ticket takes for each one waiting under it, down the whole chain.", unit: "score"},
		{local: "day-score", def: float64(1), doc: "The score a ticket takes for each day it stands.", unit: "score"},
		{local: "fail-score", def: float64(5), doc: "The score a ticket takes for each hand-back that comes back refused.", unit: "score"},
	},
}

// Every section, in name order. [[spec/tickets/the-config-schema-gets-generated]]
func Sections() []string {
	names := make([]string, 0, len(sections))
	for name := range sections {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

// The module type registering one section's keys, which answers the first key's writer. [[spec/tickets/the-config-schema-gets-generated]]
func Of(section string) func(*q.Catalog) q.Writer {
	return func(c *q.Catalog) q.Writer {
		var first q.Writer
		for i, one := range sections[section] {
			writer := declared(c, one)
			if i == 0 {
				first = writer
			}
		}
		return first
	}
}

// A key registers under the Go type of its built-in value, which names its JSON type. [[spec/tickets/the-config-schema-gets-generated]]
func declared(c *q.Catalog, one key) q.Writer {
	opts := []q.Option{q.Doc(one.doc)}
	if one.unit != "" {
		opts = append(opts, q.Unit(one.unit))
	}
	if len(one.enum) > 0 {
		opts = append(opts, q.Enum(one.enum...))
	}
	switch def := one.def.(type) {
	case bool:
		return q.CfgIn(c, one.local, def, opts...)
	case string:
		return q.CfgIn(c, one.local, def, opts...)
	default:
		return q.CfgIn(c, one.local, def.(float64), opts...)
	}
}
