// The tab's road to the index: the standing file names the door's port, a
// call posts one question, and a door standing nowhere gets started through
// the binary the way every caller starts one.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// The door's standing file, whose folder .claude/skills/level0/lib/folders.js owns and whose name door.go under src/index owns, spelled again here because a Go module imports neither. [[spec/design_output/index#the-door-owns-the-database]]
const IndexStandingAt = ".se/.runtime/index.json"

// The binary, whose folder .claude/skills/level0/lib/folders.js owns and whose name lib/index.js owns, spelled again here for the same reason. [[spec/design_output/index#the-door-owns-the-database]]
const indexBinAt = ".se/.runtime/bin/se-index"

// A call waits past the changes wait the door holds, so a held call answers before the client lets go. [[spec/design_output/index#the-index-fires-on-change]]
const indexCallWait = 40 * time.Second

// What the door takes and answers. [[spec/design_output/index#the-door-owns-the-database]]
type indexCall struct {
	Method string `json:"method"`
	Params any    `json:"params"`
	ID     int    `json:"id"`
}

type indexAnswer struct {
	Result json.RawMessage `json:"result"`
	Error  string          `json:"error"`
}

// [[spec/design_output/index#the-door-owns-the-database]]
func indexPort(root string) (int, error) {
	said, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(IndexStandingAt)))
	if err != nil {
		return 0, err
	}
	var standing struct {
		Port int `json:"port"`
	}
	if err := json.Unmarshal(said, &standing); err != nil {
		return 0, err
	}
	if standing.Port == 0 {
		return 0, errors.New("the standing file names no port")
	}
	return standing.Port, nil
}

// One question to the door. A door answering nowhere gets started once, and the question goes again. [[spec/design_output/index#a-door-comes-back]]
func askIndex(root, method string, params any) (json.RawMessage, error) {
	said, err := postIndex(root, method, params)
	if err == nil {
		return said, nil
	}
	if err := startIndex(root); err != nil {
		return nil, err
	}
	return postIndex(root, method, params)
}

func postIndex(root, method string, params any) (json.RawMessage, error) {
	port, err := indexPort(root)
	if err != nil {
		return nil, err
	}
	body, err := json.Marshal(indexCall{Method: method, Params: params, ID: 1})
	if err != nil {
		return nil, err
	}
	client := &http.Client{Timeout: indexCallWait}
	got, err := client.Post(fmt.Sprintf("http://127.0.0.1:%d/", port), "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer got.Body.Close()
	var out indexAnswer
	if err := json.NewDecoder(got.Body).Decode(&out); err != nil {
		return nil, err
	}
	if out.Error != "" {
		return nil, errors.New(out.Error)
	}
	return out.Result, nil
}
