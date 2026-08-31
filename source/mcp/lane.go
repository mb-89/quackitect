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
			"description": "MINT A WORK TOKEN. Work that is not a token is work nothing can see.\n\n" +
				"\"Write a note on this\" means backlog: true.\n" +
				"An instruction to act on now means backlog left off.\n\n" +
				"form is one line. detail is the whole instruction, in the words it was asked in.\n" +
				"You cannot close what you mint. A reviewer settles it.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"form":     map[string]any{"type": "string", "description": "what is to be done, in one line"},
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
				},
				"required": []string{"form", "assignee"},
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
	a := []string{"work", "--form", str(args["form"]), "--assignee", str(args["assignee"])}
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
	for _, k := range []string{"id", "evidence", "disposition", "successors", "reason", "verdict", "findings"} {
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
