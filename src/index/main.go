// The command line over the door. Every verb here asks the resident process,
// and starts one where none stands.
// [[spec/design_output/index#the-door-owns-the-database]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	"quackitect/swap"
)

const (
	reachTries         = 3
	postTimeout        = 30 * time.Second
	callArgsWithParams = 3
	startPolls         = 300
	startPollPause     = 100 * time.Millisecond
)

func main() {
	argv := os.Args[1:]
	if len(argv) == 0 {
		fmt.Fprintln(os.Stderr, "usage: se-index <serve|find|notes|links|dangling|same|reindex|standing> [words]\n       se-index call <method> <json params>")
		os.Exit(2)
	}

	root, err := rootHere()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	if argv[0] == "serve" {
		os.Exit(serves(root))
	}
	os.Exit(asks(root, argv))
}

func rootHere() (string, error) {
	said := os.Getenv("QUACKITECT_ROOT")
	if said == "" {
		here, err := os.Getwd()
		if err != nil {
			return "", err
		}
		said = here
	}
	return filepath.Abs(said)
}

func serves(root string) int {
	stop, _, err := Serve(root, filepath.Join(root, Runtime, "index.db"))
	if err != nil {
		fmt.Fprintln(os.Stderr, "the index door did not stand:", err)
		return 1
	}
	defer os.Remove(standingPath(root))

	said := make(chan os.Signal, 1)
	signal.Notify(said, os.Interrupt, syscall.SIGTERM)
	swap.Watches(func() { said <- os.Interrupt })
	<-said
	stop()
	return 0
}

func asks(root string, argv []string) int {
	said, err := reaches(root, argv)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	if said.Error != "" {
		fmt.Fprintln(os.Stderr, said.Error)
		return 1
	}

	out, err := json.MarshalIndent(said.Result, "", "  ")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	fmt.Println(string(out))
	return 0
}

// [[spec/design_output/index#a-door-comes-back]]
func reaches(root string, argv []string) (answer, error) {
	for try := 0; try < reachTries; try++ {
		standing, err := standingOf(root)
		if err == nil && stands(standing, root) {
			said, err := posts(standing, argv)
			if err == nil {
				return said, nil
			}
		}
		if err == nil && standing.Port != 0 && !stands(standing, root) {
			posts(standing, []string{"stop"})
		}
		os.Remove(standingPath(root))
		if err := starts(root); err != nil {
			return answer{}, err
		}
	}
	return answer{}, errorOf("the index door does not answer, and one would not start")
}

// [[spec/design_output/index#a-door-comes-back]]
func stands(said Standing, root string) bool {
	if said.Root != "" && said.Root != root {
		return false
	}
	return said.Stamp == stampHere()
}

func standingOf(root string) (Standing, error) {
	var standing Standing
	said, err := os.ReadFile(standingPath(root))
	if err != nil {
		return standing, err
	}
	if err := json.Unmarshal(said, &standing); err != nil {
		return standing, err
	}
	if standing.Port == 0 {
		return standing, errorOf("the standing file names no port")
	}
	return standing, nil
}

func posts(standing Standing, argv []string) (answer, error) {
	method, params := asked(argv)

	body, err := json.Marshal(call{Method: method, Params: params, ID: 1})
	if err != nil {
		return answer{}, err
	}

	client := &http.Client{Timeout: postTimeout}
	said, err := client.Post(
		fmt.Sprintf("http://127.0.0.1:%d/", standing.Port), "application/json", bytes.NewReader(body))
	if err != nil {
		return answer{}, err
	}
	defer said.Body.Close()

	var out answer
	return out, json.NewDecoder(said.Body).Decode(&out)
}

func asked(argv []string) (string, json.RawMessage) {
	if argv[0] == "call" {
		if len(argv) < 2 {
			return "", json.RawMessage("{}")
		}
		if len(argv) < callArgsWithParams {
			return argv[1], json.RawMessage("{}")
		}
		return argv[1], json.RawMessage(argv[2])
	}

	params := map[string]any{}
	if len(argv) > 1 {
		switch argv[0] {
		case "find", "notes":
			params["words"] = argv[1]
			if len(argv) > 2 {
				params["limit"], _ = strconv.Atoi(argv[2])
			}
		case "links":
			params["target"] = argv[1]
		case "same":
			params["path"] = argv[1]
		}
	}
	return argv[0], asRaw(params)
}

func asRaw(said map[string]any) json.RawMessage {
	out, _ := json.Marshal(said)
	return out
}

