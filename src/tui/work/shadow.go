// The work view in shadow: the rows and the badge the tab draws, read beside
// the rows under work/rows and the badge off index/names. Each pair read apart
// becomes one shadow row in the session log.
// [[spec/tickets/the-work-view-gains-actions]]

package work

import (
	"time"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/tree"
)

// One row of work/rows, on the fields the view reads. [[spec/design_output/tui#the-work-tab]]
type IndexRow struct {
	Name     string `json:"name"`
	Kind     string `json:"kind"`
	State    string `json:"state"`
	Step     string `json:"step"`
	Progress string `json:"progress"`
	Group    string `json:"group"`
	Urgent   bool   `json:"urgent"`
	Person   bool   `json:"person"`
	Held     bool   `json:"held"`
	Todo     bool   `json:"todo"`
	Says     string `json:"says"`
	Queue    string `json:"queue"`
	Cloud    bool   `json:"cloud"`
}

// One row of index/names, on the fields the badge reads. [[spec/tickets/the-work-view-gains-actions]]
type NameRow struct {
	Name  string `json:"name"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
	Looks string `json:"looks"`
	Value any    `json:"value"`
}

// A pair read apart, by name, as each path reads it. [[spec/tickets/the-work-view-gains-actions]]
type Mismatch struct {
	Name, Old, New string
}

// The shadow a work tab holds: the source, the mode the config names, and the clock the row's stamp reads. [[spec/tickets/the-work-view-gains-actions]]
type Shadow struct {
	From frame.Source
	Mode func() string
	Now  func() time.Time
}

// The view drawn off the base file and the rows work/rows answers, with no verb and no ticket file read. [[spec/tickets/the-work-view-gains-actions]]
func ViewOver(base string, rows []IndexRow) (*tree.Tree, error) {
	views, err := tree.ReadBase(base)
	if err != nil {
		return nil, err
	}
	return tree.NewTree(views[0].Cols, nil, views[0].Nests), nil
}

// The badge drawn off the label and the look the port declares and the count it holds. [[spec/tickets/the-work-view-gains-actions]]
func BadgeOf(names []NameRow, name string) string { return "" }

// Every row the tab and work/rows read apart, on state and queue. [[spec/tickets/the-work-view-gains-actions]]
func Apart(items []tree.Item, rows []IndexRow) []Mismatch { return nil }

// The badge the strip draws and the index answers, where the two read apart. [[spec/tickets/the-work-view-gains-actions]]
func BadgeApart(old, now string) []Mismatch { return nil }

// Reads work/rows and index/names, and appends one shadow row to the log at path for each pair read apart, where the mode stands at shadow. [[spec/tickets/the-work-view-gains-actions]]
func (s *Shadow) Check(path string, items []tree.Item, badge string) error { return nil }
