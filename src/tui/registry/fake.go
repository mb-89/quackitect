// The catalog a case hands the registry tabs: the values it seeds, and an
// error where the case names one.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import "encoding/json"

// [[spec/design_output/model#the-registry-tabs]]
type Fake struct {
	Values map[string]any
	Err    error
}

func (f Fake) Read(_ string) (json.RawMessage, error) { return nil, nil }
