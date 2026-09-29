// The index generates one tool an action off the registry: its name, its doc
// and its input schema, with a bare input carried as one property.
// [[spec/tickets/the-hook-registers-index-tools]]
package index

import (
	"encoding/json"
	"flag"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/tool"
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

// The golden file test/level0/index-tools.test.js reads as the list se-index tools prints. [[spec/tickets/tool-list-shape-held-once]]
const toolsGoldenAt = "testdata/tools.golden.json"

var update = flag.Bool("update", false, "write the golden file again off the index")

// The body /v1/tools answers over a door holding t/add and t/echo. [[spec/tickets/the-hook-registers-index-tools]]
func toolsBody(t *testing.T) []byte {
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
	if said.StatusCode != http.StatusOK {
		t.Fatalf("/v1/tools answers %d: %.300s", said.StatusCode, body)
	}
	return body
}

// The tools a door over t/add and t/echo lists, by name. [[spec/tickets/the-hook-registers-index-tools]]
func listedTools(t *testing.T) map[string]listedTool {
	t.Helper()
	body := toolsBody(t)
	var list []listedTool
	if err := json.Unmarshal(body, &list); err != nil {
		t.Fatalf("/v1/tools answers %.300s: %v", body, err)
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

// Every tool the list names spells its action as the shared surface does, so the hooks door and the mcp module read it back. [[spec/tickets/tool-surface-moves-into-q]]
func TestEveryListedNameIsTheSharedToolName(t *testing.T) {
	listed := listedTools(t)
	if len(listed) == 0 {
		t.Fatal("the list holds no tool, and wants t/add and t/echo")
	}
	for name, one := range listed {
		if name != tool.Name(one.Action) {
			t.Fatalf("%s lists as %q, and wants the shared name %q", one.Action, name, tool.Name(one.Action))
		}
	}
}

func TestABareInputRidesAsOneProperty(t *testing.T) {
	echo, ok := listedTools(t)["index_t_echo"]
	if !ok || !echo.Bare || echo.InputSchema.Type != "object" || echo.InputSchema.Properties["input"].Type != "string" {
		t.Fatalf("the list holds %+v for t/echo", echo)
	}
}

// The list /v1/tools generates reads as the golden file, so the hook's case holds the one shape the index answers. [[spec/tickets/tool-list-shape-held-once]]
func TestTheToolListReadsAsItsGoldenFile(t *testing.T) {
	var said, held any
	if err := json.Unmarshal(toolsBody(t), &said); err != nil {
		t.Fatal(err)
	}
	if *update {
		body, err := json.MarshalIndent(said, "", "  ")
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(toolsGoldenAt, append(body, '\n'), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	body, err := os.ReadFile(toolsGoldenAt)
	if err != nil {
		t.Fatalf("%v: run go test ./src/index -run TestTheToolListReadsAsItsGoldenFile -update", err)
	}
	if err := json.Unmarshal(body, &held); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(said, held) {
		t.Fatalf("/v1/tools lists %v, and %s holds %v", said, toolsGoldenAt, held)
	}
}
