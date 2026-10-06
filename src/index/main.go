// The command line over the door. Every verb here asks the resident process,
// and starts one where none stands.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"quackitect/src/engine/swap"
	"quackitect/src/q"
)

const (
	reachTries         = 3
	callArgsWithParams = 3
	startPolls         = 300
	startPollPause     = 100 * time.Millisecond
	postWait           = 30 * time.Second
	// The span between two looks at the standing file, and the misses in a row that tell a door another stands in its place. [[spec/tickets/process-shadow-reads-clean]]
	displacedEvery = 5 * time.Second
	displacedLooks = 2
)

// How long a client waits on the door's answer, which a test cuts short. [[spec/tickets/one-index-a-tree]]
var postTimeout = postWait

// The command line the composition root runs, with the IO modules it starts in the served index. [[spec/design_output/model#io-modules-are-modules]]
func Main(clock q.Clock, manage Manage, starts ...Start) {
	Serving()
	argv := argsOf()[1:]
	if len(argv) == 0 {
		fmt.Fprintln(stderr, "usage: se-index <serve|find|notes|links|dangling|same|tickets|changes|reindex|standing|why|dump> [words]\n       se-index call <method> <json params>")
		exits(2)
	}

	root, err := rootHere()
	if err != nil {
		fmt.Fprintln(stderr, err)
		exits(1)
	}

	if argv[0] == "serve" {
		exits(serves(clock, root, manage, starts))
	}
	exits(asks(clock, root, argv))
}

// The root every verb works in, which the composition root reads its wiring off. [[spec/design_output/index#a-door-comes-back]]
func Root() (string, error) { return rootHere() }

// The base of /v1 on the door standing over the root, which it starts where none answers, so a client reaches the index the way every other client does. [[spec/tickets/the-quack-cli-gets-generated]]
func V1(clock q.Clock) (string, error) {
	root, err := rootHere()
	if err != nil {
		return "", err
	}
	if _, err := reaches(clock, root, []string{"standing"}); err != nil {
		return "", err
	}
	standing, err := standingOf(root)
	if err != nil {
		return "", err
	}
	if standing.V1 == 0 {
		return "", errorOf("the standing door names no /v1 port")
	}
	return fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1), nil
}

func rootHere() (string, error) {
	said := envOf("QUACKITECT_ROOT")
	if said == "" {
		here, err := workDirOf()
		if err != nil {
			return "", err
		}
		said = here
	}
	abs, err := filepath.Abs(said)
	return rooted(abs), err
}

// The one spelling of a root: a hook hands the drive letter lower case, and a shell upper case, and both name one tree. Every compare of two roots reads this. [[spec/design_output/index#a-door-comes-back]]
func rooted(path string) string {
	path = filepath.Clean(path)
	if volume := filepath.VolumeName(path); len(volume) == 2 && volume[1] == ':' {
		return strings.ToUpper(volume) + path[len(volume):]
	}
	return path
}

func serves(clock q.Clock, root string, manage Manage, starts []Start) int {
	// A second serve beside a live door places every module again, and the first door's file goes with whichever leaves first. [[spec/tickets/process-shadow-reads-clean]]
	if said, live := liveDoor(root); live {
		fmt.Fprintf(stderr, "an index stands over this tree already, at port %d\n", said.Port)
		return 0
	}
	// A fresh tree holds no runtime folder yet, and the database needs one to open in. [[spec/design_output/index#the-door-owns-the-database]]
	if err := makeDir(filepath.Join(root, Runtime), 0o755); err != nil {
		fmt.Fprintln(stderr, "the runtime folder did not stand:", err)
		return 1
	}
	stop, _, err := ServeManaged(clock, root, filepath.Join(root, Runtime, "index.db"), q.Main, manage, starts...)
	if err != nil {
		fmt.Fprintln(stderr, "the index door did not stand:", err)
		return 1
	}
	pid := pidOf()
	defer dropsOwn(root, pid)

	select {
	case <-stops(func(gone func()) { swap.Watches(clock, gone) }):
	case <-stopAsked:
	case <-displaced(clock, root, pid, displacedEvery):
	}
	stop()
	return 0
}

