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
func WriteShadow(path string, now time.Time, slice, said string) error {
	line, err := json.Marshal(map[string]any{"at": now.UTC().Format(shadowStamp), "level": "info", "kind": "shadow", "slice": slice, "said": said})
	if err != nil {
		return err
	}
	return appendFile(path, append(line, '\n'))
}

// The stamp the session log writes. [[spec/design_output/log#what-one-line-looks-like]]
const shadowStamp = "2006-01-02T15:04:05.000Z"
