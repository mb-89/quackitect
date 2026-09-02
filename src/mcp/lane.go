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
			"name": "se_apply",
			"description": "CHANGE FILES. This is how you write, and it says which work the change is.\n\n" +
				"The harness's Write and Edit are refused: they carry no way to name a " +
				"token, so a change made with one is a change nothing can file.\n\n" +
				"ONE MANIFEST, AS MANY FILES AS YOU LIKE. Every edit is checked before " +
				"any is written, so one bad edit writes nothing and the tree is never " +
				"half changed. Edits to one file compose in the order you wrote them.\n\n" +
				"THREE OPS.\n" +
				"- left off: replace old with new. old must be in the file exactly once, " +
				"so take in enough of what is around it to be sure.\n" +
				"- create: a file that is not there yet. It refuses if it is.\n" +
				"- write: replace a whole file.\n\n" +
				"NAMING A TOKEN YOU WERE NOT ON SWAPS THEM. The one you held goes back " +
				"and this one comes into your hands, so changing what you work on is one " +
				"word on the next write and never a call of its own.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"on": map[string]any{"type": "string",
						"description": "the token this change belongs to, by id"},
					"edits": map[string]any{"type": "array",
						"description": "the manifest, in order",
						"items": map[string]any{"type": "object",
							"properties": map[string]any{
								"file": map[string]any{"type": "string",
									"description": "the path, from the folder being worked on"},
								"old": map[string]any{"type": "string",
									"description": "the bytes to replace. It has to be there exactly once"},
								"new": map[string]any{"type": "string",
									"description": "what to put there, or the whole content for create and write"},
								"op": map[string]any{"type": "string",
									"description": "create, write, or left off for an exact replacement"},
							},
							"required": []string{"file"},
						}},
					"dry": map[string]any{"type": "boolean",
						"description": "check every edit and write nothing"},
					"undo": map[string]any{"type": "boolean",
						"description": "instead of writing: put back what the last apply overwrote. " +
							"It refuses if any of those files has changed since, so it never " +
							"throws away work somebody did afterwards. Needs no on and no edits"},
					"actor": map[string]any{"type": "string", "description": "who is writing. Default main"},
				},
			},
		},
		{
			"name": "se_run",
			"description": "RUN A SHELL COMMAND. This is how you build, test and search, and it " +
				"says which work the command is.\n\n" +
				"The harness's Bash is refused. The engine cannot read a command and know " +
				"whether it writes -- a redirection, sed -i, mv, rm and a script you wrote " +
				"all reach the filesystem -- so it does not ask. Every command names its " +
				"work because it could write.\n\n" +
				"The command runs in the folder being worked on. Output and errors come " +
				"back as one stream with the exit code. A long output is cut at the FRONT " +
				"and the cut is reported, because a failure says why on its last lines.\n\n" +
				"NAMING A TOKEN YOU WERE NOT ON SWAPS THEM, the same as a write.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"on": map[string]any{"type": "string",
						"description": "the token this command belongs to, by id"},
					"command": map[string]any{"type": "string",
						"description": "the command, whole. Quotes, newlines and pipes are yours to use"},
					"actor": map[string]any{"type": "string", "description": "who is running it. Default main"},
				},
				"required": []string{"on", "command"},
			},
		},
		{
			"name": "se_work",
			"description": "MINT A WORK TOKEN. Every piece of work is one.\n\n" +
				"THE PROCESS SHAPES IT. Pass process: <name>, one of the files in " +
				"src/processes. It says which sections the note carries, which states " +
				"it can be in, and what each step asks before it is done. Left off, " +
				"it is note.\n\n" +
				"title is four words at most. detail is the whole instruction, in the " +
				"words it was asked in. proposed_action is what you think should " +
				"happen about it.\n\n" +
				"AND IT IS WHERE YOU SAY WHICH TOKEN YOU ARE ON. Pass on: <id>. " +
				"That token goes in your hands, whatever else you held goes back, and " +
				"a write is refused until you have said it.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"title":   map[string]any{"type": "string", "description": "what the work is, in four words at most"},
					"detail":  map[string]any{"type": "string", "description": "the whole instruction"},
					"process": map[string]any{"type": "string", "description": "which process shapes it. Default note"},
					"proposed_action": map[string]any{"type": "string",
						"description": "what you think should happen about it"},
					"depends_on": map[string]any{"type": "array", "items": map[string]any{"type": "string"},
						"description": "ids that have to end before this can start"},
					"on": map[string]any{"type": "string",
						"description": "instead of minting: say which token you are working on, by id. " +
							"It goes in your hands and whatever else you held goes back. " +
							"A write is refused until you have said it"},
					"actor": map[string]any{"type": "string",
						"description": "who is minting. Default main"},
				},
				"required": []string{"title"},
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
				"THREE ANSWERS, and the pull field names which.\n" +
				"- work: do the token. Walk the checklist for the step you are on.\n" +
				"- refused: a check failed. Fix what the finding names and pull again with the same id.\n" +
				"- wait: nothing for you. Say so and stop.\n\n" +
				"SUBMITTING IS A PULL: id and disposition. The checklist is on the note " +
				"itself, so answer it there and the engine reads it. A step the token " +
				"has not reached yet, ticked, is refused.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"id": map[string]any{"type": "string",
						"description": "the token you are submitting. Leave it out to ask for work"},
					"evidence": map[string]any{"type": "object",
						"additionalProperties": map[string]any{"type": "string"},
						"description":          "one entry per section the token asked for. Empty is refused"},
					"disposition": map[string]any{"type": "string",
						"description": "done, became, or dropped"},
					"successors": map[string]any{"type": "array", "items": map[string]any{"type": "string"},
						"description": "became only: the tokens this turned into. They must exist"},
					"reason": map[string]any{"type": "string", "description": "dropped only: why the work stopped"},
					"actor":  map[string]any{"type": "string", "description": "who is pulling. Default main"},
				},
			},
		},
	}
}

