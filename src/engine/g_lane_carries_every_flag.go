package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// EVERY FLAG AN ENGINE VERB DECLARES, THE LANE TOOL FOR IT CAN SAY.
//
// The tool lane is a second door onto the same verbs, and an agent uses that
// door. A verb grew a flag and the tool never grew the field, so a lane call
// could not say what the shell could, and the engine refused the call for a
// thing the caller had no way to send. MEASURED: the lane's tool for the work
// verb carried no tracked field, and every tracked token of a session was
// minted through the shell.
//
// THE READER THIS REPLACES SAW HALF THE DECLARATIONS. It matched fs.String,
// fs.Bool, fs.Int and fs.Duration and nothing else, so a flag declared with
// fs.StringVar, fs.BoolVar, fs.IntVar, fs.Float64 or fs.Int64 was invisible,
// and the drift the reader exists for walked past it green. Here the call is
// read by the name of the method, and the method says which argument is the
// flag and which is its help, so every form the flag package offers is held.
//
// IT IS DECIDED PER WRITE, AND IT IS COLD. The bytes going into the engine file
// carry the flag sets. The fields are read off src/cage/tools.json, which the
// lane generates from its structs. Nothing is built and nothing is run.
//
// WHAT IS PASSED OVER IS NAMED BELOW, WITH WHY: the shell's own flags, the
// renames, the record verbs' actor, a flag that opens a door of its own along
// with the companions of that door, and what the lane is answered whatever the
// caller says.
func everyFlagAVerbDeclaresHasALaneField(r Roots, _ bool, rel, text string) error {
	if !laneFlagIsAVerbFile(rel) {
		return nil
	}
	tools := laneFlagAdvertised(r)
	if len(tools) == 0 {
		return nil // the generated list is not in this tree, so there is nothing to hold to
	}
	for _, set := range laneFlagSetsIn(text) {
		tool := laneFlagToolFor(set.verb)
		fields, wrapped := tools[tool]
		if !wrapped {
			continue // a verb the lane does not wrap is not its business
		}
		doors := laneFlagOwnDoors(set.flags)
		for _, one := range set.flags {
			if laneFlagShells[one.name] || doors[one.name] {
				continue
			}
			if laneFlagSpeaksAsItself[tool] && (one.name == "actor" || one.name == "by") {
				continue
			}
			if laneFlagAlwaysAnswered[tool][one.name] {
				continue
			}
			field := laneFlagFieldFor(tool, one.name)
			if fields[field] {
				continue
			}
			return errors.New("A VERB GREW A FLAG THE LANE TOOL CANNOT SAY. " + rel +
				" declares --" + one.name + " on the " + set.verb + " verb, and " + tool +
				" has no " + field + " field in src/cage/tools.json.\n\n" +
				"WHY IT MATTERS. The tool lane is a second door onto the same verbs, and an agent " +
				"uses that door. A lane call cannot say what the shell can, so the engine refuses " +
				"the call for a thing the caller has no way to send. Measured: the lane's tool for " +
				"the work verb carried no tracked field, and every tracked token of a session was " +
				"minted through the shell.\n\n" +
				"WHAT TO WRITE INSTEAD. Add a " + field + " field to the " + tool +
				" struct in src/mcp/lane.go and regenerate src/cage/tools.json with " +
				".bin/se-mcp --tools. If the flag is not the lane's to send, say so where it is " +
				"passed over: a flag whose help opens \"instead of minting\" is a door of its own, " +
				"and a flag whose help opens \"with <that door>:\" travels with it.")
		}
	}
	return nil
}

// THE SHELL'S OWN FLAGS. Each says where the shell stands rather than what the
// verb does, and a lane call stands where the engine put it. The manifest is a
// file holding the payload, which is a door for a caller with no pipe, and the
// lane sends the payload itself on the call.
var laneFlagShells = map[string]bool{
	"work": true, "method": true, "stdin": true, "from": true,
	"template": true, "help": true, "h": true, "manifest": true,
}

// THE RENAMES. The lane says the same thing under its own name, and the star
// holds for every tool.
var laneFlagRenamed = map[string]map[string]string{
	"*":         {"by": "actor"},
	"se_said":   {"text": "said"},
	"se_answer": {"text": "answer"},
}

// THE LANE SPEAKS AS ITSELF on the record verbs, so the actor is the engine's
// to fill in rather than a field a caller sends.
var laneFlagSpeaksAsItself = map[string]bool{"se_said": true, "se_answer": true}

