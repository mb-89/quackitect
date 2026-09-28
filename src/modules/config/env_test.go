// The config module names the variable a key reads, as src/config names it.
// [[spec/design_output/config#the-go-reader]]
package config

import "testing"

func TestAKeyNamesItsVariableAsSrcConfigDoes(t *testing.T) {
	for key, want := range map[string]string{"names.words": "SE_NAMES_WORDS", "tickets.ask-cap": "SE_TICKETS_ASK_CAP"} {
		if said := EnvOf(key); said != want {
			t.Fatalf("EnvOf(%q) answers %q, not %q", key, said, want)
		}
	}
}
