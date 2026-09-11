// THE COMMAND LINE OVER THE DOOR. Every verb here asks the resident process,
// and starts one where none stands. So a caller never opens the database
// itself, and the tree has one writer however many people ask it questions.
// [[spec/design_output/index#the-door-owns-the-database]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"
)

func main() {
	argv := os.Args[1:]
	if len(argv) == 0 {
		fmt.Fprintln(os.Stderr, "usage: se-index <serve|find|links|dangling|same|reindex|standing> [words]")
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
	server, _, err := Serve(root, filepath.Join(root, ".se", "index.db"))
	if err != nil {
		fmt.Fprintln(os.Stderr, "the index door did not stand:", err)
		return 1
	}
	defer os.Remove(standingPath(root))

	said := make(chan os.Signal, 1)
	signal.Notify(said, os.Interrupt, syscall.SIGTERM)
	<-said
	server.Close()
	return 0
}

// asks reaches the door, starting one where none answers. A caller waits for
// the first warm walk, which is the one cost the index takes.
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

func reaches(root string, argv []string) (answer, error) {
	for try := 0; try < 2; try++ {
		standing, err := standingOf(root)
		if err == nil {
			said, err := posts(standing, argv)
			if err == nil {
				return said, nil
			}
		}
		if try == 0 {
			if err := starts(root); err != nil {
				return answer{}, err
			}
		}
	}
	return answer{}, errorOf("the index door does not answer, and one would not start")
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
	params := map[string]any{}
	if len(argv) > 1 {
		switch argv[0] {
		case "find":
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

	body, err := json.Marshal(call{Method: argv[0], Params: asRaw(params), ID: 1})
	if err != nil {
		return answer{}, err
	}

	client := &http.Client{Timeout: 30 * time.Second}
	said, err := client.Post(
		fmt.Sprintf("http://127.0.0.1:%d/", standing.Port), "application/json", bytes.NewReader(body))
	if err != nil {
		return answer{}, err
	}
	defer said.Body.Close()

	var out answer
	return out, json.NewDecoder(said.Body).Decode(&out)
}

func asRaw(said map[string]any) json.RawMessage {
	out, _ := json.Marshal(said)
	return out
}

// starts puts a door up and waits for it to say where it stands.
func starts(root string) error {
	self, err := os.Executable()
	if err != nil {
		return err
	}

	one := exec.Command(self, "serve")
	one.Dir = root
	one.Env = append(os.Environ(), "QUACKITECT_ROOT="+root)
	one.Stdout, one.Stderr = nil, nil
	if err := one.Start(); err != nil {
		return err
	}
	go one.Wait()

	for waited := 0; waited < 300; waited++ {
		if _, err := standingOf(root); err == nil {
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return errorOf("the door took longer than thirty seconds to stand")
}
