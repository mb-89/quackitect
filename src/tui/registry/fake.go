// The catalog a case hands the registry tabs: the values it seeds, and an
// error where the case names one.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import (
	"context"
	"encoding/json"
	"fmt"
)

// [[spec/design_output/model#the-registry-tabs]]
type Fake struct {
	Values map[string]any
	Err    error
	// The changes the watch hands on, in order, before it ends. [[spec/tickets/v1-watch-streams-changes]]
	Changes []Change
}

// Each change the case seeded, then the end. [[spec/tickets/v1-watch-streams-changes]]
func (f Fake) Watch(_ context.Context, _ []string, _ func(Change)) error {
	return f.Err
}

// The value the case seeded under the name, and an error for a name it left out, as the /v1 door answers. [[spec/design_output/model#the-fake-keeps-a-contract]]
func (f Fake) Read(name string) (json.RawMessage, error) {
	if f.Err != nil {
		return nil, f.Err
	}
	value, found := f.Values[name]
	if !found {
		return nil, fmt.Errorf("no provider answers %s", name)
	}
	return json.Marshal(value)
}
