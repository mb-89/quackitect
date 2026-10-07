// The reads the route, fill and update verbs share, each case off
// test/level0/ticket-route.test.js, ticket-drift.test.js and ticket-verb.test.js.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
package pull

import (
	_ "embed"
	"encoding/json"
	"reflect"
	"testing"

	"quackitect/src/yaml"
)

// The value YAML text reads as, which a case writes its fronts and routes in. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func yamlOf(text string) *yaml.Doc { return yaml.AsDoc(yaml.Read(text)) }

const routeTwo = `steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach
      - name: review
        does: reads the approach
  - name: do
    does: makes the change
`

func TestRouteAheadOnly(t *testing.T) {
	t.Parallel()
	front := yamlOf("step: design/review\nrecord:\n  - step: design/draft\n" + routeTwo)
	if why, at := RouteAheadOnly(front, yaml.AsList(front.Get("steps"))); why != "" || at != "" {
		t.Errorf("a route standing as it stood is refused: %s at %s", why, at)
	}
	changed := yamlOf(routeTwo + "  - name: sign\n")
	if why, _ := RouteAheadOnly(front, yaml.AsList(changed.Get("steps"))); why != "" {
		t.Errorf("a step past the pointer is refused: %s", why)
	}
	dropped := yamlOf("steps:\n  - name: do\n")
	if _, at := RouteAheadOnly(front, yaml.AsList(dropped.Get("steps"))); at != "design/review" {
		t.Errorf("a route without the pointer's leaf names %q", at)
	}
}

func TestRouteDrift(t *testing.T) {
	t.Parallel()
	t.Run("an added, a dropped and a changed step, and the reached skipped", func(t *testing.T) {
		front := yamlOf("step: do\nsteps:\n  - name: do\n    does: edited, and reached\n  - name: check\n    does: changed\n  - name: sign\n    does: added\n")
		base := yaml.AsList(yamlOf("steps:\n  - name: do\n    does: makes the change\n  - name: check\n    does: checks it\n  - name: land\n    does: dropped\n").Get("steps"))
		if got := RouteDrift(front, base); !reflect.DeepEqual(got, []string{"check", "sign", "land"}) {
			t.Errorf("the drift names %v", got)
		}
	})
	t.Run("a step moved past the reached leaves", func(t *testing.T) {
		front := yamlOf("step: do\nsteps:\n  - name: do\n    does: makes the change\n  - name: land\n    does: lands it\n  - name: check\n    does: checks it\n")
		base := yaml.AsList(yamlOf("steps:\n  - name: do\n    does: makes the change\n  - name: check\n    does: checks it\n  - name: land\n    does: lands it\n").Get("steps"))
		if got := RouteDrift(front, base); !reflect.DeepEqual(got, []string{"land"}) {
			t.Errorf("the drift names %v", got)
		}
	})
}

func TestDriftBase(t *testing.T) {
	t.Parallel()
	older, newer := "steps:\n  - name: do\n", "steps:\n  - name: do\n  - name: check\n"
	shows := map[string]string{"bbb": newer, "aaa": older}
	show := func(sha string) string { return shows[sha] }
	log := func() (string, bool) { return "bbb\naaa\n", true }
	base, ok := DriftBase(log, show, ProcessHash(yamlOf(older)))
	if !ok || len(base) != 1 {
		t.Errorf("the base the older hash names reads %v, %v", base, ok)
	}
	if _, ok := DriftBase(log, show, "nothing"); ok {
		t.Error("a hash no version answers reads a base")
	}
	if _, ok := DriftBase(func() (string, bool) { return "", false }, show, ProcessHash(yamlOf(older))); ok {
		t.Error("a history git refuses reads a base")
	}
}

