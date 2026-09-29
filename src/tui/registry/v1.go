// The catalog the window reads: a GET of /v1/values/<name> on the index,
// the road quack takes.
// [[spec/design_output/model#surfaces]]

package registry

import "encoding/json"

// The index at that /v1 base. [[spec/design_output/model#surfaces]]
type V1 struct {
	Base string
}

func (v V1) Read(_ string) (json.RawMessage, error) { return nil, nil }
