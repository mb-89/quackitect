package main

import (
	"bufio"
	"encoding/json"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE SOCKET IS THE TRUTH, NOT THE RECORD. See askModelWithin.

// anEngineListening answers every question on the engine's own socket path
// under the work folder, and stops with the test.
func anEngineListening(t *testing.T, r roots) {
	t.Helper()
	if err := os.MkdirAll(filepath.Join(r.work, ".se"), 0o755); err != nil {
		t.Fatal(err)
	}
	ln, err := net.Listen("unix", theEngineSocket(r))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ln.Close() })
	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				return
			}
			go func() {
				defer conn.Close()
				in := bufio.NewScanner(conn)
				for in.Scan() {
					_ = json.NewEncoder(conn).Encode(map[string]any{"ok": true, "result": map[string]any{"pong": true}})
				}
			}()
		}
	}()
}

func TestARecordNamingNoSocketStillReachesTheEngine(t *testing.T) {
	for _, c := range []struct {
		name   string
		record bool
	}{
		{"a record naming no socket", true},

		// AND NO RECORD AT ALL, which is what a second engine leaves when it goes.
		{"no record at all", false},
	} {
		t.Run(c.name, func(t *testing.T) {
			r := roots{method: t.TempDir(), work: t.TempDir()}
			anEngineListening(t, r)
			if c.record {
				record := filepath.Join(r.work, ".se", "engine.json")
				if err := os.WriteFile(record, []byte("{\"pid\": 1}\n"), 0o644); err != nil {
					t.Fatal(err)
				}
			}
			if _, err := askModel(r, "ping", nil); err != nil {
				t.Fatalf("the call was answered %q, and an engine was listening on its own path", err)
			}
		})
	}
}

// ONE CASE, SO ONE FUNCTION. Nothing is listening and no record names a
// socket, and there is no second reading to sit beside it.
func TestNothingListeningIsNoEngine(t *testing.T) {
	r := roots{method: t.TempDir(), work: t.TempDir()}
	_, err := askModel(r, "ping", nil)
	if err == nil || !strings.Contains(err.Error(), "no engine is running over") {
		t.Fatalf("with nothing listening and no record the call answered %v, and it is no engine", err)
	}
}
