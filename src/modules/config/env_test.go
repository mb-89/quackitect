// The config module names the variable a key reads, as src/config names it, and
// a key names one variable however its leaf is spelled.
// [[spec/design_output/config#a-variable-names-a-key]]
package config

import (
	"testing"

	"quackitect/src/q"
)

func TestAKeyNamesItsVariableAsSrcConfigDoes(t *testing.T) {
	for key, want := range map[string]string{"names.words": "SE_NAMES_WORDS", "tickets.ask-cap": "SE_TICKETS_ASK_CAP"} {
		if said := EnvOf(key); said != want {
			t.Fatalf("EnvOf(%q) answers %q, not %q", key, said, want)
		}
	}
}

func TestAKeyNamesOneVariableHoweverItsLeafIsSpelled(t *testing.T) {
	for key, want := range map[string]string{
		"stop.mostInARow":    "SE_STOP_MOST_IN_A_ROW",
		"stop.most-in-a-row": "SE_STOP_MOST_IN_A_ROW",
		"plan.everyCalls":    "SE_PLAN_EVERY_CALLS",
		"log.level":          "SE_LOG_LEVEL",
		"names.words":        "SE_NAMES_WORDS",
	} {
		if said := EnvOf(key); said != want {
			t.Errorf("EnvOf(%q) answers %q, and wants %q", key, said, want)
		}
	}
	declared := map[string]q.Key{"stop.mostInARow": KeyOfDotted("stop.mostInARow")}
	rows := Rows(declared, q.Ordered{Object: true}, q.Ordered{Object: true}, map[string]string{"SE_STOP_MOST_IN_A_ROW": "7"})
	if len(rows) != 1 || string(rows[0].Value) != "7" || rows[0].Layer != "SE_STOP_MOST_IN_A_ROW" {
		t.Errorf("SE_STOP_MOST_IN_A_ROW=7 reads %+v, and wants stop.mostInARow at 7 off SE_STOP_MOST_IN_A_ROW", rows)
	}
}
