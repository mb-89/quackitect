// The catalog the window reads: a GET of /v1/values/<name> on the index,
// the road quack takes.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const readWithin = 5 * time.Second

// The index at that /v1 base. [[spec/design_output/model#surfaces]]
type V1 struct {
	Base string
}

// The value the name holds, or the problem's detail where the index answers one. [[spec/design_output/model#surfaces]]
func (v V1) Read(name string) (json.RawMessage, error) {
	said, err := (&http.Client{Timeout: readWithin}).Get(v.Base + "/values/" + name)
	if err != nil {
		return nil, err
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	if err != nil {
		return nil, err
	}
	if said.StatusCode >= http.StatusBadRequest {
		var problem struct {
			Detail string `json:"detail"`
		}
		if json.Unmarshal(body, &problem) == nil && problem.Detail != "" {
			return nil, fmt.Errorf("%s", problem.Detail)
		}
		return nil, fmt.Errorf("the index answers %s", said.Status)
	}
	var value struct {
		Value json.RawMessage `json:"value"`
	}
	if err := json.Unmarshal(body, &value); err != nil {
		return nil, err
	}
	return value.Value, nil
}
