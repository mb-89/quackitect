// The one road from the rows work/rows answers to the tree the tab draws: the
// base file says the columns, and each row carries its place and its flags.
// [[spec/tickets/the-work-tab-reads-v1]]

package work

import (
	"quackitect/src/tui/draw"
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
	Path     string `json:"path"`
	Route    string `json:"route"`
	Changed  int64  `json:"changed"`
}

// The view drawn off the base file and the rows work/rows answers, with no verb and no ticket file read. A todo no ticket carries stands at the left. [[spec/tickets/the-work-tab-reads-v1]]
func ViewOver(base string, rows []IndexRow) (*tree.Tree, error) {
	views, err := tree.ReadBase(base)
	if err != nil {
		return nil, err
	}
	one := views[0]
	tickets := make([]ticketRow, 0, len(rows))
	todos := []tree.Item{}
	marks := map[string]IndexRow{}
	for _, row := range rows {
		marks[row.Name] = row
		if row.Kind == KindTodo {
			todos = append(todos, todoOf(row))
			continue
		}
		tickets = append(tickets, ticketOf(row))
	}
	out := tree.NewTree(one.Cols, append(itemsOfTickets(tickets), todos...), one.Nests)
	out.Amend(func(item *tree.Item) {
		item.Keys[QueueKey] = marks[item.Name].Queue
		item.Keys[CloudKey] = flagOf(marks[item.Name].Cloud)
	})
	out.Sorted(one.Sorts)
	out.Flagged(one.Flags)
	out.Presets(one.Presets)
	return out, nil
}

// A branch row carries no route, and stands for its group. [[spec/design_output/work#one-reading-answers-git]]
func ticketOf(row IndexRow) ticketRow {
	route := row.Route
	if row.Kind == KindGroup && route == "" {
		route = KindGroup
	}
	standing := ""
	if row.Held {
		standing = heldStanding
	}
	return ticketRow{Name: row.Name, Path: row.Path, State: row.State, Step: row.Step, Route: route, Group: row.Group,
		Urgent: row.Urgent, Todo: row.Todo, Standing: standing, Says: row.Says, Progress: row.Progress, Changed: row.Changed, Person: row.Person}
}

// A sentence todo draws with its place and its text, and no path. [[spec/design_output/stop#the-plan]]
func todoOf(row IndexRow) tree.Item {
	return tree.Item{Name: row.Name, Keys: map[string]string{
		"kind": KindTodo, "state": row.State, QueueKey: row.Queue, TodoKey: flagOf(row.Todo),
		CloudKey: flagOf(false), "urgent": flagOf(false), "says": row.Says,
	}}
}

// A name in the table links to its note under the root, so the details carry no path, and a sentence todo links nowhere. [[spec/design_output/tree-view#a-value-carries-a-link]]
func linked(out *tree.Tree, root string) {
	out.LinkOf = func(item tree.Item) string {
		if item.Keys["kind"] == KindTodo {
			return ""
		}
		return draw.FileAddress(root, pathOf(item))
	}
}
