// The lsp IO module: an editor's buffers written to the index, and the check
// module's sweep drawn back as diagnostics, over a recorded session.
// [[spec/tickets/the-lsp-door-lands]]
package lsp

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The recording the replay drives, under the tree's root. [[spec/design_output/model#an-inbound-fake-replays]]
const recording = "../../../test/replay/lsp/one-session.jsonl"

// A sweep that behaves: an open buffer of spec/a.md carrying a dead pointer draws one finding on its line. [[spec/tickets/the-lsp-door-lands]]
func serverOver(t *testing.T) (*Server, *q.Store) {
	t.Helper()
	c := q.New()
	as := Registers(c)
	store := qtest.Over(t, c, as).Store()
	sweep := func() any {
		text, _ := store.Snapshot().Read("buffers/spec/a.md").(string)
		for i, line := range strings.Split(text, "\n") {
			if at := strings.Index(line, "[[spec/nowhere]]"); at >= 0 {
				return []Finding{{File: "spec/a.md", Rule: "EveryPointerResolves", Line: i + 1, Column: at + 1, Message: "The pointer names spec/nowhere, and nothing stands there.", Severity: "error"}}
			}
		}
		return []Finding{}
	}
	return New(Outside{Root: "/tree", Store: store, As: as, Bound: func(local string) string { return local }, Sweep: sweep}), store
}

func opened(uri, text string) []byte {
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "method": "textDocument/didOpen", "params": map[string]any{"textDocument": map[string]any{"uri": uri, "version": 1, "text": text}}})
	return body
}

func TestTheReplayAnswersTheRecordedSession(t *testing.T) {
	server, _ := serverOver(t)
	body, err := os.ReadFile(recording)
	if err != nil {
		t.Fatal(err)
	}
	missed, err := Replay(server, body)
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range missed {
		t.Errorf("line %d answers %s, and the recording wants %s", one.Line, one.Got, one.Want)
	}
}

func TestAnOpenBufferWritesItsName(t *testing.T) {
	server, store := serverOver(t)
	server.Handle(opened("file:///tree/spec/b.md", "# B\n"))
	if said := store.Snapshot().Read("buffers/spec/b.md"); said != "# B\n" {
		t.Fatalf("buffers/spec/b.md reads %#v, and wants the text the editor opens", said)
	}
}

func TestAClosedBufferDropsItsName(t *testing.T) {
	server, store := serverOver(t)
	server.Handle(opened("file:///tree/spec/b.md", "# B\n"))
	closed, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "method": "textDocument/didClose", "params": map[string]any{"textDocument": map[string]any{"uri": "file:///tree/spec/b.md"}}})
	server.Handle(closed)
	if said := store.Snapshot().Read("buffers/spec/b.md"); said != "" {
		t.Fatalf("buffers/spec/b.md reads %#v after the close, and wants nothing", said)
	}
}

// Dials the listener, sends the token line and one framed initialize, and answers the first reply frame's body, or nothing where the stream ends. [[spec/tickets/the-lsp-door-lands]]
func asks(t *testing.T, root, token string) string {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(StandingFile)))
	if err != nil {
		t.Fatalf("the standing file reads nothing: %v", err)
	}
	var at Standing
	if err := json.Unmarshal(body, &at); err != nil {
		t.Fatal(err)
	}
	if token == "" {
		token = at.Token
	}
	conn, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", at.Port))
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(5 * time.Second))
	asked := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`
	fmt.Fprintf(conn, "%s\nContent-Length: %d\r\n\r\n%s", token, len(asked), asked)
	read := bufio.NewReader(conn)
	length := 0
	for {
		line, err := read.ReadString('\n')
		if err != nil {
			return ""
		}
		line = strings.TrimSpace(line)
		if line == "" {
			break
		}
		fmt.Sscanf(line, "Content-Length: %d", &length)
	}
	reply := make([]byte, length)
	if _, err := read.Read(reply); err != nil {
		return ""
	}
	return string(reply)
}

func TestAConnectionWithoutTheTokenReadsNothing(t *testing.T) {
	server, _ := serverOver(t)
	root := t.TempDir()
	stop, err := Listen(root, server)
	if err != nil {
		t.Fatalf("the listener stands nowhere: %v", err)
	}
	defer stop()
	if said := asks(t, root, "not-the-token"); said != "" {
		t.Fatalf("a connection with the wrong token reads %s, and wants nothing", said)
	}
	if said := asks(t, root, ""); !strings.Contains(said, `"quackitect"`) {
		t.Fatalf("a connection with the token reads %q, and wants the initialize reply", said)
	}
}
