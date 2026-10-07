// The index generates one tool an action off the registry: its name, its doc
// and its input schema, with a bare input carried as one property.
// [[spec/tickets/the-hook-registers-index-tools]]
package index // level0: InPackageTest - it drives the unexported opens and standingOf

import (
	"encoding/json"
	"flag"
	"fmt"
	"reflect"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
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

// The golden file holding the list se-index tools prints. [[spec/tickets/tool-list-shape-held-once]]
const toolsGoldenAt = "testdata/tools.golden.json"

var update = flag.Bool("update", false, "write the golden file again off the index")

// The same body over a catalog the case adds its own actions to. [[spec/tickets/tools-keep-their-own-names]]
func toolsBodyWith(t *testing.T, adds func(*q.Catalog)) []byte {
	t.Helper()
	clock := qtest.NewFake(time.Time{})
	c, manage := toolsCatalog(clock, adds)
	_, standing := served(t, clock, tree(t), c, manage)
	said, body := getV1(t, standing, "/v1/tools")
	if said.StatusCode != statusOK {
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

// A door over t/add, which a module answers, and t/ghost, whose request no module accepts, and the tools it lists. [[spec/tickets/every-index-tool-answers]]
func ghostTools(t *testing.T) (Standing, []listedTool) {
	t.Helper()
	c := q.New()
	ops := q.OutIn(c, "ops/<id>", map[string]any{}, q.Doc("the fake manager's operations"))
	q.ActionIn(c, "t/add", func(in addIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("adds two terms"), q.Answers[addOut]())
	q.ActionIn(c, "t/ghost", func(in addIn) []q.Request {
		return []q.Request{{Module: "ghost", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("asks a module nobody runs"), q.Answers[addOut]())
	return toolsOver(t, c, ops)
}

// A door over the catalog, whose manager answers module t alone, and the tools it lists. [[spec/tickets/tool-list-keeps-unreadable-actions]]
func toolsOver(t *testing.T, c *q.Catalog, ops q.Writer) (Standing, []listedTool) {
	t.Helper()
	answers := func(module, _ string) bool { return module == "t" }
	accept := func(asked q.Request) (any, error) {
		if !answers(asked.Module, asked.Verb) {
			return nil, fmt.Errorf("no IO module accepts %s.%s", asked.Module, asked.Verb)
		}
		in, _ := asked.Args.(addIn)
		return addOut{Sum: in.A + in.B}, nil
	}
	clock := qtest.NewFake(time.Time{})
	fake := fakeManager(clock, ops, accept)
	manage := func(root string, store *q.Store, rows OpRows, reads Reads, steps func(func())) (Managed, error) {
		one, err := fake(root, store, rows, reads, steps)
		one.Accepts = answers
		return one, err
	}
	_, standing := served(t, clock, tree(t), c, manage)
	said, body := getV1(t, standing, "/v1/tools")
	var list []listedTool
	if err := json.Unmarshal(body, &list); err != nil || said.StatusCode != statusOK {
		t.Fatalf("/v1/tools answers %d, %.300s: %v", said.StatusCode, body, err)
	}
	return standing, list
}

// Each tool the list names answers a call through the route act posts to. [[spec/tickets/every-index-tool-answers]]
// level0: FixtureOutsideHome - the case opens its own index over its own catalog and fake manager, and posts into its store.
func TestEachListedToolAnswersACallThroughAct(t *testing.T) {
	t.Parallel()
	standing, list := ghostTools(t)
	if len(list) == 0 {
		t.Fatal("the list holds no tool, and wants t/add")
	}
	for _, one := range list {
		said, body := postV1(t, standing, "/v1/actions/"+one.Action, "wait=5", `{"a":2,"b":3}`)
		if out := postedOf(t, body); said.StatusCode != statusOK || out.Result == nil || out.Result.Sum != 5 {
			t.Errorf("%s answers %d: %s", one.Name, said.StatusCode, body)
		}
	}
}

// The list keeps an action whose zero input it cannot read: one that panics on it, one that opens no request on it, and one that asks a refused module only past it. [[spec/tickets/tool-list-keeps-unreadable-actions]]
// level0: FixtureOutsideHome - the case opens its own index over a catalog it declares itself.
func TestTheToolListKeepsAnActionItsZeroInputCannotRead(t *testing.T) {
	t.Parallel()
	c := q.New()
	ops := q.OutIn(c, "ops/<id>", map[string]any{}, q.Doc("the fake manager's operations"))
	q.ActionIn(c, "t/panics", func(in addIn) []q.Request {
		return []q.Request{{Module: "ghost", Verb: "add", Args: []int{}[in.B]}}
	}, q.Doc("panics on every input before it names its request"), q.Answers[addOut]())
	q.ActionIn(c, "t/quiet", func(in addIn) []q.Request {
		if in.A == 0 {
			return nil
		}
		return []q.Request{{Module: "t", Verb: "add", Args: in}}
	}, q.Doc("opens no request on a zero input"), q.Answers[addOut]())
	q.ActionIn(c, "t/later", func(in addIn) []q.Request {
		if in.A == 0 {
			return []q.Request{{Module: "t", Verb: "add", Args: in}}
		}
		return []q.Request{{Module: "ghost", Verb: "add", Args: in}}
	}, q.Doc("asks a refused module past a zero input"), q.Answers[addOut]())
	_, list := toolsOver(t, c, ops)
	names := map[string]bool{}
	for _, one := range list {
		names[one.Action] = true
	}
	for _, kept := range []string{"t/panics", "t/quiet", "t/later"} {
		if !names[kept] {
			t.Errorf("the list leaves out %s, and names %v", kept, names)
		}
	}
}

// The routes serve no action whose request no module accepts, so the route and the list agree. [[spec/tickets/accepts-reads-away-modules]]
// level0: FixtureOutsideHome - the case opens its own index over its own catalog and fake manager, and posts into its store.
func TestTheRoutesServeNoActionNoModuleAccepts(t *testing.T) {
	t.Parallel()
	standing, _ := ghostTools(t)
	if said, body := postV1(t, standing, "/v1/actions/t/ghost", "wait=5", `{"a":2,"b":3}`); said.StatusCode != statusNotFound {
		t.Errorf("t/ghost answers %d: %s", said.StatusCode, body)
	}
}

// The list leaves out an action whose request no module accepts, and keeps the one a module answers. [[spec/tickets/every-index-tool-answers]]
// level0: FixtureOutsideHome - the case opens its own index over its own catalog and fake manager.
func TestTheToolListSkipsAnActionNoModuleAccepts(t *testing.T) {
	t.Parallel()
	_, list := ghostTools(t)
	names := map[string]bool{}
	for _, one := range list {
		names[one.Action] = true
	}
	if !names["t/add"] || names["t/ghost"] {
		t.Errorf("the list names %v, and wants t/add without t/ghost", names)
	}
}

func TestV1ListsEachActionAsATool(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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

// An action carrying its own tool name lists under that name, and still names its action. [[spec/tickets/tools-keep-their-own-names]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheToolListNamesAnActionUnderItsOwnToolName(t *testing.T) {
	t.Parallel()
	body := toolsBodyWith(t, func(c *q.Catalog) {
		q.ActionIn(c, "t/plan", func(in string) []q.Request {
			return []q.Request{{Module: "t", Verb: "echo", Args: in, NoUndo: "a plan writes nothing here"}}
		}, q.Doc("plans the work"), q.ToolName("plan"))
	})
	var list []listedTool
	if err := json.Unmarshal(body, &list); err != nil {
		t.Fatalf("/v1/tools answers %.300s: %v", body, err)
	}
	names := map[string]string{}
	for _, one := range list {
		names[one.Name] = one.Action
	}
	if names["plan"] != "t/plan" {
		t.Fatalf("the list names %v, and wants plan for t/plan", names)
	}
	if _, ok := names["index_t_plan"]; ok {
		t.Fatal("t/plan lists under its generated name too, and wants its own name alone")
	}
}

// Every listed tool carries the plan field, so the plan's answer rides any call. [[spec/tickets/plan-writes-off-go]]
func TestEveryListedToolCarriesThePlanField(t *testing.T) {
	t.Parallel()
	listed := listedTools(t)
	if len(listed) == 0 {
		t.Fatal("the list holds no tool, and wants t/add and t/echo")
	}
	for name, one := range listed {
		if plan, ok := one.InputSchema.Properties[tool.PlanArg]; !ok || plan.Type != "object" {
			t.Errorf("%s lists the properties %v, and wants the plan field as an object", name, one.InputSchema.Properties)
		}
	}
}

// The plan tool takes the plan as its input, and carries no plan field of its own. [[spec/tickets/plan-writes-off-go]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestThePlanToolCarriesNoPlanField(t *testing.T) {
	t.Parallel()
	body := toolsBodyWith(t, func(c *q.Catalog) {
		q.ActionIn(c, "t/plan", func(tool.Plan) []q.Request { return nil }, q.Doc("plans the work"), q.ToolName(tool.PlanTool))
	})
	var list []listedTool
	if err := json.Unmarshal(body, &list); err != nil {
		t.Fatalf("/v1/tools answers %.300s: %v", body, err)
	}
	for _, one := range list {
		if one.Name != tool.PlanTool {
			continue
		}
		if _, ok := one.InputSchema.Properties[tool.PlanArg]; ok {
			t.Errorf("the plan tool lists %v, and wants no plan field", one.InputSchema.Properties)
		}
		if _, ok := one.InputSchema.Properties["working"]; !ok {
			t.Errorf("the plan tool lists %v, and wants its own input", one.InputSchema.Properties)
		}
		return
	}
	t.Fatal("the list names no plan tool")
}

func TestABareInputRidesAsOneProperty(t *testing.T) {
	t.Parallel()
	echo, ok := listedTools(t)["index_t_echo"]
	if !ok || !echo.Bare || echo.InputSchema.Type != "object" || echo.InputSchema.Properties["input"].Type != "string" {
		t.Fatalf("the list holds %+v for t/echo", echo)
	}
}

// The list /v1/tools generates reads as the golden file, so the hook's case holds the one shape the index answers. [[spec/tickets/tool-list-shape-held-once]]
func TestTheToolListReadsAsItsGoldenFile(t *testing.T) {
	t.Parallel()
	var said, held any
	if err := json.Unmarshal(toolsBody(t), &said); err != nil {
		t.Fatal(err)
	}
	if *update {
		body, err := json.MarshalIndent(said, "", "  ")
		if err != nil {
			t.Fatal(err)
		}
		if err := writeFile(toolsGoldenAt, append(body, '\n'), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	body, err := readFile(toolsGoldenAt)
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
