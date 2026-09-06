package main

import (
	"encoding/json"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"
)

// THE TOOL LIST FOLLOWS THE BUILD.
//
// A cloud box pulled a commit that added a tool, rebuilt, and was still told
// there was no such tool. tools() is compiled into the lane, so a lane that is
// running cannot serve a list it does not carry, and the list a session opened
// with was the list it died with. Restarting the whole session was the only
// way out, which on a cloud box means losing everything the session knew.
//
// AND THE ORDINARY BOX WAS THE ONE THAT COULD NOT BE REPAIRED. util/cage/
// mcp-lane.mjs supervised a cold clone and handed a built tree straight over
// with stdio inherited, so on the common path nothing was left between the
// client and the lane to notice the program had moved.
//
// SO THE LANE IS SUPERVISED ON BOTH PATHS NOW, and this drives the one that was
// not. A built tree is started, spoken to, and then the lane on disk is
// replaced. What has to hold: the client is told the list changed, and the list
// it gets after that is the new program's and not the old one's.
func TestANewLaneOnDiskRefreshesTheToolList(t *testing.T) {
	t.Parallel()
	if _, err := exec.LookPath("node"); err != nil {
		t.Skip("no node on this machine, and the lane is started by node")
	}
	root := t.TempDir()
	bin := filepath.Join(root, ".bin")
	for _, dir := range []string{"util/cage", "util/setup", ".bin"} {
		if err := os.MkdirAll(filepath.Join(root, filepath.FromSlash(dir)), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	script := filepath.Join(root, "util", "cage", "mcp-lane.mjs")
	copyOver(t, filepath.Join("..", "..", "util", "cage", "mcp-lane.mjs"), script)

	// A BUILT TREE IS A LANE AND AN ENGINE BESIDE IT. The engine is a file and
	// not a program: the script only asks whether it is there.
	laneExe := filepath.Join(bin, exeName("se-mcp"))
	building := exec.Command("go", "build", "-o", laneExe, ".")
	building.Dir = filepath.Join("..", "mcp")
	if out, err := building.CombinedOutput(); err != nil {
		t.Fatalf("the tool lane will not build: %v\n%s", err, out)
	}
	if err := os.WriteFile(filepath.Join(bin, exeName("se")), []byte("an engine"), 0o755); err != nil {
		t.Fatal(err)
	}

	// THE SECOND LANE IS BUILT BEFORE THE FIRST IS STARTED, so replacing the
	// file later is a copy and not a compile. It lists one tool nothing else
	// lists, which is how the list that comes back is known to be its own.
	second := aLaneThatListsOneTool(t)

	lane := exec.Command("node", script, "--method", root, "--work", root)
	in, err := lane.StdinPipe()
	if err != nil {
		t.Fatal(err)
	}
	out, err := lane.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	lane.Stderr = os.Stderr
	if err := lane.Start(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		_ = in.Close()
		_ = lane.Process.Kill()
		_ = lane.Wait()
	})
	heard := everythingItKeeps(out, in)

	theFirstBreath(t, in)
	first := heard.list(t, 2, 60*time.Second)
	if len(first) == 0 {
		t.Fatal("the lane came up over a built tree and listed no tool")
	}
	if lists(first, "the_second_lane") {
		t.Fatalf("the first lane already lists the second lane's tool: %v", first)
	}
	saidSoFar := heard.notifications("notifications/tools/list_changed")

	// THE BUILD. On a real box this is the installer writing over .bin/se-mcp
	// after a pull. Here it is the same write, with a program whose list differs
	// so the answer says which of the two replied.
	theLaneOnDiskBecomes(t, laneExe, second)

	// THE SIGNAL. The client is told the list moved. One was sent when the lane
	// first came up, so this waits for one after that.
	heard.until(t, func() bool {
		return heard.notifications("notifications/tools/list_changed") > saidSoFar
	}, 30*time.Second, "a tools/list_changed after the lane on disk changed")

	// AND THE LIST IS THE NEW ONE. A signal nobody can act on is the same stale
	// list with more code in front of it, so the list is asked for again.
	after := heard.list(t, 3, 30*time.Second)
	if !lists(after, "the_second_lane") {
		t.Fatalf("after the restart the list is still the old lane's: %v", after)
	}
}

// aLaneThatListsOneTool builds a program that speaks just enough of the
// protocol to be a lane, and lists one tool by a name nothing else uses.
func aLaneThatListsOneTool(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte("module secondlane\n\ngo 1.27\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(theSecondLane), 0o644); err != nil {
		t.Fatal(err)
	}
	exe := filepath.Join(dir, exeName("second-lane"))
	building := exec.Command("go", "build", "-o", exe, ".")
	building.Dir = dir
	if out, err := building.CombinedOutput(); err != nil {
		t.Fatalf("the second lane will not build: %v\n%s", err, out)
	}
	return exe
}

// theSecondLane answers initialize, tools/list and anything else, one message a
// line. It is a stand-in for a rebuilt lane, and the only thing that matters
// about it is that its list is not the real one's.
const theSecondLane = `package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewScanner(os.Stdin)
	in.Buffer(make([]byte, 0, 1<<20), 1<<24)
	for in.Scan() {
		var req struct {
			ID     json.RawMessage ` + "`json:\"id\"`" + `
			Method string          ` + "`json:\"method\"`" + `
		}
		if json.Unmarshal(in.Bytes(), &req) != nil || len(req.ID) == 0 {
			continue
		}
		var result any = map[string]any{}
		switch req.Method {
		case "initialize":
			result = map[string]any{
				"protocolVersion": "2025-06-18",
				"capabilities":    map[string]any{"tools": map[string]any{"listChanged": true}},
				"serverInfo":      map[string]any{"name": "quackitect", "version": "second"},
			}
		case "tools/list":
			result = map[string]any{"tools": []any{map[string]any{
				"name":        "the_second_lane",
				"description": "only a rebuilt lane lists this",
				"inputSchema": map[string]any{"type": "object"},
			}}}
		}
		b, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": req.ID, "result": result})
		fmt.Println(string(b))
	}
}
`

// theLaneOnDiskBecomes writes one program over another, the way an installer
// does after a pull.
//
// A RUNNING PROGRAM CANNOT BE OVERWRITTEN ON WINDOWS, so the old one is moved
// aside first and the new one put in its place. That is what the installer
// would have to do there too, and on Linux the plain write is the same thing.
func theLaneOnDiskBecomes(t *testing.T, path, become string) {
	t.Helper()
	b, err := os.ReadFile(become)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(path, path+".was"); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, b, 0o755); err != nil {
		t.Fatal(err)
	}
}

