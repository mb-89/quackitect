package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"os"
)

// THE STUB. It is the lane between an agent and an engine, and it is
// deliberately small.
//
// It holds no rules. Everything it is asked, it asks the engine, and what the
// engine answers is what the agent gets. Which engine it talks to is decided
// where engines are listed, not compiled in here.
//
// It speaks JSON-RPC over standard input and output, one message per line,
// which is what the harnesses start.

var (
	method = flag.String("method", "", "the method root (default: from the register)")
	work   = flag.String("work", "", "the folder being worked on (default: this one)")
)

type request struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type response struct {
	JSONRPC string  `json:"jsonrpc"`
	ID      any     `json:"id"`
	Result  any     `json:"result,omitempty"`
	Error   *rpcErr `json:"error,omitempty"`
}

type rpcErr struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func main() {
	flag.Parse()
	roots := findRoots()

	in := bufio.NewScanner(os.Stdin)
	in.Buffer(make([]byte, 0, 1<<20), 1<<24)
	out := json.NewEncoder(os.Stdout)

	for in.Scan() {
		line := in.Bytes()
		if len(line) == 0 {
			continue
		}
		var req request
		if err := json.Unmarshal(line, &req); err != nil {
			continue // a line that is not a message is not ours to complain about
		}
		// A notification has no id and takes no answer.
		if len(req.ID) == 0 {
			continue
		}
		var id any
		_ = json.Unmarshal(req.ID, &id) // an id that will not read is a notification, which has none

		switch req.Method {
		case "initialize":
			// The client's version is echoed back. Choosing one here is how a
			// stub stops working when a harness moves on.
			var p struct {
				ProtocolVersion string `json:"protocolVersion"`
			}
			_ = json.Unmarshal(req.Params, &p) // params that will not read are no params
			if p.ProtocolVersion == "" {
				p.ProtocolVersion = "2025-06-18"
			}
			reply(out, id, map[string]any{
				"protocolVersion": p.ProtocolVersion,
				"capabilities":    map[string]any{"tools": map[string]any{}},
				"serverInfo":      map[string]any{"name": "quackitect", "version": "0.1.0"},
			})
		case "tools/list":
			reply(out, id, map[string]any{"tools": tools()})
		case "tools/call":
			reply(out, id, call(roots, req.Params))
		case "ping":
			reply(out, id, map[string]any{})
		default:
			out.Encode(response{JSONRPC: "2.0", ID: id,
				Error: &rpcErr{Code: -32601, Message: "no such method: " + req.Method}})
		}
	}
}

func reply(out *json.Encoder, id any, result any) {
	_ = out.Encode(response{JSONRPC: "2.0", ID: id, Result: result}) // the pipe is shut, so there is nobody left to tell
}

// A blank line between paragraphs, written once so every description reads the
// same and none of them carries the escape.
const blankLine = "\n\n"

func tools() []map[string]any {
	// The lane's tools are declared where they are handled, so a tool and its
	// description never drift apart.
	return append(laneTools(), []map[string]any{
		{
			"name":        "se_status",
			"description": "What the engine knows: the two roots, the log it is writing, and the rules in force.",
			"inputSchema": map[string]any{"type": "object", "properties": map[string]any{}},
		},
		{
			"name": "se_answer",
			"description": "ANSWER THE PERSON, IN THE RECORD. One prompt, one answer, where they are " +
				"already looking." + blankLine +
				"Use it for every prompt they give you. Say what you would have said to them, in " +
				"full, and then carry on with the work you hold." + blankLine +
				"YOU DO NOT HAVE TO STOP TO BE HEARD. Answer, then keep working.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"answer": map[string]any{"type": "string",
						"description": "what you would have said to them. The whole answer, not a summary of it."},
				},
				"required": []string{"answer"},
			},
		},
		{
			"name": "se_said",
			// ONE RULE, SAID ONCE, IN BOTH PLACES AN AGENT READS IT.
			//
			// This said the opposite of the guidance it sits beside. Look in
			// the log first is a condition over a private log that an agent has
			// to evaluate before every recording and can forget, and the
			// guidance removed it. An agent reads both.
			//
			// The sentence in saidRule is the guidance's own, and a check in
			// this package holds the two together. What is written here around
			// it says what this layer knows and the guidance does not: which
			// message the engine has already copied.
			"description": "PUT WHAT THE PERSON SAID IN THE RECORD, WORD FOR WORD.\n\n" +
				"THE ENGINE COPIES A MID-TURN MESSAGE ON YOUR NEXT TOOL CALL. This is the " +
				"fallback, for a message it has not copied, and it refuses a repeat.\n\n" +
				"THEIR SENTENCE, NOT A SUMMARY OF IT. " + saidRule + "\n\n" +
				"A NOTE IS SOMETHING ELSE. A note is a work token, and se_work is what " +
				"mints one.",
			"inputSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"said": map[string]any{"type": "string",
						"description": "what they said, copied. Their words and nothing else."},
				},
				"required": []string{"said"},
			},
		},
	}...)
}

func call(roots roots, params json.RawMessage) map[string]any {
	var p struct {
		Name      string         `json:"name"`
		Arguments map[string]any `json:"arguments"`
	}
	_ = json.Unmarshal(params, &p) // params that will not read are no params

	switch p.Name {
	case "se_status":
		return text(status(roots))
	case "se_answer":
		msg, _ := p.Arguments["answer"].(string)
		if msg == "" {
			return text("Say what you would have said to them.")
		}
		if err := answered(roots, msg); err != nil {
			return text("It could not be recorded: " + err.Error())
		}
		return text("recorded")
	case "se_said":
		msg, _ := p.Arguments["said"].(string)
		if msg == "" {
			return text("Say what they said.")
		}
		if err := said(roots, msg); err != nil {
			return text("It could not be recorded: " + err.Error())
		}
		return text("recorded")
	case "se_ask":
		return text(askIndex(roots, p.Arguments))
	case "se_apply":
		return text(applyEdits(roots, p.Arguments))
	case "se_run":
		return text(runCommand(roots, p.Arguments))
	case "se_work":
		return text(mintWork(roots, p.Arguments))
	case "se_pull":
		return text(pull(roots, p.Arguments))
	case "se_stop":
		return text(stopClaim(roots, p.Arguments))
	}
	return text("No such tool: " + p.Name)
}

func text(s string) map[string]any {
	return map[string]any{"content": []map[string]any{{"type": "text", "text": s}}}
}
