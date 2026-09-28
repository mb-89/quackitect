// The golden file holds one real run of the queue over this tree: the lists
// placesIn in src/scripts/work-answer.js hands the sort, and the places it
// answers. The case seeds the rows the lists hold through the fake index, and
// reads every place the module answers against the file.
// test/level0/queue-golden.js writes the file.
// [[spec/tickets/the-queue-becomes-a-module]]
package queue

import (
	_ "embed"
	"encoding/json"
	"strconv"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

//go:embed testdata/queue.golden.json
var goldenFile []byte

type queueGolden struct {
	Persons []Row             `json:"persons"`
	Held    []Row             `json:"held"`
	Agents  []Row             `json:"agents"`
	Back    []Row             `json:"back"`
	All     []Row             `json:"all"`
	Places  map[string]string `json:"places"`
	At      At                `json:"at"`
	Answer  map[string]string `json:"answer"`
}

// The ports a case feeds, as the wiring binds them. [[spec/design_output/model#the-fake-index]]
func fed(c *q.Catalog) q.Writer {
	hand := q.Join(
		q.OutIn(c, RowsPort, []ticket.Ticket{}, q.Doc("the tickets, as the case seeds them")),
		q.OutIn(c, PlanPort, q.Content{}, q.Doc("the plan file, as the case seeds it")),
		q.OutIn(c, CloudPort, []string{}, q.Doc("the tickets the cloud holds, as the case seeds them")),
		q.OutIn(c, StoodPort, map[string]int64{}, q.Doc("the second each path came in, as the case seeds it")),
		q.OutIn(c, MinutePort, int64(0), q.Doc("the minute, as the case seeds it")),
		q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values, as the case seeds them")),
	)
	Places(c)
	return hand
}

// The places the module answers over what the case seeds. [[spec/design_output/model#the-fake-index]]
func placesOver(t *testing.T, seeds map[string]any) map[string]string {
	t.Helper()
	var hand q.Writer
	index := qtest.New(t, func(c *q.Catalog) { hand = fed(c) })
	index.SeedAs(hand, seeds)
	said, _ := index.Run(PlacesPort).(map[string]string)
	return said
}

// The plan file a case seeds. [[spec/design_output/stop#the-plan]]
func planText(t *testing.T, plan map[string]any) q.Content {
	t.Helper()
	text, err := json.Marshal(plan)
	if err != nil {
		t.Fatal(err)
	}
	return q.Content{Hash: "plan", Text: string(text)}
}

// The golden rows as the tickets and the plan they came off: a list names a row open, and a row in none stands closed. [[spec/tickets/the-queue-becomes-a-module]]
func seedsOf(t *testing.T, golden queueGolden) map[string]any {
	t.Helper()
	open := map[string]bool{}
	for _, list := range [][]Row{golden.Persons, golden.Held, golden.Agents, golden.Back} {
		for _, one := range list {
			open[one.Name] = true
		}
	}
	person, held, cloud := listedIn(golden.Persons), listedIn(golden.Held), []string{}
	for name, place := range golden.Answer {
		if place == CloudPlace {
			open[name] = true
			cloud = append(cloud, name)
		}
	}
	rows, todos := []ticket.Ticket{}, []map[string]any{}
	for _, one := range golden.All {
		if one.Path == "" {
			todos = append(todos, map[string]any{"title": one.Name, "todo": one.Todo})
			continue
		}
		state := "closed"
		if open[one.Name] {
			state = "open"
		}
		rows = append(rows, ticket.Ticket{
			Name: one.Name, Path: one.Path, State: state, Group: one.Group, Urgent: one.Urgent,
			Todo: one.Todo != "", TodoAt: one.Todo, DependsOn: one.DependsOn, Fails: one.Fails,
			Person: person[one.Name], Held: held[one.Name],
		})
	}
	values := q.Resolved{}
	for key, value := range map[string]string{"weight/block": blockWeight, "weight/day": dayWeight, "weight/fail": failWeight} {
		values["config/"+key] = strconv.FormatFloat(golden.At.Weights[value], 'f', -1, floatBits)
	}
	return map[string]any{
		RowsPort:     rows,
		PlanPort:     planText(t, map[string]any{"places": golden.Places, "todos": todos}),
		CloudPort:    cloud,
		StoodPort:    golden.At.Stood,
		MinutePort:   golden.At.Now / msAMinute,
		q.ResolvedName: values,
	}
}

func listedIn(list []Row) map[string]bool {
	out := map[string]bool{}
	for _, one := range list {
		out[one.Name] = true
	}
	return out
}

func TestQueueGolden(t *testing.T) {
	var golden queueGolden
	if err := json.Unmarshal(goldenFile, &golden); err != nil {
		t.Fatal(err)
	}
	said := placesOver(t, seedsOf(t, golden))
	compared := 0
	for name, place := range golden.Answer {
		compared++
		if said[name] != place {
			t.Errorf("%s stands at %q, and the golden file says %q", name, said[name], place)
		}
	}
	for name, place := range said {
		if _, stands := golden.Answer[name]; !stands {
			t.Errorf("%s stands at %q, and the golden file names no place for it", name, place)
		}
	}
	if compared == 0 {
		t.Fatalf("the golden file names no place: run node test/level0/queue-golden.js")
	}
}
