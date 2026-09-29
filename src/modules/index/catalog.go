// The catalog as rows under index/: each name with its provider and state,
// each action with its input fields, and each doc, so every surface reads
// one list. [[spec/design_output/model#the-topics-and-their-writers]]
package index

import (
	"strings"

	"quackitect/src/q"
)

// The three names the catalog rows stand under. [[spec/design_output/model#the-topics-and-their-writers]]
const (
	NamesName   = "index/names"
	ActionsName = "index/actions"
	DocsName    = "index/docs"
)

// A name, its provider and its state, and its value where it names one value. [[spec/tickets/the-catalog-reads-as-rows]]
type NameRow struct {
	Name     string     `json:"name"`
	Provider q.Provider `json:"provider"`
	State    string     `json:"state"`
	Value    any        `json:"value,omitempty"`
}

// An action, its doc, and its input fields, which stand for its input type. [[spec/tickets/the-catalog-reads-as-rows]]
type ActionRow struct {
	Name   string    `json:"name"`
	Doc    string    `json:"doc"`
	Fields []q.Field `json:"fields"`
}

// A name, an action or a key, with its doc. [[spec/tickets/the-catalog-reads-as-rows]]
type DocRow struct {
	Name string `json:"name"`
	Kind string `json:"kind"`
	Doc  string `json:"doc"`
}

// The three row lists off the store, in catalog order. [[spec/tickets/the-catalog-reads-as-rows]]
func catalogOf(store *q.Store) ([]NameRow, []ActionRow, []DocRow) {
	names, actions, docs := []NameRow{}, []ActionRow{}, []DocRow{}
	for _, name := range store.Names() {
		why, err := store.Why(name)
		if err != nil {
			continue
		}
		looks, _ := store.Presentation(name)
		row := NameRow{Name: name, Provider: why.Provider, State: why.State}
		// A family and the catalog's own rows carry no value, so index/names nests no list of itself. [[spec/tickets/the-catalog-reads-as-rows]]
		if !strings.Contains(name, "<") && !strings.HasPrefix(name, "index/") {
			row.Value = why.Value
		}
		names = append(names, row)
		kind := "name"
		switch {
		case why.Provider.Kind == "action":
			kind = "action"
			actions = append(actions, ActionRow{Name: name, Doc: looks.Doc, Fields: looks.Fields})
		case strings.HasPrefix(name, "config/") || strings.Contains(name, "/config/"):
			kind = "key"
		}
		docs = append(docs, DocRow{Name: name, Kind: kind, Doc: looks.Doc})
	}
	return names, actions, docs
}
