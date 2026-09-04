package main

import (
	"bufio"
	"encoding/json"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"testing"
	"time"
)

// THE LANE ANSWERS BEFORE THERE IS ANYTHING BEHIND IT.
//
// MEASURED ON A CLOUD BOX, AND IT COST THE WHOLE SESSION. util/cage/mcp-lane.mjs
// ran the installer and then handed over, and a harness gives an MCP server
// thirty seconds to answer initialize. A fresh clone spent those thirty seconds
// compiling, the harness killed the spawn, and the session had no se_ tool at
// all. Every guard then refused every call and named a tool that was not there.
//
// THE WINDOW IS THE POINT AND THE BUILD IS NOT. So the installer here is a stub
// that sleeps, and it sleeps for longer than the harness would wait. A script
// that installs before it answers cannot pass this, on either platform.
func TestTheLaneAnswersWhileItIsStillBuilding(t *testing.T) {
	t.Parallel()
	started, said, in := aLaneOverATreeWithNothingBuilt(t, 40)
	defer in.Close()
	theFirstBreath(t, in)

	// THE HANDSHAKE IS ANSWERED OUT OF A FILE GIT CARRIES, so it takes about as
	// long as starting node. Ten seconds is loose enough for a loaded machine
	// and still a third of what the harness allows.
	hello := answerTo(t, said, 1, 10*time.Second)
	if took := time.Since(started); took > 10*time.Second {
		t.Fatalf("initialize took %s, and the harness allows thirty", took)
	}
	var greeting struct {
		ServerInfo struct{ Name string } `json:"serverInfo"`
	}
	if err := json.Unmarshal(hello, &greeting); err != nil || greeting.ServerInfo.Name == "" {
		t.Fatalf("the handshake answered nothing that names a server: %s", hello)
	}
}

// A HELD CALL IS A CALL THAT STILL HAPPENS, which is the whole difference
// between a slow door and no door. The list arrives before there is anything to
// list, and it is answered once there is.
func TestACallHeldWhileItBuildsIsAnsweredAfter(t *testing.T) {
	t.Parallel()
	_, said, in := aLaneOverATreeWithNothingBuilt(t, 2)
	defer in.Close()
	theFirstBreath(t, in)

	var listed struct {
		Tools []struct{ Name string } `json:"tools"`
	}
	if err := json.Unmarshal(answerTo(t, said, 2, 60*time.Second), &listed); err != nil {
		t.Fatal(err)
	}
	if len(listed.Tools) == 0 {
		t.Fatal("the lane came up and listed no tool")
	}
}

// theFirstBreath is everything a harness says at once when it opens a lane: the
// handshake, the notification that follows it, and the list.
func theFirstBreath(t *testing.T, in io.Writer) {
	t.Helper()
	for _, msg := range []string{
		`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}`,
		`{"jsonrpc":"2.0","method":"notifications/initialized"}`,
		`{"jsonrpc":"2.0","id":2,"method":"tools/list"}`,
	} {
		if _, err := io.WriteString(in, msg+"\n"); err != nil {
			t.Fatal(err)
		}
	}
}

// aLaneOverATreeWithNothingBuilt starts the committed script over a clone that
// carries no .bin, with an installer that takes the given seconds to deliver
// one. It answers when it started, what the lane says, and where to say things
// to it.
func aLaneOverATreeWithNothingBuilt(t *testing.T, seconds int) (time.Time, <-chan []byte, io.WriteCloser) {
	t.Helper()
	if _, err := exec.LookPath("node"); err != nil {
		t.Skip("no node on this machine, and the lane is started by node")
	}
	root := t.TempDir()
	script := aTreeWithNothingBuilt(t, root, seconds)

	started := time.Now()
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
		_ = lane.Process.Kill()
		_ = lane.Wait()
	})
	return started, everythingItSays(out), in
}

