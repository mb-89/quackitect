// The port beside the editor's pipe. While the editor speaks to this server, a
// caller on the box reads the list the panel holds, and the pointer file says
// where the port stands.
// [[spec/design_output/lsp#a-port-serves-the-list]]
package main

import (
	"encoding/json"
	"net"
	"net/http"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	findingsRoute = "/findings"
	// The longest an answer waits for the runs to land, which a whole sweep of Vale stays inside. [[spec/design_output/lsp#a-port-serves-the-list]]
	settleWait = 3 * time.Minute
	settlePoll = 20 * time.Millisecond
)

// Where the port stands, the shape vehicle.json gives the bridge's. [[spec/design_output/lsp#a-port-serves-the-list]]
type Pointer struct {
	Port int    `json:"port"`
	Pid  int    `json:"pid"`
	Root string `json:"root"`
}

// What the port answers. [[spec/design_output/lsp#a-port-serves-the-list]]
type Listing struct {
	OK      bool      `json:"ok"`
	Settled bool      `json:"settled"`
	Open    []string  `json:"open"`
	Found   []Finding `json:"found"`
}

// The runtime folder .claude/skills/level0/lib/folders.js owns, spelled again here because a Go module imports no JavaScript. [[spec/design_input/the-runtime-files-stand-apart]]
func pointerPath(root string) string {
	return filepath.Join(root, ".se", ".runtime", "panel.json") // .claude/skills/level0/lib/folders.js owns the folder
}

// Listens on the loopback address and writes the pointer. The answer closes the port and drops the pointer, once however often it runs. [[spec/design_output/lsp#a-port-serves-the-list]]
func (one *server) listens(root string) (func(), error) {
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc(findingsRoute, one.answersFindings)
	served := &http.Server{Handler: mux, ReadHeaderTimeout: headerWait}
	go served.Serve(listen)

	said := Pointer{Port: listen.Addr().(*net.TCPAddr).Port, Pid: pidOf(), Root: root}
	var once sync.Once
	drops := func() {
		once.Do(func() {
			served.Close()
			dropsPointer(root, said.Pid)
		})
	}
	text, err := json.Marshal(said)
	if err == nil {
		err = makeDir(filepath.Dir(pointerPath(root)), folderMode)
	}
	if err == nil {
		err = writeFile(pointerPath(root), append(text, '\n'), fileMode)
	}
	if err != nil {
		drops()
		return nil, err
	}
	return drops, nil
}

// The pointer goes where it still names this process, so a second editor's server keeps its own. [[spec/design_output/lsp#a-port-serves-the-list]]
func dropsPointer(root string, pid int) {
	text, err := readFile(pointerPath(root))
	if err != nil {
		return
	}
	var said Pointer
	if json.Unmarshal(text, &said) == nil && said.Pid == pid {
		removeFile(pointerPath(root))
	}
}

// GET /findings answers the list the panel holds, once the runs land, kept to the paths the query names. [[spec/design_output/lsp#a-port-serves-the-list]]
func (one *server) answersFindings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "the route answers GET alone", http.StatusMethodNotAllowed)
		return
	}
	settled := one.waitsSettled(settleWait)
	found, open := one.listing(r.URL.Query()["path"])
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Listing{OK: true, Settled: settled, Open: open, Found: found})
}

// Whether the runs land inside the span. [[spec/design_output/lsp#a-port-serves-the-list]]
func (one *server) waitsSettled(span time.Duration) bool {
	until := time.Now().Add(span)
	for !one.settled() {
		if time.Now().After(until) {
			return false
		}
		time.Sleep(settlePoll)
	}
	return true
}

// Every row the panel holds on a path the query keeps, in order, and the paths an editor holds open. [[spec/design_output/lsp#a-port-serves-the-list]]
func (one *server) listing(asked []string) ([]Finding, []string) {
	tree := one.checker.Tree()
	prefixes := []string{}
	for _, path := range asked {
		at := strings.Trim(relativeTo(tree.Root, path), "/")
		if at == "" || at == "." {
			prefixes = nil
			break
		}
		prefixes = append(prefixes, at)
	}
	one.guard.Lock()
	defer one.guard.Unlock()
	found := []Finding{}
	for path := range one.panel.paths() {
		if keeps(prefixes, path) {
			found = append(found, one.rowsOf(tree, path)...)
		}
	}
	open := []string{}
	for path := range one.panel.open {
		if keeps(prefixes, path) {
			open = append(open, path)
		}
	}
	sort.Strings(open)
	return sorted(found), open
}

// Whether a path stands on a file the query names or under a folder it names, and every path where it names none. [[spec/design_output/lsp#a-port-serves-the-list]]
func keeps(prefixes []string, path string) bool {
	if len(prefixes) == 0 {
		return true
	}
	for _, at := range prefixes {
		if path == at || strings.HasPrefix(path, at+"/") {
			return true
		}
	}
	return false
}
