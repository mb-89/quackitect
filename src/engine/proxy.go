package main

import (
	"errors"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"
)

// THE AGENT PROXY MOVES, AND HTTPS_PROXY DOES NOT FOLLOW IT.
//
// Outbound HTTPS on a cloud box goes through an agent proxy on a local port,
// named in HTTPS_PROXY. A container restart moves the port, and a resumed
// session carries the old one, so every git call reaches a port nothing
// listens on.
//
// MEASURED. Four claims in a row answered: the push did not run, git fetch,
// unable to access, failed to connect to 127.0.0.1 port 33243. Nothing was
// wrong with the claim or the remote. The same call with the variable set to
// 37347 answered the branch head, and the engine had reported it as its own
// trouble every time. See wk-07c2d80710.
//
// SO THE ENGINE ASKS THE BOX. The proxy writes a note naming the port it runs
// on, and its status endpoint is what tells a proxy from a port that merely
// accepts a connection.

// theProxyNote is where the agent proxy writes down which port it is on.
const theProxyNote = "/root/.ccr/README.md"

// errNoNote is what a box with no agent proxy answers, and it is not a fault.
var errNoNote = errors.New("no agent proxy note on this box")

var (
	proxyOnce sync.Once
	proxyEnv  []string

	// readsTheProxyNote and theProxyAnswers are the two questions this asks of
	// the box, named so a test can answer them itself.
	readsTheProxyNote = func() ([]byte, error) {
		b, err := os.ReadFile(theProxyNote)
		if err != nil {
			return nil, errNoNote
		}
		return b, nil
	}
	theProxyAnswers = func(at string) bool {
		c := &http.Client{Timeout: 2 * time.Second}
		res, err := c.Get(strings.TrimSuffix(at, "/") + "/__agentproxy/status")
		if err != nil {
			return false
		}
		res.Body.Close()
		return res.StatusCode == http.StatusOK
	}

	aLocalProxy = regexp.MustCompile(`http://127\.0\.0\.1:\d+`)
)

// TheProxyEnv answers what a child needs so its HTTPS reaches the agent proxy
// this box runs, or nothing where what it would inherit already reaches one.
//
// IT IS ASKED ONCE A RUN. The answer is a port, and a port does not move under
// a running engine. Asking once a call would put an HTTP request in front of
// every git command the engine makes.
func TheProxyEnv() []string {
	proxyOnce.Do(func() { proxyEnv = theProxyHere() })
	return proxyEnv
}

// forgetTheProxy makes the next call ask again, for a test that changes what
// the box answers.
func forgetTheProxy() {
	proxyOnce = sync.Once{}
	proxyEnv = nil
}

// theProxyHere finds the agent proxy, or answers nothing where there is
// nothing to correct.
func theProxyHere() []string {
	named := os.Getenv("HTTPS_PROXY")
	if named == "" {
		named = os.Getenv("https_proxy")
	}
	if named != "" && theProxyAnswers(named) {
		return nil // what a child inherits already reaches it
	}
	note, err := readsTheProxyNote()
	if err != nil {
		return nil // no agent proxy is documented here, so nothing is overridden
	}
	for _, at := range aLocalProxy.FindAllString(string(note), -1) {
		if theProxyAnswers(at) {
			return []string{"HTTPS_PROXY=" + at, "https_proxy=" + at}
		}
	}
	return nil
}
