// The catalog the window reads: a GET of /v1/values/<name> on the index,
// the road quack takes.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"encoding/json"
	"fmt"
	"time"
)

const (
	readWithin = 5 * time.Second
	statusBad  = 400
)

// The index at that /v1 base. [[spec/design_output/model#surfaces]]
type V1 struct {
	Base string
}

// The value the name holds, or the problem's detail where the index answers one. [[spec/design_output/model#surfaces]]
func (v V1) Read(name string) (json.RawMessage, error) {
	code, status, body, err := get(v.Base+"/values/"+name, readWithin)
	if err != nil {
		return nil, err
	}
	if code >= statusBad {
		return nil, problemIn(status, body)
	}
	var value struct {
		Value json.RawMessage `json:"value"`
	}
	if err := json.Unmarshal(body, &value); err != nil {
		return nil, err
	}
	return value.Value, nil
}

// The problem's detail where the index answers one, and the status where it answers none. [[spec/design_output/model#surfaces]]
func problemIn(status string, body []byte) error {
	var problem struct {
		Detail string `json:"detail"`
	}
	if json.Unmarshal(body, &problem) == nil && problem.Detail != "" {
		return fmt.Errorf("%s", problem.Detail)
	}
	return fmt.Errorf("the index answers %s", status)
}
