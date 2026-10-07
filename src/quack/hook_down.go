// The hook verb's down word: what a forwarder whose post fails hands on. It
// starts the index on a cloud box, asks the door again, and otherwise answers
// the cage block, the refusal of a guarded call and the fall line.
// [[spec/tickets/level0-hooks-forward-to-go]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"quackitect/src/modules/hooks"
)

// The span the start road allows an install on a fresh clone, which the boot hook's timeout waits out. [[spec/design_output/level0#the-boot-hook]]
const startSpan = 180 * time.Second

// The name of the block a prompt context carries while level zero stands down. [[spec/design_output/level0#a-session-says-its-cage]]
const cageBlock = "level0-cage"

// The word, the row kind it writes, the events it reads apart, and the codes the start answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const (
	downWord      = "down"
	downKind      = "bridge"
	downStart     = "session.start"
	downContext   = "prompt.context"
	startStands   = 0
	startByPerson = 3
	startFails    = 8
)

// The level and the reason each start code reads as. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
var startReasons = map[int][2]string{
	0: {"info", "no index answered, so the bridgehead starts one"},
	1: {"warn", "the start of the index fails"},
	3: {"", "a person starts the index here"},
	4: {"warn", "the method root is absent, so no index starts"},
	5: {"warn", "this box carries no node, so no index starts"},
	7: {"info", "the index stands nowhere, so the bridgehead installs the tree and starts it"},
	8: {"warn", "the index fails its standing, so no door stands"},
	9: {"warn", "the install builds no index, so no index starts"},
}

// The level and the reason a start code reads as. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func startReasonOf(code int) (string, string) {
	if said, ok := startReasons[code]; ok {
		return said[0], said[1]
	}
	return "warn", fmt.Sprintf("the start answers %d, which nobody names", code)
}

// Answers one event the forwarder's post failed on: the door's answer once a start stands it, or the answer level zero gives while it stands down. It prints the answer as JSON and exits zero. [[spec/tickets/level0-hooks-forward-to-go]]
func hookDown(d hookDoors, event string, out, errs io.Writer) int {
	var e map[string]any
	if text, err := io.ReadAll(d.stdin); err == nil {
		_ = json.Unmarshal(text, &e)
	}
	if e == nil {
		e = map[string]any{}
	}
	post := hooks.Post{Event: event, E: e, Root: d.root}
	code, detail := downStarts(d)
	if level, reason := startReasonOf(code); level != "" {
		_ = d.log(level, downKind, reason, map[string]any{"event": event, "detail": detail})
	}
	answer, err := d.ask(post)
	if err != nil {
		answer = downAnswer(d, post, code, detail, err, errs)
	}
	prints := json.NewEncoder(out)
	prints.SetEscapeHTML(false)
	_ = prints.Encode(answer)
	return 0
}

// The start a cloud box runs where no door answers, as the serve verb runs it, and what it says. A desk waits for a person. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func downStarts(d hookDoors) (int, string) {
	if !d.cloud {
		return startByPerson, ""
	}
	code, said := serveDetachedStart(serveDoors{root: d.root, run: d.run})
	if code != 0 {
		return startFails, said
	}
	return startStands, said
}

// What level zero answers while the door stands down: the row of the fall, the line the person reads, the refusal of a guarded call, and the cage block on the prompt context. The session start says nothing to the person, because the start road runs under it. [[spec/design_output/level0#the-bridge-says-it-falls]]
func downAnswer(d hookDoors, post hooks.Post, code int, detail string, fell error, errs io.Writer) hooks.Answer {
	_ = d.log("warn", downKind, "the door answers nothing", map[string]any{"event": post.Event, "detail": fell.Error()})
	if post.Event != downStart {
		fmt.Fprintln(errs, fellText(fell.Error()))
	}
	if hooks.Guarded(post.Event, post.E) {
		return hooks.Answer{Effects: []hooks.Effect{{Kind: "result", Text: hooks.RefusedText(post.E)}}}
	}
	if level, _ := startReasonOf(code); post.Event == downContext && level == "warn" {
		return hooks.Answer{Effects: []hooks.Effect{{Kind: "after", Name: cageBlock, Text: cageText(code, detail)}}}
	}
	return hooks.Answer{Effects: []hooks.Effect{{Kind: "pass"}}}
}

// The one line a person reads where the door falls. [[spec/design_output/level0#the-bridge-says-it-falls]]
func fellText(why string) string {
	return strings.Join([]string{
		"LEVEL ZERO ANSWERS NOTHING. The hooks door answers nothing, so no",
		"rule, no write door and no stop hook reaches this session. It says:",
		strings.TrimSpace(why) + ".",
		"Say so in your next answer, and run ./RUNME.sh serve to start it again.",
		"Run ./RUNME.sh doctor where that fails, which names what this box holds.",
	}, " ")
}

// The one block a session outside the cage reads, because the agent inside it is the one reader who cannot see the fault. [[spec/design_output/level0#a-session-says-its-cage]]
func cageText(code int, detail string) string {
	_, reason := startReasonOf(code)
	lines := []string{
		"LEVEL ZERO STANDS DOWN ON THIS BOX. No rule, no brief, no write door and no",
		fmt.Sprintf("stop hook reaches this session. The start road answers %d, and that", code),
		"code says: " + reason + ".",
	}
	if said := strings.TrimSpace(detail); said != "" {
		lines = append(lines, "The road itself says: "+said)
	}
	return strings.Join(append(lines,
		"Open your first answer with one line saying level zero stands down here, and",
		"what this box lacks. Then run ./RUNME.sh, which installs it, and start the",
		"index with ./RUNME.sh serve.",
	), " ")
}
