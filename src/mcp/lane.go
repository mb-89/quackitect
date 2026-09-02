package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// THE LANE, for Level 1. The stub decides nothing. It shapes the arguments,
// hands them to the engine, and returns what the engine said.
//
// A DESCRIPTION IS IN THE PROMPT ON EVERY TURN, so it says what to do and
// stops. Explaining why costs the same tokens forever and changes nothing.

func laneTools() []map[string]any {
	return []map[string]any{
		{
			"name": "se_work",
			"description": "MINT A WORK TOKEN. Every piece of work is one.\n\n" +
				"\"Write a note on this\" means backlog: true.\n" +
				"An instruction to act on now means backlog left off.\n\n" +
				"form is one line. detail is the whole instruction, in the words it was asked in.\n" +
				"You cannot close what you mint. A reviewer settles it.\n\n" +
				"AND IT IS WHERE YOU SAY WHICH TOKEN YOU ARE ON. Pass on: <id>. " +
				"That token goes in work, whatever else you held goes back, and " +
				"a write is refused until you have said it.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"title":    map[string]any{"type": "string", "description": "what the work is, in four words at most"},
					"assignee": map[string]any{"type": "string", "description": "whose it is"},
					"detail":   map[string]any{"type": "string", "description": "the whole instruction"},
					"guidance": map[string]any{"type": "string", "description": "the method, inline"},
					"guidance_ref": map[string]any{"type": "string",
						"description": "the method, by path"},
					"evidence": map[string]any{"type": "array", "items": map[string]any{"type": "string"},
						"description": "sections completion must fill. Each is checked before a reviewer sees it"},
					"evidence_script": map[string]any{"type": "string",
						"description": "a command that must exit zero"},
					"parent": map[string]any{"type": "string",
						"description": "the token this breaks down. Yours to close, if it is ephemeral"},
					"backlog": map[string]any{"type": "boolean",
						"description": "out of the queue, holding nobody. What a note is"},
					"open": map[string]any{"type": "string",
						"description": "instead of minting: move a backlogged token into the queue, by id"},
					"on": map[string]any{"type": "string",
						"description": "instead of minting: say which token you are working on, by id. " +
							"It goes in work and whatever else you held goes back. A write is refused until you have said it"},
					"actor": map[string]any{"type": "string",
						"description": "who is minting. Default main"},
				},
				"required": []string{"title", "assignee"},
			},
		},
		{
			"name": "se_stop",
			"description": "NAME WHY YOU ARE STOPPING, when a stop was refused.\n\n" +
				"The refusal carries the list. Say which entry applies and why.\n" +
				"One claim releases one stop. Do anything else first and it is gone.\n" +
				"No arguments reads the list.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"because": map[string]any{"type": "string",
						"description": "the id of the sanctioned stop. Leave it out to read the list"},
					"why":   map[string]any{"type": "string", "description": "why it applies, in one line"},
					"actor": map[string]any{"type": "string", "description": "who is stopping. Default main"},
				},
			},
		},
		{
			"name": "se_pull",
			"description": "THE PULL, your one verb for work. Pull, do what comes back, pull again.\n\n" +
				"FOUR ANSWERS, and the pull field names which.\n" +
				"- work: do the token. Findings from an earlier round have to be answered.\n" +
				"- review: judge it against its own rules. Answer verdict accept, or reject with findings.\n" +
				"- refused: a check failed. Fix what the finding names and pull again with the same id.\n" +
				"- wait: nothing for you. Say so and stop.\n\n" +
				"SUBMITTING IS A PULL: id, evidence and disposition. You cannot close a token.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"id": map[string]any{"type": "string",
						"description": "the token you are submitting or judging. Leave it out to ask for work"},
					"evidence": map[string]any{"type": "object",
						"additionalProperties": map[string]any{"type": "string"},
						"description":          "one entry per section the token asked for. Empty is refused"},
					"disposition": map[string]any{"type": "string",
						"description": "done, became, or dropped"},
					"successors": map[string]any{"type": "array", "items": map[string]any{"type": "string"},
						"description": "became only: the tokens this turned into. They must exist"},
					"reason": map[string]any{"type": "string", "description": "dropped only: why the work stopped"},
					"verdict": map[string]any{"type": "string",
						"description": "reviewer only: accept or reject"},
					"findings": map[string]any{"type": "array",
						"description": "reviewer only, with reject: clause, wrong, satisfies",
						"items": map[string]any{"type": "object", "properties": map[string]any{
							"clause":    map[string]any{"type": "string"},
							"wrong":     map[string]any{"type": "string"},
							"satisfies": map[string]any{"type": "string"},
						}}},
					"lesson": map[string]any{"type": "object",
						"description": "reviewer only, with reject: the class of mistake and what to do " +
							"instead. A rejection with no lesson is refused",
						"properties": map[string]any{
							"class":    map[string]any{"type": "string"},
							"avoid":    map[string]any{"type": "string"},
							"prevents": map[string]any{"type": "string"},
						}},
					"learned": map[string]any{"type": "string",
						"description": "reviewer only, with reject: the id of the token you minted for " +
							"the lesson. A rejection naming none is refused"},
					"rewatched": map[string]any{"type": "object",
						"additionalProperties": map[string]any{"type": "string"},
						"description": "reviewer only, with accept: what you watched go red, keyed by " +
							"the criterion's own sentence"},
					"criteria": map[string]any{"type": "array",
						"description": "a draft's criteria: says, and runs where a command decides it",
						"items": map[string]any{"type": "object", "properties": map[string]any{
							"says":    map[string]any{"type": "string"},
							"runs":    map[string]any{"type": "string"},
							"without": map[string]any{"type": "string"},
							"red":     map[string]any{"type": "string"},
						}}},
					"as":    map[string]any{"type": "string", "description": "worker, or reviewer. Default worker"},
					"actor": map[string]any{"type": "string", "description": "who is pulling. Default main"},
				},
			},
		},
	}
}