// aTreeWithNothingBuilt is a clone as a cloud box meets one: the committed
// script, an installer that takes its time, and no .bin at all. It answers the
// path to the script.
func aTreeWithNothingBuilt(t *testing.T, root string, seconds int) string {
	t.Helper()
	for _, dir := range []string{"util/cage", "util/setup", ".bin"} {
		if err := os.MkdirAll(filepath.Join(root, filepath.FromSlash(dir)), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	script := filepath.Join(root, "util", "cage", "mcp-lane.mjs")
	copyOver(t, filepath.Join("..", "..", "util", "cage", "mcp-lane.mjs"), script)

	// A REAL LANE IS WHAT THE STUB DELIVERS, because a fixture handing back a
	// program that cannot speak the protocol is checking the wait and not the
	// handover. It is built here rather than shared, because this one has to end
	// up in a place the script chooses. src/mcp is its own module, so the build
	// runs in it rather than naming it from here.
	held := filepath.Join(t.TempDir(), exeName("se-mcp"))
	building := exec.Command("go", "build", "-o", held, ".")
	building.Dir = filepath.Join("..", "mcp")
	if out, err := building.CombinedOutput(); err != nil {
		t.Fatalf("the tool lane will not build: %v\n%s", err, out)
	}

	name := "install.sh"
	if runtime.GOOS == "windows" {
		name = "install.ps1"
	}
	if err := os.WriteFile(filepath.Join(root, "util", "setup", name),
		[]byte(theStubInstaller(root, held, seconds)), 0o755); err != nil {
		t.Fatal(err)
	}
	return script
}

// theStubInstaller sleeps, puts a real lane where the script looks for one, and
// leaves an engine beside it.
//
// THE ENGINE IS A FILE AND NOT A PROGRAM HERE. The script only asks whether it
// is there, to decide whether a call has anything to reach.
func theStubInstaller(root, lane string, seconds int) string {
	bin := filepath.Join(root, ".bin")
	if runtime.GOOS == "windows" {
		return "Start-Sleep -Seconds " + strconv.Itoa(seconds) + "\r\n" +
			"Copy-Item -LiteralPath '" + lane + "' -Destination '" + filepath.Join(bin, "se-mcp.exe") + "'\r\n" +
			"New-Item -ItemType File -Path '" + filepath.Join(bin, "se.exe") + "' -Force | Out-Null\r\n"
	}
	return "#!/bin/sh\nsleep " + strconv.Itoa(seconds) + "\n" +
		"cp '" + lane + "' '" + filepath.Join(bin, "se-mcp") + "'\n" +
		": > '" + filepath.Join(bin, "se") + "'\n"
}

func copyOver(t *testing.T, from, to string) {
	t.Helper()
	b, err := os.ReadFile(from)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(to, b, 0o644); err != nil {
		t.Fatal(err)
	}
}

// everythingItSays reads the lane's answers off its output, one message a line,
// so a test can wait for the one it asked for and not for the one before it.
func everythingItSays(out io.Reader) <-chan []byte {
	said := make(chan []byte, 16)
	go func() {
		defer close(said)
		lines := bufio.NewScanner(out)
		lines.Buffer(make([]byte, 0, 1<<16), 1<<22)
		for lines.Scan() {
			b := make([]byte, len(lines.Bytes()))
			copy(b, lines.Bytes())
			said <- b
		}
	}()
	return said
}

// answerTo waits for the answer to one request and answers its result.
func answerTo(t *testing.T, said <-chan []byte, id int, within time.Duration) []byte {
	t.Helper()
	deadline := time.After(within)
	for {
		select {
		case line, ok := <-said:
			if !ok {
				t.Fatalf("the lane stopped talking before it answered %d", id)
			}
			var msg struct {
				ID     *int            `json:"id"`
				Result json.RawMessage `json:"result"`
				Error  json.RawMessage `json:"error"`
			}
			if json.Unmarshal(line, &msg) != nil || msg.ID == nil || *msg.ID != id {
				continue // a notification, or somebody else's answer
			}
			if len(msg.Error) > 0 {
				t.Fatalf("%d was refused: %s", id, msg.Error)
			}
			return msg.Result
		case <-deadline:
			t.Fatalf("nothing answered %d within %s", id, within)
			return nil
		}
	}
}
