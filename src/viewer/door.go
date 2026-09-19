// The window's door. The window listens on its own port so a second launch
// reaches the first, hands it a tab and ends. The door reads one shape both
// ways, so the window sends to another port with the same words it takes.
// A port already held means a window already stands, and the caller says so.
// [[spec/design_output/viewer#a-second-launch-hands-over]]

package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"
)

// The port the window holds, one below the bridge's, where the register hands out none, and the wait a call takes. [[spec/design_output/viewer#a-second-launch-hands-over]]
const (
	windowPort = 6509
	callWait   = 500 * time.Millisecond
)

// What the door carries, in both directions. [[spec/design_output/viewer#a-second-launch-hands-over]]
type said struct {
	Tab string `json:"tab"`
}

// The arrival a taken call puts into the window. [[spec/design_output/viewer#a-second-launch-hands-over]]
type tabMsg struct{ name string }

// Opens the door, and answers the server so the caller closes it. A port already held answers an error, which says a window already stands. [[spec/design_output/viewer#a-second-launch-hands-over]]
func openDoor(port int, take func(tea any)) (*http.Server, error) {
	at, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		return nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/tab", func(w http.ResponseWriter, r *http.Request) {
		var one said
		if err := json.NewDecoder(r.Body).Decode(&one); err != nil {
			http.Error(w, "the body reads as no tab", http.StatusBadRequest)
			return
		}
		take(tabMsg{name: one.Tab})
		w.Header().Set("content-type", "application/json")
		fmt.Fprint(w, `{"ok":true}`)
	})
	server := &http.Server{Handler: mux, ReadHeaderTimeout: callWait}
	go func() { _ = server.Serve(at) }()
	return server, nil
}

// Hands a tab to whatever stands on that port, and answers whether it took it. [[spec/design_output/viewer#a-second-launch-hands-over]]
func tellPort(port int, tab string) bool {
	body, err := json.Marshal(said{Tab: tab})
	if err != nil {
		return false
	}
	ctx, stop := context.WithTimeout(context.Background(), callWait)
	defer stop()
	where := fmt.Sprintf("http://127.0.0.1:%d/tab", port)
	call, err := http.NewRequestWithContext(ctx, http.MethodPost, where, bytes.NewReader(body))
	if err != nil {
		return false
	}
	call.Header.Set("content-type", "application/json")
	answer, err := http.DefaultClient.Do(call)
	if err != nil {
		return false
	}
	defer answer.Body.Close()
	return answer.StatusCode == http.StatusOK
}

// The tab of that name, counted from 1, and 0 where the window holds none. [[spec/design_output/viewer#a-tab-the-caller-names]]
func (m model) tabNamed(name string) int {
	for at, one := range m.tabs {
		if one.Name() == name {
			return at + 1
		}
	}
	return 0
}
