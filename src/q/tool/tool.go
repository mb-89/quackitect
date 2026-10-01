// The tool surface every caller of an action shares: the tool name an action
// carries, its input schema, the wait a call sets, and the line a call still
// running answers. The index core and every IO module import it, so one
// action reads the same on every surface.
// [[spec/tickets/tool-surface-moves-into-q]]
package tool

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"

	"quackitect/src/q"
)

// The prefix a tool's name opens on, the argument a call sets its wait by, and the property a bare input rides under, since a tool takes an object. [[spec/tickets/the-hook-registers-index-tools]]
const (
	Prefix  = "index_"
	Served  = "mcp__level0__"
	WaitArg = "wait"
	BareArg = "input"
	// The field the plan's answer rides any level zero call under, and the tool that answers it alone. [[spec/tickets/plan-writes-off-go]]
	PlanArg  = "plan"
	PlanTool = "plan"
	percent  = 100
)

// The tool name of an action: the prefix, and each slash an underscore. [[spec/tickets/the-hook-registers-index-tools]]
func Name(action string) string {
	return Prefix + strings.ReplaceAll(action, "/", "_")
}

// The tool name an action answers under: its own where it carries one, and the generated one otherwise. [[spec/tickets/tools-keep-their-own-names]]
func NameOf(store *q.Store, action string) string {
	if looks, ok := store.Presentation(action); ok && looks.Tool != "" {
		return looks.Tool
	}
	return Name(action)
}

// The action of the store whose tool name the call names, past the prefix the harness sets before a level zero tool. [[spec/tickets/tools-keep-their-own-names]]
func Action(store *q.Store, tool string) (string, bool) {
	tool = strings.TrimPrefix(tool, Served)
	for _, name := range store.Names() {
		if _, _, ok := store.Types(name); ok && NameOf(store, name) == tool {
			return name, true
		}
	}
	return "", false
}

// The input schema of a type, with its reference resolved, and a schema short of an object wrapped as the one bare property. [[spec/tickets/the-hook-registers-index-tools]]
func Schema(registry huma.Registry, in reflect.Type) (map[string]any, bool, error) {
	schema := registry.Schema(in, false, "")
	if schema.Ref != "" {
		schema = registry.SchemaFromRef(schema.Ref)
	}
	bare := schema.Type != huma.TypeObject
	if bare {
		schema = &huma.Schema{Type: huma.TypeObject, Properties: map[string]*huma.Schema{BareArg: schema}, Required: []string{BareArg}}
	}
	body, err := json.Marshal(schema)
	if err != nil {
		return nil, false, err
	}
	var out map[string]any
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, bare, err
	}
	inlined, err := inlines(registry, out, map[string]bool{})
	if err != nil {
		return nil, bare, err
	}
	out, _ = inlined.(map[string]any)
	return out, bare, nil
}

// A schema with each ref the registry holds written in its place, since a tool list carries no components a harness resolves a ref against. A ref inside its own schema stays a ref. [[spec/tickets/plan-writes-off-go]]
func inlines(registry huma.Registry, value any, open map[string]bool) (any, error) {
	switch one := value.(type) {
	case map[string]any:
		if ref, ok := one["$ref"].(string); ok && !open[ref] {
			body, err := json.Marshal(registry.SchemaFromRef(ref))
			if err != nil {
				return nil, err
			}
			var held any
			if err := json.Unmarshal(body, &held); err != nil {
				return nil, err
			}
			open[ref] = true
			defer delete(open, ref)
			return inlines(registry, held, open)
		}
		out := make(map[string]any, len(one))
		for key, inner := range one {
			done, err := inlines(registry, inner, open)
			if err != nil {
				return nil, err
			}
			out[key] = done
		}
		return out, nil
	case []any:
		out := make([]any, len(one))
		for at, inner := range one {
			done, err := inlines(registry, inner, open)
			if err != nil {
				return nil, err
			}
			out[at] = done
		}
		return out, nil
	}
	return value, nil
}