func mintWork(r roots, args map[string]any) string {
	// NAMING A TOKEN IS WHAT OPENS IT, so it goes through the same verb the
	// agent already has rather than becoming a second thing to remember.
	if id := str(args["on"]); id != "" {
		return engineCall(r, []string{"work", "--on", id, "--by", orMain(str(args["actor"]))}, nil)
	}
	// The agent minting is the actor it pulls as, so the engine is told rather
	// than left to guess.
	by := str(args["actor"])
	if by == "" {
		by = "main"
	}
	// EVERY FLAG HERE IS ONE se work DEFINES.
	//
	// MEASURED, AND IT MEANT NOTHING COULD MINT THROUGH THIS DOOR. It sent
	// --assignee, --backlog, --guidance, --guidance-ref, --evidence-script,
	// --parent and --evidence, and the verb defines none of them, so the engine
	// printed its usage and minted nothing on every call. The extension's
	// builders are driven against the real binary by util/checks/engine-args.mjs
	// and these were not, which is why it was quiet.
	a := []string{"work", "--title", str(args["title"]), "--by", by}
	// A fixed order, because a map's is not one and a command line a person
	// reads in the log should look the same every time.
	for _, pair := range [][2]string{
		{"--detail", "detail"}, {"--process", "process"},
		{"--proposed-action", "proposed_action"},
	} {
		if v := str(args[pair[1]]); v != "" {
			a = append(a, pair[0], v)
		}
	}
	if s := strList(args["depends_on"]); len(s) > 0 {
		a = append(a, "--depends-on", strings.Join(s, ","))
	}
	return engineCall(r, a, nil)
}

func stopClaim(r roots, args map[string]any) string {
	actor := orMain(str(args["actor"]))
	if str(args["because"]) == "" {
		return engineCall(r, []string{"stop", "--list"}, nil)
	}
	return engineCall(r, []string{"stop", "--actor", actor,
		"--because", str(args["because"]), "--why", str(args["why"])}, nil)
}

func pull(r roots, args map[string]any) string {
	actor := orMain(str(args["actor"]))
	// Everything but the routing argument is the payload, which the engine
	// reads. The stub does not know what a payload means.
	payload := map[string]any{}
	// EVERY FIELD THE ENGINE'S PAYLOAD CARRIES, AND NO MORE.
	//
	// It forwarded eleven. Six of them — rewatched, verdict, findings, lesson,
	// learned, criteria — are fields Payload no longer has, so json.Unmarshal
	// dropped them without a word. A door that invites an agent to fill in
	// something nothing reads is worse than one that does not offer it.
	for _, k := range []string{"id", "evidence", "disposition", "successors", "reason"} {
		if v, ok := args[k]; ok && v != nil {
			payload[k] = v
		}
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "the payload will not encode: " + err.Error()
	}
	// NO --as. se pull defines no such flag, so a call that named a role was
	// refused by the engine before it read a byte of the payload.
	return engineCall(r, []string{"pull", "--actor", actor}, body)
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

// applyEdits hands the manifest to the engine, whole, on standard input.
//
// THE MANIFEST IS NOT FLATTENED INTO FLAGS. It is a list of edits carrying
// content with newlines and quotes in it, and a command line is the wrong shape
// for that: it has a length limit, and every layer between here and the engine
// would have to agree about quoting. The stub passes the bytes through.
func applyEdits(r roots, args map[string]any) string {
	if undo, is := args["undo"].(bool); is && undo {
		return engineCall(r, []string{"apply", "--undo"}, nil)
	}
	on := str(args["on"])
	if on == "" {
		return `{"error":"say which token this change is, with on: <id>"}`
	}
	raw, ok := args["edits"].([]any)
	if !ok || len(raw) == 0 {
		return `{"error":"an apply with no edits: say what to change"}`
	}
	body, err := json.Marshal(raw)
	if err != nil {
		return "the manifest will not encode: " + err.Error()
	}
	a := []string{"apply", "--on", on, "--by", orMain(str(args["actor"]))}
	if dry, is := args["dry"].(bool); is && dry {
		a = append(a, "--dry")
	}
	return engineCall(r, a, body)
}

// runCommand hands the command to the engine on standard input, whole.
//
// NOT AS A FLAG. A command line holds quotes, newlines, dollar signs and pipes,
// and passing it as an argument makes every layer between the agent and the
// engine agree about quoting. They do not.
func runCommand(r roots, args map[string]any) string {
	on := str(args["on"])
	if on == "" {
		return `{"error":"say which token this command is, with on: <id>"}`
	}
	command := str(args["command"])
	if strings.TrimSpace(command) == "" {
		return `{"error":"say what to run"}`
	}
	return engineCall(r, []string{"run", "--on", on, "--by", orMain(str(args["actor"]))},
		[]byte(command))
}

// orMain is who is acting, and it is main where nobody said.
func orMain(actor string) string {
	if actor == "" {
		return "main"
	}
	return actor
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
