package main

import (
	"os"
	"path/filepath"
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

	// WHAT THIS DOOR FORWARDS, read out of the door rather than typed here again.
	door, err := os.ReadFile("lane.go")
	if err != nil {
		t.Fatal(err)
	}
	forwards := regexp.MustCompile(`for _, k := range \[\]string\{([^}]*)\}`).FindStringSubmatch(string(door))
	if forwards == nil {
		t.Fatal("no list of forwarded keys was found in lane.go, so this guards nothing")
	}
	sends := map[string]bool{}
	for _, one := range strings.Split(forwards[1], ",") {
		sends[strings.Trim(strings.TrimSpace(one), `"`)] = true
	}

	// AND THE SCHEMA SAYS SO, because a key forwarded and not declared is a key
	// no caller knows to send.
	declared := string(door)
	for _, tag := range tags {
		name := tag[1]
		if !sends[name] {
			t.Errorf("the engine's payload carries %q and this door does not forward it, "+
				"so nothing reaching the engine through here can ever set it", name)
			continue
		}
		if !strings.Contains(declared, `"`+name+`": map[string]any{`) {
			t.Errorf("this door forwards %q and its schema never declares it, so no caller "+
				"knows to send it", name)
		}
	}
}
