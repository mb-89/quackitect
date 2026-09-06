package main

import (
	"testing"
)

// THE REFUSAL NAMES ONE CALL, SO THE LANE HAS TO CARRY IT.
//
// An unclaimed tracked token is refused with "Claim it and take it in one call:
// se claim --these <id> --take". That spelling is the shell's. The lane offered
// actor, next, these, as, release, list and whoami, and no take, so an agent on
// the tool lane read a refusal naming a door it could not open and paid two
// calls for what the sentence says is one.
//
// BOTH DOORS ARE HELD AGAINST EACH OTHER. The lane builds its schema from the
// request struct, and util/cage/tools.json is what a cold session is shown
// before the lane is built, so a field in one and not the other is a door that
// changes when the engine warms up.
func TestTheLaneOffersTheTakeTheRefusalNames(t *testing.T) {
	t.Parallel()
	if !offersTake(t, schemaOf(claimArgs{})) {
		t.Error("se_claim does not offer take, and the refusal an agent reads names it")
	}

	claim, offered := byName(coldDoor(t))["se_claim"]
	if !offered {
		t.Fatal("the cold door offers no se_claim at all")
	}
	cold, _ := claim["inputSchema"].(map[string]any)
	if !offersTake(t, cold) {
		t.Error("the cold door does not offer take. Rewrite it: " +
			".bin/se-mcp --tools > util/cage/tools.json")
	}
}

// AND THE CALL THE LANE MAKES CARRIES THE FLAG.
//
// The door offering take buys nothing while the call built behind it drops it,
// which is the half that has no output of its own and would have been missed.
func TestTheLaneCallCarriesTake(t *testing.T) {
	t.Parallel()
	argv, refusal := claimArgv(claimArgs{Actor: "worker-one", These: []string{"wk-aa"}, Take: true})
	if refusal != "" {
		t.Fatalf("claiming one token with take was refused: %s", refusal)
	}
	if !carries(argv, "--take") {
		t.Errorf("the call drops the take the door offers: %v", argv)
	}
	if !carries(argv, "--these") || !carries(argv, "wk-aa") {
		t.Errorf("the call does not name the token to claim: %v", argv)
	}

	// AND NOTHING ELSE GAINS IT. A claim that was not asked to take up must not
	// start work the caller did not ask for.
	plain, _ := claimArgv(claimArgs{Actor: "worker-one", These: []string{"wk-aa"}})
	if carries(plain, "--take") {
		t.Errorf("a claim that asked for no take-up takes one up: %v", plain)
	}
	listed, _ := claimArgv(claimArgs{Actor: "worker-one", List: true, Take: true})
	if carries(listed, "--take") {
		t.Errorf("listing what is claimed takes a token up: %v", listed)
	}
	givenBack, _ := claimArgv(claimArgs{Actor: "worker-one", These: []string{"wk-aa"}, Release: true, Take: true})
	if carries(givenBack, "--take") {
		t.Errorf("giving work back takes it up again: %v", givenBack)
	}
}

// carries says whether the call names this word.
func carries(argv []string, word string) bool {
	for _, a := range argv {
		if a == word {
			return true
		}
	}
	return false
}

// offersTake says whether one tool's schema carries the take argument.
func offersTake(t *testing.T, schema map[string]any) bool {
	t.Helper()
	props, ok := schema["properties"].(map[string]any)
	if !ok {
		t.Fatalf("the schema has no properties to read: %v", schema)
	}
	_, has := props["take"]
	return has
}
