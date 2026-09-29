// The log view drawn off spec/views/log.base over the rows log/rows answers,
// with no file of the log read.
// [[spec/design_output/model#the-log-is-a-view]]

package log

import (
	"strconv"

	"quackitect/src/tui/tree"
)

// The view drawn off the base file and the rows the index answers, one flat row a line, named by its place. [[spec/design_output/model#the-log-is-a-view]]
func ViewOver(base string, rows []Row) (*tree.Tree, error) {
	views, err := tree.ReadBase(base)
	if err != nil {
		return nil, err
	}
	one := views[0]
	items := make([]tree.Item, 0, len(rows))
	for at, row := range rows {
		items = append(items, tree.Item{
			Name: strconv.Itoa(at + 1),
			Keys: map[string]string{"at": row.At, "level": row.Level, "kind": row.Kind, "said": row.Said},
		})
	}
	out := tree.NewTree(one.Cols, items, one.Nests)
	out.Sorted(one.Sorts)
	out.Flagged(one.Flags)
	out.Presets(one.Presets)
	return out, nil
}
