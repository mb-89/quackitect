// A plan writes the file the bridge writes, places each new todo off the
// queue, keeps a handover todo out, and answers the place each todo takes.
// Each case runs over a fake file, a fixed clock and fake places.
// [[spec/tickets/plan-writes-off-go]]
package plans

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The clock every case stands at. [[spec/tickets/plan-writes-off-go]]
var planned = time.Date(2026, 10, 1, 2, 0, 0, 0, time.UTC)

// A plan file in memory, and the places the case hands each plan text. [[spec/tickets/plan-writes-off-go]]
type fakePlan struct {
	text   string
	places func(text string) map[string]string
}

func (one *fakePlan) outside(most int) Outside {
	return Outside{
		Read:  func() (string, error) { return one.text, nil },
		Write: func(text string) error { one.text = text; return nil },
		Now:   func() time.Time { return planned },
		Most:  most,
		Places: func(text string) map[string]string {
			if one.places == nil {
				return map[string]string{}
			}
			return one.places(text)
		},
	}
}

func (one *fakePlan) plans(t *testing.T, most int, in tool.Plan) string {
	t.Helper()
	said, err := Accept(one.outside(most))(q.Request{Module: Module, Verb: "set", Args: in})
	if err != nil {
		t.Fatal(err)
	}
	return fmt.Sprint(said)
}

// [[spec/tickets/plan-writes-off-go]]
func TestAPlanWritesTheFileTheBridgeWrites(t *testing.T) {
	file := &fakePlan{
		text:   `{"extra":1,"working":"","todos":[{"title":"old","details":"","todo":"true","made":"x"}],"places":{"a":"2"}}`,
		places: func(string) map[string]string { return map[string]string{"Übung <one>": "2"} },
	}
	said := file.plans(t, 0, tool.Plan{Working: "new-ticket", Done: []string{"old"}, Add: []tool.PlanTodo{{Title: " Übung <one> ", Details: " d "}}})
	want := `{
  "working": "new-ticket",
  "todos": [
    {
      "title": "Übung <one>",
      "details": "d",
      "todo": "true",
      "made": "2026-10-01T02:00:00.000Z"
    }
  ],
  "places": {
    "a": "2"
  },
  "extra": 1
}
`
	if file.text != want {
		t.Errorf("the plan writes %q, and wants the bridge's file: %q", file.text, want)
	}
	if want := "The plan stands: 1 todo(s) open, working on new-ticket. Übung <one> stands at 2."; said != want {
		t.Errorf("the plan answers %q, and wants %q", said, want)
	}
}

// [[spec/tickets/plan-writes-off-go]]
func TestATodoAtADigitAnchorsBeforeTheRowAtThatPlace(t *testing.T) {
	file := &fakePlan{places: func(string) map[string]string {
		return map[string]string{"b": "2", "a": "1", "c": "3", "nested": "1.2", "cloudy": "∞"}
	}}
	file.plans(t, 0, tool.Plan{Add: []tool.PlanTodo{{Title: "first", Place: 1}, {Title: "second", Place: 2}, {Title: "past", Place: 4}, {Title: "far", Place: 10}}})
	for title, todo := range map[string]string{"first": "true", "second": "b", "past": "end", "far": "end"} {
		if !strings.Contains(file.text, `"title": "`+title+`",
      "details": "",
      "todo": "`+todo+`"`) {
			t.Errorf("the todo %s stands at another place than %s: %s", title, todo, file.text)
		}
	}
}

// [[spec/tickets/plan-writes-off-go]]
func TestTodosPastTheMostOpenStayOut(t *testing.T) {
	file := &fakePlan{text: `{"working":"","todos":[{"title":"held","details":"","todo":"true","made":""}],"places":{}}`}
	said := file.plans(t, 1, tool.Plan{Add: []tool.PlanTodo{{Title: "p"}, {Title: "r"}}})
	if want := "The plan stands: 1 todo(s) open, working on nothing named. 2 todo(s) stay out, because 1 stand open already: p, r. Finish one, or write a ticket."; said != want {
		t.Errorf("the plan answers %q, and wants %q", said, want)
	}
}

// [[spec/tickets/plan-writes-off-go]]
func TestAHandoverTodoStaysOut(t *testing.T) {
	file := &fakePlan{text: `{"working":"the handover","todos":[{"title":"read the Handover","details":"","todo":"true","made":""}],"places":{}}`}
	said := file.plans(t, 0, tool.Plan{Working: "write the handover", Add: []tool.PlanTodo{{Title: "a handover line"}}})
	if want := "The plan stands: 0 todo(s) open, working on nothing named. a handover line stays out, because the clear's tickets carry the handover and the work tab draws them."; said != want {
		t.Errorf("the plan answers %q, and wants %q", said, want)
	}
	if strings.Contains(file.text, "andover") {
		t.Errorf("the plan writes %s, and wants every handover todo and the handover work out", file.text)
	}
}

// [[spec/tickets/plan-writes-off-go]]
func TestTheAnswerNamesEachNewTodosPlace(t *testing.T) {
	var read []string
	file := &fakePlan{places: func(text string) map[string]string {
		read = append(read, text)
		return map[string]string{"t1": "1.1"}
	}}
	said := file.plans(t, 0, tool.Plan{Working: "w", Add: []tool.PlanTodo{{Title: "t1"}, {Title: "t2"}}})
	if want := "The plan stands: 2 todo(s) open, working on w. t1 stands at 1.1. t2 stands at no place."; said != want {
		t.Errorf("the plan answers %q, and wants %q", said, want)
	}
	if len(read) == 0 || read[len(read)-1] != file.text {
		t.Errorf("the places read %d plan texts, and want the last to be the plan as written", len(read))
	}
}

// The module writes the plan file, so its source calls q.IO(). [[spec/design_output/model#io-modules-are-modules]]
func TestTheModuleRegistersThePlanTool(t *testing.T) {
	c := q.New()
	Registers(c)
	if looks, ok := c.Presentation(Module + "/set"); !ok || looks.Tool != tool.PlanTool {
		t.Errorf("the module registers %+v, and wants plans/set under the tool name plan", looks)
	}
}
