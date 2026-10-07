package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os" // level0: OutsideInDoors - the case reads the stop rule file the tree holds, as a build check reads source
	"path/filepath"
	"testing"

	"quackitect/src/modules/hooks/stop"
)

// The tree's own rule file holds a-cloud-box-decides running ends-on-a-question, as the pure stop test assumes. [[spec/design_output/stop#a-cloud-box-decides]]
func TestTheTreeHoldsACloudBoxDecides(t *testing.T) {
	t.Parallel()
	at := filepath.Join("..", "..", stop.Rules, "level0.yml")
	text, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	rules, broken := stop.Pool([]stop.File{{Name: "level0.yml", Text: string(text)}})
	if len(broken) > 0 {
		t.Fatalf("%s reads broken: %v", at, broken)
	}
	for _, one := range rules {
		if one.ID == "a-cloud-box-decides" {
			if one.Runs != "ends-on-a-question" || one.Side != stop.GoSide || !stop.KnowsCheck(one.Runs) {
				t.Fatalf("a-cloud-box-decides reads %+v, want a continue rule running ends-on-a-question", one)
			}
			return
		}
	}
	t.Fatalf("%s holds no rule a-cloud-box-decides", at)
}
