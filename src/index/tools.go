// The index lists one tool an action at /v1/tools: its name, its doc and its
// input schema off the registry, with a bare input carried as one property.
// [[spec/tickets/the-hook-registers-index-tools]]
package index

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/danielgtaylor/huma/v2"
)

// The prefix a tool's name opens on, so it reads apart from the tools the bridge serves. [[spec/tickets/the-hook-registers-index-tools]]
const toolPrefix = "index_"

// The property a bare input rides under, since a tool takes an object. [[spec/tickets/the-hook-registers-index-tools]]
const bareKey = "input"

// One tool: the action it calls, whether its input rides bare, and what a harness registers. [[spec/tickets/the-hook-registers-index-tools]]
type tool struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Action      string         `json:"action"`
	Bare        bool           `json:"bare"`
	InputSchema map[string]any `json:"inputSchema"`
}

type toolsOut struct {
	Body []tool
}

// The tool name of an action: the prefix, and each slash an underscore. [[spec/tickets/the-hook-registers-index-tools]]
func toolName(action string) string {
	return toolPrefix + strings.ReplaceAll(action, "/", "_")
}

// Registers the list, read at each call off the actions the door serves. A door with no manager serves no action, so it lists no tool. [[spec/tickets/the-hook-registers-index-tools]]
func (one *door) servesTools(api huma.API) {
	registry := api.OpenAPI().Components.Schemas
	huma.Register(api, huma.Operation{
		OperationID: "get-tools",
		Method:      http.MethodGet,
		Path:        "/tools",
		Summary:     "one tool an action, with its input schema",
	}, func(context.Context, *struct{}) (*toolsOut, error) {
		out := &toolsOut{Body: []tool{}}
		if one.call == nil {
			return out, nil
		}
		for _, name := range one.store.Names() {
			in, _, ok := one.store.Types(name)
			if !ok {
				continue
			}
			looks, _ := one.store.Presentation(name)
			schema, bare, err := inputOf(registry, registry.Schema(in, false, ""))
			if err != nil {
				return nil, huma.Error500InternalServerError(err.Error())
			}
			out.Body = append(out.Body, tool{Name: toolName(name), Description: looks.Doc, Action: name, Bare: bare, InputSchema: schema})
		}
		return out, nil
	})
}

// The input schema with its reference resolved, and a schema short of an object wrapped as the one bare property. [[spec/tickets/the-hook-registers-index-tools]]
func inputOf(registry huma.Registry, schema *huma.Schema) (map[string]any, bool, error) {
	if schema.Ref != "" {
		schema = registry.SchemaFromRef(schema.Ref)
	}
	bare := schema.Type != huma.TypeObject
	if bare {
		schema = &huma.Schema{Type: huma.TypeObject, Properties: map[string]*huma.Schema{bareKey: schema}, Required: []string{bareKey}}
	}
	body, err := json.Marshal(schema)
	if err != nil {
		return nil, false, err
	}
	var out map[string]any
	return out, bare, json.Unmarshal(body, &out)
}
