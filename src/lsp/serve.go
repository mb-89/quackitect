// The resident server on a loopback port. It writes where it stands into
// .se/lsp.json, the way the index door writes .se/index.json, so a second
// caller finds the first server and a stale file gives way.
// [[spec/design_output/lsp#the-port-and-the-standing-file]]
package main

import (
	"encoding/json"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Standing struct {
	Port  int    `json:"port"`
	Pid   int    `json:"pid"`
	Root  string `json:"root"`
	Stamp string `json:"stamp"`
}

type call struct {
	Method string          `json:"method"`
	Params json.RawMessage `json:"params"`
	ID     int             `json:"id"`
}

type answer struct {
	Result any    `json:"result,omitempty"`
	Error  string `json:"error,omitempty"`
	ID     int    `json:"id"`
}

type door struct {
	checker *Checker
	guard   sync.Mutex
}

func standingPath(root string) string {
	return filepath.Join(root, ".se", "lsp.json")
}

// [[spec/design_output/lsp#the-port-and-the-standing-file]]
func Serve(root string) (*http.Server, net.Listener, error) {
	one := &door{checker: checkerAt(root)}
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, nil, err
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", one.took)
	server := &http.Server{Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go server.Serve(listen)

	return server, listen, stands(root, listen)
}

func stands(root string, listen net.Listener) error {
	if err := os.MkdirAll(filepath.Dir(standingPath(root)), 0o755); err != nil {
		return err
	}
	said, err := json.Marshal(Standing{
		Port:  listen.Addr().(*net.TCPAddr).Port,
		Pid:   os.Getpid(),
		Root:  root,
		Stamp: stampHere(),
	})
	if err != nil {
		return err
	}
	return os.WriteFile(standingPath(root), append(said, '\n'), 0o644)
}

func (one *door) took(w http.ResponseWriter, r *http.Request) {
	var said call
	if err := json.NewDecoder(r.Body).Decode(&said); err != nil {
		writes(w, answer{Error: "the call reads as no JSON", ID: said.ID})
		return
	}

	one.guard.Lock()
	defer one.guard.Unlock()

	result, err := one.answers(said)
	if err != nil {
		writes(w, answer{Error: err.Error(), ID: said.ID})
		return
	}
	writes(w, answer{Result: result, ID: said.ID})
}

func (one *door) answers(said call) (any, error) {
	var asked struct {
		Path string `json:"path"`
	}
	if len(said.Params) > 0 {
		json.Unmarshal(said.Params, &asked)
	}

	switch strings.ToLower(said.Method) {
	case "check":
		if asked.Path == "" {
			return one.checker.Sweep(), nil
		}
		return one.checker.Over(asked.Path), nil
	case "sweep":
		return one.checker.Sweep(), nil
	case "standing":
		return map[string]any{
			"root":    one.checker.Tree().Root,
			"version": Version,
			"words":   one.checker.Tree().Words,
		}, nil
	case "stop":
		go stopsSoon(one.checker.Tree().Root)
		return map[string]string{"stopping": one.checker.Tree().Root}, nil
	}
	return nil, errorOf("no method called " + said.Method)
}

// [[spec/design_output/lsp#the-port-and-the-standing-file]]
func stampHere() string {
	self, err := os.Executable()
	if err != nil {
		return ""
	}
	said, err := os.Stat(self)
	if err != nil {
		return ""
	}
	return said.ModTime().UTC().Format(time.RFC3339Nano) + ":" + strconv.FormatInt(said.Size(), 10)
}

func stopsSoon(root string) {
	time.Sleep(100 * time.Millisecond)
	os.Remove(standingPath(root))
	os.Exit(0)
}

func writes(w http.ResponseWriter, said answer) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(said)
}
