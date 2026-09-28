// The index answers /v1 through Huma, on a port of its own beside the old
// API, with openapi.json and the docs.
// [[spec/design_output/model#surfaces]]
package index

import (
	"context"
	"net"
	"net/http"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
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
		return valueOf(one.store, in.Name)
	})
	server := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}
	go server.Serve(listen)
	return listen, server, nil
}

// A name the catalog lacks answers a problem, and a stale one carries its mark. [[spec/design_output/model#a-stale-mark]]
func valueOf(store *q.Store, name string) (*valueOut, error) {
	if _, ok := store.Declared(name); !ok {
		return nil, huma.Error404NotFound("the catalog holds no provider of " + name)
	}
	snap := store.Snapshot()
	out := &valueOut{}
	out.Body.Name, out.Body.Value, out.Body.Revision = name, snap.Read(name), snap.Revision
	if since, stale := snap.Stale(name); stale {
		out.Body.Stale = &since
	}
	return out, nil
}
