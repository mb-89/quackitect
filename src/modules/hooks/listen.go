// The hooks door's listener: POST /hook on a loopback port behind a token,
// with the port and the token written under the root.
// [[spec/tickets/hooks-standing-file-names-token]]
package hooks

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"os"
	"path/filepath"
)

// What the standing file holds: the port, and the token a post carries. [[spec/tickets/hooks-standing-file-names-token]]
type Standing struct {
	Port  int    `json:"port"`
	Token string `json:"token"`
	// Says the door takes the transcript's raw rows and trims them itself, so a bridgehead sends them raw. A standing file lacking it stands from a door that reads the trimmed fields. [[spec/tickets/level0-hooks-hold-no-rule]]
	Raw bool `json:"raw"`
}

// Serves POST /hook on a loopback port behind a token, and writes both under the root. The listener stands in the index process until the IO process holds every listener. [[spec/tickets/hooks-listener-joins-io-process]]
func Listen(root string, door *Door) (func(), error) {
	secret := make([]byte, tokenBytes)
	if _, err := rand.Read(secret); err != nil {
		return nil, err
	}
	token := hex.EncodeToString(secret)
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /hook", door.serves(token))
	server := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}
	go server.Serve(listen)
	at := filepath.Join(root, filepath.FromSlash(StandingFile))
	body, err := json.Marshal(Standing{Port: listen.Addr().(*net.TCPAddr).Port, Token: token, Raw: true})
	if err == nil {
		err = os.MkdirAll(filepath.Dir(at), 0o755)
	}
	if err == nil {
		err = os.WriteFile(at, body, 0o600)
	}
	if err != nil {
		server.Close()
		return nil, err
	}
	return func() {
		server.Close()
		os.Remove(at)
	}, nil
}

// A post short of the token answers 401, a body past the cap or short of JSON 400, and a door that fails 500. [[spec/tickets/hooks-standing-file-names-token]]
func (d *Door) serves(token string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != bearer+token {
			http.Error(w, "the post carries no token the standing file names", http.StatusUnauthorized)
			return
		}
		var post Post
		if err := json.NewDecoder(io.LimitReader(r.Body, bodyCap)).Decode(&post); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		said, err := d.Hook(post)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(said)
	}
}