func TestUpdatedRoute(t *testing.T) {
	t.Parallel()
	t.Run("the new leaf lands where the ticket has yet to reach it", func(t *testing.T) {
		front := yamlOf("step: one\nsteps:\n  - name: one\n    does: the old first\n  - name: two\n    does: the old second\n")
		route := yaml.AsList(yamlOf("steps:\n  - name: one\n    does: the new first\n  - name: two\n    does: the new second\n").Get("steps"))
		steps, kept, why := UpdatedRouteKept(front, route)
		if why != "" || kept != 1 || yaml.AsString(yaml.AsDoc(steps[0]).Get("does")) != "the old first" || yaml.AsString(yaml.AsDoc(steps[1]).Get("does")) != "the new second" {
			t.Errorf("the update answers %v, %d, %q", steps, kept, why)
		}
	})
	t.Run("a leaf the record holds keeps what it holds", func(t *testing.T) {
		front := yamlOf("step: two\nrecord:\n  - step: one\nsteps:\n  - name: one\n    does: the old first\n  - name: two\n    does: the old second\n  - name: three\n    does: the old third\n")
		route := yaml.AsList(yamlOf("steps:\n  - name: one\n    does: the new first\n  - name: two\n    does: the new second\n  - name: three\n    does: the new third\n").Get("steps"))
		steps, _ := UpdatedRoute(front, route)
		for i, want := range []string{"the old first", "the old second", "the new third"} {
			if got := yaml.AsString(yaml.AsDoc(steps[i]).Get("does")); got != want {
				t.Errorf("leaf %d does %q, and wants %q", i, got, want)
			}
		}
	})
	t.Run("a pointer the new route lacks is refused", func(t *testing.T) {
		front := yamlOf("step: decide\nsteps:\n  - name: decide\n")
		if _, why := UpdatedRoute(front, yaml.AsList(yamlOf(routeTwo).Get("steps"))); why == "" {
			t.Error("a pointer the route lacks passes")
		}
	})
}

func TestRouteOf(t *testing.T) {
	t.Parallel()
	for _, said := range []string{"", "not json", `{"name":"do"}`, "[] and more"} {
		if _, ok := RouteOf(said); ok {
			t.Errorf("%q reads as a route", said)
		}
	}
	said := `[{"does":"b","name":"a","does":"c","n":3,"f":1.5,"x":null,"l":[true,"<&>"]}]`
	route, ok := RouteOf(said)
	if !ok {
		t.Fatalf("%s reads as no route", said)
	}
	want := `[{"does":"c","name":"a","n":3,"f":1.5,"x":null,"l":[true,"<&>"]}]`
	if got := RouteJSON(route); got != want {
		t.Errorf("the route writes back as\n%s\nand JSON.stringify writes\n%s", got, want)
	}
}

// The front the drawing edits, and the route each move and drop answers. test/level0/drawing-edit.test.js holds edit.js to the same routes. [[spec/tickets/ticket-scripts-leave]]
//
//go:embed testdata/drawing_edits.json
var drawingEdits []byte

func TestEveryRouteTheDrawingsEditsAnswerKeepsTheReachedLeaves(t *testing.T) {
	t.Parallel()
	var held struct {
		Step  string          `json:"step"`
		Steps json.RawMessage `json:"steps"`
		Edits []struct {
			Name  string          `json:"name"`
			Steps json.RawMessage `json:"steps"`
		} `json:"edits"`
	}
	if err := json.Unmarshal(drawingEdits, &held); err != nil || len(held.Edits) == 0 {
		t.Fatalf("testdata/drawing_edits.json reads %v, and wants a front and its edits", err)
	}
	steps, ok := RouteOf(string(held.Steps))
	if !ok {
		t.Fatal("the fixture's steps read as no route")
	}
	front := yaml.New()
	front.Set("step", held.Step)
	front.Set("steps", steps)
	for _, one := range held.Edits {
		route, ok := RouteOf(string(one.Steps))
		if !ok {
			t.Errorf("%s reads as no route", one.Name)
			continue
		}
		if why, at := RouteAheadOnly(front, route); why != "" || at != "" {
			t.Errorf("%s is refused at %s: %s", one.Name, at, why)
		}
	}
}
