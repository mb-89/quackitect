// quack why: where a value comes from, off the catalog and a snapshot.
// [[spec/design_output/model#quack-why]]
package q

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

type Why struct {
	Name     string     `json:"name"`
	Value    any        `json:"value"`
	State    string     `json:"state"`
	Since    *time.Time `json:"since,omitempty"`
	Provider Provider   `json:"provider"`
	Inputs   []WhyInput `json:"inputs,omitempty"`
	Readers  []string   `json:"readers,omitempty"`
	Text     string     `json:"text,omitempty"`
}

type Provider struct {
	Name  string `json:"name"`
	Kind  string `json:"kind"`
	Where string `json:"where"`
}

type WhyInput struct {
	Field string `json:"field"`
	Why   Why    `json:"why"`
}

var kinds = map[provider]string{given: "given", derived: "derived", fold: "fold", action: "action"}

func (s *Store) Why(name string) (Why, error) {
	if s.owner(name) == nil {
		return Why{}, fmt.Errorf("the catalog holds no active provider of %s", name)
	}
	said := s.why(s.Snapshot(), name, map[string]bool{})
	lines := said.lines("")
	if len(said.Readers) > 0 {
		lines = append(lines, "read by "+strings.Join(said.Readers, ", "))
	}
	said.Text = strings.Join(lines, "\n")
	return said, nil
}

// [[spec/design_output/model#quack-why]]
func (s *Store) why(snap Snapshot, name string, seen map[string]bool) Why {
	one := s.owner(name)
	said := Why{
		Name:     name,
		Value:    snap.Read(name),
		State:    "default",
		Provider: Provider{Name: one.name, Kind: kinds[one.kind], Where: one.where},
		Readers:  s.readersOf(one),
	}
	if _, ok := snap.values[name]; ok {
		said.State = "answered"
	}
	if since, ok := snap.Stale(name); ok {
		said.State, said.Since = "stale", &since
	}
	if snap.NotProvided(name) {
		said.State, said.Since = "not provided", nil
	}
	if seen[one.name] {
		return said
	}
	seen[one.name] = true
	for _, in := range one.inputs {
		if s.owner(in.name) != nil {
			said.Inputs = append(said.Inputs, WhyInput{Field: in.field, Why: s.why(snap, in.name, seen)})
		}
	}
	return said
}

func (s *Store) readersOf(one *registration) []string {
	out := []string{}
	for _, reader := range s.active {
		for _, in := range reader.inputs {
			if s.owner(in.name) == one {
				out = append(out, reader.name)
				break
			}
		}
	}
	sort.Strings(out)
	return out
}

func (said Why) lines(indent string) []string {
	state := said.State
	if said.Since != nil {
		state += " since " + said.Since.Format(time.RFC3339)
	}
	out := []string{fmt.Sprintf("%s%s = %v, %s, %s at %s", indent, said.Name, said.Value, state, said.Provider.Kind, said.Provider.Where)}
	for _, in := range said.Inputs {
		out = append(out, in.Why.lines(indent+"  "+in.Field+" <- ")...)
	}
	return out
}
