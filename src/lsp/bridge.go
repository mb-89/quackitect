// The battery's findings past this server's own rules, asked of the bridge.
// The bridge runs the rules written in JavaScript and restarts when their code
// moves, so the problems panel reads the same list the check reads.
// [[spec/design_output/lsp]]
package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

// The route and the port, owned by src/bridge/findings.js, .claude/skills/level0/lib/vehicle.js and the runtime folder of folders.js, and spelled again here because a Go module imports no JavaScript. [[spec/design_output/lsp]]
const (
	findingsRoute = "/findings"
	// The runtime folder folders.js owns, spelled again here because a Go module imports no JavaScript. [[spec/design_input/the-runtime-files-stand-apart]]
	pointerAt = ".se/.runtime/vehicle.json"
	portBase  = 6510
	// A sweep over the whole tree runs Vale over every note, so the wait stands long. [[spec/design_output/lsp]]
	bridgeWait = 3 * time.Minute
	// The pause between two asks while no bridge answers yet, so the panel fills once one stands. [[spec/design_output/lsp#the-panel-reads-the-battery]]
	bridgeRetry = 5 * time.Second
	// The pause after the last change before the bridge reads the buffer, so a burst of typing costs one ask. [[spec/design_output/lsp#the-panel-lints-as-typed]]
	lintQuiet = time.Second
)

// The source a finding comes from, so an open file leaves Biome to its own server. [[spec/design_output/lsp]]
const (
	fromVale  = "vale"
	fromBiome = "biome"
)

type bridgeAnswer struct {
	OK    bool      `json:"ok"`
	Found []Finding `json:"found"`
	Fault string    `json:"fault"`
}

// Asks the bridge for the findings over the paths named, or the whole tree for none, and answers false where no bridge answers. [[spec/design_output/lsp]]
func bridgeFindings(root string, paths []string) ([]Finding, bool) {
	query := url.Values{}
	for _, one := range paths {
		query.Add("path", one)
	}
	where := "http://127.0.0.1:" + strconv.Itoa(portOf(root)) + findingsRoute
	if len(paths) > 0 {
		where += "?" + query.Encode()
	}

	client := http.Client{Timeout: bridgeWait}
	answer, err := client.Get(where)
	if err != nil {
		return nil, false
	}
	defer answer.Body.Close()
	return decoded(answer.Body)
}

// Asks the bridge over the buffers the editor holds, as they stand, and answers false where no bridge answers. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func bridgeHeld(root string, held map[string]string) ([]Finding, bool) {
	list := []map[string]string{}
	for path, text := range held {
		list = append(list, map[string]string{"path": path, "text": text})
	}
	body, err := json.Marshal(map[string]any{"held": list})
	if err != nil {
		return nil, false
	}
	where := "http://127.0.0.1:" + strconv.Itoa(portOf(root)) + findingsRoute
	client := http.Client{Timeout: bridgeWait}
	answer, err := client.Post(where, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, false
	}
	defer answer.Body.Close()
	return decoded(answer.Body)
}

func decoded(body io.Reader) ([]Finding, bool) {
	var said bridgeAnswer
	if err := json.NewDecoder(body).Decode(&said); err != nil || !said.OK {
		return nil, false
	}
	return said.Found, true
}

func portOf(root string) int {
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(pointerAt)))
	if err != nil {
		return portBase
	}
	var said struct {
		Port int `json:"port"`
	}
	if json.Unmarshal(text, &said) != nil || said.Port == 0 {
		return portBase
	}
	return said.Port
}
