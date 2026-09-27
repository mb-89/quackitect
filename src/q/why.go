// quack why: where a value comes from, off the catalog and a snapshot.
// [[spec/design_output/model#quack-why]]
package q

import "time"

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
	Alt   string `json:"alt,omitempty"`
	Where string `json:"where"`
}

type WhyInput struct {
	Field string `json:"field"`
	Why   Why    `json:"why"`
}

func (s *Store) Why(name string) (Why, error) { return Why{}, nil }
