package main

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"
)

// THE LANE, for Level 1. The stub decides nothing. It shapes the arguments,
// hands them to the engine, and returns what the engine said.
//
// A DESCRIPTION SAYS WHAT TO DO AND STOPS. Where a reader would ask why the
// door is shaped this way, the answer is [[a-description-is-an-instruction]].

func laneTools() []map[string]any {
	return []map[string]any{
		{
			"name":        "se_test",
			"description": "TEST WHAT YOU CHANGED, naming the token: on: <id>.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"on":      map[string]any{"type": "string"},
					"propose": map[string]any{"type": "array", "items": map[string]any{"type": "string"}, "description": "tests by name, or patterns"},
					"plan":    map[string]any{"type": "boolean", "description": "say what would run, run nothing"},
				},
			},
		},
		{
			"name": "se_find",
			"description": "SEARCH THE TREE THROUGH THE INDEX: words (FTS5), regex, or path " +
				"(a glob; alone it lists files).",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"words": map[string]any{"type": "string"},
					"regex": map[string]any{"type": "string"},
					"path":  map[string]any{"type": "string"},
					"limit": map[string]any{"type": "integer"},
				},
			},
		},
		{
			"name":        "se_ask",
			"description": "ASK THE INDEX: sql, read-only; schema prints the tables.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"sql":      map[string]any{"type": "string"},
					"search":   map[string]any{"type": "string"},
					"links":    map[string]any{"type": "string"},
					"dangling": map[string]any{"type": "boolean"},
					"schema":   map[string]any{"type": "boolean"},
					"limit":    map[string]any{"type": "integer"},
				},
			},
		},
		{
			"name": "se_apply",
			"description": "CHANGE FILES, naming the token: on: <id>. op: left off (replace old, " +
				"exactly once, with new), create, write. undo puts back what that token wrote, " +
				"and never another agent's work.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"on": map[string]any{"type": "string"},
					"edits": map[string]any{"type": "array",
						"items": map[string]any{"type": "object",
							"properties": map[string]any{
								"file": map[string]any{"type": "string"},
								"old":  map[string]any{"type": "string"},
								"new":  map[string]any{"type": "string"},
								"op":   map[string]any{"type": "string"},
							},
							"required": []string{"file"},
						}},
					"dry":   map[string]any{"type": "boolean"},
					"undo":  map[string]any{"type": "boolean"},
					"actor": map[string]any{"type": "string"},
				},
			},
		},
		{
			"name": "se_run",
			"description": "RUN A SHELL COMMAND in the work folder, naming the token: on: <id>. " +
				"A long output pages with page and from.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"on":      map[string]any{"type": "string"},
					"command": map[string]any{"type": "string"},
					"page":    map[string]any{"type": "string"},
					"from":    map[string]any{"type": "integer"},
					"actor":   map[string]any{"type": "string"},
				},
			},
		},
		{
			"name": "se_work",
			"description": "MINT A WORK TOKEN: title (four words at most), detail, done_when. " +
				"Or on: <id> takes that token into your hands.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"title":           map[string]any{"type": "string"},
					"detail":          map[string]any{"type": "string"},
					"process":         map[string]any{"type": "string"},
					"proposed_action": map[string]any{"type": "string"},
					"done_when":       map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
					"depends_on":      map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
					"parent":          map[string]any{"type": "string"},
					"on":              map[string]any{"type": "string"},
					"actor":           map[string]any{"type": "string"},
				},
				"required": []string{"title"},
			},
		},
		{
			"name": "se_stop",
			"description": "NAME WHY YOU ARE STOPPING, when a stop was refused. No arguments " +
				"reads the list.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"because": map[string]any{"type": "string"},
					"why":     map[string]any{"type": "string"},
					"actor":   map[string]any{"type": "string"},
				},
			},
		},
		{
			"name": "se_pull",
			"description": "PULL FOR WORK; act on work, refused or wait. Submit with id and " +
				"disposition, the checklist answered on the note.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"id":          map[string]any{"type": "string"},
					"evidence":    map[string]any{"type": "object", "additionalProperties": map[string]any{"type": "string"}},
					"disposition": map[string]any{"type": "string"},
					"successors":  map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
					"reason":      map[string]any{"type": "string"},
					"actor":       map[string]any{"type": "string"},
					"role":        map[string]any{"type": "string", "description": "worker, or reviewer for verdicts owed"},
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
		{"--proposed-action", "proposed_action"}, {"--parent", "parent"},
	} {
		if v := str(args[pair[1]]); v != "" {
			a = append(a, pair[0], v)
		}
	}
	if s := strList(args["depends_on"]); len(s) > 0 {
		a = append(a, "--depends-on", strings.Join(s, ","))
	}
	for _, says := range strList(args["done_when"]) {
		a = append(a, "--done-when", says)
	}
	return engineCall(r, a, nil)
}

