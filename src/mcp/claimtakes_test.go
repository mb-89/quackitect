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
	claim, offered := byName(coldDoor(t))["se_claim"]
	if !offered {
		t.Fatal("the cold door offers no se_claim at all")
	}
	cold, _ := claim["inputSchema"].(map[string]any)

	for _, c := range []struct {
		name   string
		schema map[string]any
		fix    string
	}{
		{"the lane builds its schema off the request struct", schemaOf(claimArgs{}), ""},
		{"the cold door is shown before the lane is built", cold,
			" Rewrite it: .bin/se-mcp --tools > util/cage/tools.json"},
	} {
		t.Run(c.name, func(t *testing.T) {
			if !offersTake(t, c.schema) {
				t.Errorf("se_claim does not offer take here, and the refusal an agent reads names it.%s", c.fix)
			}
		})
	}
}

// AND THE CALL THE LANE MAKES CARRIES THE FLAG.
//
// The door offering take buys nothing while the call built behind it drops it,
// which is the half that has no output of its own and would have been missed.
func TestTheLaneCallCarriesTake(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		name  string
		args  claimArgs
		takes bool
		names []string
	}{
		{
			"claiming one token and taking it up",
			claimArgs{Actor: "worker-one", These: []string{"wk-aa"}, Take: true},
			true,
			[]string{"--these", "wk-aa"},
		},

		// AND NOTHING ELSE GAINS IT. A claim that was not asked to take up must
		// not start work the caller did not ask for.
		{
			"a claim that asked for no take-up",
			claimArgs{Actor: "worker-one", These: []string{"wk-aa"}},
			false,
			nil,
		},
		{
			"listing what is claimed",
			claimArgs{Actor: "worker-one", List: true, Take: true},
			false,
			nil,
		},
		{
			"giving work back",
			claimArgs{Actor: "worker-one", These: []string{"wk-aa"}, Release: true, Take: true},
			false,
			nil,
		},
	} {
		t.Run(c.name, func(t *testing.T) {
			argv, refusal := claimArgv(c.args)
			if refusal != "" {
				t.Fatalf("the call was refused: %s", refusal)
			}
			if carries(argv, "--take") != c.takes {
				t.Errorf("the call carries --take against the %v this case asks for: %v", c.takes, argv)
			}
			for _, want := range c.names {
				if !carries(argv, want) {
					t.Errorf("the call does not name %q, so it does not say what to claim: %v", want, argv)
				}
			}
		})
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
