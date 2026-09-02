package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Reads a process from src/processes. A process owns which states exist, which
// activities move between them, and how a note ends.
// The activities are SIPOC rows, so the drawing is derived rather than drawn.

type Process struct {
	Name        string
	Description string
	Traced      bool
	// Which of the catalogue's sections and fields this process switches on.
	RequiredSection []string
	OptionalSection []string
	RequiredField   []string
	OptionalField   []string
	States          []ProcessState
	Activities      []Activity
	Dispositions    []DispositionSpec
}

type ProcessState struct {
	Name        string
	Description string
}

// ActivityCriterion is what has to be true before an activity is done.
//
// Every one is ticked. Evidence turns a tick into a sentence saying what was
// seen, for the ones where a tick would be an assertion and nothing more.
// Raising the bar here raises it for every token minted after it.
type ActivityCriterion struct {
	Says          string
	NeedsEvidence bool
}

// Activity is one SIPOC row, plus what the engine needs: who may do it, and
// which state it moves the work to.
type Activity struct {
	Name     string
	Supplier string
	Input    string
	Does     string
	Output   string
	Customer string
	By       string
	From     string
	To       string
	// Pulled says whether the engine hands this step out. A step a person
	// takes, like reading the backlog and deciding what a note becomes, says
	// false, and the queue passes over it.
	Pulled   bool
	Criteria []ActivityCriterion
}

type DispositionSpec struct {
	Name        string
	Description string
	NeedsReason bool
}

// ProcessesDir is where a copy keeps the processes it knows.
func ProcessesDir(methodRoot string) string {
	return filepath.Join(methodRoot, "src", "processes")
}

// LoadProcess reads one process, or says why it cannot.
func LoadProcess(methodRoot, name string) (Process, error) {
	path := filepath.Join(ProcessesDir(methodRoot), name+".process.yaml")
	b, err := os.ReadFile(path)
	if err != nil {
		return Process{}, fmt.Errorf("no process named %q: %w", name, err)
	}
	tree, err := ParseYAML(string(b))
	if err != nil {
		return Process{}, fmt.Errorf("%s does not parse: %w", path, err)
	}
	top := ymap(tree)
	p := Process{
		Name:            ystr(top["name"]),
		Description:     ystr(top["description"]),
		Traced:          ystr(top["traced"]) == "true",
		RequiredSection: ystrs(ymap(top["sections"])["required"]),
		OptionalSection: ystrs(ymap(top["sections"])["optional"]),
		OptionalField:   ystrs(ymap(top["fields"])["optional"]),
		RequiredField:   ystrs(ymap(top["fields"])["required"]),
	}
	if p.Name != name {
		return Process{}, fmt.Errorf("%s declares name %q and is named for %q", path, p.Name, name)
	}
	for _, raw := range ylist(top["states"]) {
		m := ymap(raw)
		p.States = append(p.States, ProcessState{
			Name: ystr(m["name"]), Description: ystr(m["description"])})
	}
	for _, raw := range ylist(top["activities"]) {
		m := ymap(raw)
		p.Activities = append(p.Activities, Activity{
			Name:     ystr(m["name"]),
			Supplier: ystr(m["supplier"]),
			Input:    ystr(m["input"]),
			Does:     ystr(m["does"]),
			Output:   ystr(m["output"]),
			Customer: ystr(m["customer"]),
			By:       ystr(m["by"]),
			From:     ystr(m["from"]),
			To:       ystr(m["to"]),
			Pulled:   ystr(m["pulled"]) != "false",
			Criteria: criteriaOf(m["criteria"]),
		})
	}
	for _, raw := range ylist(top["dispositions"]) {
		m := ymap(raw)
		p.Dispositions = append(p.Dispositions, DispositionSpec{
			Name:        ystr(m["name"]),
			Description: ystr(m["description"]),
			NeedsReason: ystr(m["reason"]) == "required",
		})
	}
	if err := p.check(path); err != nil {
		return Process{}, err
	}
	return p, nil
}

// check refuses a process that could not drive anything.
//
// A process with no state, or an activity moving work to a state it does not
// declare, passes every note silently and answers nothing when asked what to
// do next.
func (p Process) check(path string) error {
	if len(p.States) == 0 {
		return fmt.Errorf("%s declares no states, so nothing can be in it", path)
	}
	if len(p.Activities) == 0 {
		return fmt.Errorf("%s declares no activities, so nothing moves", path)
	}
	for _, a := range p.Activities {
		for _, where := range []struct{ field, name string }{{"from", a.From}, {"to", a.To}} {
			if where.name == "" {
				continue
			}
			if !p.hasState(where.name) {
				return fmt.Errorf("%s: activity %q goes %s %q, which is not a declared state",
					path, a.Name, where.field, where.name)
			}
		}
	}
	return nil
}

// criteriaOf reads an activity's criteria, in the order they were written.
func criteriaOf(v any) []ActivityCriterion {
	var out []ActivityCriterion
	for _, raw := range ylist(v) {
		m := ymap(raw)
		out = append(out, ActivityCriterion{
			Says:          ystr(m["says"]),
			NeedsEvidence: ystr(m["evidence"]) == "required",
		})
	}
	return out
}

