// A place the plan overrides lights the todo letter, as overrides in
// src/scripts/work-answer.js lights it.
// [[spec/tickets/rows-todo-folds-overrides]]
package work

import (
	"testing"

	"quackitect/src/ticket"
)

func TestAPlanOverrideLightsTheTodoLetter(t *testing.T) {
	rows := rowsBy(t, map[string]any{
		TicketsPort:   []ticket.Ticket{{Name: "placed", State: "open"}, {Name: "left", State: "open"}},
		OverridesPort: map[string]string{"placed": "2"},
	})
	if !rows["placed"].Todo || rows["left"].Todo {
		t.Fatalf("the placed ticket reads %+v and the other %+v, and only the placed one lights its todo", rows["placed"], rows["left"])
	}
}
