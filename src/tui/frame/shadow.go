// What the tabs share of the window's shadow: the one read a source answers,
// and the row a mismatch writes to the session log.
// [[spec/design_output/model#the-log-is-a-view]]

package frame

import (
	"encoding/json"
	"time"
)

// The one read the index's catalog answers, which the registry tabs and the shadows read through. [[spec/design_output/model#the-registry-tabs]]
type Source interface {
	Read(name string) (json.RawMessage, error)
}

// Appends one shadow row for the slice to the session log at path, at the stamp handed in. [[spec/design_output/model#the-log-is-a-view]]
func WriteShadow(path string, now time.Time, slice, said string) error { return nil }