func (p Process) hasState(name string) bool {
	for _, s := range p.States {
		if s.Name == name {
			return true
		}
	}
	return false
}

// StateNames is what a status field draws its values from.
func (p Process) StateNames() []string {
	out := make([]string, 0, len(p.States))
	for _, s := range p.States {
		out = append(out, s.Name)
	}
	return out
}

// DispositionNames is what a disposition field draws its values from.
func (p Process) DispositionNames() []string {
	out := make([]string, 0, len(p.Dispositions))
	for _, d := range p.Dispositions {
		out = append(out, d.Name)
	}
	return out
}

// Narrow cuts a catalogue down to what this process switched on.
//
// The schema owns what may exist. This owns what does exist here. A section or
// a field the process never named is off, so a token carries only what its own
// process asked for.
func (p Process) Narrow(s Schema) Schema {
	var kept []SectionSpec
	for _, sec := range s.Body.Sections {
		// A section names itself by its heading, or by the prefix it matches
		// when the heading carries a name the schema cannot know.
		name := sec.Header
		if name == "" {
			name = sec.HeaderPrefix
		}
		switch {
		case holdsName(p.RequiredSection, name):
			sec.Required = true
			kept = append(kept, sec)
		case holdsName(p.OptionalSection, name):
			sec.Required = false
			kept = append(kept, sec)
		}
	}
	s.Body.Sections = kept

	// THE DECLARED ORDER IS KEPT. This walked the properties map, whose order
	// Go randomises, so the generated template came out in a different order
	// on every run and every mint would have looked like an edit.
	props := map[string]PropSpec{}
	var required []string
	keep := func(name string, isRequired bool) {
		spec, declared := s.Frontmatter.Properties[name]
		if !declared {
			return
		}
		if _, already := props[name]; already {
			return
		}
		props[name] = spec
		if isRequired {
			required = append(required, name)
		}
	}
	for _, name := range s.Frontmatter.Required {
		keep(name, true)
	}
	for _, name := range p.RequiredField {
		keep(name, true)
	}
	for _, name := range p.OptionalField {
		keep(name, false)
	}
	// A field the process never named is off, and a token carrying one is
	// carrying something nothing reads.
	s.Frontmatter.Properties = props
	s.Frontmatter.Required = required

	// Where a field draws its values from this process, resolve it now.
	for name, spec := range s.Frontmatter.Properties {
		switch spec.EnumFrom {
		case "process.states":
			spec.Enum = p.StateNames()
		case "process.dispositions":
			spec.Enum = p.DispositionNames()
		}
		s.Frontmatter.Properties[name] = spec
	}
	return s
}

func holdsName(all []string, one string) bool {
	for _, n := range all {
		if n == one {
			return true
		}
	}
	return false
}

// AvailableProcesses answers every process this copy has.
func AvailableProcesses(methodRoot string) []string {
	entries, err := os.ReadDir(ProcessesDir(methodRoot))
	if err != nil {
		return nil
	}
	var out []string
	for _, e := range entries {
		if name, found := strings.CutSuffix(e.Name(), ".process.yaml"); found && !Parked(name) {
			out = append(out, name)
		}
	}
	return out
}

// LintProcesses reads every process a copy has, so a broken one is heard about
// before something asks it what to do.
func LintProcesses(r Roots) []Finding {
	var out []Finding
	for _, name := range AvailableProcesses(r.Method) {
		if _, err := LoadProcess(r.Method, name); err != nil {
			out = append(out, Finding{ID: name + ".process.yaml", Says: err.Error()})
		}
	}
	return out
}

// Workable answers whether some activity of this token's process can run from
// where the token stands.
//
// THE PROCESS SAYS WHAT IS WORKABLE AND THE ENGINE SAYS WHICH. An activity
// moves work from one state to another, so a token is workable when an
// activity starts where it stands. An activity marked pulled: false is a step
// a person takes, and the queue passes over it.
func Workable(r Roots, t Token) bool {
	if t.Process == "" {
		return false
	}
	p, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return false
	}
	for _, a := range p.Activities {
		if a.From == "" || !a.Pulled {
			continue
		}
		if a.From == string(t.Status) {
			return true
		}
	}
	return false
}

// StartsAt is the state a new token of this process stands in. It is where the
// first activity that comes from nowhere puts it.
func (p Process) StartsAt() string {
	for _, a := range p.Activities {
		if a.From == "" && a.To != "" {
			return a.To
		}
	}
	if len(p.States) > 0 {
		return p.States[0].Name
	}
	return ""
}

// ActivityFrom is the step that leaves a state, which is the one a token
// standing there has next. StartsAt answers the other end of the same table.
func (p Process) ActivityFrom(state string) (Activity, bool) {
	for _, a := range p.Activities {
		if a.From == state {
			return a, true
		}
	}
	return Activity{}, false
}

// StepOf is where an activity sits in the process, counting from one. It is the
// number the checklist heading carries, so a reader and the engine agree on
// which step is which.
func (p Process) StepOf(name string) int {
	for i, a := range p.Activities {
		if a.Name == name {
			return i + 1
		}
	}
	return 0
}
