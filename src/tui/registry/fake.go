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
	// The result each action answers, and every post the fake takes, where the case holds the list. [[spec/tickets/the-work-keys-call-actions]]
	Results map[string]any
	Posted  *[]Posted
}

// One post the fake takes: the action and its input as JSON. [[spec/tickets/the-work-keys-call-actions]]
type Posted struct {
	Name  string
	Input json.RawMessage
}

// Keeps the post where the case holds the list, and answers the result the case seeded, or an error naming an action it left out, as the /v1 door answers. [[spec/design_output/model#the-fake-keeps-a-contract]]
func (f Fake) Call(name string, input any) (Said, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return Said{}, err
	}
	if f.Posted != nil {
		*f.Posted = append(*f.Posted, Posted{Name: name, Input: body})
	}
	result, found := f.Results[name]
	if !found {
		return Said{}, fmt.Errorf("no action answers %s", name)
	}
	said, err := json.Marshal(result)
	return Said{Result: said}, err
}

// Each change the case seeded, then the end. [[spec/tickets/v1-watch-streams-changes]]
func (f Fake) Watch(_ context.Context, _ []string, each func(Change)) error {
	for _, one := range f.Changes {
		each(one)
	}
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