func lists(names []string, want string) bool {
	for _, n := range names {
		if n == want {
			return true
		}
	}
	return false
}

// kept is everything the lane has said, held rather than consumed.
//
// answerTo in lanestarts_test.go drops every line that is not the answer it
// waits for, which loses the notifications this test is about. This keeps them
// all and reads back over them.
type kept struct {
	mu    sync.Mutex
	lines [][]byte
	in    io.Writer // where to say the next thing
}

func everythingItKeeps(out io.Reader, in io.Writer) *kept {
	k := &kept{in: in}
	go func() {
		for line := range everythingItSays(out) {
			k.mu.Lock()
			k.lines = append(k.lines, line)
			k.mu.Unlock()
		}
	}()
	return k
}

func (k *kept) each(look func(line []byte)) {
	k.mu.Lock()
	defer k.mu.Unlock()
	for _, line := range k.lines {
		look(line)
	}
}

// notifications counts what has been said with this method and no id.
func (k *kept) notifications(method string) int {
	n := 0
	k.each(func(line []byte) {
		var msg struct {
			ID     json.RawMessage `json:"id"`
			Method string          `json:"method"`
		}
		if json.Unmarshal(line, &msg) == nil && len(msg.ID) == 0 && msg.Method == method {
			n++
		}
	})
	return n
}

// answer reads back the result of one request, or nil if it has not come.
func (k *kept) answer(id int) json.RawMessage {
	var found json.RawMessage
	k.each(func(line []byte) {
		var msg struct {
			ID     *int            `json:"id"`
			Result json.RawMessage `json:"result"`
		}
		if json.Unmarshal(line, &msg) == nil && msg.ID != nil && *msg.ID == id {
			found = msg.Result
		}
	})
	return found
}

// list asks for the tools under a fresh id and answers the names it gets.
func (k *kept) list(t *testing.T, id int, within time.Duration) []string {
	t.Helper()
	k.ask(t, id, `{"jsonrpc":"2.0","id":`+strconv.Itoa(id)+`,"method":"tools/list"}`)
	k.until(t, func() bool { return k.answer(id) != nil }, within, "an answer to tools/list")
	var listed struct {
		Tools []struct{ Name string } `json:"tools"`
	}
	if err := json.Unmarshal(k.answer(id), &listed); err != nil {
		t.Fatal(err)
	}
	names := make([]string, 0, len(listed.Tools))
	for _, tool := range listed.Tools {
		names = append(names, tool.Name)
	}
	return names
}

func (k *kept) ask(t *testing.T, id int, msg string) {
	t.Helper()
	if k.in == nil {
		t.Fatal("nothing to say it to")
	}
	if _, err := io.WriteString(k.in, msg+"\n"); err != nil {
		t.Fatal(err)
	}
}

// until waits for something to become true, and says what it was waiting for.
func (k *kept) until(t *testing.T, holds func() bool, within time.Duration, what string) {
	t.Helper()
	deadline := time.Now().Add(within)
	for time.Now().Before(deadline) {
		if holds() {
			return
		}
		time.Sleep(50 * time.Millisecond)
	}
	// WHAT IT SAID, AND NOT EVERY BYTE OF IT. A tools/list answer is the whole
	// schema of every tool, and a failure that prints it buries itself.
	var said []string
	k.each(func(line []byte) {
		if len(line) > 200 {
			line = append(line[:200:200], []byte("...")...)
		}
		said = append(said, string(line))
	})
	t.Fatalf("waited %s for %s, and the lane said:\n%s", within, what, strings.Join(said, "\n"))
}