// The action's input off a call's arguments: past the wait argument, which an input declaring its own wait keeps, or the bare input a tool carries under its one property. [[spec/tickets/hooks-wait-leaves-tool-input]]
func Input(store *q.Store, action string, args map[string]any) (any, error) {
	in, _, _ := store.Types(action)
	kept := map[string]any{}
	for key, value := range args {
		// A plan field riding the call leaves the input as the wait does. [[spec/tickets/plan-writes-off-go]]
		if (key != WaitArg || declares(in, WaitArg)) && (key != PlanArg || declares(in, PlanArg)) {
			kept[key] = value
		}
	}
	body, err := json.Marshal(kept)
	if err != nil {
		return nil, err
	}
	input, err := store.Input(action, body)
	if bare, ok := kept[BareArg]; err != nil && ok && len(kept) == 1 {
		if body, err = json.Marshal(bare); err != nil {
			return nil, err
		}
		return store.Input(action, body)
	}
	return input, err
}

// Whether the input type carries a field its JSON names so. [[spec/tickets/hooks-wait-leaves-tool-input]]
func declares(in reflect.Type, key string) bool {
	if in == nil || in.Kind() != reflect.Struct {
		return false
	}
	for i := range in.NumField() {
		field := in.Field(i)
		name, _, _ := strings.Cut(field.Tag.Get("json"), ",")
		if name == key || (name == "" && strings.EqualFold(field.Name, key)) {
			return true
		}
	}
	return false
}

// The wait the call's arguments set, or the seconds its key reads, or the fallback. [[spec/design_output/model#a-caller-sets-its-wait]]
func Wait(args map[string]any, key any, fallback time.Duration) time.Duration {
	if seconds, ok := Number(args[WaitArg]); ok && seconds >= 0 {
		return time.Duration(seconds * float64(time.Second))
	}
	if seconds, ok := key.(int); ok && seconds >= 0 {
		return time.Duration(seconds) * time.Second
	}
	return fallback
}

// The number a decoded JSON value holds, in every form a decoder answers. [[spec/design_output/model#a-caller-sets-its-wait]]
func Number(value any) (float64, bool) {
	switch one := value.(type) {
	case float64:
		return one, true
	case int:
		return float64(one), true
	case int64:
		return float64(one), true
	case json.Number:
		n, err := one.Float64()
		return n, err == nil
	}
	return 0, false
}

// The line an operation past its wait answers: the action, the fraction done, the time gone by and the handle. [[spec/design_output/model#a-caller-sets-its-wait]]
func Running(action string, fraction float64, gone time.Duration, handle string) string {
	return fmt.Sprintf("%s still running: %.0f%% done after %s, handle %s", action, fraction*percent, gone, handle)
}

// One todo a plan adds: its title, its detail line, and the place it stands at. [[spec/design_output/stop#the-plan]]
type PlanTodo struct {
	Title   string `json:"title" doc:"the todo's title"`
	Details string `json:"details,omitempty" doc:"the todo's detail line"`
	Place   int    `json:"place,omitempty" doc:"The place in the queue, 1 to 9: the todo stands before the todo at that place now. A place on a ticket or past the todos puts it after every todo, before the first ticket."`
}

// The answer to the engine's three questions. [[spec/design_output/stop#the-plan]]
type Plan struct {
	Working string     `json:"working,omitempty" doc:"The title of the todo, or the name of the ticket, you work on now."`
	Done    []string   `json:"done,omitempty" nullable:"false" doc:"The titles of the todos you finished, which leave the queue."`
	Add     []PlanTodo `json:"add,omitempty" nullable:"false" doc:"The todos you add, each with the place you do it at."`
}

// The description the plan field carries, as planField in src/bridge/plan.js words it. [[spec/design_output/stop#the-plan]]
const planDoc = "The answer to the engine's three questions, riding this call: what you work on, which todos you finished, which you add."

// A tool's schema with the plan field among its properties, so the plan's answer rides any call, and the plan tool's own as it stands. [[spec/design_output/stop#the-plan]]
func WithPlan(registry huma.Registry, schema map[string]any, name string) map[string]any {
	if name == PlanTool {
		return schema
	}
	plan, _, err := Schema(registry, reflect.TypeOf(Plan{}))
	if err != nil {
		return schema
	}
	properties := map[string]any{}
	if own, ok := schema["properties"].(map[string]any); ok {
		for key, value := range own {
			properties[key] = value
		}
	}
	properties[PlanArg] = map[string]any{"type": "object", "description": planDoc, "properties": plan["properties"]}
	out := map[string]any{}
	for key, value := range schema {
		out[key] = value
	}
	out["properties"] = properties
	return out
}
