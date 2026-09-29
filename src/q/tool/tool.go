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
	WaitArg = "wait"
	BareArg = "input"
	percent = 100
)

// The tool name of an action: the prefix, and each slash an underscore. [[spec/tickets/the-hook-registers-index-tools]]
func Name(action string) string {
	return Prefix + strings.ReplaceAll(action, "/", "_")
}

// The action of the store whose tool name the call names. [[spec/tickets/the-hook-registers-index-tools]]
func Action(store *q.Store, tool string) (string, bool) {
	if !strings.HasPrefix(tool, Prefix) {
		return "", false
	}
	for _, name := range store.Names() {
		if _, _, ok := store.Types(name); ok && Name(name) == tool {
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
	return out, bare, json.Unmarshal(body, &out)
}

// The action's input off a call's arguments: past the wait argument, which an input declaring its own wait keeps, or the bare input a tool carries under its one property. [[spec/tickets/hooks-wait-leaves-tool-input]]
func Input(store *q.Store, action string, args map[string]any) (any, error) {
	in, _, _ := store.Types(action)
	kept := map[string]any{}
	for key, value := range args {
		if key != WaitArg || declares(in, WaitArg) {
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
