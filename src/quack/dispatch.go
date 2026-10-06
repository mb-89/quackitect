// quack dispatch: the dispatch verb in Go, registered from this file, over the
// branch doors and a send door onto the network.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package main

import (
	"io"
	"net/http"
	"strings"
	"time"

	"quackitect/src/branches"
	"quackitect/src/index"
)

// How long one request of the fire waits for its reply. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
const sendTimeout = time.Minute

func init() { register("dispatch", dispatchVerb(index.Root, reachV1, httpSend)) }

// dispatch off the branch doors and the send door, every word past the verb handed to the package. [[spec/tickets/dispatch-verbs-port-to-go]]
func dispatchVerb(root func() (string, error), v1 func() (string, error), send branches.Send) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return branches.Dispatch(branchDoors(root, v1, out, errs), send, argv[1:])
	}
}

// One request onto the network, its reply's headers keyed in lower case. [[spec/design_output/doors#a-door-reads-the-outside]]
func httpSend(url string, request branches.Request) (branches.Reply, error) {
	asked, err := http.NewRequest(request.Method, url, strings.NewReader(request.Body))
	if err != nil {
		return branches.Reply{}, err
	}
	for key, value := range request.Headers {
		asked.Header.Set(key, value)
	}
	said, err := (&http.Client{Timeout: sendTimeout}).Do(asked)
	if err != nil {
		return branches.Reply{}, err
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	if err != nil {
		return branches.Reply{}, err
	}
	headers := map[string]string{}
	for key := range said.Header {
		headers[strings.ToLower(key)] = said.Header.Get(key)
	}
	return branches.Reply{Status: said.StatusCode, Text: string(body), Headers: headers}, nil
}
