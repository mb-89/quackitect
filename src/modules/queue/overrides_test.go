// The overrides name each place the plan file overrides, and a todo's own
// passes the check its anchor does.
// [[spec/tickets/rows-todo-folds-overrides]]
package queue

import (
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestTheOverridesNameEachPlaceThePlanOverrides(t *testing.T) {
	var hand q.Writer
	index := qtest.New(t, func(c *q.Catalog) { hand = fed(c) })
	index.SeedAs(hand, map[string]any{PlanPort: planText(t, map[string]any{
		"places": map[string]any{"a-ticket": "2", "a-todo": "somewhere"},
		"todos":  []map[string]any{{"title": "a-todo", "todo": true}},
	})})
	said, _ := index.Run(OverridesPort).(map[string]string)
	want := map[string]string{"a-ticket": "2", "a-todo": Last}
	if !reflect.DeepEqual(said, want) {
		t.Fatalf("%s reads %v, and wants %v", OverridesPort, said, want)
	}
}
