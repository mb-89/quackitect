// The actions over /v1: one operation an action, off the registry, which
// answers within the wait the request sets with Prefer, per RFC 7240.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package index

import (
	"context"
	"encoding/json"
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"quackitect/src/q"
)

// The name the wiring binds the http module's default wait under, in seconds. [[spec/tickets/actions-answer-over-http]]
const WaitName = "http/config/wait"

// The caller a call over /v1 stands under, and the path its handle reads at. [[spec/design_output/model#the-handle-is-a-name]]
const (
	httpCaller = "http"
	opsPath    = "/v1/values/ops/"
)

// A post of an action: its preference and its input as JSON. [[spec/design_output/model#a-caller-sets-its-wait]]
type actionIn struct {
	Prefer string          `header:"Prefer" doc:"wait=N, the seconds the call waits on its action, per RFC 7240"`
	Body   json.RawMessage `required:"false"`
}

// What a post answers: 200 with the result, or 202 with the operation still running. [[spec/design_output/model#a-caller-sets-its-wait]]
type actionOut struct {
	Status  int
	Applied string `header:"Preference-Applied"`
	Body    calledBody
}

// [[spec/design_output/model#a-caller-sets-its-wait]]
type calledBody struct {
	Result   any     `json:"result,omitempty" doc:"what the action answers, once it ends within the wait"`
	Running  bool    `json:"running" doc:"whether the action still runs past the wait"`
	Handle   string  `json:"handle" doc:"the path its operation reads at"`
	Fraction float64 `json:"fraction" doc:"the fraction of its requests done"`
	Gone     float64 `json:"gone" doc:"the seconds gone by since it started"`
}

// Registers a post for each action the store holds, with its input schema, its answer schema, and the 202 of a wait that runs out. A door with no manager serves none. [[spec/tickets/actions-answer-over-http]]
func (one *door) servesActions(api huma.API) {
	if one.call == nil {
		return
	}
	registry := api.OpenAPI().Components.Schemas
	for _, name := range one.store.Names() {
		in, out, ok := one.store.Types(name)
		if !ok || !one.accepted(name) {
			continue
		}
		looks, _ := one.store.Presentation(name)
		jsonOf := func(schema *huma.Schema) map[string]*huma.MediaType {
			return map[string]*huma.MediaType{"application/json": {Schema: schema}}
		}
		huma.Register(api, huma.Operation{
			OperationID:      "post-" + strings.ReplaceAll(name, "/", "-"),
			Method:           http.MethodPost,
			Path:             "/actions/" + name,
			Summary:          looks.Doc,
			SkipValidateBody: true,
			RequestBody:      &huma.RequestBody{Content: jsonOf(registry.Schema(in, false, ""))},
			Responses: map[string]*huma.Response{
				"200": {Description: "the action ends within the wait", Content: jsonOf(answered(registry, out, looks.Out))},
				"202": {Description: "the wait runs out first, and the operation still runs", Content: jsonOf(answered(registry, nil, nil))},
			},
		}, func(_ context.Context, asked *actionIn) (*actionOut, error) {
			return one.acts(name, asked)
		})
	}
}

// The body's schema, its result drawn off the answer type, each field titled by its label and described by its doc. [[spec/tickets/surfaces-read-the-output-fields]]
func answered(registry huma.Registry, out reflect.Type, fields []q.Field) *huma.Schema {
	base := *registry.Schema(reflect.TypeFor[calledBody](), false, "")
	props := make(map[string]*huma.Schema, len(base.Properties))
	for key, schema := range base.Properties {
		props[key] = schema
	}
	delete(props, "result")
	if out != nil {
		result := *registry.Schema(out, false, "")
		result.Properties = make(map[string]*huma.Schema, len(result.Properties))
		for key, schema := range registry.Schema(out, false, "").Properties {
			result.Properties[key] = schema
		}
		for _, field := range fields {
			if held, ok := result.Properties[field.Key]; ok {
				titled := *held
				titled.Title, titled.Description = field.Label, field.Doc
				result.Properties[field.Key] = &titled
			}
		}
		props["result"] = &result
	}
	base.Properties = props
	return &base
}

// Decodes the body, calls the action within the wait, and answers 200 where it ends, 202 where it runs on, 400 for a body its input refuses, and 422 where it fails. [[spec/design_output/model#a-caller-sets-its-wait]]
func (one *door) acts(name string, asked *actionIn) (*actionOut, error) {
	input, err := one.store.Input(name, asked.Body)
	if err != nil {
		return nil, huma.Error400BadRequest(err.Error())
	}
	wait, applied := one.waitOf(asked.Prefer)
	said, err := one.call(name, input, httpCaller, wait)
	if err != nil {
		return nil, huma.Error500InternalServerError(err.Error())
	}
	if said.Error != "" {
		return nil, huma.Error422UnprocessableEntity(said.Error)
	}
	out := &actionOut{Status: http.StatusOK, Applied: applied, Body: calledBody{
		Result: said.Result, Running: said.Running, Handle: opsPath + said.Handle, Fraction: said.Fraction, Gone: said.Gone.Seconds(),
	}}
	if said.Running {
		out.Status, out.Body.Result = http.StatusAccepted, nil
	}
	return out, nil
}

// The wait a Prefer header sets with wait=N, and the preference it applies, or the default key's wait where it sets none. [[spec/design_output/model#a-caller-sets-its-wait]]
func (one *door) waitOf(prefer string) (time.Duration, string) {
	for _, part := range strings.FieldsFunc(prefer, func(r rune) bool { return r == ',' || r == ';' }) {
		key, value, _ := strings.Cut(strings.TrimSpace(part), "=")
		if !strings.EqualFold(strings.TrimSpace(key), "wait") {
			continue
		}
		if seconds, err := strconv.Atoi(strings.TrimSpace(value)); err == nil && seconds >= 0 {
			return time.Duration(seconds) * time.Second, "wait=" + strconv.Itoa(seconds)
		}
	}
	seconds, _ := one.store.Snapshot().Read(WaitName).(int)
	return time.Duration(max(seconds, 0)) * time.Second, ""
}