// The door standing over the root, and whether it answers on this build. A door on another build takes a stop, so the serve after it stands alone. [[spec/tickets/process-shadow-reads-clean]]
func liveDoor(root string) (Standing, bool) {
	said, err := standingOf(root)
	if err != nil || said.Pid == pidOf() {
		return said, false
	}
	if !stands(said, root) {
		posts(said, []string{"stop"})
		return said, false
	}
	_, err = posts(said, []string{"standing"})
	return said, err == nil || late(err)
}

// Removes the standing file while it names this door, so a door leaving takes no other door's file with it. [[spec/tickets/process-shadow-reads-clean]]
func dropsOwn(root string, pid int) {
	if said, err := standingOf(root); err == nil && said.Pid != pid {
		return
	}
	removeFile(standingPath(root))
}

// Closes once the standing file names another door, or none, on two looks in a row, so a door no caller reaches leaves and takes its placements with it. [[spec/tickets/process-shadow-reads-clean]]
func displaced(clock q.Clock, root string, pid int, every time.Duration) <-chan struct{} {
	out := make(chan struct{})
	looks, stop := ticks(clock, every)
	go func() {
		defer stop()
		misses := 0
		for range looks {
			if said, err := standingOf(root); err == nil && said.Pid == pid {
				misses = 0
				continue
			}
			if misses++; misses >= displacedLooks {
				close(out)
				return
			}
		}
	}()
	return out
}

// Asks the index standing over the root, and answers its result, so the composition root runs a verb that writes through a module. [[spec/design_output/model#everything-on-disk-mirrors]]
func Ask(clock q.Clock, argv ...string) (any, error) {
	root, err := rootHere()
	if err != nil {
		return nil, err
	}
	said, err := reaches(clock, root, argv)
	if err != nil {
		return nil, err
	}
	if said.Error != "" {
		return nil, errorOf(said.Error)
	}
	return said.Result, nil
}

func asks(clock q.Clock, root string, argv []string) int {
	said, err := reaches(clock, root, argv)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if said.Error != "" {
		fmt.Fprintln(stderr, said.Error)
		return 1
	}
	// why prints the tree the design input draws. [[spec/design_output/model#quack-why]]
	if found, ok := said.Result.(map[string]any); ok && argv[0] == "why" {
		fmt.Println(found["text"])
		return 0
	}

	out, err := json.MarshalIndent(said.Result, "", "  ")
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Println(string(out))
	return 0
}

// [[spec/design_output/index#a-door-comes-back]]
func reaches(clock q.Clock, root string, argv []string) (answer, error) {
	for try := 0; try < reachTries; try++ {
		standing, err := standingOf(root)
		if err == nil && stands(standing, root) {
			said, posted := posts(standing, argv)
			if posted == nil {
				return said, nil
			}
			// A door past its answer time is busy, and its process still runs, so a second index sweeps beside it. [[spec/tickets/one-index-a-tree]]
			if late(posted) {
				return answer{}, posted
			}
		}
		if err == nil && standing.Port != 0 && !stands(standing, root) {
			posts(standing, []string{"stop"})
		}
		removeFile(standingPath(root))
		if err := starts(clock, root); err != nil {
			return answer{}, err
		}
	}
	return answer{}, errorOf("the index door does not answer, and one would not start")
}

// Whether a post ran out its answer time, where a refused connection names a door that stands dead. [[spec/tickets/reaches-keeps-the-post-fault]]
func late(err error) bool {
	var timed net.Error
	return errors.As(err, &timed) && timed.Timeout()
}

// A door stands while the build that stands it lies unchanged on disk, whatever build the caller runs. [[spec/design_output/index#a-door-comes-back]]
func stands(said Standing, root string) bool {
	if said.Root != "" && rooted(said.Root) != rooted(root) {
		return false
	}
	bin := said.Bin
	if bin == "" {
		self, _ := executableOf()
		bin = serverOf(self, root)
	}
	return said.Stamp != "" && said.Stamp == stampOf(bin)
}

func standingOf(root string) (Standing, error) {
	var standing Standing
	said, err := readFile(standingPath(root))
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
		case "why", "dump", "value":
			params["name"] = argv[1]
		case "same":
			params["path"] = argv[1]
		case "changes":
			params["since"], _ = strconv.Atoi(argv[1])
		}
	}
	return argv[0], asRaw(params)
}

func asRaw(said map[string]any) json.RawMessage {
	out, _ := json.Marshal(said)
	return out
}
