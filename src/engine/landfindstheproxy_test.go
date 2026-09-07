package main

import (
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE PROXY MOVES WHEN THE CONTAINER RESTARTS and HTTPS_PROXY goes on naming
// the port it had before. Every push then fails to connect.
//
// MEASURED, 2026-09-07. HTTPS_PROXY named port 43603 and nothing listened
// there. The live proxy was at 32897. A box in that state keeps working and
// loses everything it has not pushed, which is how six archived notes went.
//
// A REAL GIT AND THE REAL SCRIPT, as the tests beside these do. The remote is a
// path rather than a URL, so no push here goes near a proxy. What is under test
// is which port the script picks and whether it says so.

// aProxyThatAnswers stands up the one endpoint the real proxy answers on, and
// nothing else. Its port is the live one.
func aProxyThatAnswers(t *testing.T) string {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/__agentproxy/status" {
			http.NotFound(w, r)
			return
		}
		_, _ = w.Write([]byte(`{"enabled":true}`))
	}))
	t.Cleanup(srv.Close)
	_, port, err := net.SplitHostPort(strings.TrimPrefix(srv.URL, "http://"))
	if err != nil {
		t.Fatal(err)
	}
	return port
}

// aCcrFolderNaming writes the folder the proxy keeps its own notes in, with the
// README naming a port the way the real one does. An empty port writes no
// README, which is a box that carries no such folder.
func aCcrFolderNaming(t *testing.T, port string) string {
	t.Helper()
	dir := t.TempDir()
	if port != "" {
		text := "# Claude Code agent proxy\n\nOutbound HTTPS from this session goes " +
			"through a local proxy at http://127.0.0.1:" + port + "\n(set via HTTPS_PROXY).\n"
		if err := os.WriteFile(filepath.Join(dir, "README.md"), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return filepath.Join(dir, "ca-bundle.crt")
}

// A DEAD PORT. Nothing listens on 1, and a box may not bind it either.
const aDeadProxy = "1"

func TestALandFindsTheProxyThatMoved(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	live := aProxyThatAnswers(t)
	bundle := aCcrFolderNaming(t, live)
	writeIn(t, clone, "landed.txt", "as it is now\n")

	out := runLandWith(t, clone, []string{
		"HTTPS_PROXY=http://127.0.0.1:" + aDeadProxy,
		"https_proxy=http://127.0.0.1:" + aDeadProxy,
		"CURL_CA_BUNDLE=" + bundle,
	}, "the file lands", "landed.txt")

	if !strings.Contains(out, live) {
		t.Fatalf("the live proxy is at %s and land never named it:\n%s", live, out)
	}
	if !strings.Contains(out, aDeadProxy) {
		t.Errorf("land did not say which port was dead:\n%s", out)
	}
	if !strings.Contains(out, "PUSHED") {
		t.Fatalf("the push did not run:\n%s", out)
	}
}

// A VARIABLE THAT IS RIGHT IS LEFT ALONE, and says nothing. A line on every
// land is noise, and noise is what teaches an agent to stop reading.
func TestALandWithALiveProxySaysNothingAboutIt(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	live := aProxyThatAnswers(t)
	bundle := aCcrFolderNaming(t, live)
	writeIn(t, clone, "landed.txt", "as it is now\n")

	out := runLandWith(t, clone, []string{
		"HTTPS_PROXY=http://127.0.0.1:" + live,
		"https_proxy=http://127.0.0.1:" + live,
		"CURL_CA_BUNDLE=" + bundle,
	}, "the file lands", "landed.txt")

	if strings.Contains(out, "PROXY") {
		t.Fatalf("the variable already named the live proxy, and land said:\n%s", out)
	}
	if !strings.Contains(out, "PUSHED") {
		t.Fatalf("the push did not run:\n%s", out)
	}
}

// AND NOTHING ANSWERING ANYWHERE STILL PUSHES. A desk has no such proxy at all,
// and a land that stopped there would break every box to fix one.
func TestALandPushesWhenNoProxyAnswers(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	bundle := aCcrFolderNaming(t, "")
	writeIn(t, clone, "landed.txt", "as it is now\n")

	out := runLandWith(t, clone, []string{
		"HTTPS_PROXY=http://127.0.0.1:" + aDeadProxy,
		"https_proxy=http://127.0.0.1:" + aDeadProxy,
		"CURL_CA_BUNDLE=" + bundle,
	}, "the file lands", "landed.txt")

	if strings.Contains(out, "PROXY") {
		t.Fatalf("nothing answered, so there was no port to name, and land said:\n%s", out)
	}
	if !strings.Contains(out, "PUSHED") {
		t.Fatalf("the push did not run:\n%s", out)
	}
}
