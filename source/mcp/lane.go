package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// THE LANE, for Level 1. Two tools, and the stub decides nothing about
// either. It shapes the arguments into a payload, hands them to the engine,
// and returns what the engine said.
//
// Whether a submission is good, which token comes next, and who may close it
// are all the engine's rulings. Putting any of them here would be a second
// place that decides, and two places that decide disagree.

func laneTools() []map[string]any {
	return []map[string]any{
		{
			"name": "se_work",
			"description": "MINT A WORK TOKEN. Work that is not a token is work nothing can see.\n\n" +
				"Open one for anything you are about to do that is not already a token, and for " +
				"anything a person asks you for in conversation. Until it is a token it has left " +
				"no mark, and the person cannot watch it go.\n\n" +
				"The form is what is to be done, in the words it was asked in. Write the whole " +
				"instruction: a line naming the work tells the next hand nothing about it.\n\n" +
				"The evidence names the sections that completion has to fill, or evidence_script " +
				"names a command that has to exit zero. Asserting done is not evidence.\n\n" +
				"A parent breaks a token you already hold into steps. A sub-token closes on your " +
				"own submission, so use it for your own breakdown and nothing else.\n\n" +
				"You cannot close what you mint. A reviewer settles it.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"form": map[string]any{"type": "string",
						"description": "what work is to be done. The whole instruction, not its name."},
					"assignee": map[string]any{"type": "string",
						"description": "whose token it is. Yours is the actor you pull as."},
					"guidance": map[string]any{"type": "string",
						"description": "the method that travels with this work, inline."},
					"guidance_ref": map[string]any{"type": "string",
						"description": "the method by reference, where it is shared. A path."},
					"evidence": map[string]any{"type": "array", "items": map[string]any{"type": "string"},
						"description": "the sections completion must fill. Every one is checked before a reviewer is woken."},
					"evidence_script": map[string]any{"type": "string",
						"description": "a command that must exit zero. Use it wherever completion can be measured rather than judged."},
					"parent": map[string]any{"type": "string", "description": "the token this one breaks down."},
					"closer": map[string]any{"type": "string",
						"description": "who settles it. Leave it out and a reviewer does, which is the point."},
				},
				"required": []string{"form", "assignee"},
			},
		},
		{
			"name": "se_stop",
			"description": "NAME WHY YOU ARE STOPPING. Use it when a stop was refused and one of the " +
				"sanctioned reasons applies.\n\n" +
				"The refusal carries the list. Say which entry applies and why, in one line. " +
				"Saying it in chat is not enough, because nothing can read chat.\n\n" +
				"One claim releases one stop, and your next pull spends it.\n\n" +
				"Call it with no arguments to read the list.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"because": map[string]any{"type": "string",
						"description": "the id of the sanctioned stop that applies. Leave it out to read the list."},
					"why": map[string]any{"type": "string",
						"description": "why it applies here, in one line. A reason on its own is a category."},
					"actor": map[string]any{"type": "string", "description": "who is stopping. Leave it out and you are main."},
				},
			},
		},
		{
			"name": "se_pull",
			"description": "THE PULL, your one verb for work. Pull, do what comes back, pull again.\n\n" +
				"The engine owns the queue. You never name a target and never choose what to work on.\n\n" +
				"FOUR ANSWERS, and the pull field names which one you got.\n\n" +
				"- work: a token rides in token. Do it. Findings from an earlier round ride in " +
				"findings, and every one of them has to be answered.\n" +
				"- review: you are the reviewer, and a submission rides in token. Judge it against " +
				"the token's own rules and nothing else. Answer verdict accept, or verdict reject " +
				"with findings.\n" +
				"- refused: the engine checked what a program can check and your submission failed. " +
				"The finding names the clause, what is wrong, and what would satisfy it. Fix it and " +
				"pull again with the same id.\n" +
				"- wait: no token is assigned to you. Say so plainly and stop.\n\n" +
				"SUBMITTING IS A PULL. When the evidence is produced, pull with id, evidence and " +
				"disposition. You get back either a refusal or your next piece of work. You cannot " +
				"close a token: the engine checks it, then a reviewer settles it.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"id": map[string]any{"type": "string",
						"description": "the token you are submitting or judging. Leave it out to ask for work."},
					"evidence": map[string]any{"type": "object",
						"additionalProperties": map[string]any{"type": "string"},
						"description":          "one entry per section the token asked for. An empty section is refused."},
					"disposition": map[string]any{"type": "string",
						"description": "done, became, or dropped. A token cannot close without one."},
					"successors": map[string]any{"type": "array", "items": map[string]any{"type": "string"},
						"description": "became only: the tokens this turned into. They must exist."},
					"reason": map[string]any{"type": "string",
						"description": "dropped only: why the work stopped. Abandoning is a decision, and decisions are recorded."},
					"verdict": map[string]any{"type": "string", "description": "reviewer only: accept or reject."},
					"findings": map[string]any{"type": "array",
						"description": "reviewer only, with reject: each names the clause, what is wrong, and what would satisfy it.",
						"items": map[string]any{"type": "object", "properties": map[string]any{
							"clause":    map[string]any{"type": "string"},
							"wrong":     map[string]any{"type": "string"},
							"satisfies": map[string]any{"type": "string"},
						}}},
					"as": map[string]any{"type": "string",
						"description": "which queue: worker, or reviewer. Leave it out and you are a worker."},
					"actor": map[string]any{"type": "string",
						"description": "who is pulling. Leave it out and you are main."},
				},
			},
		},
	}
}

func mintWork(r roots, args map[string]any) string {
	a := []string{"work", "--form", str(args["form"]), "--assignee", str(args["assignee"])}
	// A fixed order, because a map's is not one and a command line a person
	// reads in the log should look the same every time.
	for _, pair := range [][2]string{
		{"--guidance", "guidance"}, {"--guidance-ref", "guidance_ref"},
		{"--evidence-script", "evidence_script"}, {"--parent", "parent"}, {"--closer", "closer"},
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
