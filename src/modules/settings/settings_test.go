// Each section registers its keys, each with its help, its JSON type and its
// built-in value, and every name passes the catalog's check.
// [[spec/tickets/the-config-schema-gets-generated]]
package settings

import (
	"testing"

	"quackitect/src/q"
)

func TestEverySectionRegistersItsKeys(t *testing.T) {
	for _, section := range Sections() {
		c := q.New()
		Of(section)(c)
		if faults := c.Check(); len(faults) > 0 {
			t.Errorf("%s: %v", section, faults)
		}
		keys := c.Keys()
		if len(keys) != len(sections[section]) {
			t.Errorf("%s registers %d keys of %d", section, len(keys), len(sections[section]))
		}
		for _, key := range keys {
			if key.Doc == "" || key.Type == "" || key.Default == "" {
				t.Errorf("%s: %s stands without its help, type or built-in: %+v", section, key.Local, key)
			}
		}
	}
}

func TestAKeyTakesTheTypeOfItsBuiltIn(t *testing.T) {
	c := q.New()
	Of("stop")(c)
	want := map[string]string{"enabled": "boolean", "most-in-a-row": "number", "hold": "string"}
	for _, key := range c.Keys() {
		if key.Type != want[key.Local] {
			t.Errorf("%s reads the type %s, and wants %s", key.Local, key.Type, want[key.Local])
		}
	}
}

// The check's budget stands under battery, a fifth over a clean check whose parts start at once. [[spec/tickets/the-check-runs-fast-again]] [[spec/tickets/the-budget-reads-the-span]]
func TestTheCheckBudgetReadsItsBuiltIn(t *testing.T) {
	c := q.New()
	Of("battery")(c)
	for _, key := range c.Keys() {
		if key.Local == "budget" {
			if key.Default != "150000" {
				t.Fatalf("budget reads the built-in %s, and wants 150000", key.Default)
			}
			return
		}
	}
	t.Fatal("battery registers no budget key")
}

// A named built-in reads the same number through the catalog, so the constants block changes no key. [[spec/design_output/config#the-magic-numbers-take-names]]
func TestANamedBuiltInReadsItsNumber(t *testing.T) {
	c := q.New()
	Of("stop")(c)
	for _, key := range c.Keys() {
		if key.Local == "most-in-a-row" && key.Default != "3" {
			t.Fatalf("most-in-a-row reads the built-in %s, and wants 3", key.Default)
		}
	}
}
