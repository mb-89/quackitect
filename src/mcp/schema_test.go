package main

import (
	"reflect"
	"sort"
	"testing"
)

// WHAT THE DOOR ADVERTISES IS WHAT THE HAND BEHIND IT READS.
//
// The schema was a nested literal and the handler read the arguments back out
// of a map[string]any by string key. Two hand-written lists of the same names
// with nothing joining them, so a name in one and not the other was silent, and
// it was: se_work's schema grew tracked, the engine began refusing a standard
// mint without it, and a stub built before the field advertised a schema with
// no tracked. The harness dropped the argument as unknown and every standard
// mint through the door was refused for a field the caller could not send.
//
// SO THE TWO HALVES ARE NAMED AND DRIVEN THROUGH EACH OTHER. The lane's table
// says which request each tool takes. The table below says which handler takes
// it, written out with the function's real type, which the compiler checks at
// this line. This holds the two against each other, so a handler still reading
// a map, or one taking a different request from the one advertised, is named
// here rather than found by an agent that cannot mint.
func TestToolSchemasComeFromTheirStructs(t *testing.T) {
	t.Parallel()

	// THE HANDLERS, BY THE TYPE THEY DECLARE. Each entry is the real function,
	// so its parameter type is the one the compiler gave it and not a name
	// typed again here.
	handlers := map[string]any{
		"se_start":  startTheEngine,
		"se_test":   testTheDelta,
		"se_claim":  claimWork,
		"se_find":   findInTree,
		"se_ask":    askIndex,
		"se_apply":  applyEdits,
		"se_run":    runCommand,
		"se_work":   mintWork,
		"se_stop":   stopClaim,
		"se_pull":   pull,
		"se_status": showStatus,
		"se_answer": recordAnswer,
		"se_said":   recordSaid,
	}

	// AND THE DOOR OFFERS NOTHING THIS TABLE HAS NOT SEEN.
	//
	// The walk below reads the lane, so a tool appended to tools() after
	// laneTools() was advertised to every agent and walked by nobody. Three
	// were: se_status kept the one literal schema this file exists to end, and
	// se_answer and se_said named a struct with nothing holding it against the
	// handler. tools() is what an agent is shown, so tools() is what is counted.
	if len(tools()) != len(theLane) {
		t.Fatalf("the door offers %d tools off a lane of %d, so the difference is "+
			"declared outside the table this test walks", len(tools()), len(theLane))
	}

	advertised := laneTools()
	if len(advertised) == 0 {
		t.Fatal("the lane advertises no tools, so this guards nothing")
	}
	if len(advertised) != len(theLane) {
		t.Fatalf("the lane advertises %d tools off a table of %d", len(advertised), len(theLane))
	}

	for i, tool := range advertised {
		name, _ := tool["name"].(string)
		t.Run(name, func(t *testing.T) {
			takes := reflect.TypeOf(theLane[i].takes)
			if takes == nil || takes.Kind() != reflect.Struct {
				t.Fatalf("%s names no request struct, so its schema is written beside it "+
					"rather than read off what the handler decodes: %v", name, takes)
			}

			// THE HANDLER TAKES THE SAME REQUEST, and it takes a struct.
			f, ok := handlers[name]
			if !ok {
				t.Fatalf("%s is advertised and this test knows no handler for it, so nothing "+
					"holds its schema against what reads the arguments", name)
			}
			sig := reflect.TypeOf(f)
			if sig.Kind() != reflect.Func || sig.NumIn() != 2 {
				t.Fatalf("the handler for %s is not a call of two arguments: %v", name, sig)
			}
			reads := sig.In(1)
			if reads.Kind() == reflect.Map {
				t.Fatalf("the handler for %s still reads its arguments out of %v by string key, "+
					"so the schema above it is a second list nothing checks", name, reads)
			}
			if reads != takes {
				t.Fatalf("%s advertises %v and its handler reads %v, so an agent is invited to "+
					"send fields nothing decodes", name, takes, reads)
			}

			// AND THE ADVERTISED PROPERTIES ARE THAT STRUCT'S FIELDS, EXACTLY.
			//
			// AN EMPTY PROPERTIES OBJECT IS NOT A MISSING ONE. A tool that takes
			// nothing has a request with no fields, and schema.go reads an empty
			// object off it: that is the right answer, and se_status is it. A
			// schema carrying no properties object at all is the other thing, a
			// schema that was never read off a request, and it still fails here.
			schema, _ := tool["inputSchema"].(map[string]any)
			props, has := schema["properties"].(map[string]any)
			if !has {
				t.Fatalf("%s advertises no properties object, so its schema was not read "+
					"off the request it takes: %v", name, schema)
			}
			if len(props) == 0 && reads.NumField() > 0 {
				t.Fatalf("%s decodes %d fields and advertises none: %v", name, reads.NumField(), schema)
			}
			for prop, says := range props {
				one, ok := says.(map[string]any)
				if !ok || one["type"] == nil {
					t.Errorf("%s advertises %q with no type, so its Go kind is one schema.go "+
						"does not know: %v", name, prop, says)
				}
			}
			if diff := onlyIn(fieldNames(reads), keys(props)); len(diff) > 0 {
				t.Errorf("%s decodes %v and does not advertise it, so no caller knows to send it",
					name, diff)
			}
			if diff := onlyIn(keys(props), fieldNames(reads)); len(diff) > 0 {
				t.Errorf("%s advertises %v and nothing decodes it, so a caller that sends it is "+
					"answered as though it had not", name, diff)
			}
		})
	}

	// AND THE COMPARISON CAN SEE A DIFFERENCE.
	//
	// A guard nobody has watched catch anything is a guard nobody has tested,
	// and the two sets above are read off one type by construction, so the
	// comparison itself is driven over the drift it exists to catch: a schema
	// with a field the request has not got, which is the shape se_work was in.
	t.Run("the comparison sees a field in one and not the other", func(t *testing.T) {
		type before struct {
			Title string `json:"title"`
		}
		type after struct {
			Title   string `json:"title"`
			Tracked *bool  `json:"tracked"`
		}
		stale, _ := schemaOf(before{})["properties"].(map[string]any)
		got := onlyIn(fieldNames(reflect.TypeOf(after{})), keys(stale))
		if len(got) != 1 || got[0] != "tracked" {
			t.Fatalf("a request carrying tracked against a schema without it was read as %v, "+
				"so this test cannot catch the drift it exists for", got)
		}
	})
}

// fieldNames is the json names one struct carries.
func fieldNames(t reflect.Type) []string {
	var out []string
	for i := 0; i < t.NumField(); i++ {
		if name, ok := jsonName(t.Field(i)); ok {
			out = append(out, name)
		}
	}
	sort.Strings(out)
	return out
}

func keys(m map[string]any) []string {
	var out []string
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// onlyIn is what the first list has and the second has not.
func onlyIn(these, those []string) []string {
	have := map[string]bool{}
	for _, s := range those {
		have[s] = true
	}
	var out []string
	for _, s := range these {
		if !have[s] {
			out = append(out, s)
		}
	}
	return out
}
