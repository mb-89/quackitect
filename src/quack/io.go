// The IO process: quack io dials the bus, runs the IO instances placed in it,
// and publishes each commit. Under shadow the index weighs each value it
// publishes against its own.
// [[spec/design_output/model#the-io-process]]
package main

import (
	"encoding/json"
	"time"

	"quackitect/src/index"
)

// Runs each start over the bus, publishing what it commits on commit.<instance>, and answers the stop of them all. [[spec/design_output/model#the-io-process]]
func runsIO(url, token string, starts map[string]index.Start) (func(), error) {
	return func() {}, nil
}

// The index's side of the shadow: what the store holds for a name, the span a value settles in, and where a row goes. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
type shadows struct {
	read   func(name string) any
	settle time.Duration
	wait   func(time.Duration)
	say    func(row map[string]any) error
}

// Weighs each value the IO process commits against the store's, once the span passes, and writes a shadow row for each value apart. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
func (s shadows) weigh(values map[string]json.RawMessage) {}
