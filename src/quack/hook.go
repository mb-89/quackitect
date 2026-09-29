// The hook verb: a Copilot hook's input off stdin, posted to the hooks door
// as the protocol reads it, with the old path's answer beside it in shadow.
// [[spec/tickets/copilot-meets-the-hooks-door]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/modules/hooks"
)

// The harness a Copilot post names, the prefix a Copilot event takes where the protocol names it no other way, the cap on stdin, and the span the post waits on the door. [[spec/tickets/copilot-meets-the-hooks-door]]
const (
	copilotHarness = "copilot"
	classicPrefix  = "classic."
	hookBodyCap    = 1 << 20
	hookWait       = 5 * time.Second
)

// The Copilot events the protocol names otherwise than classic.<event>. [[spec/design_output/model#the-hook-protocol]]
var copilotEvents = map[string]string{"PreToolUse": "tool.call"}

// The post a Copilot hook input makes: its event on the protocol, the session, the tool's last name and its input, and the runtime's answer as old. [[spec/tickets/copilot-meets-the-hooks-door]]
func copilotPost(event string, input map[string]any) hooks.Post {
	kind, ok := copilotEvents[event]
	if !ok {
		kind = classicPrefix + event
	}
	session := firstText(input, "session_id", "sessionId")
	e := map[string]any{"session_id": session}
	if tool := firstText(input, "tool_name", "toolName"); tool != "" {
		e["tool"] = tool[strings.LastIndex(tool, ".")+1:]
	}
	if args := argsOf(input); args != nil {
		e["input"] = args
	}
	return hooks.Post{Event: kind, Harness: copilotHarness, Session: session, E: e, Old: input["old"]}
}

func firstText(input map[string]any, keys ...string) string {
	for _, key := range keys {
		if text, ok := input[key].(string); ok && text != "" {
			return text
		}
	}
	return ""
}

// The tool's input, which Copilot's cloud sends as a JSON string. [[spec/tickets/copilot-meets-the-hooks-door]]
func argsOf(input map[string]any) any {
	args, ok := input["tool_input"]
	if !ok {
		args = input["toolArgs"]
	}
	if text, ok := args.(string); ok {
		var parsed any
		if json.Unmarshal([]byte(text), &parsed) == nil {
			return parsed
		}
	}
	return args
}

// Posts stdin to the hooks door the root's standing file names, and prints its answer. No door, a refusal or an input short of JSON prints nothing and exits 0, so the old path's answer stands. [[spec/tickets/copilot-meets-the-hooks-door]]
func hookVerb(root, event string, in io.Reader, out io.Writer) int {
	var input map[string]any
	if json.NewDecoder(io.LimitReader(in, hookBodyCap)).Decode(&input) != nil {
		return 0
	}
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(hooks.StandingFile)))
	if err != nil {
		return 0
	}
	var standing hooks.Standing
	if json.Unmarshal(text, &standing) != nil || standing.Port == 0 {
		return 0
	}
	body, err := json.Marshal(copilotPost(event, input))
	if err != nil {
		return 0
	}
	asked, err := http.NewRequest(http.MethodPost, fmt.Sprintf("http://127.0.0.1:%d/hook", standing.Port), bytes.NewReader(body))
	if err != nil {
		return 0
	}
	asked.Header.Set("Content-Type", "application/json")
	asked.Header.Set("Authorization", "Bearer "+standing.Token)
	said, err := (&http.Client{Timeout: hookWait}).Do(asked)
	if err != nil {
		return 0
	}
	defer said.Body.Close()
	if said.StatusCode == http.StatusOK {
		io.Copy(out, said.Body)
	}
	return 0
}
