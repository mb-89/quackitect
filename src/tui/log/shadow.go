// The log view in shadow: the rows the tail holds, read beside the rows the
// index holds under log/rows. Each pair read apart becomes one shadow row in
// the session log.
// [[spec/design_output/model#the-log-is-a-view]]

package log

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"quackitect/src/tui/frame"
)

// The one read the index's catalog answers, which the registry tabs read through too. [[spec/design_output/model#the-registry-tabs]]
type Source = frame.Source

// The name the index answers the session rows under, and the slice a mismatch names. [[spec/design_output/model#the-log-is-a-view]]
const (
	rowsName    = "log/rows"
	shadowKind  = "shadow"
	windowSlice = "window"
	modeShadow  = "shadow"
)

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

// The shadow a log tab holds: the source, the mode the config names, and the clock the row's stamp reads. A pair already told stands once in the log. [[spec/design_output/model#the-log-is-a-view]]
type Shadow struct {
	From Source
	Mode func() string
	Now  func() time.Time

	mu   sync.Mutex
	told map[string]bool
}

// The row the tail holds, as the module reads the same line: the level off the ladder, and the stamp as written. [[spec/design_output/model#the-log-is-a-view]]
func oldRow(r Record) Row {
	at := ""
	var fields map[string]any
	if json.Unmarshal([]byte(r.Raw), &fields) == nil {
		at = textOf(fields["at"])
	}
	return Row{At: at, Level: ladder[Rank(r.Level)], Kind: r.Kind, Said: r.Said, Broken: r.Broken}
}

// Every pair the tail and the index read apart, where a tail one side holds alone is the log growing. A shadow row counts on neither side, so none breeds another. [[spec/design_output/model#the-log-is-a-view]]
func Apart(old []Record, rows []Row) []Mismatch {
	var olds []Row
	for _, one := range old {
		if one.Kind != shadowKind {
			olds = append(olds, oldRow(one))
		}
	}
	var news []Row
	for _, one := range rows {
		if one.Kind != shadowKind {
			news = append(news, one)
		}
	}
	var out []Mismatch
	for at := 0; at < min(len(olds), len(news)); at++ {
		if olds[at] != news[at] {
			out = append(out, Mismatch{Old: olds[at], New: news[at]})
		}
	}
	return out
}

// Reads log/rows, and appends one shadow row to the log at path for each pair read apart, where the mode stands at shadow. [[spec/design_output/model#the-log-is-a-view]]
func (s *Shadow) Check(path string, old []Record) error {
	if s == nil || s.Mode == nil || s.Mode() != modeShadow {
		return nil
	}
	said, err := s.From.Read(rowsName)
	if err != nil {
		return err
	}
	var rows []Row
	if err := json.Unmarshal(said, &rows); err != nil {
		return err
	}
	for _, one := range Apart(old, rows) {
		old, now := jsonOf(one.Old), jsonOf(one.New)
		line := fmt.Sprintf("%s in shadow: the row at %s reads %s on the tail, and %s off %s", windowSlice, one.Old.At, old, now, rowsName)
		if s.tell(line) {
			if err := frame.WriteShadow(path, s.Now(), windowSlice, line); err != nil {
				return err
			}
		}
	}
	return nil
}

func jsonOf(one Row) string {
	said, _ := json.Marshal(one)
	return string(said)
}

// Whether the line is new, which it stops being once told. [[spec/design_output/model#the-log-is-a-view]]
func (s *Shadow) tell(line string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.told == nil {
		s.told = map[string]bool{}
	}
	if s.told[line] {
		return false
	}
	s.told[line] = true
	return true
}
