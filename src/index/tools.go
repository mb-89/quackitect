// The index lists one tool an action at /v1/tools: its name, its doc and its
// input schema off the registry, with a bare input carried as one property.
// [[spec/tickets/the-hook-registers-index-tools]]
package index

import (
	"context"
	"net/http"

	"github.com/danielgtaylor/huma/v2"

	"quackitect/src/q/tool"
)

// One tool: the action it calls, whether its input rides bare, and what a harness registers. [[spec/tickets/the-hook-registers-index-tools]]
type listed struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Action      string         `json:"action"`
	Bare        bool           `json:"bare"`
	InputSchema map[string]any `json:"inputSchema"`
}

type toolsOut struct {
	Body []listed
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
		out := &toolsOut{Body: []listed{}}
		if one.call == nil {
			return out, nil
		}
		for _, name := range one.store.Names() {
			in, _, ok := one.store.Types(name)
			if !ok {
				continue
			}
			looks, _ := one.store.Presentation(name)
			schema, bare, err := tool.Schema(registry, in)
			if err != nil {
				return nil, huma.Error500InternalServerError(err.Error())
			}
			toolName := tool.NameOf(one.store, name)
			// [[spec/tickets/plan-writes-off-go]]
			schema = tool.WithPlan(registry, schema, toolName)
			out.Body = append(out.Body, listed{Name: toolName, Description: looks.Doc, Action: name, Bare: bare, InputSchema: schema})
		}
		return out, nil
	})
}
