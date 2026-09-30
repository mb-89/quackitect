// The catalog the window reads: a GET of /v1/values/<name> on the index,
// the road quack takes.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"
)

// A call waits callWait on its action, and the post gives up a second past it. [[spec/design_output/model#a-caller-sets-its-wait]]
const (
	readWithin = 5 * time.Second
	statusBad  = 400
	callWait   = 5
	callWithin = (callWait + 1) * time.Second
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

// The action's result where it ends within the wait, its handle where it runs on, or the problem's detail. [[spec/design_output/model#a-caller-sets-its-wait]]
func (v V1) Call(name string, input any) (Said, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return Said{}, err
	}
	code, status, read, err := post(v.Base+"/actions/"+name, "wait="+strconv.Itoa(callWait), body, callWithin)
	if err != nil {
		return Said{}, err
	}
	if code >= statusBad {
		return Said{}, problemIn(status, read)
	}
	var answer struct {
		Result  json.RawMessage `json:"result"`
		Running bool            `json:"running"`
		Handle  string          `json:"handle"`
	}
	if err := json.Unmarshal(read, &answer); err != nil {
		return Said{}, err
	}
	return Said{Result: answer.Result, Running: answer.Running, Handle: answer.Handle}, nil
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
