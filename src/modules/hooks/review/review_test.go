// The review package answers the table the bridge's own answers fill: the
// reader's prompt, the reading of its answer, and the report.
// [[spec/tickets/review-spawns-off-the-door]]
package review

import (
	"encoding/json"
	"os"
	"testing"
)

// The case table the bridge answers alike. [[spec/tickets/review-spawns-off-the-door]]
const reviewCases = "../../../../test/replay/cage/review-cases.json"

type reviewTable struct {
	Material Material `json:"material"`
	Rules    string   `json:"rules"`
	Asks     string   `json:"asks"`
	Says     []struct {
		Name string `json:"name"`
		Text string `json:"text"`
		Read Read   `json:"read"`
	} `json:"says"`
	Answered []struct {
		Name string `json:"name"`
		E    struct {
			Text    string `json:"text"`
			Deny    string `json:"deny"`
			IsError bool   `json:"isError"`
		} `json:"e"`
		Check  Check  `json:"check"`
		Retro  bool   `json:"retro"`
		Report string `json:"report"`
	} `json:"answered"`
}

func readTable(t *testing.T) reviewTable {
	t.Helper()
	body, err := os.ReadFile(reviewCases)
	if err != nil {
		t.Fatal(err)
	}
	var table reviewTable
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	return table
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheReaderAsksAsTheBridge(t *testing.T) {
	table := readTable(t)
	if said := ReaderAsks(table.Material, table.Rules); said != table.Asks {
		t.Errorf("the reader's prompt reads %q, and the bridge reads %q", said, table.Asks)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheReaderSaysAsTheBridge(t *testing.T) {
	for _, one := range readTable(t).Says {
		if said := ReaderSays(one.Text); said != one.Read {
			t.Errorf("%s: the reading is %+v, and the bridge reads %+v", one.Name, said, one.Read)
		}
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheReportAnswersAsTheBridge(t *testing.T) {
	table := readTable(t)
	for _, one := range table.Answered {
		material := table.Material
		material.Check, material.Retro = one.Check, one.Retro
		if said := Report(material, ReadOf(one.E.Deny, one.E.IsError, one.E.Text)); said != one.Report {
			t.Errorf("%s: the report reads %q, and the bridge reads %q", one.Name, said, one.Report)
		}
	}
}