// THE TOOLS THAT WRAP A VERB UNDER ANOTHER NAME. Everything else finds its verb
// by name. A tool named unlike its verb once fell out of the reading in
// silence: the status tool wraps state, and state's flags were held to nothing
// at all.
var laneFlagWraps = map[string]string{"se_status": "state"}

// WHAT THE LANE ANSWERS WHATEVER THE CALLER SAYS. The --json flag of state
// chooses the structure over the screen, and a lane call is answered the
// structure either way, so there is no field for a caller to send.
var laneFlagAlwaysAnswered = map[string]map[string]bool{
	"se_status": {"json": true},
}

// laneFlagIsAVerbFile says whether this write is engine source. A test file
// declares flag sets of its own that no tool wraps, so it is left alone.
func laneFlagIsAVerbFile(rel string) bool {
	at := strings.TrimPrefix(strings.ReplaceAll(rel, "\\", "/"), "./")
	if !strings.HasPrefix(at, "src/engine/") || !strings.HasSuffix(at, ".go") {
		return false
	}
	return !strings.HasSuffix(at, "_test.go")
}

// laneFlagToolFor answers the tool that wraps a verb: the one named in the
// wraps table, or the verb under the lane's prefix.
func laneFlagToolFor(verb string) string {
	for tool, wrapped := range laneFlagWraps {
		if wrapped == verb {
			return tool
		}
	}
	return "se_" + verb
}

// laneFlagFieldFor answers the field a flag is sent under: the tool's own
// rename, then the rename every tool shares, then the flag itself, with the
// dash a flag carries written the way a field is.
func laneFlagFieldFor(tool, flag string) string {
	said := flag
	if mine, ok := laneFlagRenamed[tool][flag]; ok {
		said = mine
	} else if shared, ok := laneFlagRenamed["*"][flag]; ok {
		said = shared
	}
	return strings.ReplaceAll(said, "-", "_")
}

// laneFlagOwnDoors answers the flags that open a door of their own, and the
// companions that travel with one. The verb's own help says which is which: a
// door opens "instead of minting", and a companion opens "with <door>:".
func laneFlagOwnDoors(flags []laneFlagDeclared) map[string]bool {
	doors := map[string]bool{}
	for _, one := range flags {
		if strings.HasPrefix(one.help, "instead of minting") {
			doors[one.name] = true
		}
	}
	skip := map[string]bool{}
	for name := range doors {
		skip[name] = true
	}
	for _, one := range flags {
		rest, ok := strings.CutPrefix(one.help, "with ")
		if !ok {
			continue
		}
		at := strings.IndexByte(rest, ':')
		if at < 0 {
			continue
		}
		for _, named := range strings.Split(rest[:at], " and ") {
			if doors[strings.TrimSpace(named)] {
				skip[one.name] = true
			}
		}
	}
	return skip
}

// laneFlagDeclared is one flag as the verb declares it, with what its help says
// of itself, because the help is what tells a door from an ordinary flag.
type laneFlagDeclared struct {
	name string
	help string
}

// laneFlagSet is one verb and the flags declared for it in this write.
type laneFlagSet struct {
	verb  string
	flags []laneFlagDeclared
}

// laneFlagSetsIn reads the flag sets this file opens and the flags declared
// under each. A set runs from where it is opened to the next set in the file,
// which is how the verbs are written.
func laneFlagSetsIn(text string) []laneFlagSet {
	const opens = "flag.NewFlagSet(\""
	var at []int
	var verbs []string
	from := 0
	for {
		found := strings.Index(text[from:], opens)
		if found < 0 {
			break
		}
		start := from + found + len(opens)
		shut := strings.IndexByte(text[start:], '"')
		if shut < 0 {
			break
		}
		verbs = append(verbs, text[start:start+shut])
		at = append(at, start+shut)
		from = start + shut
	}
	var out []laneFlagSet
	for i, verb := range verbs {
		to := len(text)
		if i+1 < len(at) {
			to = at[i+1]
		}
		out = append(out, laneFlagSet{verb: verb, flags: laneFlagDeclarations(text[at[i]:to])})
	}
	return out
}

