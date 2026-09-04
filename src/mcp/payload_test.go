package main

import (
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"strings"
	"testing"
)

// EVERY FIELD THE ENGINE'S PAYLOAD CARRIES IS ONE THIS DOOR CAN SEND.
//
// MEASURED, BY THE REVIEWER IT COST. rev-6 could not use the shell, so the MCP
// pull was the only door it had left. That door carried id, verdict and
// findings and not lesson, learned or rewatched. The engine refuses a rejection
// with no lesson and no lesson token, so through this door the only verdict a
// reviewer could physically deliver was accept. It sent one, on a token it had
// not reviewed, and the token closed at round eleven.
//
// A REVIEWER THAT CANNOT REJECT IS NOT A REVIEWER, and the hole was a hand list
// of seven keys beside a struct that declares more. So the list is held against
// the struct rather than read once and trusted.
//
// THE LIST IS NOW A STRUCT TOO. pullPayload is what travels and pullArgs is
// what the door takes, and both are read here by reflection rather than by
// pattern over the source: a name is a name whatever gofmt does to the spacing
// around it, and what an agent may send is what schema.go reads off pullArgs.
func TestThePullDoorCarriesEveryFieldThePayloadHas(t *testing.T) {
	t.Parallel()
	b, err := os.ReadFile(filepath.Join("..", "engine", "pull.go"))
	if err != nil {
		t.Fatalf("the engine's payload cannot be read, so this guards nothing: %v", err)
	}
	src := string(b)
	at := strings.Index(src, "type Payload struct {")
	if at < 0 {
		t.Fatal("no Payload struct was found, so this guards nothing")
	}
	end := strings.Index(src[at:], "\n}")
	if end < 0 {
		t.Fatal("the Payload struct does not end, so this guards nothing")
	}
	tags := regexp.MustCompile(`json:"([a-z_]+)`).FindAllStringSubmatch(src[at:at+end], -1)
	if len(tags) == 0 {
		t.Fatal("the Payload struct declares no json field, so this guards nothing")
	}

	// WHAT THIS DOOR SENDS, AND WHAT IT INVITES, read off the two types the
	// lane declares rather than typed here again.
	sends := map[string]bool{}
	for _, name := range fieldNames(reflect.TypeOf(pullPayload{})) {
		sends[name] = true
	}
	invites := map[string]bool{}
	for _, name := range keys(schemaOf(pullArgs{})["properties"].(map[string]any)) {
		invites[name] = true
	}

	for _, tag := range tags {
		name := tag[1]
		if !sends[name] {
			t.Errorf("the engine's payload carries %q and this door does not forward it, "+
				"so nothing reaching the engine through here can ever set it", name)
			continue
		}
		// AND THE SCHEMA SAYS SO, because a field forwarded and not advertised is
		// one no caller knows to send.
		if !invites[name] {
			t.Errorf("this door forwards %q and its schema never declares it, so no caller "+
				"knows to send it", name)
		}
	}

	// AND NOTHING TRAVELS THAT THE ENGINE WOULD DROP. A field the payload has
	// not got is one json.Unmarshal discards without a word, which is a door
	// inviting an agent to fill in something nothing reads.
	carries := map[string]bool{}
	for _, tag := range tags {
		carries[tag[1]] = true
	}
	for name := range sends {
		if !carries[name] {
			t.Errorf("this door sends %q and the engine's payload has no such field, so the "+
				"engine drops it without a word", name)
		}
	}
}
