// The index generates one tool an action off the registry: its name, its doc
// and its input schema, with a bare input carried as one property.
// [[spec/tickets/the-hook-registers-index-tools]]
package index

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"testing"

	"quackitect/src/q"
)

// One tool as the list reads it. [[spec/tickets/the-hook-registers-index-tools]]
type listedTool struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Action      string `json:"action"`
	Bare        bool   `json:"bare"`
	InputSchema struct {
		Type       string `json:"type"`
		Properties map[string]struct {
			Type        string `json:"type"`
			Description string `json:"description"`
		} `json:"properties"`
	} `json:"inputSchema"`
}

// The tools a door over t/add and t/echo lists. [[spec/tickets/the-hook-registers-index-tools]]
func listedTools(t *testing.T) map[string]listedTool {
	t.Helper()
	root := tree(t)
	c := q.New()
	ops := q.OutIn(c, "ops/<id>", map[string]any{}, q.Doc("the fake manager's operations"))
	q.ActionIn(c, "t/add", func(in addIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("adds two terms"))
	q.ActionIn(c, "t/echo", func(in string) []q.Request {
		return []q.Request{{Module: "t", Verb: "echo", Args: in, NoUndo: "an echo writes nothing"}}
	}, q.Doc("echoes its input"))
	accept := func(asked q.Request) (any, error) { return asked.Args, nil }
	_, stop, _, err := opens(root, filepath.Join(t.TempDir(), "index.db"), c, fakeManager(ops, accept))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	said, body := getV1(t, standing, "/v1/tools")
	var list []listedTool
	if said.StatusCode != http.StatusOK || json.Unmarshal(body, &list) != nil {
		t.Fatalf("/v1/tools answers %d: %.300s", said.StatusCode, body)
	}
	out := map[string]listedTool{}
	for _, one := range list {
		out[one.Name] = one
	}
	return out
}

func TestV1ListsEachActionAsATool(t *testing.T) {
	add, ok := listedTools(t)["index_t_add"]
	if !ok || add.Action != "t/add" || add.Description != "adds two terms" || add.Bare || add.InputSchema.Type != "object" {
		t.Fatalf("the list holds %+v for t/add", add)
	}
	if a := add.InputSchema.Properties["a"]; a.Type != "integer" || a.Description != "the first term" {
		t.Fatalf("the input schema of t/add reads %+v", add.InputSchema)
	}
}

func TestABareInputRidesAsOneProperty(t *testing.T) {
	echo, ok := listedTools(t)["index_t_echo"]
	if !ok || !echo.Bare || echo.InputSchema.Type != "object" || echo.InputSchema.Properties["input"].Type != "string" {
		t.Fatalf("the list holds %+v for t/echo", echo)
	}
}