func mintWork(r roots, args map[string]any) string {
	if id := str(args["open"]); id != "" {
		return engineCall(r, []string{"work", "--open", id}, nil)
	}
	// NAMING A TOKEN IS WHAT OPENS IT, so it goes through the same verb the
	// agent already has rather than becoming a second thing to remember.
	if id := str(args["on"]); id != "" {
		by := str(args["actor"])
		if by == "" {
			by = "main"
		}
		return engineCall(r, []string{"work", "--on", id, "--by", by}, nil)
	}
	// The agent minting is the actor it pulls as, so the engine is told rather
	// than left to guess.
	by := str(args["actor"])
	if by == "" {
		by = "main"
	}
	a := []string{"work", "--title", str(args["title"]), "--assignee", str(args["assignee"]), "--by", by}
	if b, ok := args["backlog"].(bool); ok && b {
		a = append(a, "--backlog")
	}
	// A fixed order, because a map's is not one and a command line a person
	// reads in the log should look the same every time.
	for _, pair := range [][2]string{
		{"--detail", "detail"}, {"--guidance", "guidance"}, {"--guidance-ref", "guidance_ref"},
		{"--evidence-script", "evidence_script"}, {"--parent", "parent"},
	} {
		if v := str(args[pair[1]]); v != "" {
			a = append(a, pair[0], v)
		}
	}
	if s := strList(args["evidence"]); len(s) > 0 {
		a = append(a, "--evidence", strings.Join(s, ","))
	}
	return engineCall(r, a, nil)
}

func stopClaim(r roots, args map[string]any) string {
	actor := str(args["actor"])
	if actor == "" {
		actor = "main"
	}
	if str(args["because"]) == "" {
		return engineCall(r, []string{"stop", "--list"}, nil)
	}
	return engineCall(r, []string{"stop", "--actor", actor,
		"--because", str(args["because"]), "--why", str(args["why"])}, nil)
}

func pull(r roots, args map[string]any) string {
	actor, role := str(args["actor"]), str(args["as"])
	if actor == "" {
		actor = "main"
	}
	// Everything but the two routing arguments is the payload, which the
	// engine reads. The stub does not know what a payload means.
	payload := map[string]any{}
	// EVERY FIELD THE ENGINE'S PAYLOAD CARRIES. It was seven of them, and the
	// three a rejection needs were among the missing: a reviewer coming through
	// this door could only ever send accept, because the engine refuses a
	// rejection with no lesson and no lesson token. One did, on a token it had
	// not reviewed, and the token closed.
	for _, k := range []string{"id", "evidence", "rewatched", "disposition", "successors",
		"reason", "verdict", "findings", "lesson", "learned", "criteria"} {
		if v, ok := args[k]; ok && v != nil {
			payload[k] = v
		}
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "the payload will not encode: " + err.Error()
	}
	a := []string{"pull", "--actor", actor}
	if role != "" {
		a = append(a, "--as", role)
	}
	return engineCall(r, a, body)
}

// engineCall runs a subcommand with an optional payload on standard input. A
// subcommand answers JSON whether it worked or not, so the output is handed
// back whole rather than judged here.
//
// The evidence script runs inside the engine, and a test suite is a long
// thing, so the wait is longer than a question deserves and shorter than a
// hang.
func engineCall(r roots, args []string, stdin []byte) string {
	// The subcommand leads. The engine reads it before it parses a flag, the
	// way it reads the guard's, so nothing may come in front of it.
	out, err := askWithInput(r, append(args, "--work", r.work), stdin, 6*time.Minute)
	if err != nil && strings.TrimSpace(out) == "" {
		return fmt.Sprintf("the engine could not be asked: %v", err)
	}
	return out
}

func str(v any) string {
	s, _ := v.(string)
	return s
}

func strList(v any) []string {
	raw, _ := v.([]any)
	var out []string
	for _, e := range raw {
		if s := str(e); s != "" {
			out = append(out, s)
		}
	}
	return out
}
