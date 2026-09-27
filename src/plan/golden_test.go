// The golden file holds one real run of the queue over this tree: the lists
// placesIn in src/scripts/work-answer.js hands the sort, and the places it
// answers. The port replays the lists and answers every place the same.
// test/level0/queue-golden.js writes the file.
// [[spec/tickets/the-queue-moves-to-plan]]
package plan

import (
	"encoding/json"
	"os"
	"testing"
)

const queueGoldenAt = "testdata/queue.golden.json"

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

func TestQueueGolden(t *testing.T) {
	read, err := os.ReadFile(queueGoldenAt)
	if err != nil {
		t.Fatalf("the golden file stands nowhere: run node test/level0/queue-golden.js")
	}
	var golden queueGolden
	if err := json.Unmarshal(read, &golden); err != nil {
		t.Fatal(err)
	}
	persons := Queued(golden.Persons, golden.All, golden.At)
	agents := Queued(golden.Agents, golden.All, golden.At)
	back := Queued(golden.Back, golden.All, golden.At)
	said := Outline(persons, golden.Held, append(agents, back...), golden.All, golden.Places)
	// A row a cloud branch holds takes its place in placesIn, past the outline this package ports. [[spec/design_output/pull#the-queue-is-an-outline]]
	compared := 0
	for name, place := range golden.Answer {
		if place == CloudPlace {
			continue
		}
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
