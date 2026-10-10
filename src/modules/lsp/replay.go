// The inbound fake of the lsp IO module: a recorded session driven through
// the server, one message a line, each reply set compared with the recording.
// [[spec/design_output/model#an-inbound-fake-replays]]
package lsp

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"reflect"
)

// One line of a recording whose replies differ from the server's. [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// One line of a recording: a message as the editor sends it, and the replies the server gives. [[spec/design_output/model#an-inbound-fake-replays]]
type recorded struct {
	Message json.RawMessage   `json:"message"`
	Replies []json.RawMessage `json:"replies"`
}

// The inbound fake: it drives the server off a recording, one message a line, and answers each line whose replies differ. [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(server *Server, recording []byte) ([]Mismatch, error) {
	var missed []Mismatch
	scan := bufio.NewScanner(bytes.NewReader(recording))
	scan.Buffer(nil, frameCap)
	for n := 1; scan.Scan(); n++ {
		line := bytes.TrimSpace(scan.Bytes())
		if len(line) == 0 {
			continue
		}
		var one recorded
		if err := json.Unmarshal(line, &one); err != nil {
			return nil, fmt.Errorf("line %d: %w", n, err)
		}
		got := server.Handle(one.Message)
		if !same(one.Replies, got) {
			gotRaw := make([]json.RawMessage, len(got))
			for i, body := range got {
				gotRaw[i] = body
			}
			want, _ := json.Marshal(one.Replies)
			seen, _ := json.Marshal(gotRaw)
			missed = append(missed, Mismatch{Line: n, Want: string(want), Got: string(seen)})
		}
	}
	return missed, scan.Err()
}

// Whether the recorded replies and the server's decode alike, in order. [[spec/design_output/model#an-inbound-fake-replays]]
func same(want []json.RawMessage, got [][]byte) bool {
	if len(want) != len(got) {
		return false
	}
	for i := range want {
		var a, b any
		if json.Unmarshal(want[i], &a) != nil || json.Unmarshal(got[i], &b) != nil || !reflect.DeepEqual(a, b) {
			return false
		}
	}
	return true
}
