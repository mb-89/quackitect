// Every verb the Bash description names stands registered in Go, off the case
// test/contract/tree.test.js held over lib/bash.js.
// [[spec/tickets/cage-libs-leave]]
package main

import (
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

// [[spec/design_output/bash#the-description-names-verbs]]
func TestEveryVerbTheBashLineNamesStandsRegistered(t *testing.T) {
	t.Parallel()
	verbs := hooks.LineVerbs()
	if len(verbs) == 0 {
		t.Fatal("the Bash line names no verb, and wants the verbs it hands the agent")
	}
	registered := map[string]bool{}
	for words := range registry {
		registered[strings.Fields(words)[0]] = true
	}
	for _, verb := range verbs {
		if !registered[verb] {
			t.Errorf("./RUNME.sh %s stands nowhere in the Go registry", verb)
		}
	}
}
