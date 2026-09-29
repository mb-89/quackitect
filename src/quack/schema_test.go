// The schema stands as the declarations write it, and the default file holds
// no key the declarations do not name, and none at its built-in value.
// [[spec/tickets/the-config-schema-gets-generated]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	oldconfig "quackitect/src/config"
	"quackitect/src/q"
)

func TestSchemaStandsAsGenerated(t *testing.T) {
	want, err := schemaText(treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	held, err := os.ReadFile(filepath.Join(treeRoot, schemaAt))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(held, want) {
		t.Fatalf("%s stands apart from the declarations, so run go run ./src/quack schema --write", schemaAt)
	}
}

func TestDefaultFileHoldsNoBuiltIn(t *testing.T) {
	keys := declared(t)
	for dotted, literal := range trackedLeaves(t) {
		key, ok := keys[dotted]
		if !ok {
			continue
		}
		if key.Default == "" {
			t.Errorf("%s stands declared with no built-in to weigh", dotted)
			continue
		}
		if literal == normalised(t, key.Default) {
			t.Errorf("%s holds %s at its built-in value %s", oldconfig.Tracked, dotted, literal)
		}
	}
}

func TestEveryTrackedKeyIsDeclared(t *testing.T) {
	keys := declared(t)
	for dotted := range trackedLeaves(t) {
		if _, ok := keys[dotted]; !ok {
			t.Errorf("%s holds %s, and no module declares it", oldconfig.Tracked, dotted)
		}
	}
}

// The sections the drawing names stand first, in its order, so the sidebar meets its groups as it drew them. [[spec/tickets/the-config-schema-gets-generated]]
func TestDrawnSectionsStandFirst(t *testing.T) {
	text, err := schemaText(treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	schema, err := q.JSON.Parse(text)
	if err != nil {
		t.Fatal(err)
	}
	sections := schema.Fields[len(schema.Fields)-1].Keys
	want := []string{"stop", "ask", "bridge", "log", "work", "engine", "answer"}
	for i, name := range want {
		if i >= len(sections) || sections[i] != name {
			t.Fatalf("the sections read %v, and want %v first", sections, want)
		}
	}
}

// Every key the tree declares, by its dotted name. [[spec/tickets/the-config-schema-gets-generated]]
func declared(t *testing.T) map[string]q.Key {
	t.Helper()
	c, err := catalogOf(treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	out := map[string]q.Key{}
	for _, key := range c.Keys() {
		out[dottedOf(key)] = key
	}
	return out
}

// Every leaf the default file holds past its comments, by its dotted name, as a JSON literal. [[spec/tickets/the-config-schema-gets-generated]]
func trackedLeaves(t *testing.T) map[string]string {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(treeRoot, oldconfig.Tracked))
	if err != nil {
		t.Fatal(err)
	}
	var said map[string]any
	if err := json.Unmarshal(text, &said); err != nil {
		t.Fatal(err)
	}
	out := map[string]string{}
	leavesInto(t, said, "", out)
	return out
}

func leavesInto(t *testing.T, said map[string]any, at string, out map[string]string) {
	for name, value := range said {
		if name == explained {
			continue
		}
		under := name
		if at != "" {
			under = at + "." + name
		}
		if inner, ok := value.(map[string]any); ok {
			leavesInto(t, inner, under, out)
			continue
		}
		literal, err := json.Marshal(value)
		if err != nil {
			t.Fatal(err)
		}
		out[under] = string(literal)
	}
}

// A literal written again the way encoding/json writes it, so two spellings of one value compare equal. [[spec/tickets/the-config-schema-gets-generated]]
func normalised(t *testing.T, literal string) string {
	t.Helper()
	var value any
	if json.Unmarshal([]byte(literal), &value) != nil {
		return ""
	}
	out, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}
