// The catalog a case hands the registry tabs: the values it seeds, and an
// error where the case names one.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import (
	"encoding/json"
	"fmt"
)

// [[spec/design_output/model#the-registry-tabs]]
type Fake struct {
	Values map[string]any
	Err    error
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