// WHERE THE NAME AND THE HELP SIT IN EACH DECLARATION. The method is what says
// it: the value forms take the name first, the Var forms take the pointer first
// and the name after it, and the func forms take the help straight after the
// name. This table is why fs.StringVar is as visible here as fs.String.
var laneFlagWhere = map[string][2]int{
	"String": {0, 2}, "Bool": {0, 2}, "Int": {0, 2}, "Int64": {0, 2},
	"Uint": {0, 2}, "Uint64": {0, 2}, "Float64": {0, 2}, "Duration": {0, 2},
	"StringVar": {1, 3}, "BoolVar": {1, 3}, "IntVar": {1, 3}, "Int64Var": {1, 3},
	"UintVar": {1, 3}, "Uint64Var": {1, 3}, "Float64Var": {1, 3},
	"DurationVar": {1, 3}, "TextVar": {1, 3},
	"Var": {1, 2}, "Func": {0, 1}, "BoolFunc": {0, 1},
}

// laneFlagDeclarations reads every flag one region declares, whatever method
// declared it.
func laneFlagDeclarations(region string) []laneFlagDeclared {
	var out []laneFlagDeclared
	from := 0
	for {
		found := strings.Index(region[from:], "fs.")
		if found < 0 {
			return out
		}
		start := from + found + len("fs.")
		from = start
		open := strings.IndexByte(region[start:], '(')
		if open < 0 {
			return out
		}
		method := region[start : start+open]
		where, known := laneFlagWhere[method]
		if !known {
			continue
		}
		args := laneFlagArgs(region, start+open+1)
		if len(args) <= where[0] || len(args) <= where[1] {
			continue
		}
		name, ok := laneFlagLiteral(args[where[0]])
		if !ok || !laneFlagIsAName(name) {
			continue
		}
		help, _ := laneFlagLiteral(args[where[1]])
		out = append(out, laneFlagDeclared{name: name, help: help})
	}
}

// laneFlagArgs answers the arguments of the call whose open paren the caller
// has already passed, split where the commas of that call are and nowhere else,
// so a comma inside a string or inside a nested call stays where it belongs.
func laneFlagArgs(text string, from int) []string {
	var out []string
	depth := 0
	quote := byte(0)
	start := from
	for i := from; i < len(text); i++ {
		c := text[i]
		if quote != 0 {
			if c == '\\' && quote != '`' {
				i++
				continue
			}
			if c == quote {
				quote = 0
			}
			continue
		}
		switch c {
		case '"', '\'', '`':
			quote = c
		case '(', '[', '{':
			depth++
		case ')':
			if depth == 0 {
				return append(out, text[start:i])
			}
			depth--
		case ']', '}':
			depth--
		case ',':
			if depth == 0 {
				out = append(out, text[start:i])
				start = i + 1
			}
		}
	}
	return out
}

// laneFlagLiteral answers the string an argument opens with, or nothing when
// the argument is not written as a string. A help built out of pieces is read
// down to its first piece, which is where a door says it is one.
func laneFlagLiteral(arg string) (string, bool) {
	said := strings.TrimLeft(arg, " \t\r\n")
	if !strings.HasPrefix(said, "\"") {
		return "", false
	}
	for i := 1; i < len(said); i++ {
		if said[i] == '\\' {
			i++
			continue
		}
		if said[i] == '"' {
			read, err := strconv.Unquote(said[:i+1])
			if err != nil {
				return "", false
			}
			return read, true
		}
	}
	return "", false
}

// laneFlagIsAName says whether what was read is written the way a flag is, so a
// call that happens to take a string first is not read as a declaration.
func laneFlagIsAName(said string) bool {
	if said == "" {
		return false
	}
	for i := 0; i < len(said); i++ {
		c := said[i]
		fine := c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c == '-'
		if !fine {
			return false
		}
	}
	return true
}

// laneFlagAdvertised answers the fields each advertised tool takes, read off
// the generated list. The work root is asked first and the method after it, so
// a tree that carries the engine and the cage together is read once.
func laneFlagAdvertised(r Roots) map[string]map[string]bool {
	for _, root := range []string{r.Work, r.Method} {
		if root == "" {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(root, "src", "cage", "tools.json"))
		if err != nil {
			continue
		}
		var doc struct {
			Tools []struct {
				Name   string `json:"name"`
				Schema struct {
					Properties map[string]json.RawMessage `json:"properties"`
				} `json:"inputSchema"`
			} `json:"tools"`
		}
		if err := json.Unmarshal(raw, &doc); err != nil {
			continue
		}
		out := map[string]map[string]bool{}
		for _, tool := range doc.Tools {
			fields := map[string]bool{}
			for field := range tool.Schema.Properties {
				fields[field] = true
			}
			out[tool.Name] = fields
		}
		if len(out) > 0 {
			return out
		}
	}
	return nil
}
