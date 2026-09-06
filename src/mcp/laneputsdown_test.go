package main

import "testing"

// A CLAIM CAN BE TAKEN FROM A LANE AND MUST BE PUTTABLE DOWN FROM ONE.
//
// se work takes --put-down. The lane's se_work did not offer it, so an agent
// at a prompt could set work back and an agent in a lane could not. The lane is
// where every cloud agent lives.
//
// MEASURED, IN SEPTEMBER 2026, THREE TIMES. Told to put work down, a session
// reached for se claim --release, which frees the claim and leaves the hold,
// and answers freed. A reviewer that finished and left kept its hold, and the
// next hand was refused with one token has one holder while nobody held it.
func TestTheLaneOffersPutDown(t *testing.T) {
	t.Parallel()
	tool, ok := byName(laneTools())["se_work"]
	if !ok {
		t.Fatal("the lane offers no se_work, so this test asks nothing")
	}
	props := propertiesOf(t, tool)
	if _, has := props["put_down"]; !has {
		names := make([]string, 0, len(props))
		for k := range props {
			names = append(names, k)
		}
		t.Errorf("se_work offers no put_down, so an agent in a lane cannot set work "+
			"back. It offers: %v", names)
	}
}

// AND THE CALL BEHIND THE FIELD CARRIES IT.
//
// A door that offers a field while the call built behind it drops it is the
// half with no output of its own, which is the shape se_claim was in over take.
func TestThePutDownCallNamesTheToken(t *testing.T) {
	t.Parallel()
	argv := putDownArgv(workArgs{PutDown: "wk-1234567890", Actor: "worker-one"})
	if !carries(argv, "--put-down") {
		t.Errorf("the call does not name the verb's flag: %v", argv)
	}
	if !carries(argv, "wk-1234567890") {
		t.Errorf("the call does not say which token: %v", argv)
	}
	if !carries(argv, "worker-one") {
		t.Errorf("the call does not say whose hand it leaves: %v", argv)
	}
}

// propertiesOf reads a tool's advertised fields, and says so rather than
// panicking where the schema is not the shape this test expects.
func propertiesOf(t *testing.T, tool map[string]any) map[string]any {
	t.Helper()
	schema, ok := tool["inputSchema"].(map[string]any)
	if !ok {
		t.Fatalf("the tool advertises no inputSchema: %v", tool)
	}
	props, ok := schema["properties"].(map[string]any)
	if !ok {
		t.Fatalf("the schema advertises no properties: %v", schema)
	}
	return props
}
