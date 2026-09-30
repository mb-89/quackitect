// The index answers /v1 through Huma, on a port of its own beside the old
// API, with openapi.json and the docs.
// [[spec/design_output/model#surfaces]]
package index

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/danielgtaylor/huma/v2/sse"
	"quackitect/src/q"
)

const v1Title = "the quackitect index"
const v1Version = "1.0.0"

type valueOut struct {
	Body struct {
		Name     string     `json:"name"`
		Value    any        `json:"value"`
		Revision int64      `json:"revision"`
		Stale    *time.Time `json:"stale,omitempty"`
	}
}

// [[spec/design_output/model#surfaces]]
func (one *door) servesV1(listens func(network, address string) (net.Listener, error)) (net.Listener, *http.Server, error) {
	listen, err := listens("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, nil, err
	}
	mux := http.NewServeMux()
	api := humago.NewWithPrefix(mux, "/v1", huma.DefaultConfig(v1Title, v1Version))
	huma.Register(api, huma.Operation{
		OperationID: "get-value",
		Method:      http.MethodGet,
		Path:        "/values/{name...}",
		Summary:     "the value of a name at the latest revision",
	}, func(_ context.Context, in *struct {
		Name string `path:"name"`
	}) (*valueOut, error) {
		return valueOf(one.store, one.drains, in.Name)
	})
	one.servesWatch(api)
	one.servesActions(api)
	one.servesTools(api)
	server := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}
	go server.Serve(listen)
	return listen, server, nil
}

type watchIn struct {
	Names string `query:"names" required:"true"`
}

// One event of the watch: the name, the revision the store stands at, and its value. [[spec/tickets/v1-watch-sends-changes]]
type watchEvent struct {
	Name     string `json:"name"`
	Revision int64  `json:"revision"`
	Value    any    `json:"value"`
}

func namesIn(list string) []string {
	return strings.Split(list, ",")
}

// The middleware refuses a name the catalog lacks, because the stream writes its status before the handler runs. [[spec/tickets/watch-refuses-before-it-streams]]
func (one *door) servesWatch(api huma.API) {
	known := func(ctx huma.Context, next func(huma.Context)) {
		for _, name := range namesIn(ctx.Query("names")) {
			if _, ok := one.store.Declared(name); !ok {
				huma.WriteErr(api, ctx, http.StatusNotFound, "the catalog holds no provider of "+name)
				return
			}
		}
		next(ctx)
	}
	sse.Register(api, huma.Operation{
		OperationID: "watch-values",
		Method:      http.MethodGet,
		Path:        "/watch",
		Summary:     "each named value once, then each change to one",
		Middlewares: huma.Middlewares{known},
	}, map[string]any{"change": watchEvent{}}, func(ctx context.Context, in *watchIn, send sse.Sender) {
		one.streams(ctx, namesIn(in.Names), send)
	})
}

// Each name once, then each name whose JSON form moves on a commit, until the request ends. [[spec/tickets/v1-watch-sends-changes]]
func (one *door) streams(ctx context.Context, names []string, send sse.Sender) {
	if one.drains != nil {
		one.drains()
	}
	sent := map[string]string{}
	for {
		next := one.nextCommit()
		snap := one.store.Snapshot()
		for _, name := range names {
			value := snap.Read(name)
			form, _ := json.Marshal(value)
			if seen, ok := sent[name]; ok && seen == string(form) {
				continue
			}
			sent[name] = string(form)
			if send.Data(watchEvent{Name: name, Revision: snap.Revision, Value: value}) != nil {
				return
			}
		}
		select {
		case <-ctx.Done():
			return
		case <-next:
		}
	}
}

// A name the catalog lacks answers a problem, and a stale one carries its mark. The scheduler settles first, as the door's value call does, so a reader beside the old path reads the settled value. [[spec/design_output/model#a-stale-mark]]
func valueOf(store *q.Store, settle func(), name string) (*valueOut, error) {
	if _, ok := store.Declared(name); !ok {
		return nil, huma.Error404NotFound("the catalog holds no provider of " + name)
	}
	if settle != nil {
		settle()
	}
	snap := store.Snapshot()
	out := &valueOut{}
	out.Body.Name, out.Body.Value, out.Body.Revision = name, snap.Read(name), snap.Revision
	if since, stale := snap.Stale(name); stale {
		out.Body.Stale = &since
	}
	return out, nil
}
