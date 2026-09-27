// A port presents itself by its doc, label, icon and look, and the start
// refuses an action or an input field with no description.
// [[spec/design_output/model#the-options]]
package q

import (
	"strings"
	"testing"
)

type pullIn struct {
	Ticket string `json:"ticket" label:"Ticket" doc:"the ticket to pull, or the next one when empty"`
	Note   string `json:"note" label:"Note"`
}

func TestAPortCarriesItsLabelIconAndLook(t *testing.T) {
	c := New()
	GivenIn(c, "queue/count", 0, Doc("the tickets waiting"), Label("Queue"), Icon("inbox"), Looks(Count))
	got, ok := c.Presentation("queue/count")
	if !ok || got.Doc != "the tickets waiting" || got.Label != "Queue" || got.Icon != "inbox" || got.Looks != Count {
		t.Fatalf("queue/count presents %+v, %v", got, ok)
	}
}

func TestTheStartRefusesAnActionWithNoDocNamingItsFileAndLine(t *testing.T) {
	types := map[string]func(*Catalog){"puller": func(c *Catalog) {
		ActionIn(c, "pull", func(string) []Request { return nil })
	}}
	refused(t, Wiring{Instances: []Instance{{"work", "puller"}}}, types, string(NoDoc), "pull", "looks_test.go:")
}

func TestAnInputFieldCarriesItsLabelAndDoc(t *testing.T) {
	c := New()
	ActionIn(c, "pull", func(pullIn) []Request { return nil }, Doc("pulls a ticket"))
	got, _ := c.Presentation("pull")
	if len(got.Fields) != 2 || got.Fields[0] != (Field{Name: "Ticket", Key: "ticket", Label: "Ticket", Doc: "the ticket to pull, or the next one when empty"}) {
		t.Fatalf("pull presents the fields %+v", got.Fields)
	}
}

type pulled struct {
	Ticket string `json:"ticket" label:"Ticket" doc:"the ticket the pull hands out"`
	Leaf   string `json:"leaf" label:"Leaf"`
}

func TestAnActionOutputCarriesItsLabelAndDoc(t *testing.T) {
	c := New()
	ActionIn(c, "pull", func(pullIn) []Request { return nil }, Doc("pulls a ticket"), Answers[pulled]())
	got, _ := c.Presentation("pull")
	if len(got.Out) != 2 || got.Out[0] != (Field{Name: "Ticket", Key: "ticket", Label: "Ticket", Doc: "the ticket the pull hands out"}) {
		t.Fatalf("pull presents the output %+v", got.Out)
	}
}

func TestTheStartRefusesAnOutputFieldWithNoDocTag(t *testing.T) {
	types := map[string]func(*Catalog){"puller": func(c *Catalog) {
		ActionIn(c, "pull", func(string) []Request { return nil }, Doc("pulls a ticket"), Answers[pulled]())
	}}
	refused(t, Wiring{Instances: []Instance{{"work", "puller"}}}, types, "output field Leaf")
}

func TestTheStartRefusesAnInputFieldWithNoDocTag(t *testing.T) {
	types := map[string]func(*Catalog){"puller": func(c *Catalog) {
		ActionIn(c, "pull", func(pullIn) []Request { return nil }, Doc("pulls a ticket"))
	}}
	_, err := Start(Wiring{Instances: []Instance{{"work", "puller"}}}, types)
	if err == nil || !strings.Contains(err.Error(), "field Note") {
		t.Fatalf("the refusal names no field Note: %v", err)
	}
	if strings.Contains(err.Error(), "field Ticket") {
		t.Fatalf("the refusal names field Ticket, which carries its doc: %v", err)
	}
}
