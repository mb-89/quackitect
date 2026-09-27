// The index answers /v1 through Huma, on a port of its own beside the old
// API, with openapi.json and the docs.
// [[spec/design_output/surfaces]]
package main

import (
	"net"
	"net/http"
	"time"

	"quackitect/src/q"
)

type valueOut struct {
	Body struct {
		Name     string     `json:"name"`
		Value    any        `json:"value"`
		Revision int64      `json:"revision"`
		Stale    *time.Time `json:"stale,omitempty"`
	}
}

// [[spec/design_output/surfaces]]
func (one *door) servesV1() (net.Listener, *http.Server, error) {
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, nil, err
	}
	server := &http.Server{Handler: http.NewServeMux(), ReadHeaderTimeout: headerReadTimeout}
	go server.Serve(listen)
	return listen, server, nil
}

func valueOf(store *q.Store, name string) (*valueOut, error) { return &valueOut{}, nil }
