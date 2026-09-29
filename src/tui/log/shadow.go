// The log view in shadow: the rows the tail holds, read beside the rows the
// index holds under log/rows. Each pair read apart becomes one shadow row in
// the session log.
// [[spec/design_output/model#the-log-is-a-view]]

package log

import (
	"encoding/json"
	"time"
)

// The one read the index's catalog answers, which the registry tabs read through too. [[spec/design_output/model#the-registry-tabs]]
type Source interface {
	Read(name string) (json.RawMessage, error)
}

// One row of log/rows, on the fields the compare reads. [[spec/design_output/model#the-log-is-a-view]]
type Row struct {
	At     string `json:"at"`
	Level  string `json:"level"`
	Kind   string `json:"kind"`
	Said   string `json:"said"`
	Broken bool   `json:"broken"`
}

// A pair of rows read apart: the tail's, and the index's. [[spec/design_output/model#the-log-is-a-view]]
type Mismatch struct {
	Old, New Row
}

// The shadow a log tab holds: the source, the mode the config names, and the clock the row's stamp reads. [[spec/design_output/model#the-log-is-a-view]]
type Shadow struct {
	From Source
	Mode func() string
	Now  func() time.Time
}

// Every pair the tail and the index read apart, where a tail one side holds alone is the log growing. [[spec/design_output/model#the-log-is-a-view]]
func Apart(old []Record, rows []Row) []Mismatch { return nil }

// Reads log/rows, and appends one shadow row to the log at path for each pair read apart, where the mode stands at shadow. [[spec/design_output/model#the-log-is-a-view]]
func (s *Shadow) Check(path string, old []Record) error { return nil }
