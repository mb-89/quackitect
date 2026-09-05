package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"testing"

	"github.com/google/go-cmp/cmp"
)

// THE COLD DOOR IS THE LANE, TOOL FOR TOOL.
//
// util/cage/mcp-lane.mjs answers tools/list off util/cage/tools.json before this
// program is built, so that file is the door a cold session is shown. It is
// generated from the lane, and generated is another word for drifts: changing
// the lane and rewriting the file are two acts, and only the first is compiled.
//
// IT HAS DRIFTED FIELD BY FIELD, AND EACH ONE COST A PERSON. se_work grew
// tracked and the file did not, so every standard mint through the door was
// refused for a field the caller could not send. se_claim grew take, and the
// refusal an agent reads named a door it could not open. se_work grew
// needs_human, and an agent flagging a note it cannot decide sent a field the
// harness dropped as unknown. Each was answered with a test about that one
// field, which is a guard that arrives after the damage every time.
//
// SO THIS ONE IS ABOUT NO FIELD. It holds the whole file against the whole
// lane, so the next thing added to the lane is caught by the test already here.
func TestTheColdDoorIsTheLane(t *testing.T) {
	t.Parallel()
	cold := byName(coldDoor(t))
	warm := byName(asJSON(t, tools()))
	if len(warm) == 0 {
		t.Fatal("the lane builds no tools, so this guards nothing")
	}

	for name, want := range warm {
		got, offered := cold[name]
		if !offered {
			t.Errorf("the cold door offers no %s at all. Rewrite it: "+
				".bin/se-mcp --tools > util/cage/tools.json", name)
			continue
		}
		if cmp.Diff(want, got) == "" {
			continue
		}
		t.Errorf("the cold door and the lane differ on %s: %s. Rewrite it: "+
			".bin/se-mcp --tools > util/cage/tools.json", name, howTheyDiffer(want, got))
	}
	for name := range cold {
		if _, built := warm[name]; !built {
			t.Errorf("the cold door offers %s and the lane builds no such tool, so a cold "+
				"session is shown a door that closes when the engine warms up. Rewrite it: "+
				".bin/se-mcp --tools > util/cage/tools.json", name)
		}
	}

	// AND THE COMPARISON CAN SEE A DIFFERENCE.
	//
	// The two sides above are equal when nothing is wrong, so on a good tree this
	// test passes whether or not it looks at anything. It is driven here over the
	// drift it exists for: one tool's schema with a field the other has not got,
	// which is the shape se_work was in twice.
	t.Run("the comparison sees a missing field", func(t *testing.T) {
		lane := asJSON(t, tools())
		stale := asJSON(t, tools())
		dropField(t, stale, "se_work", "needs_human")
		if cmp.Diff(byName(lane)["se_work"], byName(stale)["se_work"]) == "" {
			t.Fatal("a schema with a field taken out of it reads the same as one with it, " +
				"so this test cannot catch the drift it exists for")
		}
		if said := howTheyDiffer(byName(lane)["se_work"], byName(stale)["se_work"]); said == "" {
			t.Fatal("the difference is seen and not said, so the failure names nothing to fix")
		}
	})
}

// coldDoor is the tool list a cold session is shown, read off the file.
func coldDoor(t *testing.T) []map[string]any {
	t.Helper()
	path := filepath.Join("..", "..", "util", "cage", "tools.json")
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", path, err)
	}
	var snapshot struct {
		Tools []map[string]any `json:"tools"`
	}
	if err := json.Unmarshal(b, &snapshot); err != nil {
		t.Fatalf("%s will not read, so this guards nothing: %v", path, err)
	}
	if len(snapshot.Tools) == 0 {
		t.Fatalf("%s carries no tools, so this guards nothing", path)
	}
	return snapshot.Tools
}

// asJSON puts the lane's tools through JSON, which is what the file went
// through. Comparing a Go value against a decoded one otherwise fails on the
// types rather than on the door: every number out of a file is a float64.
func asJSON(t *testing.T, list []map[string]any) []map[string]any {
	t.Helper()
	b, err := json.Marshal(list)
	if err != nil {
		t.Fatal(err)
	}
	var out []map[string]any
	if err := json.Unmarshal(b, &out); err != nil {
		t.Fatal(err)
	}
	return out
}

// byName keys a tool list by the name each tool answers to.
func byName(list []map[string]any) map[string]map[string]any {
	out := map[string]map[string]any{}
	for _, tool := range list {
		if name, ok := tool["name"].(string); ok {
			out[name] = tool
		}
	}
	return out
}

// howTheyDiffer says what to look at, so the failure names the fix.
//
// A DIFFERENCE PRINTED WHOLE IS TWO SCHEMAS AND NO ANSWER. What a reader needs
// is which side has the field, and after that whether the sentence changed.
func howTheyDiffer(want, got map[string]any) string {
	mine, theirs := properties(want), properties(got)
	if missing := onlyIn(keys(mine), keys(theirs)); len(missing) > 0 {
		return "the lane takes " + join(missing) + " and the cold door does not offer it"
	}
	if extra := onlyIn(keys(theirs), keys(mine)); len(extra) > 0 {
		return "the cold door offers " + join(extra) + " and the lane decodes no such field"
	}
	if want["description"] != got["description"] {
		return "they say different things of it"
	}
	return "their schemas are not the same object"
}

// properties is one tool's advertised arguments, and nothing where it has none.
func properties(tool map[string]any) map[string]any {
	schema, _ := tool["inputSchema"].(map[string]any)
	props, _ := schema["properties"].(map[string]any)
	return props
}

// dropField takes one argument out of one tool's schema, for the drift above.
func dropField(t *testing.T, list []map[string]any, tool, field string) {
	t.Helper()
	props := properties(byName(list)[tool])
	if _, has := props[field]; !has {
		t.Fatalf("%s advertises no %s, so taking it out proves nothing", tool, field)
	}
	delete(props, field)
}

// join reads a list of names as a sentence does.
func join(names []string) string {
	sort.Strings(names)
	said := ""
	for i, name := range names {
		switch {
		case i == 0:
		case i == len(names)-1:
			said += " and "
		default:
			said += ", "
		}
		said += name
	}
	return said
}
