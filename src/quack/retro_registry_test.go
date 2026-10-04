// Every retro verb registers a Go twin of its own, so ./RUNME.sh retro <verb>
// reaches no node.
// [[spec/tickets/retro-verbs-port-to-go]]
package main

import (
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
)

// Every name RetroVerbs lists answers a registered twin, and none falls to the bare retro's usage. [[spec/tickets/retro-verbs-port-to-go]]
func TestEveryRetroVerbRegisters(t *testing.T) {
	for _, one := range verbsmodule.RetroVerbs {
		key, found := twinOf([]string{"retro", one.Name}, registry)
		if found == nil || key != "retro "+one.Name {
			t.Errorf("retro %s answers the twin %q", one.Name, key)
		}
	}
}
