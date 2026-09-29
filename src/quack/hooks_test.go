// The wiring loads the hooks IO module and the folds over session/, and an
// event the door writes lands under session/<id>/ by the names it binds.
// [[spec/tickets/the-hooks-door-lands]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
	"quackitect/src/q"
)

func TestTheWiringBindsTheHooksEventsAndTheSessionFolds(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	if faults := c.Check(); len(faults) > 0 {
		t.Fatal(faults)
	}
	hook := hookedOf(w, hands)
	if !hook.on || hook.bound("events/s1") != "session/s1/events" || hook.bound("config/wait") != "hooks/config/wait" {
		t.Fatalf("the hooks instance binds events/s1 to %q, and wants session/s1/events", hook.bound("events/s1"))
	}
	s := q.NewStore(c)
	if folds := strings.Join(s.Folds("session/<id>/"), " "); folds != "session/<id>/fill session/<id>/last" {
		t.Fatalf("the folds under session/ read %q, and want the fill and the last", folds)
	}
	door := hooks.New(hooks.Outside{Store: s, As: hook.as, Bound: hook.bound})
	if _, err := door.Hook(hooks.Post{Event: "tool.call", E: map[string]any{"tool": "Read", "session_id": "s1"}, Fill: 900}); err != nil {
		t.Fatal(err)
	}
	read := s.Snapshot()
	if event, ok := read.Read("session/s1/events").(q.Event); !ok || event.Seq != 1 {
		t.Fatalf("session/s1/events holds %+v, and wants the first event", read.Read("session/s1/events"))
	}
	if fill := read.Read("session/s1/fill"); fill != 900 {
		t.Fatalf("session/s1/fill reads %v, and wants the 900 the post carries", fill)
	}
}