// askIndex hands a question to se ask. One question per call, and the flag
// order is the verb's own, so the command a person reads in the log is the
// one they would type.
// testTheDelta hands the engine a token's delta and a proposal, as the verb.
func testTheDelta(r roots, args map[string]any) string {
	argv := []string{"test"}
	if on := str(args["on"]); on != "" {
		argv = append(argv, "--on", on)
	}
	if list, ok := args["propose"].([]any); ok {
		for _, p := range list {
			if s := str(p); s != "" {
				argv = append(argv, "--propose", s)
			}
		}
	}
	if args["plan"] == true {
		argv = append(argv, "--plan")
	}
	return engineCall(r, argv, nil)
}

// findInTree puts one search to the engine that lives, over its socket.
func findInTree(r roots, args map[string]any) string {
	params := map[string]any{}
	for _, k := range [...]string{"words", "regex", "path"} {
		if v := str(args[k]); v != "" {
			params[k] = v
		}
	}
	if len(params) == 0 {
		return "Say what to find: words, regex, or path."
	}
	if n, ok := args["limit"].(float64); ok && n > 0 {
		params["limit"] = int(n)
	}
	raw, err := askModel(r, "find", params)
	if err != nil {
		b, _ := json.Marshal(map[string]any{"error": err.Error()})
		return string(b)
	}
	return string(raw)
}

func askIndex(r roots, args map[string]any) string {
	// THE SCHEMA IS THE ENGINE'S TEXT, and needs no engine running.
	if args["schema"] == true {
		return engineCall(r, []string{"ask", "--schema"}, nil)
	}
	params := map[string]any{}
	for _, k := range [...]string{"sql", "search", "links"} {
		if v := str(args[k]); v != "" {
			params[k] = v
		}
	}
	if args["dangling"] == true {
		params["dangling"] = true
	}
	if len(params) == 0 {
		return "Say what to ask: sql, search, links, dangling or schema."
	}
	if n, ok := args["limit"].(float64); ok && n > 0 {
		params["limit"] = int(n)
	}
	// THE QUESTION GOES TO THE ENGINE THAT LIVES, over its socket, and
	// nothing is started for it.
	raw, err := askModel(r, "ask", params)
	if err != nil {
		b, _ := json.Marshal(map[string]any{"error": err.Error()})
		return string(b)
	}
	return string(raw)
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
	argv := []string{"pull", "--actor", actor}
	if role := str(args["role"]); role != "" {
		argv = append(argv, "--role", role)
	}
	return engineCall(r, argv, body)
}

// engineCall runs a subcommand with an optional payload on standard input. A
// subcommand answers JSON whether it worked or not, so the output is handed
// back whole rather than judged here.
//
// The evidence script runs inside the engine, and a test suite is a long
// thing, so the wait is longer than a question deserves and shorter than a
// hang.
func engineCall(r roots, args []string, stdin []byte) string {
	// THE VERB RUNS IN THE ENGINE THAT LIVES. The lane sends the verb, its
	// flags and the payload over the socket, and prints what the engine
	// wrote. Nothing is started for a call. With no engine over the folder
	// the answer says so, and how to start one.
	raw, err := askModelWithin(r, "verb", map[string]any{"verb": args[0], "args": args[1:], "stdin": string(stdin)}, 6*time.Minute)
	if err != nil {
		b, _ := json.Marshal(map[string]any{"error": err.Error()})
		return string(b)
	}
	var a struct {
		Out  string `json:"out"`
		Err  string `json:"err"`
		Code int    `json:"code"`
	}
	if json.Unmarshal(raw, &a) != nil {
		return string(raw)
	}
	return strings.TrimRight(a.Out+a.Err, "\n")
}

// applyEdits hands the manifest to the engine, whole, on standard input.
//
// THE MANIFEST IS NOT FLATTENED INTO FLAGS. It is a list of edits carrying
// content with newlines and quotes in it, and a command line is the wrong shape
// for that: it has a length limit, and every layer between here and the engine
// would have to agree about quoting. The stub passes the bytes through.
func applyEdits(r roots, args map[string]any) string {
	on := str(args["on"])
	// AN UNDO CARRIES ITS TOKEN LIKE ANY OTHER WRITE, and this dropped it.
	//
	// The stub took on: and actor: for an apply and threw both away for an undo,
	// so the engine was asked to put back the newest apply on the tree by anybody.
	// With several agents writing at once that is somebody else's change, and it
	// was: an undo named on one token restored a file belonging to another actor's.
	if undo, is := args["undo"].(bool); is && undo {
		if on == "" {
			return `{"error":"say which token to undo, with on: <id>. An undo puts back what that token wrote"}`
		}
		return engineCall(r, []string{"apply", "--undo", "--on", on,
			"--by", orMain(str(args["actor"]))}, nil)
	}
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
	// READING A PAGE NAMES NO TOKEN, because looking is not writing.
	if page := str(args["page"]); page != "" {
		a := []string{"run", "--page", page}
		if from, is := args["from"].(float64); is {
			a = append(a, "--from", itoa(int(from)))
		}
		return engineCall(r, a, nil)
	}
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

// itoa is a number as the flag takes it.
func itoa(n int) string { return strconv.Itoa(n) }

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
